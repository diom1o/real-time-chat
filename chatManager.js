const io = require('socket.io')(process.env.SOCKET_IO_PORT || 3000, {
  cors: {
    origin: '*',
  },
});

let users = {};
let messages = [];

const addUser = (userId, nickname) => {
  users[userId] = nickname;
};

const removeUser = (userId) => {
  delete users[userId];
};

const broadcastMessage = (message) => {
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