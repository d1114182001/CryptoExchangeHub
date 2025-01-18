const express = require('express');
const mysql = require('mysql'); // 引入 mysql 模組
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors()); 
app.use(express.json());

// 測試路由
app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from backend!' }); // 返回与前端期望一致的 JSON 格式
  });
  

// 資料庫連接設定
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // 替換為你的 MySQL 用戶名
  password: '4182004V1314', // 替換為你的 MySQL 密碼
  database: 'testdb', // 替換為你的資料庫名稱
});

// 連接資料庫
db.connect((err) => {
  if (err) {
    console.error('資料庫連接失敗: ', err.stack);
    return;
  }
  console.log('成功連接到資料庫');
});

// 查詢 API
app.get('/data', (req, res) => {
  db.query('SELECT * FROM cities', (err, results) => {
    if (err) {
      console.error('查詢失敗: ', err.stack);
      res.status(500).send('查詢失敗');
      return;
    }
    res.json(results); // 回傳查詢結果
  });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});

