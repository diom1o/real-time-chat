const io = require('socket.io')(process.env.SOCKET_IO_PORT || 3000, {
  cors: {
    origin: '*', // Allow connections from any origin
  },
});

let users = new Map();

let messages = [];

const addUser = (userId, nickname, room = 'general') => {
  users.set(userId, {nickname, room});
  // Join the user to a specific room
  const userSocket = io.sockets.sockets.get(userId);
  if (userSocket) {
    userSocket.join(room);
  }
};

const removeUser = (userId) => {
  const user = users.get(userId);
  if (user) {
    // Leave the room on disconnect
    const userSocket = io.sockets.sockets.get(userId);
    if (userSocket) {
      userSocket.leave(user.room);
    }
  }
  users.delete(userId);
};

const broadcastMessage = (message, room = 'general') => {
  if (messages.length >= 100) {
    messages.shift();
  }
  messages.push(message);

  // Emit message only to users in the same room
  io.to(room).emit('chat message', message);
};

const notifyTyping = (userId, isTyping) => {
  const userData = users.get(userId);
  if (userData && userData.room) {
    // Notify users in the same room about the typing status
    io.to(userData.room).emit('user typing', { userId, isTyping });
  }
}

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log('Received message: ' + msg);
    const userData = users.get(socket.id);
    if (userData) {
      // Send message to the room the user is in
      broadcastMessage(msg, userData.room);
    }
  });

  socket.on('register nickname', (nickname) => {
    const userId = socket.id;
    // Default to joining the 'general' room upon registration
    addUser(userId, nickname, 'general');
    console.log(`${nickname} has joined the chat.`);
    socket.emit('nickname registered', nickname);
    // Inform other users in the room
    socket.broadcast.to('general').emit('user joined', nickname);
  });

  socket.on('join room', (room) => {
    const userData = users.get(socket.id);
    if (userData) {
      // Leave the current room and join the new one
      socket.leave(userData.room);
      socket.join(room);
      // Update the user's current room
      userData.room = room;
      users.set(socket.id, userData);
      console.log(`${userData.nickname} has joined ${room}`);
      // Notify users in the room
      io.to(room).emit('user joined room', { user: userData.nickname, room });
    }
  });

  socket.on('typing', (isTyping) => {
    notifyTyping(socket.id, isTyping);
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log('User disconnected');
  });
});

console.log(`Server running on port ${process.env.SOCKET_IO_PORT || 3000}`);