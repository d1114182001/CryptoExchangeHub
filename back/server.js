const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Database connection settings
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost", // Use "localhost" if running on Raspberry Pi
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "login",
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to the database successfully.");
  }
});

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const user = results[0];
    const storedHash = user.password;

    // Verify password using SHA-256
    const hash = crypto.createHash("sha256").update(password).digest("hex");

    if (hash !== storedHash) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.json({ success: true, token });
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://<RaspberryPi_IP>:${PORT}`);
});
