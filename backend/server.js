const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Set up MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '4182004V1314',
    database: 'test_db'
});

db.connect(err => {
    if (err) {
        console.log('Failed to connect to the database:', err);
        return;
    }
    console.log('Successfully connected to the database');
});

// API: Get all messages
app.get('/messages', (req, res) => {
    db.query('SELECT * FROM messages', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// API: Add a new message
app.post('/messages', (req, res) => {
    const { name, message } = req.body;
    db.query('INSERT INTO messages (name, message) VALUES (?, ?)', [name, message], (err) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send('Message has been added');
        }
    });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
