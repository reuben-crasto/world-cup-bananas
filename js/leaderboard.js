(function () {
  var isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") { window.location.href = "login.html"; return; }

  var groupLocked = localStorage.getItem("groupStageLocked2026") === "true";
  var koLocked = localStorage.getItem("knockoutLocked2026") === "true";
  if (!groupLocked || !koLocked) {
    document.querySelector(".page").innerHTML =
      '<div style="text-align:center;padding:var(--space-12) var(--space-6);">' +
        '<p style="font-size:var(--text-h2);font-family:var(--font-display);font-weight:var(--weight-bold);margin-bottom:var(--space-6);">Leaderboard Locked</p>' +
        '<div style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:var(--space-6);max-width:480px;margin:0 auto var(--space-6);text-align:left;">' +
          '<ul style="list-style:disc;padding-left:var(--space-5);margin:0;display:flex;flex-direction:column;gap:var(--space-3);color:var(--text-muted);">' +
            '<li>Complete and lock both your group stage predictions and knockout bracket to view the leaderboard.</li>' +
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
    var lockTime = userLockedAt ? new Date(userLockedAt).getTime() : Infinity;
    var createdTime = userCreatedAt ? new Date(userCreatedAt).getTime() : 0;
    var graceRate = createdTime >= GRACE_CUTOFF ? 1.5 : 3;

    LETTERS.forEach(function(letter, gi) {
      var teams = groupTeams[letter];
      PAIRS.forEach(function(p, mi) {
        var home = teams[p[0]], away = teams[p[1]];
        var live = liveByKey[home + "|" + away];
        if (!live) return;

        var matchKickoff = live.utcDate ? new Date(live.utcDate).getTime() : 0;
        var isGraceMatch = !skipGrace && matchKickoff < lockTime;

        if (isGraceMatch) {
          gracePts += graceRate;
          graceCount++;
          breakdown.push({ match: home + " vs " + away, pts: graceRate, tag: "grace", pred: "—", actual: live.homeScore + "–" + live.awayScore });
          return;
        }

        var pr = predictions["group-" + gi + "-match-" + mi];
        if (!pr || pr.homeScore == null || pr.homeScore === "" || pr.awayScore == null || pr.awayScore === "") {
          gracePts += graceRate;
          graceCount++;
          breakdown.push({ match: home + " vs " + away, pts: graceRate, tag: "grace", pred: "—", actual: live.homeScore + "–" + live.awayScore });
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

  Promise.all([
    fetch("/api/leaderboard").then(function(r) { return r.json(); }),
    fetch("/api/live/matches").then(function(r) { return r.json(); })
  ]).then(function(results) {
    var boardData = results[0];
    var liveData = results[1];
    if (!boardData.success || !liveData.success) return;

    var liveByKey = {};
    liveData.matches.forEach(function(m) {
      if (m.status === "FINISHED" && m.group) {
        liveByKey[m.homeTeam + "|" + m.awayTeam] = m;
      }
    });

    var entries = boardData.board.map(function(user) {
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

    renderBoard(entries);
  }).catch(function() {});
})();
