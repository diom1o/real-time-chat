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
    try {
      if (endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error scrolling to the end of the messages:', error);
    }
  }, [messages]);

  if (!Array.isArray(messages) || messages.length === 0) {
    return <div style={{ height: '500px', overflow: 'auto' }}>No messages to display</div>;
  }

  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      {messages.map((message, index) => (
        <React.Fragment key={message.id || index}>
          {message && typeof message === 'object' ? (
            <div style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
              <div><strong>{message.senderName || message.senderId}:</strong></div>
              <div>{message.text}</div>
            </div>
          ) : (
            console.error('Invalid message format encountered', message) || 
            <div style={{ padding: '10px', color: 'red' }}>Error: Invalid message format</div>
          )}
        </React.Fragment>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;