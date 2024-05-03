const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*", 
    methods: ["GET", "POST"],
  },
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const messageCache = {}; // Simple cache for room messages.
const messageHistoryLimit = 10; // Limit of the last N messages

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('joinRoom', (room) => {
    console.log(`A user joined room: ${room}`);
    socket.join(room);

    // Broadcast number of users in room
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 1; // includes the new joiner
    io.to(room).emit('roomSize', roomSize);

    // Cache and emit room joining message
    const joinMsg = getCachedRoomMessage(room, `A new user has joined ${room}`);
    cacheMessage(room, joinMsg); // Updated for history purpose
    io.to(room).emit('message', joinMsg);
    
    // Emit last N messages to the new joiner
    if (messageCache[room] && messageCache[room].history) {
      socket.emit('messageHistory', messageCache[room].history.slice(-messageHistoryLimit));
    }
  });

  socket.on('leaveRoom', (room) => {
    console.log(`A user left room: ${room}`);
    socket.leave(room);

    const leaveMsg = getCachedRoomMessage(room, `A user has left ${room}`);
    cacheMessage(room, leaveMsg); // Updated for history purpose
    io.to(room).emit('message', leaveMsg);

    // Update room size
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    socket.to(room).emit('roomSize', roomSize);
  });

  socket.on('message', (data) => {
    if (!data.message) {
      console.error('Received empty message');
    } else {
      const sanitizedMessage = sanitizeMessage(data.message); // Sanitize input
      cacheMessage(data.room, sanitizedMessage); // Cache with sanitation
      io.to(data.room).emit('message', sanitizedMessage);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('error', (err) => {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    socket.close();
  });
});

function getCachedRoomMessage(room, message) {
  if (!messageCache[room]) {
    messageCache[room] = { history: [] }; // Initialize with a history array
  }
  if (!messageCache[room][message]) {
    console.log(`Caching message for room ${room}`);
    messageCache[room][message] = message;
  }
  return messageCache[room][message];
}

function cacheMessage(room, message) {
  if (!messageCache[room]) {
    messageCache[room] = { history: [] };
  }
  messageCache[room].history.push(message); // Push message to history
  if (messageCache[room].history.length > messageHistoryLimit) {
    messageCache[room].history.shift(); // Keep the history within the limit
  }
}

// Function to sanitize messages to prevent XSS
function sanitizeMessage(message) {
  return message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (error) => {
  console.error(`Server error: ${error.message}`);
  process.exit(1);
});