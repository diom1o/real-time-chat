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

io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a room
  socket.on('joinRoom', (room) => {
    console.log(`A user joined room: ${room}`);
    socket.join(room);
    // Inform others in the room that a new user has joined
    socket.to(room).emit('message', `A new user has joined ${room}`);
  });

  // Leave a room
  socket.on('leaveRoom', (room) => {
    console.log(`A user left room: ${room}`);
    socket.leave(room);
    // Inform others in the room that a user has left
    socket.to(room).emit('message', `A user has left ${room}`);
  });

  socket.on('message', (data) => {
    if (!data.message) {
      console.error('Received empty message');
      // Optionally, send an error back to the sender if the message is not valid.
      // socket.emit('error', 'Message cannot be empty');
    } else {
      // send message to a specific room
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

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (error) => {
  console.error(`Server error: ${error.message}`);
  process.exit(1);
});