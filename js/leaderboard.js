(function () {
  var isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") { window.location.href = "login.html"; return; }

  var groupLocked = localStorage.getItem("groupStageLocked2026") === "true";
  if (!groupLocked) {
    document.querySelector(".page").innerHTML =
      '<div style="text-align:center;padding:var(--space-12) var(--space-6);">' +
        '<p style="font-size:var(--text-h2);font-family:var(--font-display);font-weight:var(--weight-bold);margin-bottom:var(--space-6);">Leaderboard Locked</p>' +
        '<div style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:var(--space-6);max-width:480px;margin:0 auto var(--space-6);text-align:left;">' +
          '<ul style="list-style:disc;padding-left:var(--space-5);margin:0;display:flex;flex-direction:column;gap:var(--space-3);color:var(--text-muted);">' +
            '<li>Complete and lock your group stage predictions to view the leaderboard.</li>' +
            '<li>Predictions must be locked the day before each match kicks off — any matches not locked in time will use grace points instead.</li>' +
          '</ul>' +
        '</div>' +
        '<a href="brackets.html" class="btn btn--accent btn--lg">Go to Your Brackets</a>' +
      '</div>';
    return;
  }

  var currentUserId = localStorage.getItem("userId");

  var groupTeams = {
    A:["Mexico","South Africa","Rep. of Korea","Czech Rep."],B:["Canada","Bosnia/Herzeg.","Qatar","Switzerland"],
    C:["Brazil","Morocco","Haiti","Scotland"],D:["USA","Paraguay","Australia","Turkey"],
    E:["Germany","Curaçao","Ivory Coast","Ecuador"],F:["Netherlands","Japan","Sweden","Tunisia"],
    G:["Belgium","Egypt","IR Iran","New Zealand"],H:["Spain","Cape Verde","Saudi Arabia","Uruguay"],
    I:["France","Senegal","Iraq","Norway"],J:["Argentina","Algeria","Austria","Jordan"],
    K:["Portugal","DR Congo","Uzbekistan","Colombia"],L:["England","Croatia","Ghana","Panama"]
  };
  var PAIRS = [[0,1],[2,3],[0,2],[3,1],[3,0],[1,2]];
  var LETTERS = Object.keys(groupTeams);

  var TEAM_CODES = {
    "Argentina":"ar","France":"fr","Brazil":"br","England":"gb-eng","Portugal":"pt",
    "Netherlands":"nl","Spain":"es","Belgium":"be","Germany":"de","Croatia":"hr",
    "Uruguay":"uy","Morocco":"ma","Colombia":"co","Mexico":"mx","Switzerland":"ch",
    "USA":"us","Senegal":"sn","Japan":"jp","Ecuador":"ec","Austria":"at",
    "Australia":"au","Turkey":"tr","Rep. of Korea":"kr","Canada":"ca",
    "Tunisia":"tn","Egypt":"eg","Norway":"no","Algeria":"dz",
    "Scotland":"gb-sct","Ivory Coast":"ci","Ghana":"gh","Panama":"pa",
    "South Africa":"za","Qatar":"qa","IR Iran":"ir","New Zealand":"nz",
    "Saudi Arabia":"sa","Cape Verde":"cv","Iraq":"iq","Jordan":"jo",
    "DR Congo":"cd","Uzbekistan":"uz","Paraguay":"py","Sweden":"se",
    "Haiti":"ht","Czech Rep.":"cz","Bosnia/Herzeg.":"ba","Curaçao":"cw"
  };
  var FLAG_BASE = "https://hatscripts.github.io/circle-flags/flags/";

  function initialsOf(n) {
    var parts = n.trim().split(/\s+/);
    return ((parts[0]||"")[0]||"Y").toUpperCase()+((parts[1]||"")[0]||"").toUpperCase();
  }
  function escapeHtml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
  function avatarHtml(name, champion, cssClass) {
    var code = champion ? TEAM_CODES[champion] : null;
    if (code) {
      return '<img src="' + FLAG_BASE + code + '.svg" alt="' + escapeHtml(champion) + '" class="' + cssClass + '" style="border-radius:50%;object-fit:cover;" />';
    }
    return '<span class="' + cssClass + '">' + escapeHtml(initialsOf(name)) + '</span>';
  }

  var GRACE_CUTOFF = new Date("2026-06-17T00:00:00Z").getTime();
  var NO_GRACE_EMAIL = "crasto.reuben15@gmail.com";

  function scoreUser(predictions, liveByKey, userLockedAt, userCreatedAt, userEmail) {
    var pts = 0, exact = 0, correctResults = 0, matchesScored = 0;
    var gracePts = 0, graceCount = 0;
    var breakdown = [];

    var skipGrace = userEmail === NO_GRACE_EMAIL;
    var createdTime = userCreatedAt ? new Date(userCreatedAt).getTime() : 0;
    var graceRate = createdTime >= GRACE_CUTOFF ? 2 : 3;

    LETTERS.forEach(function(letter, gi) {
      var teams = groupTeams[letter];
      PAIRS.forEach(function(p, mi) {
        var home = teams[p[0]], away = teams[p[1]];
        var live = liveByKey[home + "|" + away];
        if (!live) return;

        var matchKickoff = live.utcDate ? new Date(live.utcDate).getTime() : 0;
        var isGraceMatch = !skipGrace && matchKickoff < createdTime;

        if (isGraceMatch) {
          gracePts += graceRate;
          graceCount++;
          breakdown.push({ match: home + " vs " + away, pts: graceRate, tag: "grace", pred: "—", actual: live.homeScore + "–" + live.awayScore });
          return;
        }

        var pr = predictions["group-" + gi + "-match-" + mi];
        if (!pr || pr.homeScore == null || pr.homeScore === "" || pr.awayScore == null || pr.awayScore === "") {
          if (!skipGrace) {
            gracePts += graceRate;
            graceCount++;
            breakdown.push({ match: home + " vs " + away, pts: graceRate, tag: "grace", pred: "—", actual: live.homeScore + "–" + live.awayScore });
          }
          return;
        }

        var ph = Number(pr.homeScore), pa = Number(pr.awayScore);
        var lh = live.homeScore, la = live.awayScore;
        matchesScored++;
        var matchPts = 0;

        var pResult = ph > pa ? 1 : ph < pa ? -1 : 0;
        var lResult = lh > la ? 1 : lh < la ? -1 : 0;

        if (ph === lh && pa === la) {
          matchPts += 3 + 2 + 2;
          exact++;
          correctResults++;
        } else {
          if (pResult === lResult) { matchPts += 3; correctResults++; }
          if (ph === lh || pa === la) matchPts += 1;
          var pGD = ph - pa, lGD = lh - la;
          if (Math.abs(pGD) === Math.abs(lGD)) {
            matchPts += (pGD === lGD) ? 2 : 1;
          }
        }
        pts += matchPts;
        var tag = (ph === lh && pa === la) ? "exact" : (pResult === lResult) ? "result" : "wrong";
        breakdown.push({ match: home + " vs " + away, pts: matchPts, tag: tag, pred: ph + "–" + pa, actual: lh + "–" + la });
      });
    });

    pts += gracePts;
    return { pts: pts, exact: exact, correctResults: correctResults, matchesScored: matchesScored, graceCount: graceCount, gracePts: gracePts, breakdown: breakdown };
  }

  function renderBoard(entries) {
    entries.sort(function(a, b) { return b.pts - a.pts || b.exact - a.exact || b.correctResults - a.correctResults; });

    var podiumHtml = "";
    var medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];
    entries.slice(0, 3).forEach(function(e, i) {
      var isYou = String(e.id) === String(currentUserId);
      var matchInfo = e.matchesScored > 0
        ? e.matchesScored + " scored"
        : "No predictions yet";
      if (e.graceCount > 0) matchInfo += " · " + e.graceCount + " grace";
      podiumHtml +=
        '<div class="card pod pod--' + (i + 1) + '" style="order:' + (i === 0 ? 1 : i === 1 ? 0 : 2) + ';">' +
          '<div class="pod__medal">' + (medals[i] || "") + '</div>' +
          '<div class="pod__avatar">' + avatarHtml(e.name, e.champion, "pod__avatar-img") + '</div>' +
          '<div class="pod__name">' + escapeHtml(e.name) + (isYou ? ' <span style="color:var(--azure-400);font-size:var(--text-sm);">(you)</span>' : '') + '</div>' +
          '<div class="pod__pts">' + e.pts + '<span> pts</span></div>' +
          '<div style="color:var(--text-muted);font-size:var(--text-sm);margin-top:6px;">' + matchInfo + '</div>' +
        '</div>';
    });
    document.getElementById("podium").innerHTML = podiumHtml;

    var rows = entries.map(function(e, i) {
      var isYou = String(e.id) === String(currentUserId);
      var uid = "bd-" + e.id;
      var playerRow = '<tr' + (isYou ? ' class="is-you"' : '') + ' data-toggle="' + uid + '" style="cursor:pointer;">' +
        '<td class="lb-rank">' + (i + 1) + '</td>' +
        '<td><div class="lb-player">' + avatarHtml(e.name, e.champion, "lb-avatar") + '<span class="lb-name">' + escapeHtml(e.name) + (isYou ? ' (you)' : '') + ' <svg class="lb-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></div></td>' +
        '<td class="num hide-sm"><span class="lb-move lb-move--same">–</span></td>' +
        '<td class="num lb-num hide-sm">' + e.exact + '</td>' +
        '<td class="num lb-num hide-sm">' + e.correctResults + '</td>' +
        '<td class="pts lb-pts">' + e.pts + '</td>' +
      '</tr>';

      var breakdownRows = "";
      if (e.breakdown && e.breakdown.length > 0) {
        breakdownRows = e.breakdown.map(function(b) {
          var tagCls = b.tag === "exact" ? "lb-tag--exact" : b.tag === "result" ? "lb-tag--result" : b.tag === "grace" ? "lb-tag--grace" : "lb-tag--wrong";
          var tagLabel = b.tag === "exact" ? "Exact" : b.tag === "result" ? "Result ✓" : b.tag === "grace" ? "Grace" : "Wrong";
          return '<tr class="lb-breakdown" data-parent="' + uid + '" style="display:none;">' +
            '<td></td>' +
            '<td colspan="4" style="padding:6px 16px;">' +
              '<span style="color:var(--text-muted);font-size:var(--text-sm);">' + escapeHtml(b.match) + '</span>' +
              '<span class="lb-tag ' + tagCls + '" style="margin-left:8px;">' + tagLabel + '</span>' +
              (b.tag !== "grace" ? '<span style="color:var(--text-muted);font-size:var(--text-sm);margin-left:8px;">Pred: ' + b.pred + ' · Actual: ' + b.actual + '</span>' : '') +
            '</td>' +
            '<td class="pts" style="font-size:var(--text-sm);color:var(--text-muted);">+' + b.pts + '</td>' +
          '</tr>';
        }).join("");
      }

      return playerRow + breakdownRows;
    }).join("");

    if (entries.length === 0) {
      rows = '<tr><td colspan="6" style="text-align:center;padding:var(--space-8);color:var(--text-muted);">No users yet.</td></tr>';
    }

    document.getElementById("lbBody").innerHTML = rows;

    Array.prototype.forEach.call(document.querySelectorAll("[data-toggle]"), function(tr) {
      tr.addEventListener("click", function() {
        var uid = tr.dataset.toggle;
        var open = tr.classList.toggle("is-expanded");
        Array.prototype.forEach.call(document.querySelectorAll('[data-parent="' + uid + '"]'), function(bd) {
          bd.style.display = open ? "" : "none";
        });
      });
    });
  }

  renderBoard([]);

  var cachedBoard = null;
  var cachedMatches = null;
  var cachedLiveByKey = null;
  var activeTab = "overall";

  function getCurrentMatchday(matches) {
    var maxDay = 1;
    matches.forEach(function(m) {
      if (m.status === "FINISHED" && m.matchday > maxDay) maxDay = m.matchday;
    });
    return maxDay;
  }

  function buildLiveByKey(matches, matchdayFilter) {
    var map = {};
    matches.forEach(function(m) {
      if (m.status === "FINISHED" && m.group) {
        if (!matchdayFilter || m.matchday === matchdayFilter) {
          map[m.homeTeam + "|" + m.awayTeam] = m;
        }
      }
    });
    return map;
  }

  function computeEntries(board, liveByKey) {
    return board.map(function(user) {
      var score = scoreUser(user.groupPredictions, liveByKey, user.lockedAt, user.createdAt, user.email);
      return {
        id: user.id,
        name: user.name,
        champion: user.knockoutPicks ? user.knockoutPicks["4-0"] : null,
        pts: score.pts,
        exact: score.exact,
        correctResults: score.correctResults,
        matchesScored: score.matchesScored,
        graceCount: score.graceCount,
        gracePts: score.gracePts,
        breakdown: score.breakdown
      };
    });
  }

  function refreshView() {
    if (!cachedBoard || !cachedMatches) return;
    var matchday = activeTab === "gameweek" ? getCurrentMatchday(cachedMatches) : null;
    var liveByKey = buildLiveByKey(cachedMatches, matchday);
    var entries = computeEntries(cachedBoard, liveByKey);
    renderBoard(entries);
  }

  var tabBtns = document.querySelectorAll(".seg button");
  Array.prototype.forEach.call(tabBtns, function(btn, i) {
    btn.addEventListener("click", function() {
      Array.prototype.forEach.call(tabBtns, function(b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      activeTab = i === 0 ? "overall" : "gameweek";
      refreshView();
    });
  });

  Promise.all([
    fetch("/api/leaderboard").then(function(r) { return r.json(); }),
    fetch("/api/live/matches").then(function(r) { return r.json(); })
  ]).then(function(results) {
    var boardData = results[0];
    var liveData = results[1];
    if (!boardData.success || !liveData.success) return;

    cachedBoard = boardData.board;
    cachedMatches = liveData.matches;
    cachedLiveByKey = buildLiveByKey(cachedMatches, null);

    var entries = computeEntries(cachedBoard, cachedLiveByKey);
    renderBoard(entries);
    renderProgressionChart(cachedBoard, cachedMatches);
  }).catch(function() {});

  var LINE_COLORS = [
    "#4dabfa","#f59e0b","#10b981","#ef4444","#8b5cf6",
    "#ec4899","#06b6d4","#f97316","#6366f1","#14b8a6"
  ];

  function scoreMatch(pr, lh, la) {
    if (!pr || pr.homeScore == null || pr.homeScore === "" || pr.awayScore == null || pr.awayScore === "") return 0;
    var ph = Number(pr.homeScore), pa = Number(pr.awayScore);
    var pts = 0;
    var pR = ph > pa ? 1 : ph < pa ? -1 : 0;
    var lR = lh > la ? 1 : lh < la ? -1 : 0;
    if (ph === lh && pa === la) {
      pts = 7;
    } else {
      if (pR === lR) pts += 3;
      if (ph === lh || pa === la) pts += 1;
      var pGD = ph - pa, lGD = lh - la;
      if (Math.abs(pGD) === Math.abs(lGD)) pts += (pGD === lGD) ? 2 : 1;
    }
    return pts;
  }

  function calcMatchPoints(user, m) {
    var skipGrace = user.email === NO_GRACE_EMAIL;
    var lockTime = user.lockedAt ? new Date(user.lockedAt).getTime() : Infinity;
    var createdTime = user.createdAt ? new Date(user.createdAt).getTime() : 0;
    var graceRate = createdTime >= GRACE_CUTOFF ? 2 : 3;
    var matchKickoff = m.utcDate ? new Date(m.utcDate).getTime() : 0;

    if (!skipGrace && matchKickoff < lockTime) return graceRate;

    var key = "group-" + LETTERS.indexOf(m.group) + "-match-";
    var teams = groupTeams[m.group];
    var matchIdx = -1;
    PAIRS.forEach(function(p, pi) {
      if (teams[p[0]] === m.homeTeam && teams[p[1]] === m.awayTeam) matchIdx = pi;
    });
    if (matchIdx < 0) return 0;

    var pr = user.groupPredictions[key + matchIdx];
    if (!pr || pr.homeScore == null || pr.homeScore === "" || pr.awayScore == null || pr.awayScore === "") return graceRate;
    return scoreMatch(pr, m.homeScore, m.awayScore);
  }

  function renderProgressionChart(board, matches) {
    var canvas = document.getElementById("progressionChart");
    if (!canvas || typeof Chart === "undefined") return;

    var finished = matches.filter(function(m) { return m.status === "FINISHED" && m.group; });
    finished.sort(function(a, b) { return new Date(a.utcDate) - new Date(b.utcDate); });
    if (finished.length === 0) return;

    var currentMatchday = 1;
    finished.forEach(function(m) { if (m.matchday > currentMatchday) currentMatchday = m.matchday; });

    var segments = [];
    var pastDays = {};
    finished.forEach(function(m) {
      if (m.matchday < currentMatchday) {
        if (!pastDays[m.matchday]) pastDays[m.matchday] = [];
        pastDays[m.matchday].push(m);
      }
    });
    var sortedPastDays = Object.keys(pastDays).map(Number).sort(function(a, b) { return a - b; });
    sortedPastDays.forEach(function(day) {
      segments.push({ type: "day", matchday: day, matches: pastDays[day] });
    });
    var currentMatches = finished.filter(function(m) { return m.matchday === currentMatchday; });
    currentMatches.forEach(function(m) {
      segments.push({ type: "match", match: m });
    });

    var labels = segments.map(function(seg) {
      if (seg.type === "day") return "Matchday " + seg.matchday;
      var m = seg.match;
      return m.homeTeam.slice(0, 3).toUpperCase() + " v " + m.awayTeam.slice(0, 3).toUpperCase();
    });

    var datasets = board.map(function(user, ui) {
      var cumulative = 0;

      var data = segments.map(function(seg) {
        if (seg.type === "day") {
          seg.matches.forEach(function(m) { cumulative += calcMatchPoints(user, m); });
        } else {
          cumulative += calcMatchPoints(user, seg.match);
        }
        return cumulative;
      });

      var color = LINE_COLORS[ui % LINE_COLORS.length];
      return {
        label: user.name,
        data: data,
        borderColor: color,
        backgroundColor: color,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 3,
        borderWidth: 3,
        fill: {
          target: "origin",
          above: color + "18"
        }
      };
    });

    new Chart(canvas, {
      type: "line",
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 20,
              font: { size: 12, weight: "500" }
            }
          },
          tooltip: {
            backgroundColor: "rgba(15,23,42,0.92)",
            titleFont: { size: 13, weight: "600" },
            bodyFont: { size: 12 },
            padding: { top: 10, bottom: 10, left: 14, right: 14 },
            cornerRadius: 8,
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            boxPadding: 4,
            callbacks: {
              title: function(items) { return items[0].label; },
              label: function(ctx) {
                var total = ctx.dataset.data[ctx.dataset.data.length - 1];
                return " " + ctx.dataset.label + ": " + ctx.parsed.y + " pts (total: " + total + ")";
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { maxRotation: 45, font: { size: 10 }, color: "rgba(100,116,139,0.8)" },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Points", font: { size: 11, weight: "500" }, color: "rgba(100,116,139,0.8)" },
            grid: { color: "rgba(0,0,0,0.04)", drawBorder: false },
            ticks: { font: { size: 10 }, color: "rgba(100,116,139,0.8)" }
          }
        }
      }
    });
  }
})();
