const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const fs = require("fs");

let db;

async function getDb() {
  if (db) return db;
  const dataDir = path.join("/tmp", "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  db = await open({
    filename: path.join(dataDir, "app.db"),
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return db;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  try {
    const database = await getDb();
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Full name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await database.get("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await database.run(
      "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
      [fullName.trim(), normalizedEmail, passwordHash]
    );
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: { id: result.lastID, fullName: fullName.trim(), email: normalizedEmail }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong during signup." });
  }
};
