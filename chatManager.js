const io = require('socket.io')(process.env.SOCKET_IO_PORT || 3000, {
  cors: {
    origin: '*',
  },
});

let users = new Map(); // Using Map for more efficient lookups and memory management
let messages = []; // Consider limiting the size or implementing a cleanup strategy

const addUser = (userId, nickname) => {
  users.set(userId, nickname); // More efficient for additions/removals
};

const removeUser = (userId) => {
  users.delete(userId); // More efficient than delete operator for objects
};

const broadcastMessage = (message) => {
  // Consider implementing a strategy to limit the size of the messages array
  // For instance, only keep the last 100 messages in memory
  if (messages.length >= 100) {
    messages.shift(); // Remove oldest message to maintain array size
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
    let userId = socket.id;
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