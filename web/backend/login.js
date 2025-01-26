const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

// 数据库连接配置
const db = mysql.createConnection({
    host: 'localhost',    // 数据库主机
    user: 'root',         // 数据库用户名
    password: '4182004V1314', // 数据库密码
    database: 'login'  // 数据库名称
});

// 测试数据库连接
db.connect(err => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('已成功连接到数据库');
    }
});

// 登录接口
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: '服务器错误' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: '用户不存在' });
        }

        const user = results[0];
        const storedHash = user.password;

        // 使用 SHA-256 验证密码
        const hash = crypto.createHash('sha256').update(password).digest('hex');

        if (hash !== storedHash) {
            return res.status(401).json({ message: '密码错误' });
        }

        // 登录成功，生成 JWT
        const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ success: true, token });
    });
});

// 启动服务器
app.listen(3001, () => {
    console.log('服务器运行在 http://localhost:3001');
});
