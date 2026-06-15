(function () {
  "use strict";

  var ADMIN_EMAIL = "crasto.reuben15@gmail.com";
  var GROUP_KEY = "groupStagePredictions2026";
  var KNOCKOUT_KEY = "knockoutPicks2026";
  var R32_KEY = "knockoutR32_2026";
  var LOCK_KEY = "groupStageLocked2026";
  var KO_LOCK_KEY = "knockoutLocked2026";

  var groupTeams = {
    A: ["Mexico", "South Africa", "Rep. of Korea", "Czech Rep."],
    B: ["Canada", "Bosnia/Herzeg.", "Qatar", "Switzerland"],
    C: ["Brazil", "Morocco", "Haiti", "Scotland"],
    D: ["USA", "Paraguay", "Australia", "Turkey"],
    E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
    F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
    G: ["Belgium", "Egypt", "IR Iran", "New Zealand"],
    H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
    I: ["France", "Senegal", "Iraq", "Norway"],
    J: ["Argentina", "Algeria", "Austria", "Jordan"],
    K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
    L: ["England", "Croatia", "Ghana", "Panama"]
  };

  var PAIRS = [[0, 1], [2, 3], [0, 2], [3, 1], [3, 0], [1, 2]];
  var LETTERS = Object.keys(groupTeams);
  var ROUND_NAMES = ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Final"];

  function isAdmin() {
    return (localStorage.getItem("userEmail") || "").toLowerCase() === ADMIN_EMAIL;
  }

  function parseGroupStage(wb) {
    var ws = wb.getWorksheet("Group Stage");
    if (!ws) return null;

    var predictions = {};
    var currentGroup = -1;
    var matchInGroup = 0;

    ws.eachRow(function (row) {
      var cellB = String(row.getCell(2).value || "").trim();
      var cellC = String(row.getCell(3).value || "").trim();

      if (cellB.match(/^GROUP\s+[A-L]$/i)) {
        var letter = cellB.replace(/^GROUP\s+/i, "").toUpperCase();
        currentGroup = LETTERS.indexOf(letter);
        matchInGroup = 0;
        return;
      }

      if (cellB === "Date" || cellB === "#" || !cellC || currentGroup < 0) return;

      var homeTeam = cellC;
      var teams = groupTeams[LETTERS[currentGroup]];
      if (!teams) return;

      var isTeamRow = teams.some(function (t) {
        return t === homeTeam;
      });
      if (!isTeamRow) return;

      var homeScore = row.getCell(4).value;
      var awayScore = row.getCell(6).value;

      if (homeScore != null && homeScore !== "" && awayScore != null && awayScore !== "") {
        predictions["group-" + currentGroup + "-match-" + matchInGroup] = {
          homeScore: Number(homeScore),
          awayScore: Number(awayScore)
        };
      }
      matchInGroup++;
    });

    return predictions;
  }

  function calcStandings(letter, predictions) {
    var teams = groupTeams[letter];
    var gi = LETTERS.indexOf(letter);
    var t = {};
    teams.forEach(function (team) {
      t[team] = { team: team, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });
    PAIRS.forEach(function (p, mi) {
      var pr = predictions["group-" + gi + "-match-" + mi];
      if (!pr || pr.homeScore === "" || pr.awayScore === "" || pr.homeScore == null || pr.awayScore == null) return;
      var hs = Number(pr.homeScore), as = Number(pr.awayScore);
      if (isNaN(hs) || isNaN(as)) return;
      var H = t[teams[p[0]]], A = t[teams[p[1]]];
      H.p++; A.p++; H.gf += hs; H.ga += as; A.gf += as; A.ga += hs;
      if (hs > as) { H.w++; A.l++; H.pts += 3; }
      else if (hs < as) { A.w++; H.l++; A.pts += 3; }
      else { H.d++; A.d++; H.pts++; A.pts++; }
    });
    var rows = Object.keys(t).map(function (k) { t[k].gd = t[k].gf - t[k].ga; return t[k]; });
    rows.sort(function (a, b) {
      return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team);
    });
    return rows;
  }

  function buildR32FromPredictions(predictions) {
    var groupWinners = [];
    var groupRunners = [];
    var thirdPlace = [];

    LETTERS.forEach(function (letter) {
      var standings = calcStandings(letter, predictions);
      if (standings.length >= 3) {
        groupWinners.push(standings[0].team);
        groupRunners.push(standings[1].team);
        thirdPlace.push({ team: standings[2].team, group: letter, pts: standings[2].pts, gd: standings[2].gd, gf: standings[2].gf });
      }
    });

    thirdPlace.sort(function (a, b) {
      return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team);
    });

    var best8Third = thirdPlace.slice(0, 8).map(function (t) { return t.team; });

    var r32 = [];
    for (var i = 0; i < 16; i++) {
      var team1 = groupWinners[i] || "TBD";
      var team2 = i < 8 ? (best8Third[i] || "TBD") : (groupRunners[i - 8] || "TBD");
      if (i < 4) {
        team2 = groupRunners[i + 8] || "TBD";
      } else if (i < 8) {
        team2 = best8Third[i - 4] || "TBD";
      } else if (i < 12) {
        team2 = groupRunners[i - 8] || "TBD";
      } else {
        team2 = best8Third[i - 8] || "TBD";
      }
      r32.push([team1, team2]);
    }

    return r32;
  }

  function parseKnockout(wb) {
    var ws = wb.getWorksheet("Knockout Bracket");
    if (!ws) return null;

    var picks = {};
    var currentRound = -1;
    var matchInRound = 0;

    ws.eachRow(function (row) {
      var cellB = String(row.getCell(2).value || "").trim();
      var cellG = String(row.getCell(7).value || "").trim();

      for (var r = 0; r < ROUND_NAMES.length; r++) {
        if (cellB === ROUND_NAMES[r]) {
          currentRound = r;
          matchInRound = 0;
          return;
        }
      }

      if (cellB === "Third-place play-off") {
        currentRound = "third";
        return;
      }

      if (cellB === "Match" || cellB === "PREDICTED CHAMPION" || currentRound < 0) return;

      if (currentRound === "third") {
        if (cellG && cellG !== "—") {
          picks["third"] = cellG;
        }
        return;
      }

      var matchNum = parseInt(cellB, 10);
      if (isNaN(matchNum)) return;

      if (cellG && cellG !== "—") {
        picks[currentRound + "-" + (matchNum - 1)] = cellG;
      }
      matchInRound++;
    });

    return picks;
  }

  window.handleImportXlsx = function (file, statusEl) {
    if (!isAdmin()) {
      statusEl.textContent = "Only the admin account can import predictions.";
      statusEl.className = "import-status import-status--error";
      return;
    }

    if (typeof ExcelJS === "undefined") {
      statusEl.textContent = "Excel library still loading. Try again in a moment.";
      statusEl.className = "import-status import-status--error";
      return;
    }

    statusEl.textContent = "Reading file…";
    statusEl.className = "import-status import-status--loading";

    var reader = new FileReader();
    reader.onload = function (e) {
      var wb = new ExcelJS.Workbook();
      wb.xlsx.load(e.target.result).then(function () {
        var groupPredictions = parseGroupStage(wb);
        var knockoutPicks = parseKnockout(wb);

        var imported = [];

        var userId = localStorage.getItem("userId");

        if (groupPredictions && Object.keys(groupPredictions).length > 0) {
          localStorage.setItem(GROUP_KEY, JSON.stringify(groupPredictions));
          imported.push(Object.keys(groupPredictions).length + " group stage matches");

          var r32 = buildR32FromPredictions(groupPredictions);
          localStorage.setItem(R32_KEY, JSON.stringify(r32));
          localStorage.setItem(LOCK_KEY, "true");
          imported.push("Group stage locked + R32 bracket generated");

          if (userId) {
            fetch("/api/predictions/group", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: userId, predictions: groupPredictions })
            }).catch(function () {});
            fetch("/api/predictions/lock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: userId, lockType: "group", r32Data: r32 })
            }).catch(function () {});
          }
        }

        if (knockoutPicks && Object.keys(knockoutPicks).length > 0) {
          localStorage.setItem(KNOCKOUT_KEY, JSON.stringify(knockoutPicks));
          localStorage.setItem(KO_LOCK_KEY, "true");
          imported.push(Object.keys(knockoutPicks).length + " knockout picks");

          if (userId) {
            fetch("/api/predictions/knockout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: userId, picks: knockoutPicks })
            }).catch(function () {});
            fetch("/api/predictions/lock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: userId, lockType: "knockout" })
            }).catch(function () {});
          }
        }

        if (imported.length === 0) {
          statusEl.textContent = "No predictions found in the file. Make sure it has 'Group Stage' and/or 'Knockout Bracket' sheets.";
          statusEl.className = "import-status import-status--error";
        } else {
          statusEl.textContent = "Imported: " + imported.join(", ") + ". Redirecting…";
          statusEl.className = "import-status import-status--success";
          setTimeout(function () { window.location.href = "brackets.html"; }, 1500);
        }
      }).catch(function (err) {
        console.error("Import error:", err);
        statusEl.textContent = "Failed to parse the file. Make sure it's a valid .xlsx file.";
        statusEl.className = "import-status import-status--error";
      });
    };
    reader.readAsArrayBuffer(file);
  };
})();
