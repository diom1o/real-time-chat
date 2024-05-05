import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [error, setError] = useState('');
  const [usersOnline, setUsersOnline] = useState(0);

  const handleError = useCallback((message, errorType = 'Socket') => {
    setError(`${errorType} Error: ${message}`);
    setTimeout(() => {
      setError('');
    }, 5000);
  }, []);

  useEffect(() => {
    const initializeSocket = () => {
      const newSocket = io(process.env.REACT_APP_SOCKET_IO_SERVER_URL, {
        reconnectionAttempts: 5,
        reconnectionDelayMax: 10000,
      });

      newSocket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      newSocket.on('updateUserCount', (count) => {
        setUsersOnline(count);
      });

      newSocket.on('connect_error', (err) => handleError(err.message || "Connection failed. Please try again later.", 'Connect'));
      newSocket.on('connect_failed', () => handleError("Connection failed. Please try again later.", 'Connect Failed'));
      newSocket.on('error', (errorMessage) => handleError(errorMessage, 'General'));

      newSocket.on('reconnect_failed', () => handleError("Reconnection Failed. Please refresh the page to try again.", 'Reconnect Failed'));

      return newSocket;
    };

    if (!socket) {
      const newSocket = initializeSocket();
      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [socket, handleError]);

  const sendMessage = (event) => {
    event.preventDefault();

    if (!currentMessage.trim() || !socket) {
      handleError("Cannot send an empty message or socket not connected.", 'Message Send');
      return;
    }

    socket.emit('message', currentMessage, (response) => {
      if (!response.ok) {
        handleError("Failed to send message. Please try again later.", 'Message Send');
      } else {
        setCurrentMessage('');
      }
    });
  };

  return (
    <div>
      <h1>Chat Application</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Users Online: {usersOnline}</p>
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