import React, { useState, useEffect, useRef } from 'react';

function Chat({ meetingId, username }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const handleNewMessage = (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        window.socket.on('chat-message', handleNewMessage);

        return () => {
            window.socket.off('chat-message', handleNewMessage);
        };
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);



    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const message = {
                sender: username,
                text: newMessage,
                timestamp: new Date().toLocaleTimeString(),
            };

            window.socket.emit('send-chat-message', {
                message,
                roomID: meetingId,
            });
            setNewMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages" ref={chatContainerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender === username ? 'sent' : 'received'}`}>
                        <div className="chat-message-header">
                            <span className='chat-message-sender'>{msg.sender}</span>
                            <span className="chat-message-time">{msg.timestamp}</span>
                        </div>
                        <p className="chat-message-text">{msg.text}</p>
                    </div>
                ))}
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default Chat;