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
  
  socket.on('message', (msg) => {
    if (!msg) {
      console.error('Received empty message');
      // Optionally, send an error back to the sender if the message is not valid.
      // socket.emit('error', 'Message cannot be empty');
    } else {
      socket.broadcast.emit('message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('error', (err) => {
    // This is a listener for any unexpected error. For specific events, consider adding more specific handlers.
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