import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    const validateMessages = (msgs) => {
      if (!Array.isArray(msgs)) {
        console.error('The messages prop should be an array!');
        return false;
      }
      if (msgs.some(message => typeof message !== 'object' || message === null)) {
        console.error('Each message should be a non-null object!');
        return false;
      }
      return true;
    };

    if (!validateMessages(messages)) return;

    try {
      if (endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error scrolling to the end of the messages:', error);
    }
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return <div style={{ height: '500px', overflow: 'auto' }}>No messages to display</div>;
  }

  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      {messages.map((message, index) => {
        if (!message || typeof message !== 'object') {
          console.error('Invalid message format encountered at index', index, ':', message);
          return (
            <div key={index} style={{ padding: '10px', color: 'red' }}>
              Error: Invalid message format
            </div>
          );
        }
        
        const { id, senderName, senderId, text, timestamp } = message;
        if (!text || !(senderName || senderId)) {
          return (
            <React.Fragment key={id || index}>
              <div style={{ padding: '10px', color: 'orange' }}>
                Warning: Message with missing content or sender info.
              </div>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={id || index}>
            <div style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
              <div><strong>{senderName || senderId}:</strong> {timestamp && formatTimestamp(timestamp)}</div>
              <div>{text}</div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;