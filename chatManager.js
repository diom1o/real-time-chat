const io = require('socket.io')(process.env.SOCKET_IO_PORT || 3000, {
  cors: {
    origin: '*', // Allow connections from any origin
  },
});

let users = new Map();

let messages = [];

const addUser = (userId, nickname) => {
  users.set(userId, nickname);
};

const removeUser = (userId) => {
  users.delete(userId);
};

const broadcastMessage = (message) => {
  if (messages.length >= 100) {
    messages.shift();
  }
  messages.push(message);

  io.emit('chat message', message);
};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log('Received message: ' + msg);
    broadcastMessage(msg);
  });

  socket.on('register nickname', (nickname) => {
    const userId = socket.id;
    addUser(userId, nickname);
    console.log(`${nickname} has joined the chat.`);
    socket.emit('nickname registered', nickname);
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log('User disconnected');
  });
});

console.log(`Server running on port ${process.env.SOCKET_IO_PORT || 3000}`);