(function () {
  "use strict";

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

  var groupDates = {
    A: ["Jun 11", "Jun 11", "Jun 18", "Jun 18", "Jun 24", "Jun 24"],
    B: ["Jun 12", "Jun 13", "Jun 18", "Jun 18", "Jun 24", "Jun 24"],
    C: ["Jun 13", "Jun 13", "Jun 19", "Jun 19", "Jun 24", "Jun 24"],
    D: ["Jun 12", "Jun 14", "Jun 19", "Jun 19", "Jun 25", "Jun 25"],
    E: ["Jun 14", "Jun 14", "Jun 20", "Jun 20", "Jun 25", "Jun 25"],
    F: ["Jun 14", "Jun 14", "Jun 20", "Jun 21", "Jun 25", "Jun 25"],
    G: ["Jun 15", "Jun 15", "Jun 21", "Jun 21", "Jun 26", "Jun 26"],
    H: ["Jun 15", "Jun 15", "Jun 21", "Jun 21", "Jun 26", "Jun 26"],
    I: ["Jun 16", "Jun 16", "Jun 22", "Jun 22", "Jun 26", "Jun 26"],
    J: ["Jun 16", "Jun 17", "Jun 22", "Jun 22", "Jun 27", "Jun 27"],
    K: ["Jun 17", "Jun 17", "Jun 23", "Jun 23", "Jun 27", "Jun 27"],
    L: ["Jun 17", "Jun 17", "Jun 23", "Jun 23", "Jun 27", "Jun 27"]
  };

  var PAIRS = [[0, 1], [2, 3], [0, 2], [3, 1], [3, 0], [1, 2]];
  var LETTERS = Object.keys(groupTeams);
  var ROUND_NAMES = ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Final"];

  var NAVY = "0A1628";
  var AZURE = "4DABFA";
  var LIME = "A3E635";
  var LIGHT_BG = "F1F5F9";
  var GREEN_BG = "DCFCE7";
  var WHITE = "FFFFFF";

  var headerFont = { name: "Calibri", size: 11, bold: true, color: { argb: "FF" + WHITE } };
  var headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + NAVY } };
  var subHeaderFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + AZURE } };
  var subHeaderFont = { name: "Calibri", size: 11, bold: true, color: { argb: "FF" + WHITE } };
  var altRowFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + LIGHT_BG } };
  var advanceFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + GREEN_BG } };
  var titleFont = { name: "Calibri", size: 16, bold: true, color: { argb: "FF" + NAVY } };
  var subtitleFont = { name: "Calibri", size: 11, color: { argb: "FF64748B" } };
  var boldFont = { name: "Calibri", size: 11, bold: true };
  var normalFont = { name: "Calibri", size: 11 };
  var scoreFont = { name: "Calibri", size: 12, bold: true };

  var thinBorder = {
    top: { style: "thin", color: { argb: "FFE2E8F0" } },
    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
    left: { style: "thin", color: { argb: "FFE2E8F0" } },
    right: { style: "thin", color: { argb: "FFE2E8F0" } }
  };

  function loadJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
  }

  function calcStandings(letter, predictions) {
    var teams = groupTeams[letter];
    var dates = groupDates[letter];
    var matches = PAIRS.map(function (p, i) {
      return { date: dates[i], home: teams[p[0]], away: teams[p[1]] };
    });
    var gi = LETTERS.indexOf(letter);

    var t = {};
    teams.forEach(function (team) {
      t[team] = { team: team, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });
    matches.forEach(function (m, mi) {
      var pr = predictions["group-" + gi + "-match-" + mi];
      if (!pr || pr.homeScore === "" || pr.awayScore === "" || pr.homeScore == null || pr.awayScore == null) return;
      var hs = Number(pr.homeScore), as = Number(pr.awayScore);
      if (isNaN(hs) || isNaN(as)) return;
      var H = t[m.home], A = t[m.away];
      H.p++; A.p++; H.gf += hs; H.ga += as; A.gf += as; A.ga += hs;
      if (hs > as) { H.w++; A.l++; H.pts += 3; }
      else if (hs < as) { A.w++; H.l++; A.pts += 3; }
      else { H.d++; A.d++; H.pts++; A.pts++; }
    });
    var rows = Object.keys(t).map(function (k) { t[k].gd = t[k].gf - t[k].ga; return t[k]; });
    rows.sort(function (a, b) {
      return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team);
    });
    return { matches: matches, standings: rows };
  }

  function applyRowBorder(row, colCount) {
    for (var c = 1; c <= colCount; c++) {
      row.getCell(c).border = thinBorder;
    }
  }

  window.exportPredictions = function () {
    if (typeof ExcelJS === "undefined") {
      alert("Export library is still loading. Please try again in a moment.");
      return;
    }

    var predictions = loadJSON("groupStagePredictions2026");
    var knockoutPicks = loadJSON("knockoutPicks2026");
    var r32Data = null;
    try { r32Data = JSON.parse(localStorage.getItem("knockoutR32_2026")); } catch (e) {}
    var userName = localStorage.getItem("fullName") || "Player";
    var now = new Date();
    var dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    var wb = new ExcelJS.Workbook();
    wb.creator = "World Cup Bananas";
    wb.created = now;

    buildGroupStageSheet(wb, predictions, userName, dateStr);
    buildStandingsSheet(wb, predictions, userName);
    buildKnockoutSheet(wb, knockoutPicks, r32Data, userName, dateStr);

    wb.xlsx.writeBuffer().then(function (buffer) {
      var blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "FIFA2026_Predictions_" + userName.replace(/\s+/g, "_") + ".xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  function buildGroupStageSheet(wb, predictions, userName, dateStr) {
    var ws = wb.addWorksheet("Group Stage", {
      properties: { tabColor: { argb: "FF" + NAVY } }
    });

    ws.columns = [
      { width: 5 },
      { width: 14 },
      { width: 22 },
      { width: 8 },
      { width: 4 },
      { width: 8 },
      { width: 22 }
    ];

    var titleRow = ws.addRow(["", "FIFA 2026 World Cup — Group Stage Predictions"]);
    titleRow.getCell(2).font = titleFont;
    ws.mergeCells(titleRow.number, 2, titleRow.number, 7);

    var subRow = ws.addRow(["", userName + "  ·  Exported " + dateStr]);
    subRow.getCell(2).font = subtitleFont;
    ws.mergeCells(subRow.number, 2, subRow.number, 7);

    ws.addRow([]);

    LETTERS.forEach(function (letter) {
      var gi = LETTERS.indexOf(letter);
      var teams = groupTeams[letter];
      var dates = groupDates[letter];
      var matches = PAIRS.map(function (p, i) {
        return { date: dates[i], home: teams[p[0]], away: teams[p[1]] };
      });

      var grpRow = ws.addRow(["", "GROUP " + letter, "", "", "", "", ""]);
      for (var c = 1; c <= 7; c++) {
        grpRow.getCell(c).font = subHeaderFont;
        grpRow.getCell(c).fill = subHeaderFill;
      }

      var hdrRow = ws.addRow(["", "Date", "Home", "Score", "", "Score", "Away"]);
      for (var c2 = 1; c2 <= 7; c2++) {
        hdrRow.getCell(c2).font = headerFont;
        hdrRow.getCell(c2).fill = headerFill;
        hdrRow.getCell(c2).alignment = { horizontal: "center", vertical: "middle" };
      }
      hdrRow.getCell(3).alignment = { horizontal: "right", vertical: "middle" };
      hdrRow.getCell(7).alignment = { horizontal: "left", vertical: "middle" };
      hdrRow.getCell(5).value = "–";

      matches.forEach(function (m, mi) {
        var pr = predictions["group-" + gi + "-match-" + mi] || {};
        var hs = pr.homeScore != null && pr.homeScore !== "" ? Number(pr.homeScore) : "";
        var as = pr.awayScore != null && pr.awayScore !== "" ? Number(pr.awayScore) : "";

        var row = ws.addRow(["", m.date, m.home, hs, "–", as, m.away]);
        row.getCell(2).font = normalFont;
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(3).font = boldFont;
        row.getCell(3).alignment = { horizontal: "right" };
        row.getCell(4).font = scoreFont;
        row.getCell(4).alignment = { horizontal: "center" };
        row.getCell(5).font = normalFont;
        row.getCell(5).alignment = { horizontal: "center" };
        row.getCell(6).font = scoreFont;
        row.getCell(6).alignment = { horizontal: "center" };
        row.getCell(7).font = boldFont;
        row.getCell(7).alignment = { horizontal: "left" };

        if (mi % 2 === 1) {
          for (var c3 = 1; c3 <= 7; c3++) row.getCell(c3).fill = altRowFill;
        }
        applyRowBorder(row, 7);
      });

      ws.addRow([]);
    });
  }

  function buildStandingsSheet(wb, predictions, userName) {
    var ws = wb.addWorksheet("Standings", {
      properties: { tabColor: { argb: "FF" + LIME } }
    });

    ws.columns = [
      { width: 5 },
      { width: 4 },
      { width: 22 },
      { width: 6 },
      { width: 6 },
      { width: 6 },
      { width: 6 },
      { width: 6 },
      { width: 6 },
      { width: 6 },
      { width: 6 }
    ];

    var titleRow = ws.addRow(["", "Group Standings — Based on " + userName + "'s predictions"]);
    titleRow.getCell(2).font = titleFont;
    ws.mergeCells(titleRow.number, 2, titleRow.number, 11);
    ws.addRow([]);

    LETTERS.forEach(function (letter) {
      var data = calcStandings(letter, predictions);

      var grpRow = ws.addRow(["", "", "GROUP " + letter, "", "", "", "", "", "", "", ""]);
      for (var c = 2; c <= 11; c++) {
        grpRow.getCell(c).font = subHeaderFont;
        grpRow.getCell(c).fill = subHeaderFill;
      }

      var hdrRow = ws.addRow(["", "#", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"]);
      for (var c2 = 2; c2 <= 11; c2++) {
        hdrRow.getCell(c2).font = headerFont;
        hdrRow.getCell(c2).fill = headerFill;
        hdrRow.getCell(c2).alignment = { horizontal: "center", vertical: "middle" };
      }
      hdrRow.getCell(3).alignment = { horizontal: "left", vertical: "middle" };

      data.standings.forEach(function (r, i) {
        var gd = r.gd > 0 ? "+" + r.gd : String(r.gd);
        var row = ws.addRow(["", i + 1, r.team, r.p, r.w, r.d, r.l, r.gf, r.ga, gd, r.pts]);
        var isAdv = i < 2;
        row.getCell(3).font = boldFont;
        row.getCell(11).font = boldFont;

        for (var c3 = 2; c3 <= 11; c3++) {
          row.getCell(c3).alignment = { horizontal: "center", vertical: "middle" };
          if (isAdv) row.getCell(c3).fill = advanceFill;
        }
        row.getCell(3).alignment = { horizontal: "left", vertical: "middle" };
        applyRowBorder(row, 11);
      });

      ws.addRow([]);
    });
  }

  function buildKnockoutSheet(wb, picks, r32Data, userName, dateStr) {
    var ws = wb.addWorksheet("Knockout Bracket", {
      properties: { tabColor: { argb: "FF" + AZURE } }
    });

    ws.columns = [
      { width: 5 },
      { width: 8 },
      { width: 22 },
      { width: 6 },
      { width: 22 },
      { width: 4 },
      { width: 22 }
    ];

    var titleRow = ws.addRow(["", "FIFA 2026 World Cup — Knockout Bracket Predictions"]);
    titleRow.getCell(2).font = titleFont;
    ws.mergeCells(titleRow.number, 2, titleRow.number, 7);

    var subRow = ws.addRow(["", userName + "  ·  Exported " + dateStr]);
    subRow.getCell(2).font = subtitleFont;
    ws.mergeCells(subRow.number, 2, subRow.number, 7);

    ws.addRow([]);

    if (!r32Data || !Array.isArray(r32Data)) {
      var noRow = ws.addRow(["", "Group stage predictions not yet locked — no bracket generated."]);
      noRow.getCell(2).font = subtitleFont;
      return;
    }

    var roundSizes = [16, 8, 4, 2, 1];

    for (var r = 0; r < 5; r++) {
      var numMatches = roundSizes[r];

      var roundRow = ws.addRow(["", ROUND_NAMES[r]]);
      for (var c = 1; c <= 7; c++) {
        roundRow.getCell(c).font = subHeaderFont;
        roundRow.getCell(c).fill = r === 4 ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFFABA17" } } : subHeaderFill;
      }
      if (r === 4) {
        for (var cf = 1; cf <= 7; cf++) roundRow.getCell(cf).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF" + NAVY } };
      }

      var hdrRow = ws.addRow(["", "Match", "Team 1", "", "Team 2", "", "Winner"]);
      for (var c2 = 1; c2 <= 7; c2++) {
        hdrRow.getCell(c2).font = headerFont;
        hdrRow.getCell(c2).fill = headerFill;
        hdrRow.getCell(c2).alignment = { horizontal: "center", vertical: "middle" };
      }
      hdrRow.getCell(3).alignment = { horizontal: "left" };
      hdrRow.getCell(5).alignment = { horizontal: "left" };
      hdrRow.getCell(7).alignment = { horizontal: "left" };
      hdrRow.getCell(4).value = "vs";

      for (var m = 0; m < numMatches; m++) {
        var team1, team2;
        if (r === 0) {
          team1 = r32Data[m] ? r32Data[m][0] : "TBD";
          team2 = r32Data[m] ? r32Data[m][1] : "TBD";
        } else {
          team1 = picks[(r - 1) + "-" + (m * 2)] || "—";
          team2 = picks[(r - 1) + "-" + (m * 2 + 1)] || "—";
        }
        var winner = picks[r + "-" + m] || "—";

        var row = ws.addRow(["", m + 1, team1, "vs", team2, "", winner]);
        row.getCell(2).font = normalFont;
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(3).font = boldFont;
        row.getCell(4).font = normalFont;
        row.getCell(4).alignment = { horizontal: "center" };
        row.getCell(5).font = boldFont;
        row.getCell(7).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF16A34A" } };

        if (m % 2 === 1) {
          for (var c3 = 1; c3 <= 7; c3++) row.getCell(c3).fill = altRowFill;
        }
        applyRowBorder(row, 7);
      }

      ws.addRow([]);
    }

    var thirdPick = picks["third"];
    if (thirdPick) {
      ws.addRow([]);
      var thirdRow = ws.addRow(["", "Third-place play-off"]);
      for (var ct = 1; ct <= 7; ct++) {
        thirdRow.getCell(ct).font = subHeaderFont;
        thirdRow.getCell(ct).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCD7F32" } };
      }
      var tRow = ws.addRow(["", "", "", "", "", "", thirdPick]);
      tRow.getCell(7).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFCD7F32" } };
    }

    var champPick = picks["4-0"];
    if (champPick) {
      ws.addRow([]);
      ws.addRow([]);
      var champRow = ws.addRow(["", "PREDICTED CHAMPION"]);
      champRow.getCell(2).font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFABA17" } };
      var champNameRow = ws.addRow(["", champPick]);
      champNameRow.getCell(2).font = { name: "Calibri", size: 18, bold: true, color: { argb: "FF" + NAVY } };
    }
  }
})();
