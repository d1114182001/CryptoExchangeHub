const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cors = require("cors");
const bitcore = require("bitcore-lib");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());


// 建立 MySQL 連線
const db = mysql.createConnection({
  host: "localhost", // Use "localhost" if running on Raspberry Pi
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
  

// 登入 API
app.post("/login", (req, res) => {
    try {
      const { username, password } = req.body;
  
      const sql = "SELECT * FROM users WHERE username = ?";
      db.query(sql, [username], (err, results) => {
        if (err) {
          console.error("Database query error:", err.message);
          return res.status(500).json({ message: "Server error" });
        }
  
        if (results.length === 0) {
          return res.status(401).json({ message: "User does not exist" });
        }
  
        const user = results[0];
        const storedHash = user.password;
        const hash = crypto.createHash("sha256").update(password).digest("hex");
  
        if (hash !== storedHash) {
          return res.status(401).json({ message: "Incorrect password" });
        }
  
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "1h" });
        res.json({ success: true, token });
      });
    } catch (error) {
      console.error("Error in login API:", error);
      res.status(500).json({ message: "Server error, please try again later" });
    }
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
app.listen(3001, () => {
  console.log('服务器运行在 http://localhost:3001');
});
