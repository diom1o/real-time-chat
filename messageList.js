import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(messages)) {
      console.error('The messages prop should be an array!');
      return;
    }
    if (messages.some(message => typeof message !== 'object' || message === null)) {
      console.error('Each message should be a non-null object!');
      return;
    }

    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!Array.isArray(messages) || messages.length === 0) {
    return <div style={{ height: '500px', overflow: 'auto' }}>No messages to display</div>;
  }

  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      {messages.map((message, index) => (
        <div key={message.id || index} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
          <div><strong>{message.senderName || message.senderId}:</strong></div>
          <div>{message.text}</div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;