const { fetchFootballAPI, mapTeamName } = require("../_shared");

module.exports = async function handler(req, res) {
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
};
