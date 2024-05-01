import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let newSocket;
    try {
      newSocket = io(process.env.REACT_APP_SOCKET_IO_SERVER_URL);
      setSocket(newSocket);

      newSocket.on('message', message => {
        setMessages(prevMessages => [...prevMessages, message]);
      });

      newSocket.on('connect_error', (err) => {
        setError("Connection failed. Please try again later.");
      });

      newSocket.on('error', (errorMessage) => {
        setError(errorMessage);
      });
    } catch (error) {
      setError("Failed to initialize socket connection.");
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (!currentMessage) return;

    try {
      socket.emit('message', currentMessage, (response) => {
        if (!response.ok) {
          setError("Failed to send message. Please try again later.");
        }
      });
      setCurrentMessage('');
    } catch (error) {
      setError("An error occurred while sending the message.");
    }
  };

  return (
    <div>
      <h1>Chat Application</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
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