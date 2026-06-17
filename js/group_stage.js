(function () {
  "use strict";

  var isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") { window.location.href = "login.html"; return; }

  var STORAGE_KEY = "groupStagePredictions2026";
  var LOCK_KEY = "groupStageLocked2026";
  var R32_KEY = "knockoutR32_2026";

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

  var FLAGS = {
    "Mexico": "\u{1F1F2}\u{1F1FD}", "South Africa": "\u{1F1FF}\u{1F1E6}", "Rep. of Korea": "\u{1F1F0}\u{1F1F7}", "Czech Rep.": "\u{1F1E8}\u{1F1FF}",
    "Canada": "\u{1F1E8}\u{1F1E6}", "Bosnia/Herzeg.": "\u{1F1E7}\u{1F1E6}", "Qatar": "\u{1F1F6}\u{1F1E6}", "Switzerland": "\u{1F1E8}\u{1F1ED}",
    "Brazil": "\u{1F1E7}\u{1F1F7}", "Morocco": "\u{1F1F2}\u{1F1E6}", "Haiti": "\u{1F1ED}\u{1F1F9}", "Scotland": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
    "USA": "\u{1F1FA}\u{1F1F8}", "Paraguay": "\u{1F1F5}\u{1F1FE}", "Australia": "\u{1F1E6}\u{1F1FA}", "Turkey": "\u{1F1F9}\u{1F1F7}",
    "Germany": "\u{1F1E9}\u{1F1EA}", "Curaçao": "\u{1F1E8}\u{1F1FC}", "Ivory Coast": "\u{1F1E8}\u{1F1EE}", "Ecuador": "\u{1F1EA}\u{1F1E8}",
    "Netherlands": "\u{1F1F3}\u{1F1F1}", "Japan": "\u{1F1EF}\u{1F1F5}", "Sweden": "\u{1F1F8}\u{1F1EA}", "Tunisia": "\u{1F1F9}\u{1F1F3}",
    "Belgium": "\u{1F1E7}\u{1F1EA}", "Egypt": "\u{1F1EA}\u{1F1EC}", "IR Iran": "\u{1F1EE}\u{1F1F7}", "New Zealand": "\u{1F1F3}\u{1F1FF}",
    "Spain": "\u{1F1EA}\u{1F1F8}", "Cape Verde": "\u{1F1E8}\u{1F1FB}", "Saudi Arabia": "\u{1F1F8}\u{1F1E6}", "Uruguay": "\u{1F1FA}\u{1F1FE}",
    "France": "\u{1F1EB}\u{1F1F7}", "Senegal": "\u{1F1F8}\u{1F1F3}", "Iraq": "\u{1F1EE}\u{1F1F6}", "Norway": "\u{1F1F3}\u{1F1F4}",
    "Argentina": "\u{1F1E6}\u{1F1F7}", "Algeria": "\u{1F1E9}\u{1F1FF}", "Austria": "\u{1F1E6}\u{1F1F9}", "Jordan": "\u{1F1EF}\u{1F1F4}",
    "Portugal": "\u{1F1F5}\u{1F1F9}", "DR Congo": "\u{1F1E8}\u{1F1E9}", "Uzbekistan": "\u{1F1FA}\u{1F1FF}", "Colombia": "\u{1F1E8}\u{1F1F4}",
    "England": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", "Croatia": "\u{1F1ED}\u{1F1F7}", "Ghana": "\u{1F1EC}\u{1F1ED}", "Panama": "\u{1F1F5}\u{1F1E6}"
  };

  var fifaRanks = {
    Argentina: 1, France: 2, Brazil: 3, England: 4, Portugal: 5, Netherlands: 6,
    Spain: 7, Belgium: 8, Germany: 10, Croatia: 11, Uruguay: 12,
    Morocco: 13, Colombia: 14, Mexico: 15, Switzerland: 16, USA: 17,
    Senegal: 18, Japan: 19, Ecuador: 22, Austria: 23,
    Australia: 24, Turkey: 25, "Rep. of Korea": 26, Canada: 28,
    Tunisia: 30, Egypt: 31, Norway: 32, Algeria: 33, Scotland: 34,
    "Ivory Coast": 36, Ghana: 38, Panama: 39, "South Africa": 40,
    Qatar: 41, "Saudi Arabia": 42, "IR Iran": 21, Paraguay: 43,
    Sweden: 20, Iraq: 46, "New Zealand": 49, "Cape Verde": 55,
    "Bosnia/Herzeg.": 50, "Czech Rep.": 44, Haiti: 60, Jordan: 70,
    "DR Congo": 56, Uzbekistan: 62, "Curaçao": 80
  };

  var R32_TEMPLATE = [
    {home: "2A", away: "2B"},
    {home: "1E", away: "3", pool: "ABCDF"},
    {home: "1F", away: "2C"},
    {home: "1C", away: "2F"},
    {home: "1I", away: "3", pool: "CDFGH"},
    {home: "2E", away: "2I"},
    {home: "1A", away: "3", pool: "CEFHI"},
    {home: "1L", away: "3", pool: "EHIJK"},
    {home: "1D", away: "3", pool: "BEFIJ"},
    {home: "1G", away: "3", pool: "AEHIJ"},
    {home: "2K", away: "2L"},
    {home: "1H", away: "2J"},
    {home: "1B", away: "3", pool: "EFGIJ"},
    {home: "1J", away: "2H"},
    {home: "1K", away: "3", pool: "DEIJL"},
    {home: "2D", away: "2G"}
  ];

  var LETTERS = Object.keys(groupTeams);
  var groups = LETTERS.map(function (letter) {
    var teams = groupTeams[letter];
    var dates = groupDates[letter];
    return {
      letter: letter,
      name: "Group " + letter,
      teams: teams,
      matches: PAIRS.map(function (p, i) {
        return { date: dates[i], home: teams[p[0]], away: teams[p[1]] };
      })
    };
  });

  var ADMIN_EMAIL = "crasto.reuben15@gmail.com";
  var isAdmin = (localStorage.getItem("userEmail") || "").toLowerCase() === ADMIN_EMAIL;

  var TOTAL = groups.length * 6;
  var predictions = loadPredictions();
  var locked = localStorage.getItem(LOCK_KEY) === "true";
  var liveResults = {};
  var matchSchedule = {};

  var container = document.getElementById("groupsContainer");
  var autofillSelect = document.getElementById("autofillSelect");
  var saveBtn = document.getElementById("saveBtn");
  var editBtn = document.getElementById("editBtn");
  var fillText = document.getElementById("fillText");
  var fillBar = document.getElementById("fillBar");
  var autofillWrap = document.getElementById("autofillWrap");

  function matchId(gi, mi) { return "group-" + gi + "-match-" + mi; }

  var userId = localStorage.getItem("userId");

  function loadPredictions() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions)); }

  function syncGroupToServer() {
    if (!userId) return;
    fetch("/api/predictions/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, predictions: predictions })
    }).catch(function () {});
  }

  function syncLockToServer(r32) {
    if (!userId) return;
    fetch("/api/predictions/lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, lockType: "group", r32Data: r32 })
    }).catch(function () {});
  }

  function syncUnlockToServer() {
    if (!userId) return;
    fetch("/api/predictions/lock", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, lockType: "group" })
    }).catch(function () {});
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function flag(t) { return FLAGS[t] || "⚽"; }

  function countFilled() {
    var filled = 0;
    var total = 0;
    groups.forEach(function (g, gi) {
      g.matches.forEach(function (m, mi) {
        var schedKey = liveKey(m.home, m.away);
        var sched = matchSchedule[schedKey];
        var matchPast = sched && new Date(sched.utcDate).getTime() < Date.now();
        if (matchPast) {
          filled++;
          total++;
          return;
        }
        total++;
        var pr = predictions[matchId(gi, mi)];
        if (pr && pr.homeScore !== "" && pr.awayScore !== "" && pr.homeScore != null && pr.awayScore != null) filled++;
      });
    });
    return { filled: filled, total: total };
  }

  function liveKey(home, away) { return home + "|" + away; }

  function liveTag(m, predictions, id) {
    var live = liveResults[liveKey(m.home, m.away)];
    if (!live || live.status !== "FINISHED") return "";
    var pr = predictions[id] || {};
    var ph = Number(pr.homeScore), pa = Number(pr.awayScore);
    var lh = live.homeScore, la = live.awayScore;
    if (pr.homeScore == null || pr.homeScore === "" || pr.awayScore == null || pr.awayScore === "") {
      return '<span class="gs-live gs-live--result">FT ' + lh + '–' + la + '</span>';
    }
    var exactMatch = ph === lh && pa === la;
    var correctResult = (ph > pa && lh > la) || (ph < pa && lh < la) || (ph === pa && lh === la);
    var cls = exactMatch ? "gs-live--exact" : correctResult ? "gs-live--correct" : "gs-live--wrong";
    var label = exactMatch ? "Exact!" : correctResult ? "Result ✓" : "Wrong";
    return '<span class="gs-live ' + cls + '">FT ' + lh + '–' + la + ' · ' + label + '</span>';
  }

  function render() {
    container.innerHTML = groups.map(function (group, gi) {
      var matches = group.matches.map(function (m, mi) {
        var id = matchId(gi, mi);
        var saved = predictions[id] || {};
        var hv = saved.homeScore != null ? saved.homeScore : "";
        var av = saved.awayScore != null ? saved.awayScore : "";
        var schedKey = liveKey(m.home, m.away);
        var sched = matchSchedule[schedKey];
        var matchPast = sched && new Date(sched.utcDate).getTime() < Date.now();
        var dis = (locked || matchPast) ? " disabled" : "";
        var lt = liveTag(m, predictions, id);
        return '' +
          '<div class="gs-match' + (locked ? ' is-locked' : '') + (matchPast ? ' is-past' : '') + '">' +
            '<span class="gs-match__date">' + esc(m.date) + '</span>' +
            '<span class="gs-match__team gs-match__team--home">' + esc(m.home) + ' <span class="gs-flag">' + flag(m.home) + '</span></span>' +
            '<input type="number" min="0" class="score-input" data-id="' + id + '" data-side="home" value="' + hv + '" placeholder="0" aria-label="' + esc(m.home) + ' score"' + dis + ' />' +
            '<input type="number" min="0" class="score-input" data-id="' + id + '" data-side="away" value="' + av + '" placeholder="0" aria-label="' + esc(m.away) + ' score"' + dis + ' />' +
            '<span class="gs-match__team gs-match__team--away"><span class="gs-flag">' + flag(m.away) + '</span> ' + esc(m.away) + '</span>' +
            lt +
          '</div>';
      }).join("");

      return '' +
        '<article class="card card--elevated gs-card">' +
          '<div class="gs-card__head">' +
            '<div class="gs-card__title">' +
              '<span class="gs-card__letter">' + group.letter + '</span>' +
              '<h2>' + group.name + '</h2>' +
            '</div>' +
            '<span class="badge">' + (locked ? 'Locked' : 'Top 2 + best 3rd advance') + '</span>' +
          '</div>' +
          '<div class="gs-card__body">' +
            '<div class="gs-matches">' + matches + '</div>' +
            '<div class="standings"><table>' +
              '<thead><tr>' +
                '<th class="team-col">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th>' +
              '</tr></thead>' +
              '<tbody id="tbody-' + gi + '"></tbody>' +
            '</table></div>' +
          '</div>' +
        '</article>';
    }).join("");

    if (!locked) {
      Array.prototype.forEach.call(container.querySelectorAll(".score-input"), function (input) {
        input.addEventListener("input", onScoreInput);
      });
    }
    updateAllTables();
    updateProgress();
    updateLockUI();
  }

  function updateLockUI() {
    if (locked) {
      if (saveBtn) { saveBtn.textContent = "Predictions Locked"; saveBtn.disabled = true; saveBtn.classList.add("btn--locked"); }
      if (editBtn) editBtn.style.display = isAdmin ? "" : "none";
      if (autofillWrap) autofillWrap.style.display = "none";
    } else {
      if (saveBtn) { saveBtn.textContent = "Save Predictions"; saveBtn.disabled = false; saveBtn.classList.remove("btn--locked"); }
      if (editBtn) editBtn.style.display = "none";
      if (autofillWrap) autofillWrap.style.display = "";
    }
  }

  function onScoreInput(e) {
    var input = e.target;
    var id = input.dataset.id;
    var side = input.dataset.side;
    input.value = input.value.replace(/[^0-9]/g, "").slice(0, 2);
    if (!predictions[id]) predictions[id] = {};
    predictions[id][side + "Score"] = input.value;
    save();
    updateTable(parseInt(id.split("-")[1], 10));
    updateProgress();
  }

  function calc(group, gi) {
    var t = {};
    group.teams.forEach(function (team) {
      t[team] = { team: team, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });
    group.matches.forEach(function (m, mi) {
      var pr = predictions[matchId(gi, mi)];
      if (!pr || pr.homeScore === "" || pr.awayScore === "" || pr.homeScore == null || pr.awayScore == null) return;
      var hs = Number(pr.homeScore), as = Number(pr.awayScore);
      if (isNaN(hs) || isNaN(as)) return;
      var H = t[m.home], A = t[m.away];
      H.p++; A.p++; H.gf += hs; H.ga += as; A.gf += as; A.ga += hs;
      if (hs > as) { H.w++; A.l++; H.pts += 3; }
      else if (hs < as) { A.w++; H.l++; A.pts += 3; }
      else { H.d++; A.d++; H.pts++; A.pts++; }
    });
    var rows = Object.keys(t).map(function (k) { var r = t[k]; r.gd = r.gf - r.ga; return r; });
    rows.sort(function (a, b) {
      return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team);
    });
    return rows;
  }

  function updateTable(gi) {
    var rows = calc(groups[gi], gi);
    var tbody = document.getElementById("tbody-" + gi);
    if (!tbody) return;
    tbody.innerHTML = rows.map(function (r, i) {
      var adv = i < 2;
      var gd = r.gd > 0 ? "+" + r.gd : r.gd;
      return '<tr' + (adv ? ' class="is-advancing"' : '') + '>' +
        '<td class="team-col">' + (adv ? '<span class="check">✓</span>' : '') + '<span class="gs-flag">' + flag(r.team) + '</span> ' + esc(r.team) + '</td>' +
        '<td>' + r.p + '</td><td>' + r.w + '</td><td>' + r.d + '</td><td>' + r.l + '</td>' +
        '<td>' + r.gf + '</td><td>' + r.ga + '</td><td>' + gd + '</td>' +
        '<td class="pts-col">' + r.pts + '</td>' +
      '</tr>';
    }).join("");
  }

  function updateAllTables() { groups.forEach(function (g, gi) { updateTable(gi); }); }

  function updateProgress() {
    var counts = countFilled();
    if (fillText) fillText.textContent = counts.filled + "/" + counts.total;
    if (fillBar) fillBar.style.width = Math.round((counts.filled / counts.total) * 100) + "%";
  }

  function computeR32() {
    var winners = {};
    var runnersUp = {};
    var thirdTeams = [];

    LETTERS.forEach(function (letter, gi) {
      var rows = calc(groups[gi], gi);
      winners[letter] = rows[0] ? rows[0].team : null;
      runnersUp[letter] = rows[1] ? rows[1].team : null;
      if (rows[2]) {
        thirdTeams.push({ group: letter, team: rows[2].team, pts: rows[2].pts, gd: rows[2].gd, gf: rows[2].gf });
      }
    });

    thirdTeams.sort(function (a, b) {
      return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.group.localeCompare(b.group);
    });

    var qualified = thirdTeams.slice(0, 8);
    var qualifiedGroups = qualified.map(function (t) { return t.group; });

    var thirdSlots = [];
    R32_TEMPLATE.forEach(function (t, i) {
      if (t.pool) thirdSlots.push({ index: i, pool: t.pool });
    });

    var thirdAssignment = {};
    var usedGroups = {};

    function solveThird(si) {
      if (si >= thirdSlots.length) return true;
      var slot = thirdSlots[si];
      for (var i = 0; i < qualifiedGroups.length; i++) {
        var g = qualifiedGroups[i];
        if (slot.pool.indexOf(g) !== -1 && !usedGroups[g]) {
          usedGroups[g] = true;
          thirdAssignment[slot.index] = g;
          if (solveThird(si + 1)) return true;
          delete thirdAssignment[slot.index];
          usedGroups[g] = false;
        }
      }
      return false;
    }
    solveThird(0);

    var thirdByGroup = {};
    qualified.forEach(function (t) { thirdByGroup[t.group] = t.team; });

    function resolve(src) {
      var pos = src[0], grp = src[1];
      if (pos === "1") return winners[grp];
      if (pos === "2") return runnersUp[grp];
      return null;
    }

    return R32_TEMPLATE.map(function (match, i) {
      var home = resolve(match.home);
      var away;
      if (match.away === "3") {
        var ag = thirdAssignment[i];
        away = ag ? thirdByGroup[ag] : null;
      } else {
        away = resolve(match.away);
      }
      return [home || "TBD", away || "TBD"];
    });
  }

  function lockPredictions() {
    var counts = countFilled();
    if (counts.filled < counts.total) {
      alert("Please fill in all " + counts.total + " match predictions before saving. You have " + counts.filled + "/" + counts.total + " filled.");
      return;
    }
    save();
    var r32 = computeR32();
    localStorage.setItem(R32_KEY, JSON.stringify(r32));
    localStorage.setItem(LOCK_KEY, "true");
    localStorage.removeItem("knockoutPicks2026");
    locked = true;
    syncGroupToServer();
    syncLockToServer(r32);
    render();
  }

  function unlockPredictions() {
    if (!confirm("Editing predictions will reset your knockout bracket picks. Continue?")) return;
    localStorage.removeItem(LOCK_KEY);
    localStorage.removeItem(R32_KEY);
    localStorage.removeItem("knockoutPicks2026");
    locked = false;
    syncUnlockToServer();
    render();
  }

  function rnd() { var s = [0, 0, 1, 1, 1, 2, 2, 3, 4]; return s[Math.floor(Math.random() * s.length)]; }

  function autofill(mode) {
    if (!mode || locked) return;
    if (mode === "clear") {
      var kept = {};
      groups.forEach(function (group, gi) {
        group.matches.forEach(function (m, mi) {
          var schedKey = liveKey(m.home, m.away);
          var sched = matchSchedule[schedKey];
          var id = matchId(gi, mi);
          if (sched && new Date(sched.utcDate).getTime() < Date.now() && predictions[id]) {
            kept[id] = predictions[id];
          }
        });
      });
      predictions = kept;
      save();
      render();
      return;
    }
    var balanced = [[1, 1], [0, 0], [2, 1], [1, 0], [2, 2], [1, 2]];
    groups.forEach(function (group, gi) {
      group.matches.forEach(function (m, mi) {
        var schedKey = liveKey(m.home, m.away);
        var sched = matchSchedule[schedKey];
        if (sched && new Date(sched.utcDate).getTime() < Date.now()) return;
        var h = 0, a = 0;
        if (mode === "favorites") {
          var hr = fifaRanks[m.home] || 100, ar = fifaRanks[m.away] || 100;
          var diff = Math.abs(hr - ar);
          if (diff <= 1) { h = 1; a = 1; }
          else if (hr < ar) { h = diff > 2 ? 2 : 1; a = 0; }
          else { h = 0; a = diff > 2 ? 2 : 1; }
        } else if (mode === "balanced") {
          var c = balanced[(gi + mi) % balanced.length]; h = c[0]; a = c[1];
        } else if (mode === "random") {
          h = rnd(); a = rnd();
        }
        predictions[matchId(gi, mi)] = { homeScore: String(h), awayScore: String(a) };
      });
    });
    save();
    render();
  }

  if (autofillSelect) {
    autofillSelect.addEventListener("change", function () {
      autofill(autofillSelect.value);
      autofillSelect.value = "";
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      if (locked) return;
      lockPredictions();
    });
  }
  if (editBtn) {
    editBtn.addEventListener("click", function () {
      unlockPredictions();
    });
  }

  render();

  function fetchLiveResults() {
    fetch("/api/live/matches")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success || !data.matches) return;
        liveResults = {};
        matchSchedule = {};
        data.matches.forEach(function (m) {
          if (m.stage && m.stage.indexOf("GROUP") !== -1) {
            var key = liveKey(m.homeTeam, m.awayTeam);
            matchSchedule[key] = { utcDate: m.utcDate, status: m.status };
            if (m.status === "FINISHED") {
              liveResults[key] = {
                status: m.status,
                homeScore: m.homeScore,
                awayScore: m.awayScore
              };
            }
          }
        });
        render();
      })
      .catch(function () {});
  }

  fetchLiveResults();
  setInterval(fetchLiveResults, 120000);
})();
