import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [messages, setMessages] = useState([]);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    // Fetch all messages
    useEffect(() => {
        axios.get('http://localhost:3001/messages')
            .then(res => setMessages(res.data))
            .catch(err => console.error(err));
    }, []);

    // Submit a new message
    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/messages', { name, message })
            .then(() => {
                setMessages([...messages, { name, message }]);
                setName('');
                setMessage('');
            })
            .catch(err => console.error(err));
    };

    return (
        <div>
            <h1>Message Board</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Your Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                ></textarea>
                <button type="submit">Submit</button>
            </form>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                        <strong>{msg.name}</strong>: {msg.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;

