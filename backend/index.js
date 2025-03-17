const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bitcore = require("bitcore-lib");
const Mnemonic = require('bitcore-mnemonic');
const crypto = require('crypto');

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
    const sql = "SELECT * FROM addresses WHERE user_id = ?";
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
    //const sql = "SELECT * FROM wallets WHERE user_id = ? AND address = ?";
    const sql = "SELECT * FROM addresses WHERE user_id = ? AND address = ?";
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
    //const sqlUser = "SELECT * FROM users WHERE id = ?";
    const sqlUser = "SELECT * FROM users WHERE id = ?";
    db.query(sqlUser, [userId], async (err, userResults) => {
      if (err) return res.status(500).json({ message: "伺服器錯誤" });
      if (userResults.length === 0) return res.status(404).json({ message: "用戶不存在" });

      const user = userResults[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).json({ message: "密碼錯誤" });

      // 獲取私鑰
      //const sqlWallet = "SELECT private_key FROM wallets WHERE user_id = ? AND address = ?";
      const sqlWallet = "SELECT private_key FROM addresses WHERE user_id = ? AND address = ?";
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

app.post("/sign-transaction", verifyToken, (req, res) => {
  const { senderAddress, recipientAddress, amount, transactionHash } = req.body;
  const userId = req.userId;

  const sqlSender = "SELECT * FROM addresses WHERE user_id = ? AND address = ?";
  db.query(sqlSender, [userId, senderAddress], (err, senderResults) => {
    if (err) {
      console.error("查詢發送者錯誤:", err);
      return res.status(500).json({ message: "伺服器錯誤" });
    }
    if (senderResults.length === 0) {
      return res.status(404).json({ message: "發送錢包不存在" });
    }

    const wallet = senderResults[0];
    const privateKey = new bitcore.PrivateKey(wallet.private_key);
    const amountInBTC = parseFloat(amount);

    if (wallet.balance < amountInBTC) {
      return res.status(400).json({ message: "餘額不足" });
    }

    // 生成簽名
    const message = new bitcore.Message(transactionHash);
    const signature = message.sign(privateKey);
    const isValidSignature = message.verify(senderAddress, signature);
    if (!isValidSignature) {
      return res.status(400).json({ message: "簽名無效" });
    }

    res.json({
      message: "簽名成功",
      signature,
    });
  });
});

/*app.post("/complete-transaction", verifyToken, (req, res) => {
  const { senderAddress, recipientAddress, amount, transactionHash } = req.body;
  const userId = req.userId;

  // 查詢發送者地址
  const sqlSender = "SELECT * FROM addresses WHERE user_id = ? AND address = ?";
  db.query(sqlSender, [userId, senderAddress], (err, senderResults) => {
    if (err) {
      console.error("查詢發送者錯誤:", err);
      return res.status(500).json({ message: "伺服器錯誤" });
    }
    if (senderResults.length === 0) {
      return res.status(404).json({ message: "發送錢包不存在" });
    }

    const wallet = senderResults[0];
    if (wallet.is_locked === 1) {
      return res.status(400).json({ message: "該地址正在處理交易，請稍後重試" });
    }
    const privateKey = new bitcore.PrivateKey(wallet.private_key);
    const amountInBTC = parseFloat(amount);

    if (wallet.balance < amountInBTC) {
      return res.status(400).json({ message: "餘額不足" });
    }

    // 生成簽名
    const message = new bitcore.Message(transactionHash);
    const signature = message.sign(privateKey);
    const isValidSignature = message.verify(senderAddress, signature);
    if (!isValidSignature) {
      return res.status(400).json({ message: "簽名無效" });
    }

    // 構建交易
    const amountInSatoshis = Math.round(amountInBTC * 1e8);
    const transaction = new bitcore.Transaction()
      .to(recipientAddress, amountInSatoshis)
      .change(senderAddress)
      .sign(privateKey);
    const transactionId = transaction.hash;

    // 開始事務
    db.beginTransaction((err) => {
      if (err) {
        console.error("事務啟動失敗:", err);
        return res.status(500).json({ message: "事務啟動失敗" });
      }

      // 鎖定發送者地址
      const sqlLockSender = "UPDATE addresses SET is_locked = 1 WHERE address = ? AND is_locked = 0";
      db.query(sqlLockSender, [senderAddress], (err, lockResult) => {
        if (err) {
          db.rollback(() => {
            console.error("鎖定地址失敗:", err);
            res.status(500).json({ message: "鎖定地址失敗" });
          });
          return;
        }
        if (lockResult.affectedRows === 0) {
          db.rollback(() => {
            console.log(`地址 ${senderAddress} 已鎖定，拒絕重複交易`);
            res.status(400).json({ message: "該地址正在處理其他交易" });
          });
          return;
        }

        // 更新發送者餘額
        const sqlUpdateSender = "UPDATE addresses SET balance = balance - ? WHERE address = ?";
        console.log(`更新發送者：${senderAddress}, 減少=${amountInBTC}`);
        db.query(sqlUpdateSender, [amountInBTC, senderAddress], (err) => {
          if (err) {
            db.rollback(() => {
              console.error("更新發送餘額失敗:", err);
              res.status(500).json({ message: "更新發送餘額失敗" });
            });
            return;
          }

          // 更新接收者餘額
          const sqlUpdateRecipient = "UPDATE addresses SET balance = balance + ? WHERE address = ?";
          console.log(`更新接收者：${recipientAddress}, 增加=${amountInBTC}`);
          db.query(sqlUpdateRecipient, [amountInBTC, recipientAddress], (err) => {
            if (err) {
              db.rollback(() => {
                console.error("更新接收餘額失敗:", err);
                res.status(500).json({ message: "更新接收餘額失敗" });
              });
              return;
            }

            // 提交事務
            db.commit((err) => {
              if (err) {
                db.rollback(() => {
                  console.error("事務提交失敗:", err);
                  res.status(500).json({ message: "事務提交失敗" });
                });
                return;
              }

              // 解鎖發送者地址
              const sqlUnlockSender = "UPDATE addresses SET is_locked = 0 WHERE address = ?";
              db.query(sqlUnlockSender, [senderAddress], (err) => {
                if (err) {
                  console.error("解鎖地址失敗:", err);
                  // 已提交，不回滾，但記錄錯誤
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
    });
  });
});*/

/*app.post("/complete-transaction", verifyToken, async (req, res) => {
  const { senderAddress, recipientAddress, amount, transactionHash } = req.body;
  const userId = req.userId;

  try {
    //const sqlSender = "SELECT * FROM wallets WHERE user_id = ? AND address = ?";
    const sqlSender = "SELECT * FROM addresses WHERE user_id = ? AND address = ?";
    db.query(sqlSender, [userId, senderAddress], async (err, senderResults) => {
      if (err) return res.status(500).json({ message: "伺服器錯誤" });
      if (senderResults.length === 0) return res.status(404).json({ message: "發送錢包不存在" });

      const wallet = senderResults[0];
      const privateKey = new bitcore.PrivateKey(wallet.private_key);

      const amountInBTC = parseFloat(amount);
      if (wallet.balance < amountInBTC) return res.status(400).json({ message: "餘額不足" });

      // 生成簽名（後端負責）
      const message = new bitcore.Message(transactionHash);
      const signature = message.sign(privateKey);

      // 驗證簽名（可選，確認簽名有效）
      const isValidSignature = message.verify(senderAddress, signature);
      if (!isValidSignature) return res.status(400).json({ message: "簽名無效" });

      const amountInSatoshis = Math.round(amountInBTC * 1e8);
      const transaction = new bitcore.Transaction()
        .to(recipientAddress, amountInSatoshis)
        .change(senderAddress)
        .sign(privateKey);
      const transactionId = transaction.hash;

      db.beginTransaction((err) => {
        if (err) return res.status(500).json({ message: "事務啟動失敗" });

        const sqlUpdateSender = "UPDATE addresses SET balance = balance - ? WHERE address = ?";
        db.query(sqlUpdateSender, [amountInBTC, senderAddress], (err) => {
          if (err) {
            db.rollback(() => res.status(500).json({ message: "更新發送餘額失敗" }));
            return;
          }

          //const sqlUpdateRecipient = "UPDATE wallets SET balance = balance + ? WHERE address = ?";
          const sqlUpdateRecipient = "UPDATE addresses SET balance = balance + ? WHERE address = ?";
          db.query(sqlUpdateRecipient, [amountInBTC, recipientAddress], (err) => {
            if (err) {
              db.rollback(() => res.status(500).json({ message: "更新接收餘額失敗" }));
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
                signature, // 返回後端生成的簽名
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("完成交易錯誤:", error);
    res.status(500).json({ message: "交易失敗" });
  }
});*/

/*app.post("/newaddress",(req,res) => {
  //seach mysql ，先找註記詞
  const userId = req.body.userId;
  console.log("接收到的 userId:", userId);
  let mnemonics,newPath,address,privatekey,publickey,walletId;
  
  const mnemonic_sql = "select id,mnemonic from wallets where user_id = ?";
  db.query(mnemonic_sql,[userId],(err, results) => {
    if (err) {
      console.error('查詢失敗:', err);
      res.status(500).json({ error: '查詢路徑失敗' });
      return;
    };
    mnemonics = results[0].mnemonic;
    walletId = results[0].id;
    console.log(mnemonics);
  
  });
  const sql = "SELECT paths FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1";
  db.query(sql,[userId],(err, rows) => {
    if (err) {
      console.error('查詢失敗:', err);
      res.status(500).json({ error: '查詢路徑失敗' });
      return;
    };
    const mnemonic = new Mnemonic(mnemonics);
    const seed = mnemonic.toSeed();
    const root = bitcore.HDPrivateKey.fromSeed(seed);
    const currentPath = rows.length > 0 ? rows[0].paths : "m/44'/0'/0'/0/0";
    const pathParts = currentPath.split('/');
    const currentIndex = parseInt(pathParts[pathParts.length - 1]);
    const nextIndex = currentIndex + 1;
    newPath = pathParts.slice(0, -1).join('/') + '/' + nextIndex;

    // 派生新地址
    const derived = root.derive(newPath);
    address = derived.privateKey.toAddress().toString();
    privatekey =derived.privateKey.toWIF();
    publickey = derived.publicKey.toString('hex');
    
    console.log(address);

  });
  //新地址儲存
  const newaddrsql = "INSERT INTO addresses (wallet_id,paths,address,private_key,public_key,user_id) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(newaddrsql, [walletId, newPath, address, privatekey, publickey,userId], (err) => {
    if (err) return res.status(500).json({ error: "Failed to insert address." }); 
    res.json({address}); 
  });
  
}); */

app.post("/newaddress", (req, res) => {
  const userId = req.body.userId;
  console.log("接收到的 userId:", userId);

  // **🔵 1. 查询 mnemonic**
  const mnemonic_sql = "SELECT id, mnemonic FROM wallets WHERE user_id = ?";
  db.query(mnemonic_sql, [userId], (err, mnemonicResults) => {
    if (err) {
      console.error("查询 mnemonic 失败:", err);
      return res.status(500).json({ error: "查询 mnemonic 失败" });
    }
    if (mnemonicResults.length === 0) {
      return res.status(404).json({ error: "未找到用户的钱包助记词" });
    }

    const mnemonics = mnemonicResults[0].mnemonic;
    const walletId = mnemonicResults[0].id;
    console.log("助记词:", mnemonics);

    // **🔵 2. 查询上一个地址路径**
    const sql = "SELECT paths FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1";
    db.query(sql, [userId], (err, rows) => {
      if (err) {
        console.error("查询路径失败:", err);
        return res.status(500).json({ error: "查询路径失败" });
      }

      const mnemonic = new Mnemonic(mnemonics);
      const seed = mnemonic.toSeed();
      const root = bitcore.HDPrivateKey.fromSeed(seed);

      const currentPath = rows.length > 0 ? rows[0].paths : "m/44'/0'/0'/0/0";
      const pathParts = currentPath.split('/');
      const currentIndex = parseInt(pathParts[pathParts.length - 1]);
      const nextIndex = currentIndex + 1;
      const newPath = pathParts.slice(0, -1).join('/') + '/' + nextIndex;

      // **🔵 3. 生成新地址**
      const derived = root.derive(newPath);
      const address = derived.privateKey.toAddress().toString();
      const privatekey = derived.privateKey.toWIF();
      const publickey = derived.publicKey.toString('hex');

      console.log("新地址:", address);

      // **🔵 4. 插入数据库**
      const newaddrsql = `
        INSERT INTO addresses (wallet_id, paths, address, private_key, public_key, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(newaddrsql, [walletId, newPath, address, privatekey, publickey, userId], (err) => {
        if (err) {
          console.error("插入地址失败:", err);
          return res.status(500).json({ error: "无法插入新地址" });
        }
        res.json({ address });
      });
    });
  });
});

app.post("/complete-transaction", verifyToken, (req, res) => {
  const { senderAddress, recipientAddress, amount, transactionHash, signature } = req.body;
  const userId = req.userId;

  const sqlSender = "SELECT * FROM addresses WHERE user_id = ? AND address = ?";
  db.query(sqlSender, [userId, senderAddress], (err, senderResults) => {
    if (err) {
      console.error("查詢發送者錯誤:", err);
      return res.status(500).json({ message: "伺服器錯誤" });
    }
    if (senderResults.length === 0) {
      return res.status(404).json({ message: "發送錢包不存在" });
    }

    const wallet = senderResults[0];
    const privateKey = new bitcore.PrivateKey(wallet.private_key);
    const amountInBTC = parseFloat(amount);

    if (wallet.balance < amountInBTC) {
      return res.status(400).json({ message: "餘額不足" });
    }

    // 驗證簽名
    const message = new bitcore.Message(transactionHash);
    const isValidSignature = message.verify(senderAddress, signature);
    if (!isValidSignature) {
      return res.status(400).json({ message: "簽名無效" });
    }

    // 構建交易
    const amountInSatoshis = Math.round(amountInBTC * 1e8);
    const transaction = new bitcore.Transaction()
      .to(recipientAddress, amountInSatoshis)
      .change(senderAddress)
      .sign(privateKey);
    const transactionId = transaction.hash;

    // 開始事務
    db.beginTransaction((err) => {
      if (err) {
        console.error("事務啟動失敗:", err);
        return res.status(500).json({ message: "事務啟動失敗" });
      }

      // 更新發送者餘額
      const sqlUpdateSender = "UPDATE addresses SET balance = balance - ? WHERE address = ?";
      console.log(`更新發送者：${senderAddress}, 減少=${amountInBTC}`);
      db.query(sqlUpdateSender, [amountInBTC, senderAddress], (err) => {
        if (err) {
          db.rollback(() => {
            console.error("更新發送餘額失敗:", err);
            res.status(500).json({ message: "更新發送餘額失敗" });
          });
          return;
        }

        // 更新接收者餘額
        const sqlUpdateRecipient = "UPDATE addresses SET balance = balance + ? WHERE address = ?";
        console.log(`更新接收者：${recipientAddress}, 增加=${amountInBTC}`);
        db.query(sqlUpdateRecipient, [amountInBTC, recipientAddress], (err) => {
          if (err) {
            db.rollback(() => {
              console.error("更新接收餘額失敗:", err);
              res.status(500).json({ message: "更新接收餘額失敗" });
            });
            return;
          }

          // 提交事務
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                console.error("事務提交失敗:", err);
                res.status(500).json({ message: "事務提交失敗" });
              });
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
});

app.post('/recover-wallet', (req, res) => {
  try {
    const mnemonic = req.body.mnemonic;
    const userId = req.body.userId;
    console.log(mnemonic);
    if (!Mnemonic.isValid(mnemonic)) {
      return res.status(400).json({ error: '無效的助記詞' });
    }
    const searchsql = "select * from wallets where mnemonic = ?";
    db.query(searchsql,[mnemonic],(err,result) =>{
      if (Array.isArray(result) && result.length > 0){
        res.status(500).json({message:'已存在錢包!'});
        console.log('已存在');
        console.log(result);
      }
      else{
        const mnemonicObj = new Mnemonic(mnemonic);
        const seed = mnemonicObj.toSeed();
        const hdPrivateKey = bitcore.HDPrivateKey.fromSeed(seed, 'mainnet');

        const derivedKey = hdPrivateKey.derive("m/44'/0'/0'/0/0");
        const address = derivedKey.privateKey.toAddress().toString();
        const public_key= derivedKey.publicKey.toString('hex');
        const private_key = derivedKey.privateKey.toWIF();
        const path ="m/44'/0'/0'/0/0";
        const insertsql = "INSERT INTO wallets (user_id, mnemonic) VALUES (?, ?)";
        db.query(insertsql,[userId,mnemonic],(err,result) =>{
          const walletId = result.insertId;
          const addrsql ="INSERT INTO addresses (wallet_id,paths,address,private_key,public_key,user_id) VALUES (?, ?, ?, ?, ?, ?)";
          db.query(addrsql, [walletId, path, address, private_key, public_key,userId], (err) => {
            if (err) return res.status(500).json({ error: "Failed to insert address." });  
          });
        });
        

        res.json({
          address,
          mnemonic,
        });
      }
    });
    

    
  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: '恢復錢包失敗' });
  }
});

// 啟動伺服器
app.listen(3001, () => {
  console.log('服务器运行在 http://localhost:3001');
});
