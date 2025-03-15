const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const crypto = require('crypto');
const bitcore = require("bitcore-lib");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// 建立 MySQL 連線
const db = mysql.createConnection({
  host: "127.0.0.1",
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


// JWT 驗證中間件
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "未提供授權標頭" });

  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, decoded) => {
    if (err) return res.status(401).json({ message: "無效的授權標頭" });
    req.userId = decoded.userId;
    next();
  });
};

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



// 原有 /send-transaction 修改如下
app.post("/send-transaction", verifyToken, async (req, res) => {
  const { senderAddress, recipientAddress, amount } = req.body;
  const userId = req.userId;

  if (!senderAddress || !recipientAddress || !amount) {
    return res.status(400).json({ message: "請提供發送地址、收款地址和金額" });
  }

  try {
    const sql = "SELECT * FROM wallets WHERE user_id = ? AND address = ?";
    db.query(sql, [userId, senderAddress], async (err, results) => {
      if (err) return res.status(500).json({ message: "伺服器錯誤" });
      if (results.length === 0) {
        return res.status(404).json({ message: "未找到指定的發送錢包或無權限" });
      }

      const wallet = results[0];
      const amountInBTC = parseFloat(amount);

      if (wallet.balance === null || wallet.balance < amountInBTC) {
        return res.status(400).json({ message: "餘額不足" });
      }

      // 建立交易內容
      const transactionContent = {
        senderAddress,
        recipientAddress,
        amount: amountInBTC,
      };

      // 生成交易訊息摘要（SHA-256）
      const transactionHash = crypto.createHash('sha256')
        .update(JSON.stringify(transactionContent))
        .digest('hex');

      // 這裡不直接簽名和完成交易，只返回初始數據
      res.json({
        message: "交易已初始化",
        senderAddress,
        recipientAddress,
        amount: amountInBTC,
        transactionHash,
      });
    });
  } catch (error) {
    console.error("交易處理錯誤:", error);
    res.status(500).json({ message: "交易初始化失敗" });
  }
});

app.post("/get-private-key", verifyToken, async (req, res) => {
  const { senderAddress, password } = req.body;
  const userId = req.userId;

  try {
    // 驗證密碼
    const sqlUser = "SELECT * FROM users WHERE id = ?";
    db.query(sqlUser, [userId], async (err, userResults) => {
      if (err) return res.status(500).json({ message: "伺服器錯誤" });
      if (userResults.length === 0) return res.status(404).json({ message: "用戶不存在" });

      const user = userResults[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).json({ message: "密碼錯誤" });

      // 獲取私鑰
      const sqlWallet = "SELECT private_key FROM wallets WHERE user_id = ? AND address = ?";
      db.query(sqlWallet, [userId, senderAddress], (err, walletResults) => {
        if (err) return res.status(500).json({ message: "伺服器錯誤" });
        if (walletResults.length === 0) return res.status(404).json({ message: "錢包不存在" });

        const privateKey = walletResults[0].private_key;
        res.json({ privateKey });
      });
    });
  } catch (error) {
    console.error("獲取私鑰錯誤:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});


app.post("/complete-transaction", verifyToken, async (req, res) => {
  const { senderAddress, recipientAddress, amount, transactionHash, finalize } = req.body;
  const userId = req.userId;

  try {
    const sqlSender = "SELECT * FROM wallets WHERE user_id = ? AND address = ?";
    db.query(sqlSender, [userId, senderAddress], async (err, senderResults) => {
      if (err) return res.status(500).json({ message: "伺服器錯誤" });
      if (senderResults.length === 0) return res.status(404).json({ message: "發送錢包不存在" });

      const wallet = senderResults[0];
      const privateKey = new bitcore.PrivateKey(wallet.private_key);
      const amountInBTC = parseFloat(amount);

      if (wallet.balance < amountInBTC) {
        return res.status(400).json({ message: "餘額不足" });
      }

      // 生成簽名
      const message = new bitcore.Message(transactionHash);
      const signature = message.sign(privateKey);

      // 驗證簽名
      const isValidSignature = message.verify(senderAddress, signature);
      if (!isValidSignature) return res.status(400).json({ message: "簽名無效" });

      if (!finalize) {
        // 如果不是最終提交，只返回簽名
        res.json({
          message: "簽名成功",
          signature,
        });
      } else {
        // 如果是最終提交，執行資料庫操作
        const amountInSatoshis = Math.round(amountInBTC * 1e8);
        const transaction = new bitcore.Transaction()
          .to(recipientAddress, amountInSatoshis)
          .change(senderAddress)
          .sign(privateKey);

        const transactionId = transaction.hash + "-" + Date.now();

        db.beginTransaction((err) => {
          if (err) return res.status(500).json({ message: "事務啟動失敗" });

          const sqlUpdateSender = "UPDATE wallets SET balance = balance - ? WHERE address = ?";
          db.query(sqlUpdateSender, [amountInBTC, senderAddress], (err) => {
            if (err) {
              db.rollback(() => res.status(500).json({ message: "更新發送餘額失敗" }));
              return;
            }

            const sqlUpdateRecipient = "UPDATE wallets SET balance = balance + ? WHERE address = ?";
            db.query(sqlUpdateRecipient, [amountInBTC, recipientAddress], (err) => {
              if (err) {
                db.rollback(() => res.status(500).json({ message: "更新接收餘額失敗" }));
                return;
              }

              const sqlInsertTransaction = `
                INSERT INTO transactions (tx_hash, sender_address, recipient_address, amount, sender_public_key)
                VALUES (?, ?, ?, ?, ?)
              `;
              db.query(sqlInsertTransaction, [transactionId, senderAddress, recipientAddress, amountInBTC, wallet.public_key], (err) => {
                if (err) {
                  db.rollback(() => res.status(500).json({ message: "插入交易資料失敗" }));
                  return;
                }

                db.commit((err) => {
                  if (err) {
                    db.rollback(() => res.status(500).json({ message: "事務提交失敗" }));
                    return;
                  }
                  res.json({
                    message: "交易成功",
                    transactionId,
                    signature,
                  });
                });
              });
            });
          });
        });
      }
    });
  } catch (error) {
    console.error("完成交易錯誤:", error);
    res.status(500).json({ message: "交易失敗" });
  }
});



// 啟動伺服器
app.listen(3001,"0.0.0.0", () => {
  console.log('服务器运行在 http://localhost:3001');
});
