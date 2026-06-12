const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
const PORT = 3000;

let db;

// football-data.org API config
const FOOTBALL_API_BASE = "https://api.football-data.org/v4";
const FOOTBALL_API_TOKEN = "019e80f1f89b4c62b9d9f1aa9011d208";
const CACHE_TTL = 60_000; // 60 seconds

// API name → our internal name
const API_TO_LOCAL = {
  "South Korea": "Rep. of Korea",
  "Czechia": "Czech Rep.",
  "Bosnia-Herzegovina": "Bosnia/Herzeg.",
  "United States": "USA",
  "Iran": "IR Iran",
  "Cape Verde Islands": "Cape Verde",
  "Congo DR": "DR Congo"
};

const liveCache = {};

async function fetchFootballAPI(endpoint) {
  const now = Date.now();
  if (liveCache[endpoint] && now - liveCache[endpoint].ts < CACHE_TTL) {
    return liveCache[endpoint].data;
  }
  const res = await fetch(`${FOOTBALL_API_BASE}${endpoint}`, {
    headers: { "X-Auth-Token": FOOTBALL_API_TOKEN }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`football-data.org ${res.status}: ${text}`);
  }
  const data = await res.json();
  liveCache[endpoint] = { data, ts: now };
  return data;
}

function mapTeamName(apiName) {
  return API_TO_LOCAL[apiName] || apiName;
}

// Middleware
app.use(express.json());

// Serve frontend files
app.use(express.static(__dirname));

// Initialize database
async function initDatabase() {
  const dataDir = path.join(__dirname, "data");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

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

  console.log("Database connected successfully.");
}

// Home route — landing page (index.html is served by static middleware)

// Signup route
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.run(
      `
      INSERT INTO users (full_name, email, password_hash)
      VALUES (?, ?, ?)
      `,
      [fullName.trim(), normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: result.lastID,
        fullName: fullName.trim(),
        email: normalizedEmail
      }
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during signup."
    });
  }
});

// Signin route
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Signin error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during signin."
    });
  }
});

// Live match results
app.get("/api/live/matches", async (req, res) => {
  try {
    const data = await fetchFootballAPI("/competitions/WC/matches");
    const matches = data.matches.map((m) => ({
      matchday: m.matchday,
      group: m.group ? m.group.replace("GROUP_", "").replace("Group ", "") : null,
      status: m.status,
      utcDate: m.utcDate,
      homeTeam: mapTeamName(m.homeTeam.name),
      awayTeam: mapTeamName(m.awayTeam.name),
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
      stage: m.stage
    }));
    res.json({ success: true, matches });
  } catch (error) {
    console.error("Live matches error:", error.message);
    res.status(502).json({ success: false, message: "Failed to fetch live data." });
  }
});

// Live group standings
app.get("/api/live/standings", async (req, res) => {
  try {
    const data = await fetchFootballAPI("/competitions/WC/standings");
    const standings = data.standings.map((s) => ({
      group: s.group.replace("GROUP_", "").replace("Group ", ""),
      table: s.table.map((t) => ({
        position: t.position,
        team: mapTeamName(t.team.name),
        played: t.playedGames,
        won: t.won,
        draw: t.draw,
        lost: t.lost,
        goalsFor: t.goalsFor,
        goalsAgainst: t.goalsAgainst,
        goalDifference: t.goalDifference,
        points: t.points
      }))
    }));
    res.json({ success: true, standings });
  } catch (error) {
    console.error("Live standings error:", error.message);
    res.status(502).json({ success: false, message: "Failed to fetch live data." });
  }
});

// Start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
  });