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
  host: process.env.DB_HOST || "localhost", // Use "localhost" if running on Raspberry Pi
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "login",
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
    // 檢查使用者是否已存在
    const checkUserSql = "SELECT * FROM users WHERE username = ?";
    db.query(checkUserSql, [username], async (err, results) => {
      if (err) return res.status(500).json({ message: "伺服器錯誤" });
      if (results.length > 0) return res.status(400).json({ message: "使用者名稱已存在" });

      // 加密密碼
      const hashedPassword = await bcrypt.hash(password, 10);

      // 插入新使用者到資料庫
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

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "1h" });
    res.json({ success: true, token });
  });
});

// 創建錢包 API
app.post("/create-wallet", (req, res) => {
  try {
    const privateKey = new bitcore.PrivateKey();
    const publicKey = privateKey.toPublicKey().toString();
    const address = privateKey.toAddress().toString();

    const sql = "INSERT INTO wallets (address, public_key, private_key) VALUES (?, ?, ?)";
    db.query(sql, [address, publicKey, privateKey.toString()], (err) => {
      if (err) return res.status(500).json({ error: "Failed to create wallet." });
      res.json({ address, publicKey, privateKey: privateKey.toString() });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create wallet." });
  }
});

// 取得所有錢包 API
app.get("/wallets", (req, res) => {
  const sql = "SELECT * FROM wallets";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 啟動伺服器
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://<RaspberryPi_IP>:${PORT}`);
});
