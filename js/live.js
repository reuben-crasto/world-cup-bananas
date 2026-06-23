(function () {
  "use strict";

  var isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") { window.location.href = "login.html"; return; }

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

  var FLAGS = {
    "Mexico":"\u{1F1F2}\u{1F1FD}","South Africa":"\u{1F1FF}\u{1F1E6}","Rep. of Korea":"\u{1F1F0}\u{1F1F7}","Czech Rep.":"\u{1F1E8}\u{1F1FF}",
    "Canada":"\u{1F1E8}\u{1F1E6}","Bosnia/Herzeg.":"\u{1F1E7}\u{1F1E6}","Qatar":"\u{1F1F6}\u{1F1E6}","Switzerland":"\u{1F1E8}\u{1F1ED}",
    "Brazil":"\u{1F1E7}\u{1F1F7}","Morocco":"\u{1F1F2}\u{1F1E6}","Haiti":"\u{1F1ED}\u{1F1F9}","Scotland":"\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
    "USA":"\u{1F1FA}\u{1F1F8}","Paraguay":"\u{1F1F5}\u{1F1FE}","Australia":"\u{1F1E6}\u{1F1FA}","Turkey":"\u{1F1F9}\u{1F1F7}",
    "Germany":"\u{1F1E9}\u{1F1EA}","Curaçao":"\u{1F1E8}\u{1F1FC}","Ivory Coast":"\u{1F1E8}\u{1F1EE}","Ecuador":"\u{1F1EA}\u{1F1E8}",
    "Netherlands":"\u{1F1F3}\u{1F1F1}","Japan":"\u{1F1EF}\u{1F1F5}","Sweden":"\u{1F1F8}\u{1F1EA}","Tunisia":"\u{1F1F9}\u{1F1F3}",
    "Belgium":"\u{1F1E7}\u{1F1EA}","Egypt":"\u{1F1EA}\u{1F1EC}","IR Iran":"\u{1F1EE}\u{1F1F7}","New Zealand":"\u{1F1F3}\u{1F1FF}",
    "Spain":"\u{1F1EA}\u{1F1F8}","Cape Verde":"\u{1F1E8}\u{1F1FB}","Saudi Arabia":"\u{1F1F8}\u{1F1E6}","Uruguay":"\u{1F1FA}\u{1F1FE}",
    "France":"\u{1F1EB}\u{1F1F7}","Senegal":"\u{1F1F8}\u{1F1F3}","Iraq":"\u{1F1EE}\u{1F1F6}","Norway":"\u{1F1F3}\u{1F1F4}",
    "Argentina":"\u{1F1E6}\u{1F1F7}","Algeria":"\u{1F1E9}\u{1F1FF}","Austria":"\u{1F1E6}\u{1F1F9}","Jordan":"\u{1F1EF}\u{1F1F4}",
    "Portugal":"\u{1F1F5}\u{1F1F9}","DR Congo":"\u{1F1E8}\u{1F1E9}","Uzbekistan":"\u{1F1FA}\u{1F1FF}","Colombia":"\u{1F1E8}\u{1F1F4}",
    "England":"\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}","Croatia":"\u{1F1ED}\u{1F1F7}","Ghana":"\u{1F1EC}\u{1F1ED}","Panama":"\u{1F1F5}\u{1F1E6}"
  };

  var ROUND_NAMES = ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Final"];
  var KNOCKOUT_STAGES = ["LAST_32", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL", "THIRD_PLACE"];

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

  var container = document.getElementById("liveGroupsContainer");
  var bracketEl = document.getElementById("liveBracket");
  var champNameEl = document.getElementById("liveChampName");
  var champFlagEl = document.getElementById("liveChampFlag");
  var liveThirdWrap = document.getElementById("liveThirdWrap");
  var finishedCount = document.getElementById("liveFinished");
  var lastUpdated = document.getElementById("liveUpdated");

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function flag(t) { return FLAGS[t] || "⚽"; }

  function statusBadge(status) {
    if (status === "FINISHED") return '<span class="live-badge live-badge--ft">FT</span>';
    if (status === "IN_PLAY" || status === "PAUSED") return '<span class="live-badge live-badge--live">LIVE</span>';
    if (status === "SCHEDULED" || status === "TIMED") return '<span class="live-badge live-badge--sched">Upcoming</span>';
    return '<span class="live-badge">' + esc(status) + '</span>';
  }

  function renderGroups(matches) {
    var byGroup = {};
    matches.forEach(function (m) {
      if (!m.group) return;
      if (!byGroup[m.group]) byGroup[m.group] = [];
      byGroup[m.group].push(m);
    });

    var finished = 0;
    matches.forEach(function (m) { if (m.group && m.status === "FINISHED") finished++; });
    if (finishedCount) finishedCount.textContent = finished + "/72";

    container.innerHTML = LETTERS.map(function (letter) {
      var teams = groupTeams[letter];
      var dates = groupDates[letter];
      var groupMatches = PAIRS.map(function (p, i) {
        return { date: dates[i], home: teams[p[0]], away: teams[p[1]] };
      });

      var liveByKey = {};
      if (byGroup[letter]) {
        byGroup[letter].forEach(function (m) {
          liveByKey[m.homeTeam + "|" + m.awayTeam] = m;
        });
      }

      var t = {};
      teams.forEach(function (team) {
        t[team] = { team: team, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      });

      var matchesHtml = groupMatches.map(function (m) {
        var live = liveByKey[m.home + "|" + m.away];
        var scoreHtml, badge;
        if (live && live.homeScore != null) {
          scoreHtml = '<span class="live-score">' + live.homeScore + '</span><span class="live-vs">–</span><span class="live-score">' + live.awayScore + '</span>';
          badge = statusBadge(live.status);
          if (live.status === "FINISHED") {
            var hs = live.homeScore, as = live.awayScore;
            var H = t[m.home], A = t[m.away];
            H.p++; A.p++; H.gf += hs; H.ga += as; A.gf += as; A.ga += hs;
            if (hs > as) { H.w++; A.l++; H.pts += 3; }
            else if (hs < as) { A.w++; H.l++; A.pts += 3; }
            else { H.d++; A.d++; H.pts++; A.pts++; }
          }
        } else {
          scoreHtml = '<span class="live-score live-score--tbd">–</span><span class="live-vs"></span><span class="live-score live-score--tbd">–</span>';
          badge = statusBadge(live ? live.status : "SCHEDULED");
        }

        return '<div class="gs-match">' +
          '<span class="gs-match__date">' + esc(m.date) + '</span>' +
          '<span class="gs-match__team gs-match__team--home">' + esc(m.home) + ' <span class="gs-flag">' + flag(m.home) + '</span></span>' +
          scoreHtml +
          '<span class="gs-match__team gs-match__team--away"><span class="gs-flag">' + flag(m.away) + '</span> ' + esc(m.away) + '</span>' +
          badge +
        '</div>';
      }).join("");

      var rows = Object.keys(t).map(function (k) { t[k].gd = t[k].gf - t[k].ga; return t[k]; });
      rows.sort(function (a, b) {
        return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team);
      });

      var tableHtml = rows.map(function (r, i) {
        var adv = i < 2;
        var gd = r.gd > 0 ? "+" + r.gd : r.gd;
        return '<tr' + (adv ? ' class="is-advancing"' : '') + '>' +
          '<td class="team-col">' + (adv ? '<span class="check">✓</span>' : '') + '<span class="gs-flag">' + flag(r.team) + '</span> ' + esc(r.team) + '</td>' +
          '<td>' + r.p + '</td><td>' + r.w + '</td><td>' + r.d + '</td><td>' + r.l + '</td>' +
          '<td>' + r.gf + '</td><td>' + r.ga + '</td><td>' + gd + '</td>' +
          '<td class="pts-col">' + r.pts + '</td>' +
        '</tr>';
      }).join("");

      return '<article class="card card--elevated gs-card">' +
        '<div class="gs-card__head">' +
          '<div class="gs-card__title">' +
            '<span class="gs-card__letter">' + letter + '</span>' +
            '<h3>Group ' + letter + '</h3>' +
          '</div>' +
          '<span class="badge">Top 2 + best 3rd advance</span>' +
        '</div>' +
        '<div class="gs-card__body">' +
          '<div class="gs-matches">' + matchesHtml + '</div>' +
          '<div class="standings"><table>' +
            '<thead><tr><th class="team-col">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>' +
            '<tbody>' + tableHtml + '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  function computeR32FromStandings(standings) {
    if (!standings || standings.length === 0) return null;
    var winners = {}, runnersUp = {}, thirdTeams = [];
    standings.forEach(function (g) {
      var letter = g.group;
      var table = g.table;
      if (table.length < 3) return;
      winners[letter] = table[0].team;
      runnersUp[letter] = table[1].team;
      thirdTeams.push({
        group: letter, team: table[2].team,
        pts: table[2].points, gd: table[2].goalDifference, gf: table[2].goalsFor
      });
    });
    if (Object.keys(winners).length < 12) return null;

    thirdTeams.sort(function (a, b) {
      return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.group.localeCompare(b.group);
    });
    var qualified = thirdTeams.slice(0, 8);
    var qualifiedGroups = qualified.map(function (t) { return t.group; });

    var thirdSlots = [];
    R32_TEMPLATE.forEach(function (t, i) {
      if (t.pool) thirdSlots.push({ index: i, pool: t.pool });
    });
    var thirdAssignment = {}, usedGroups = {};
    function solveThird(si) {
      if (si >= thirdSlots.length) return true;
      var slot = thirdSlots[si];
      for (var qi = 0; qi < qualifiedGroups.length; qi++) {
        var g = qualifiedGroups[qi];
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
      if (pos === "1") return winners[grp] || null;
      if (pos === "2") return runnersUp[grp] || null;
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
      return { homeTeam: home, awayTeam: away };
    });
  }

  function renderProvisionalR32(r32) {
    var cards = r32.map(function (m) {
      var homeName = m.homeTeam || "TBD";
      var awayName = m.awayTeam || "TBD";
      var homeEmpty = !m.homeTeam;
      var awayEmpty = !m.awayTeam;
      return '<div class="bk-match">' +
        '<button type="button" class="bk-team' + (homeEmpty ? ' is-empty' : '') + '" disabled>' +
          '<span class="bk-team__flag">' + (homeEmpty ? '⚽' : flag(homeName)) + '</span>' +
          '<span class="bk-team__name">' + esc(homeName) + '</span>' +
        '</button>' +
        '<button type="button" class="bk-team' + (awayEmpty ? ' is-empty' : '') + '" disabled>' +
          '<span class="bk-team__flag">' + (awayEmpty ? '⚽' : flag(awayName)) + '</span>' +
          '<span class="bk-team__name">' + esc(awayName) + '</span>' +
        '</button>' +
      '</div>';
    }).join("");

    bracketEl.innerHTML =
      '<div class="bk-col" data-round="0">' +
        '<div class="bk-col__label overline">' + ROUND_NAMES[0] + '</div>' +
        '<div class="bk-col__matches">' + cards + '</div>' +
      '</div>';
  }

  function renderKnockout(matches, standings) {
    var koMatches = matches.filter(function (m) {
      return !m.group && KNOCKOUT_STAGES.indexOf(m.stage) !== -1;
    });

    var hasRealKO = koMatches.some(function (m) { return m.homeTeam != null || m.awayTeam != null; });

    if (!hasRealKO) {
      var r32 = computeR32FromStandings(standings);
      if (r32) {
        renderProvisionalR32(r32);
      } else {
        bracketEl.innerHTML =
          '<div style="text-align:center;padding:var(--space-10);color:rgba(255,255,255,0.6);">' +
            '<p style="font-size:var(--text-h3);margin-bottom:var(--space-4);">No knockout matches yet</p>' +
            '<p>Knockout stage matches will appear here once the group stage is complete.</p>' +
          '</div>';
      }
      champNameEl.textContent = "—";
      champFlagEl.textContent = "\u{1F3C6}";
      liveThirdWrap.innerHTML = '<div class="bk-third__hint">Third-place play-off will appear after the semi-finals.</div>';
      return;
    }

    var stageMap = { "LAST_32": 0, "LAST_16": 1, "QUARTER_FINALS": 2, "SEMI_FINALS": 3, "FINAL": 4 };
    var rounds = [[], [], [], [], []];
    var thirdPlace = null;

    koMatches.forEach(function (m) {
      if (m.stage === "THIRD_PLACE") {
        thirdPlace = m;
        return;
      }
      var ri = stageMap[m.stage];
      if (ri != null) rounds[ri].push(m);
    });

    var champion = null;
    if (rounds[4].length > 0 && rounds[4][0].status === "FINISHED") {
      var f = rounds[4][0];
      champion = f.homeScore > f.awayScore ? f.homeTeam : f.awayTeam;
    }
    champNameEl.textContent = champion || "—";
    champFlagEl.textContent = champion ? flag(champion) : "\u{1F3C6}";

    var cols = rounds.map(function (roundMatches, r) {
      if (roundMatches.length === 0) return '';
      var cards = roundMatches.map(function (m) {
        var homeWin = m.status === "FINISHED" && m.homeScore > m.awayScore;
        var awayWin = m.status === "FINISHED" && m.homeScore < m.awayScore;
        var homeScore = m.homeScore != null ? m.homeScore : "";
        var awayScore = m.awayScore != null ? m.awayScore : "";
        return '<div class="bk-match">' +
          '<button type="button" class="bk-team' + (homeWin ? ' is-winner' : (awayWin ? ' is-loser' : '')) + '" disabled>' +
            '<span class="bk-team__flag">' + flag(m.homeTeam) + '</span>' +
            '<span class="bk-team__name">' + esc(m.homeTeam) + '</span>' +
            (homeScore !== "" ? '<span class="bk-team__tick">' + homeScore + '</span>' : '') +
          '</button>' +
          '<button type="button" class="bk-team' + (awayWin ? ' is-winner' : (homeWin ? ' is-loser' : '')) + '" disabled>' +
            '<span class="bk-team__flag">' + flag(m.awayTeam) + '</span>' +
            '<span class="bk-team__name">' + esc(m.awayTeam) + '</span>' +
            (awayScore !== "" ? '<span class="bk-team__tick">' + awayScore + '</span>' : '') +
          '</button>' +
        '</div>';
      }).join("");

      return '<div class="bk-col" data-round="' + r + '">' +
        '<div class="bk-col__label overline">' + ROUND_NAMES[r] + '</div>' +
        '<div class="bk-col__matches">' + cards + '</div>' +
      '</div>';
    }).join("");

    bracketEl.innerHTML = cols;

    if (thirdPlace) {
      var thHomeWin = thirdPlace.status === "FINISHED" && thirdPlace.homeScore > thirdPlace.awayScore;
      var thAwayWin = thirdPlace.status === "FINISHED" && thirdPlace.homeScore < thirdPlace.awayScore;
      liveThirdWrap.innerHTML =
        '<div class="bk-match bk-match--third">' +
          '<button type="button" class="bk-team' + (thHomeWin ? ' is-winner' : '') + '" disabled>' +
            '<span class="bk-team__flag">' + flag(thirdPlace.homeTeam) + '</span>' +
            '<span class="bk-team__name">' + esc(thirdPlace.homeTeam) + '</span>' +
            (thHomeWin ? '<span class="bk-team__tick">\u{1F949}</span>' : '') +
          '</button>' +
          '<button type="button" class="bk-team' + (thAwayWin ? ' is-winner' : '') + '" disabled>' +
            '<span class="bk-team__flag">' + flag(thirdPlace.awayTeam) + '</span>' +
            '<span class="bk-team__name">' + esc(thirdPlace.awayTeam) + '</span>' +
            (thAwayWin ? '<span class="bk-team__tick">\u{1F949}</span>' : '') +
          '</button>' +
        '</div>';
    } else {
      liveThirdWrap.innerHTML = '<div class="bk-third__hint">Third-place play-off will appear after the semi-finals.</div>';
    }
  }

  function renderEmpty() {
    container.innerHTML = LETTERS.map(function (letter) {
      var teams = groupTeams[letter];
      var dates = groupDates[letter];
      var groupMatches = PAIRS.map(function (p, i) {
        return { date: dates[i], home: teams[p[0]], away: teams[p[1]] };
      });

      var matchesHtml = groupMatches.map(function (m) {
        return '<div class="gs-match">' +
          '<span class="gs-match__date">' + esc(m.date) + '</span>' +
          '<span class="gs-match__team gs-match__team--home">' + esc(m.home) + ' <span class="gs-flag">' + flag(m.home) + '</span></span>' +
          '<span class="live-score live-score--tbd">–</span><span class="live-vs"></span><span class="live-score live-score--tbd">–</span>' +
          '<span class="gs-match__team gs-match__team--away"><span class="gs-flag">' + flag(m.away) + '</span> ' + esc(m.away) + '</span>' +
          '<span class="live-badge live-badge--sched">Upcoming</span>' +
        '</div>';
      }).join("");

      var tableHtml = teams.map(function (team) {
        return '<tr><td class="team-col"><span class="gs-flag">' + flag(team) + '</span> ' + esc(team) + '</td>' +
          '<td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td class="pts-col">0</td></tr>';
      }).join("");

      return '<article class="card card--elevated gs-card">' +
        '<div class="gs-card__head">' +
          '<div class="gs-card__title"><span class="gs-card__letter">' + letter + '</span><h3>Group ' + letter + '</h3></div>' +
          '<span class="badge">Top 2 + best 3rd advance</span>' +
        '</div>' +
        '<div class="gs-card__body">' +
          '<div class="gs-matches">' + matchesHtml + '</div>' +
          '<div class="standings"><table>' +
            '<thead><tr><th class="team-col">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>' +
            '<tbody>' + tableHtml + '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  function fetchAndRender() {
    Promise.all([
      fetch("/api/live/matches").then(function (res) { return res.json(); }),
      fetch("/api/live/standings").then(function (res) { return res.json(); }).catch(function () { return { success: false }; })
    ]).then(function (results) {
      var matchData = results[0];
      var standingsData = results[1];
      if (!matchData.success || !matchData.matches) return;
      renderGroups(matchData.matches);
      renderKnockout(matchData.matches, standingsData.success ? standingsData.standings : null);
      if (lastUpdated) {
        lastUpdated.textContent = "Updated " + new Date().toLocaleTimeString();
      }
    }).catch(function () {});
  }

  renderEmpty();
  fetchAndRender();
  setInterval(fetchAndRender, 120000);
})();
