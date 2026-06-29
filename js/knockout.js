(function () {
  "use strict";

  var isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") { window.location.href = "login.html"; return; }

  var KEY = "knockoutPicks2026";
  var R32_KEY = "knockoutR32_2026";
  var LOCK_KEY = "knockoutLocked2026";

  var FLAGS = {
    "Argentina":"\u{1F1E6}\u{1F1F7}","France":"\u{1F1EB}\u{1F1F7}","Brazil":"\u{1F1E7}\u{1F1F7}","England":"\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
    "Portugal":"\u{1F1F5}\u{1F1F9}","Netherlands":"\u{1F1F3}\u{1F1F1}","Spain":"\u{1F1EA}\u{1F1F8}","Belgium":"\u{1F1E7}\u{1F1EA}",
    "Germany":"\u{1F1E9}\u{1F1EA}","Croatia":"\u{1F1ED}\u{1F1F7}","Uruguay":"\u{1F1FA}\u{1F1FE}","Morocco":"\u{1F1F2}\u{1F1E6}",
    "Colombia":"\u{1F1E8}\u{1F1F4}","Mexico":"\u{1F1F2}\u{1F1FD}","Switzerland":"\u{1F1E8}\u{1F1ED}","USA":"\u{1F1FA}\u{1F1F8}",
    "Senegal":"\u{1F1F8}\u{1F1F3}","Japan":"\u{1F1EF}\u{1F1F5}","Ecuador":"\u{1F1EA}\u{1F1E8}","Austria":"\u{1F1E6}\u{1F1F9}",
    "Australia":"\u{1F1E6}\u{1F1FA}","Turkey":"\u{1F1F9}\u{1F1F7}","Rep. of Korea":"\u{1F1F0}\u{1F1F7}","Canada":"\u{1F1E8}\u{1F1E6}",
    "Tunisia":"\u{1F1F9}\u{1F1F3}","Egypt":"\u{1F1EA}\u{1F1EC}","Norway":"\u{1F1F3}\u{1F1F4}","Algeria":"\u{1F1E9}\u{1F1FF}",
    "Scotland":"\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}","Ivory Coast":"\u{1F1E8}\u{1F1EE}",
    "Ghana":"\u{1F1EC}\u{1F1ED}","Panama":"\u{1F1F5}\u{1F1E6}","South Africa":"\u{1F1FF}\u{1F1E6}","Qatar":"\u{1F1F6}\u{1F1E6}",
    "IR Iran":"\u{1F1EE}\u{1F1F7}","New Zealand":"\u{1F1F3}\u{1F1FF}","Saudi Arabia":"\u{1F1F8}\u{1F1E6}",
    "Cape Verde":"\u{1F1E8}\u{1F1FB}","Iraq":"\u{1F1EE}\u{1F1F6}","Jordan":"\u{1F1EF}\u{1F1F4}",
    "DR Congo":"\u{1F1E8}\u{1F1E9}","Uzbekistan":"\u{1F1FA}\u{1F1FF}","Paraguay":"\u{1F1F5}\u{1F1FE}",
    "Sweden":"\u{1F1F8}\u{1F1EA}","Haiti":"\u{1F1ED}\u{1F1F9}","Czech Rep.":"\u{1F1E8}\u{1F1FF}",
    "Bosnia/Herzeg.":"\u{1F1E7}\u{1F1E6}","Curaçao":"\u{1F1E8}\u{1F1FC}"
  };

  var ADMIN_EMAIL = "crasto.reuben15@gmail.com";
  var isAdmin = (localStorage.getItem("userEmail") || "").toLowerCase() === ADMIN_EMAIL;

  var ROUND_NAMES = ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Final"];

  var saveBtn = document.getElementById("koSaveBtn");
  var editBtn = document.getElementById("koEditBtn");
  var champEl = document.getElementById("champName");
  var champFlag = document.getElementById("champFlag");
  var thirdWrap = document.getElementById("thirdWrap");

  var R32, locked, picks, rounds, userId, initialized;

  function loadR32() {
    try {
      var raw = localStorage.getItem(R32_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 16) return parsed;
      return null;
    } catch (e) { return null; }
  }

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { localStorage.setItem(KEY, JSON.stringify(picks)); }

  function syncKnockoutToServer() {
    if (!userId) return;
    fetch("/api/predictions/knockout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, picks: picks })
    }).catch(function () {});
  }
  function flag(t) { return t ? (FLAGS[t] || "⚽") : ""; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  function isBracketComplete() {
    for (var r = 0; r < 5; r++) {
      var numMatches = 16 / Math.pow(2, r);
      for (var m = 0; m < numMatches; m++) {
        if (picks[r + "-" + m] == null) return false;
      }
    }
    return picks["third"] != null;
  }

  function buildRounds() {
    var rds = [R32.map(function (p) { return p.slice(); })];
    for (var r = 1; r < 5; r++) {
      var prev = rds[r - 1];
      var cur = [];
      for (var m = 0; m < prev.length / 2; m++) {
        cur.push([pickOf(r - 1, m * 2), pickOf(r - 1, m * 2 + 1)]);
      }
      rds.push(cur);
    }
    return rds;
  }
  function pickOf(round, match) {
    var key = round + "-" + match;
    return picks[key] != null ? picks[key] : null;
  }

  function setPick(round, match, team) {
    if (!team || locked) return;
    var key = round + "-" + match;
    if (picks[key] === team) return;
    picks[key] = team;
    clearDownstream(round, match);
    save();
    syncKnockoutToServer();
    rounds = buildRounds();
    render();
  }
  function clearDownstream(round, match) {
    var r = round + 1, m = Math.floor(match / 2);
    while (r < 5) {
      delete picks["" + r + "-" + m];
      r++; m = Math.floor(m / 2);
    }
    if (round >= 2) delete picks["third"];
  }

  function updateLockUI() {
    if (locked) {
      if (saveBtn) { saveBtn.textContent = "Bracket Locked"; saveBtn.disabled = true; saveBtn.classList.add("btn--locked"); }
      if (editBtn) editBtn.style.display = isAdmin ? "" : "none";
    } else {
      if (saveBtn) { saveBtn.textContent = "Save & Lock Bracket"; saveBtn.disabled = false; saveBtn.classList.remove("btn--locked"); saveBtn.style.display = ""; }
      if (editBtn) editBtn.style.display = "none";
    }
  }

  function render() {
    var cols = rounds.map(function (matches, r) {
      var cards = matches.map(function (pair, m) {
        return matchCard(r, m, pair[0], pair[1]);
      }).join("");
      return '<div class="bk-col" data-round="' + r + '">' +
        '<div class="bk-col__label overline">' + ROUND_NAMES[r] + '</div>' +
        '<div class="bk-col__matches">' + cards + '</div>' +
      '</div>';
    }).join("");

    document.getElementById("bracket").innerHTML = cols;

    if (!locked) {
      Array.prototype.forEach.call(document.querySelectorAll(".bk-team"), function (el) {
        el.addEventListener("click", function () {
          var r = +el.dataset.round, m = +el.dataset.match, t = el.dataset.team;
          if (!t) return;
          setPick(r, m, t);
        });
      });
    }

    var champ = pickOf(4, 0);
    champEl.textContent = champ || "—";
    champFlag.textContent = champ ? flag(champ) : "\u{1F3C6}";

    renderThird();
    updateLockUI();
  }

  function matchCard(round, match, top, bottom) {
    var winner = pickOf(round, match);
    return '<div class="bk-match">' +
      teamRow(round, match, top, winner) +
      teamRow(round, match, bottom, winner) +
    '</div>';
  }
  function teamRow(round, match, team, winner) {
    var isWinner = team && winner === team;
    var isLoser = team && winner && winner !== team;
    var cls = "bk-team" + (isWinner ? " is-winner" : "") + (isLoser ? " is-loser" : "") + (!team ? " is-empty" : "") + (locked ? " is-locked" : "");
    return '<button type="button" class="' + cls + '" data-round="' + round + '" data-match="' + match + '" data-team="' + esc(team) + '"' + (team && !locked ? "" : " disabled") + '>' +
      '<span class="bk-team__flag">' + flag(team) + '</span>' +
      '<span class="bk-team__name">' + (team ? esc(team) : "—") + '</span>' +
      (isWinner ? '<span class="bk-team__tick">✓</span>' : '') +
    '</button>';
  }

  function renderThird() {
    var semiTop = rounds[3][0], semiBot = rounds[3][1];
    var winTop = pickOf(3, 0), winBot = pickOf(3, 1);
    function loser(pair, win) {
      if (!win || !pair[0] || !pair[1]) return null;
      return pair[0] === win ? pair[1] : pair[0];
    }
    var lt = loser(semiTop, winTop), lb = loser(semiBot, winBot);
    if (!lt || !lb) {
      thirdWrap.innerHTML = '<div class="bk-third__hint">Pick both semi-finals to set the third-place play-off.</div>';
      return;
    }
    var pick = picks["third"];
    thirdWrap.innerHTML =
      '<div class="bk-match bk-match--third">' +
        thirdRow(lt, pick) + thirdRow(lb, pick) +
      '</div>';
    if (!locked) {
      Array.prototype.forEach.call(thirdWrap.querySelectorAll(".bk-team"), function (el) {
        el.addEventListener("click", function () {
          picks["third"] = el.dataset.team; save(); syncKnockoutToServer(); render();
        });
      });
    }
  }
  function thirdRow(team, pick) {
    var w = pick === team;
    return '<button type="button" class="bk-team' + (w ? " is-winner" : (pick ? " is-loser" : "")) + (locked ? " is-locked" : "") + '" data-team="' + esc(team) + '"' + (locked ? " disabled" : "") + '>' +
      '<span class="bk-team__flag">' + flag(team) + '</span>' +
      '<span class="bk-team__name">' + esc(team) + '</span>' +
      (w ? '<span class="bk-team__tick">\u{1F949}</span>' : '') +
    '</button>';
  }

  function showEmpty() {
    document.getElementById("bracket").innerHTML =
      '<div style="text-align:center;padding:var(--space-10);color:rgba(255,255,255,0.6);">' +
        '<p style="font-size:var(--text-h3);margin-bottom:var(--space-4);">No bracket yet</p>' +
        '<p style="margin-bottom:var(--space-6);">Complete and save your Group Stage predictions first. The knockout bracket will be generated from your group results.</p>' +
        '<a href="brackets.html" class="btn btn--accent btn--lg">Go to Group Stage</a>' +
      '</div>';
    champEl.textContent = "—";
    if (saveBtn) saveBtn.style.display = "none";
    if (editBtn) editBtn.style.display = "none";
  }

  var BRACKET_REORDER = [1, 4, 0, 2, 10, 11, 8, 9, 3, 5, 6, 7, 13, 15, 12, 14];
  var BRACKET_VERSION_KEY = "knockoutBracketVersion";

  function migrateToV2() {
    var ver = localStorage.getItem(BRACKET_VERSION_KEY);
    if (ver && parseInt(ver, 10) >= 2) return;

    var r32 = loadR32();
    if (r32 && r32.length === 16) {
      var newR32 = BRACKET_REORDER.map(function (oldIdx) { return r32[oldIdx]; });
      localStorage.setItem(R32_KEY, JSON.stringify(newR32));
    }

    var oldPicks = load();
    var newPicks = {};
    for (var i = 0; i < 16; i++) {
      var oldKey = "0-" + BRACKET_REORDER[i];
      if (oldPicks[oldKey] != null) newPicks["0-" + i] = oldPicks[oldKey];
    }
    localStorage.setItem(KEY, JSON.stringify(newPicks));

    localStorage.removeItem(LOCK_KEY);
    localStorage.setItem(BRACKET_VERSION_KEY, "2");

    if (userId) {
      fetch("/api/predictions/knockout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, picks: newPicks })
      }).catch(function () {});
      fetch("/api/predictions/lock", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, lockType: "knockout" })
      }).catch(function () {});
    }
  }

  function init() {
    userId = localStorage.getItem("userId");
    migrateToV2();

    R32 = loadR32();
    locked = localStorage.getItem(LOCK_KEY) === "true";

    if (!R32) {
      showEmpty();
      return;
    }

    picks = load();
    rounds = buildRounds();
    render();
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      if (locked) return;
      if (!isBracketComplete()) {
        alert("Please complete all bracket picks (including the third-place play-off) before locking.");
        return;
      }
      localStorage.setItem("groupStageLocked2026", "true");
      localStorage.setItem(LOCK_KEY, "true");
      locked = true;
      syncKnockoutToServer();
      if (userId) {
        var r32Data = localStorage.getItem("knockoutR32_2026");
        fetch("/api/predictions/lock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId, lockType: "group", r32Data: r32Data ? JSON.parse(r32Data) : null })
        }).catch(function () {});
        fetch("/api/predictions/lock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId, lockType: "knockout" })
        }).catch(function () {});
        fetch("/api/predictions/group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId, predictions: JSON.parse(localStorage.getItem("groupStagePredictions2026") || "{}") })
        }).catch(function () {});
      }
      render();
    });
  }
  if (editBtn) {
    editBtn.addEventListener("click", function () {
      if (!confirm("Unlock your bracket to make changes?")) return;
      localStorage.removeItem(LOCK_KEY);
      localStorage.removeItem("groupStageLocked2026");
      locked = false;
      if (userId) {
        fetch("/api/predictions/lock", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId, lockType: "knockout" })
        }).catch(function () {});
        fetch("/api/predictions/lock", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId, lockType: "group" })
        }).catch(function () {});
      }
      render();
    });
  }

  init();

  var koPanel = document.getElementById("ko-actions");
  if (koPanel) {
    new MutationObserver(function () {
      if (koPanel.classList.contains("is-active")) init();
    }).observe(koPanel, { attributes: true, attributeFilter: ["class"] });
  }
})();
