const { fetchFootballAPI, mapTeamName } = require("../_shared");

module.exports = async function handler(req, res) {
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
};
