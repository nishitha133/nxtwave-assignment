const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const db = new sqlite3.Database(":memory:");
const upload = multer({ dest: "uploads/" });
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database setup
db.serialize(() => {
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      company TEXT,
      age INTEGER,
      dob TEXT,
      profile_image TEXT
    )
  `);
  db.run(`
    CREATE TABLE otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      otp TEXT,
      expires_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// Simulated email sending
const sendOTPEmail = (email, otp) => {
  console.log(`Sending OTP ${otp} to ${email}`);
};

// Register endpoint
app.post("/register", upload.single("profile_image"), async (req, res) => {
  const { name, email, password, company, age, dob } = req.body;
  const profileImage = req.file ? req.file.filename : null;

  if (!profileImage) return res.status(400).send("Image upload is required");

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (name, email, password, company, age, dob, profile_image)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, company, age, dob, profileImage],
    (err) => {
      if (err) return res.status(400).send("User already exists");
      res.send("User registered successfully");
    }
  );
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) return res.status(400).send("Invalid credentials");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send("Invalid credentials");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.run(
      `INSERT INTO otps (user_id, otp, expires_at) VALUES (?, ?, ?)`,
      [user.id, otp, expiresAt],
      (err) => {
        if (err) return res.status(500).send("Error generating OTP");

        sendOTPEmail(user.email, otp);
        res.send("OTP sent to email");
      }
    );
  });
});

// Verify OTP endpoint
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  db.get(
    `SELECT otps.otp, otps.expires_at, users.name, users.company 
     FROM otps
     JOIN users ON otps.user_id = users.id
     WHERE users.email = ?`,
    [email],
    (err, result) => {
      if (err || !result) return res.status(400).send("Invalid OTP");

      const isExpired = new Date(result.expires_at) < new Date();
      if (isExpired || otp !== result.otp) return res.status(400).send("Invalid OTP");

      res.json({
        message: `Welcome, ${result.name}!`,
        company: result.company,
      });
    }
  );
});

// Delete account endpoint
app.post("/delete-account", (req, res) => {
  const { email } = req.body;

  db.run("DELETE FROM users WHERE email = ?", [email], (err) => {
    if (err) return res.status(500).send("Error deleting account");
    res.send("Account deleted successfully");
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
