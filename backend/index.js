const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bitcore = require("bitcore-lib");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// 建立 MySQL 連線
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "4182004V1314",
  database: "uw",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to the database successfully.");
  }
});

// 註冊 API
app.post("/register", async (req, res) => {
  const { username, password, email, phone } = req.body;

  if (!username || !password || !email || !phone) {
    return res.status(400).json({ message: "請填寫所有欄位" });
  }

  try {
    const checkUserSql = "SELECT * FROM users WHERE username = ?";
    db.query(checkUserSql, [username], async (err, results) => {
      if (err) return res.status(500).json({ message: "伺服器錯誤" });
      if (results.length > 0) return res.status(400).json({ message: "使用者名稱已存在" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = "INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)";
      db.query(sql, [username, hashedPassword, email, phone], (err) => {
        if (err) {
          console.error("插入使用者錯誤:", err);
          return res.status(500).json({ message: "註冊失敗" });
        }
        res.json({ message: "註冊成功" });
      });
    });
  } catch (error) {
    console.error("註冊錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

// 登入 API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "伺服器錯誤" });
    if (results.length === 0) return res.status(401).json({ message: "用戶不存在" });

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "密碼錯誤" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "1h" });
    res.json({ success: true, token, userId: user.id }); // 返回 userId
  });
});

// 創建錢包 API
app.post("/create-wallet", (req, res) => {
  const { user_id } = req.body; // 從請求中獲取 user_id

  try {
    const privateKey = new bitcore.PrivateKey();
    const publicKey = privateKey.toPublicKey().toString();
    const address = privateKey.toAddress().toString();

    const sql = "INSERT INTO wallets (user_id, address, public_key, private_key) VALUES (?, ?, ?, ?)";
    db.query(sql, [user_id, address, publicKey, privateKey.toString()], (err) => {
      if (err) return res.status(500).json({ error: "Failed to create wallet." });
      res.json({ address, publicKey, privateKey: privateKey.toString() });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create wallet." });
  }
});


// 取得特定使用者的錢包 API
app.get("/wallets", (req, res) => {
  // 从请求头中获取 JWT token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "未提供授權標頭" });

  // 验证 token
  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, decoded) => {
    if (err) return res.status(401).json({ message: "無效的授權標頭" });

    const userId = decoded.userId; // 获取用户 ID

    // 根据用户 ID 查询钱包信息
    const sql = "SELECT * FROM wallets WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results); // 返回该用户的所有钱包信息
    });
  });
});


// 啟動伺服器
app.listen(3001, () => {
  console.log('服务器运行在 http://localhost:3001');
});
