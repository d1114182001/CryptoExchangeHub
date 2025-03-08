const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bitcore = require("bitcore-lib");
const Mnemonic = require('bitcore-mnemonic');


require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// 建立 MySQL 連線
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "uw",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to the database successfully.");
  }
});
const network = bitcore.Networks.mainnet;
function generateMnemonicAndSeed() {
  const mnemonic = new Mnemonic(128);
  const mnemonic2 =mnemonic.toString();
  const seed = mnemonic.toSeed();
  return { mnemonic2, seed };
}

function deriveNewAddress(root, accountIndex = 0, addressIndex = 0) {
  const path = `m/44'/0'/${accountIndex}'/0/${addressIndex}`;
  const child = root.deriveChild(path);
  return {
    path,
    address: child.privateKey.toAddress(network).toString(),
    privateKey: child.privateKey.toWIF(),
    publicKey: child.publicKey.toString('hex')
  };
}


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
    const { mnemonic2, seed } = generateMnemonicAndSeed();
    const hdPrivateKey = bitcore.HDPrivateKey.fromSeed(seed, network);
    const address = deriveNewAddress(hdPrivateKey, 0, 0);
    
    res.json({ mnemonic2, address: address.address});
    
    const walletsql = "INSERT INTO wallets (user_id, mnemonic) VALUES (?, ?)";
    db.query(walletsql, [user_id, mnemonic2], (err,result) => {
      if (err) return res.status(500).json({ error: "Failed to create wallet." });
      const walletId = result.insertId; // 取得新插入的 wallet ID
      
      const addrsql ="INSERT INTO addresses (wallet_id,paths,address,private_key,public_key,user_id) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(addrsql, [walletId, address.path, address.address, address.privateKey, address.publicKey,user_id], (err) => {
        if (err) return res.status(500).json({ error: "Failed to insert address." });  
      });
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create wallet." });
  }
});


// 取得特定使用者的錢包 API (待修，address沒有user_id)
app.get("/wallets", (req, res) => {
  // 从请求头中获取 JWT token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "未提供授權標頭" });

  // 验证 token
  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, decoded) => {
    if (err) return res.status(401).json({ message: "無效的授權標頭" });

    const userId = decoded.userId; // 获取用户 ID

    // 根据用户 ID 查询钱包信息
    const sql = "SELECT * FROM addresses WHERE user_id = ?";
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
