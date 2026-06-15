const FOOTBALL_API_BASE = "https://api.football-data.org/v4";
const FOOTBALL_API_TOKEN = "019e80f1f89b4c62b9d9f1aa9011d208";
const CACHE_TTL = 60_000;

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

module.exports = { fetchFootballAPI, mapTeamName };
