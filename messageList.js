import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      {messages.map((message, index) => (
        <div key={index} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
          <div><strong>{message.senderName || message.senderId}:</strong></div>
          <div>{message.text}</div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;