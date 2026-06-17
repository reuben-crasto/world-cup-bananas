const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://cdn.jsdelivr.net"]
    }
  }
}));

app.use(function (req, res, next) {
  if (process.env.RAILWAY_ENVIRONMENT && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(301, "https://" + req.headers.host + req.url);
  }
  next();
});

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
  const dataDir = process.env.RAILWAY_ENVIRONMENT ? "/app/data" : path.join(__dirname, "data");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
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

  await db.exec(`
    CREATE TABLE IF NOT EXISTS group_predictions (
      user_id INTEGER NOT NULL,
      match_key TEXT NOT NULL,
      home_score INTEGER NOT NULL,
      away_score INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, match_key),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS knockout_predictions (
      user_id INTEGER NOT NULL,
      pick_key TEXT NOT NULL,
      team TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, pick_key),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_locks (
      user_id INTEGER NOT NULL,
      lock_type TEXT NOT NULL,
      r32_data TEXT,
      locked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, lock_type),
      FOREIGN KEY (user_id) REFERENCES users(id)
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

// ── Prediction APIs ──

// Save group stage predictions
app.post("/api/predictions/group", async (req, res) => {
  try {
    const { userId, predictions } = req.body;
    if (!userId || !predictions) {
      return res.status(400).json({ success: false, message: "userId and predictions required." });
    }
    const stmt = await db.prepare(
      "INSERT OR REPLACE INTO group_predictions (user_id, match_key, home_score, away_score, updated_at) VALUES (?, ?, ?, ?, datetime('now'))"
    );
    for (const [key, val] of Object.entries(predictions)) {
      if (val.homeScore != null && val.homeScore !== "" && val.awayScore != null && val.awayScore !== "") {
        await stmt.run(userId, key, Number(val.homeScore), Number(val.awayScore));
      }
    }
    await stmt.finalize();
    res.json({ success: true });
  } catch (error) {
    console.error("Save group predictions error:", error);
    res.status(500).json({ success: false, message: "Failed to save predictions." });
  }
});

// Get group stage predictions for a user
app.get("/api/predictions/group/:userId", async (req, res) => {
  try {
    const rows = await db.all(
      "SELECT match_key, home_score, away_score FROM group_predictions WHERE user_id = ?",
      [req.params.userId]
    );
    const predictions = {};
    rows.forEach(r => { predictions[r.match_key] = { homeScore: r.home_score, awayScore: r.away_score }; });
    res.json({ success: true, predictions });
  } catch (error) {
    console.error("Get group predictions error:", error);
    res.status(500).json({ success: false, message: "Failed to load predictions." });
  }
});

// Save knockout predictions
app.post("/api/predictions/knockout", async (req, res) => {
  try {
    const { userId, picks } = req.body;
    if (!userId || !picks) {
      return res.status(400).json({ success: false, message: "userId and picks required." });
    }
    const stmt = await db.prepare(
      "INSERT OR REPLACE INTO knockout_predictions (user_id, pick_key, team, updated_at) VALUES (?, ?, ?, datetime('now'))"
    );
    for (const [key, team] of Object.entries(picks)) {
      if (team) await stmt.run(userId, key, team);
    }
    await stmt.finalize();
    res.json({ success: true });
  } catch (error) {
    console.error("Save knockout predictions error:", error);
    res.status(500).json({ success: false, message: "Failed to save picks." });
  }
});

// Get knockout predictions for a user
app.get("/api/predictions/knockout/:userId", async (req, res) => {
  try {
    const rows = await db.all(
      "SELECT pick_key, team FROM knockout_predictions WHERE user_id = ?",
      [req.params.userId]
    );
    const picks = {};
    rows.forEach(r => { picks[r.pick_key] = r.team; });
    res.json({ success: true, picks });
  } catch (error) {
    console.error("Get knockout predictions error:", error);
    res.status(500).json({ success: false, message: "Failed to load picks." });
  }
});

// Save lock state + R32 data
app.post("/api/predictions/lock", async (req, res) => {
  try {
    const { userId, lockType, r32Data } = req.body;
    if (!userId || !lockType) {
      return res.status(400).json({ success: false, message: "userId and lockType required." });
    }
    await db.run(
      "INSERT OR REPLACE INTO user_locks (user_id, lock_type, r32_data, locked_at) VALUES (?, ?, ?, datetime('now'))",
      [userId, lockType, r32Data ? JSON.stringify(r32Data) : null]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Save lock error:", error);
    res.status(500).json({ success: false, message: "Failed to save lock." });
  }
});

// Delete lock state
app.delete("/api/predictions/lock", async (req, res) => {
  try {
    const { userId, lockType } = req.body;
    if (!userId || !lockType) {
      return res.status(400).json({ success: false, message: "userId and lockType required." });
    }
    await db.run("DELETE FROM user_locks WHERE user_id = ? AND lock_type = ?", [userId, lockType]);
    if (lockType === "group") {
      await db.run("DELETE FROM user_locks WHERE user_id = ? AND lock_type = 'knockout'", [userId]);
      await db.run("DELETE FROM knockout_predictions WHERE user_id = ?", [userId]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Delete lock error:", error);
    res.status(500).json({ success: false, message: "Failed to delete lock." });
  }
});

// Get lock state for a user
app.get("/api/predictions/locks/:userId", async (req, res) => {
  try {
    const rows = await db.all(
      "SELECT lock_type, r32_data FROM user_locks WHERE user_id = ?",
      [req.params.userId]
    );
    const locks = {};
    rows.forEach(r => {
      locks[r.lock_type] = { locked: true, r32Data: r.r32_data ? JSON.parse(r.r32_data) : null };
    });
    res.json({ success: true, locks });
  } catch (error) {
    console.error("Get locks error:", error);
    res.status(500).json({ success: false, message: "Failed to load locks." });
  }
});

// ── Leaderboard API ──
app.get("/api/leaderboard", async (req, res) => {
  try {
    const users = await db.all("SELECT id, full_name, email, created_at FROM users");
    const allGroupPreds = await db.all("SELECT user_id, match_key, home_score, away_score FROM group_predictions");
    const allKnockoutPicks = await db.all("SELECT user_id, pick_key, team FROM knockout_predictions");
    const allLocks = await db.all("SELECT user_id, lock_type, locked_at FROM user_locks WHERE lock_type = 'group'");

    const locksByUser = {};
    allLocks.forEach(r => { locksByUser[r.user_id] = r.locked_at; });

    // Index predictions by user
    const groupByUser = {};
    allGroupPreds.forEach(r => {
      if (!groupByUser[r.user_id]) groupByUser[r.user_id] = {};
      groupByUser[r.user_id][r.match_key] = { homeScore: r.home_score, awayScore: r.away_score };
    });

    const knockoutByUser = {};
    allKnockoutPicks.forEach(r => {
      if (!knockoutByUser[r.user_id]) knockoutByUser[r.user_id] = {};
      knockoutByUser[r.user_id][r.pick_key] = r.team;
    });

    const board = users.map(u => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      createdAt: u.created_at,
      lockedAt: locksByUser[u.id] || null,
      groupPredictions: groupByUser[u.id] || {},
      knockoutPicks: knockoutByUser[u.id] || {}
    }));

    res.json({ success: true, board });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load leaderboard." });
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