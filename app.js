import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_IO_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('message', message => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (!currentMessage) return;

    socket.emit('message', currentMessage);
    setCurrentMessage('');
  };

  return (
    <div>
      <h1>Chat Application</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default App;