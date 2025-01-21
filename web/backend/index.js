const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'testuser', // 替换为你的 MySQL 用户名
    password: 'V1314520', // 替换为你的 MySQL 密码
    database: 'testdb',
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// API endpoint
app.get('/api/items', (req, res) => {
    db.query('SELECT * FROM items', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});

