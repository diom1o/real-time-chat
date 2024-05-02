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

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Join a room
  socket.on('joinRoom', (room) => {
    console.log(`A user joined room: ${room}`);
    socket.join(room);
    // Cache and emit room joining message
    const joinMsg = getCachedRoomMessage(room, `A new user has joined ${room}`);
    io.to(room).emit('message', joinMsg);
  });

  // Leave a room
  socket.on('leaveRoom', (room) => {
    console.log(`A user left room: ${room}`);
    socket.leave(room);
    // Cache and emit room leaving message
    const leaveMsg = getCachedRoomMessage(room, `A user has left ${room}`);
    io.to(room).emit('message', leaveMsg);
  });

  socket.on('message', (data) => {
    if (!data.message) {
      console.error('Received empty message');
    } else {
      // Emitting the message to a specific room without caching,
      // as it's expected to be unique per use-case
      io.to(data.room).emit('message', data.message);
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

// Function to retrieve or cache room messages
function getCachedRoomMessage(room, message) {
  if (!messageCache[room]) {
    messageCache[room] = {};
  }
  if (!messageCache[room][message]) {
    console.log(`Caching message for room ${room}`);
    messageCache[room][message] = message;
  }
  return messageCache[room][message];
}

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (error) => {
  console.error(`Server error: ${error.message}`);
  process.exit(1);
});