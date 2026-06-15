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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await database.get("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      user: { id: user.id, fullName: user.full_name, email: user.email }
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong during signin." });
  }
};
