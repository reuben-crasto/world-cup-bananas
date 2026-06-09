document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
  
    if (isLoggedIn !== "true") {
      window.location.href = "login.html";
      return;
    }
  
    const groupsContainer = document.getElementById("groupsContainer");
    const autofillSelect = document.getElementById("autofillSelect");
    const saveBtn = document.getElementById("saveBtn");
  
    const STORAGE_KEY = "groupStagePredictions2026";
  
    const groupLetters = [
        "A", "B", "C", "D", "E", "F",
        "G", "H", "I", "J", "K", "L"
      ];
      
      /*
        Replace these teams with the official FIFA 2026 groups when finalized.
        Each group must have exactly 4 teams.
      */
      
      const groupTeams = {
        A: ["United States", "Switzerland", "Egypt", "New Zealand"],
        B: ["Canada", "Uruguay", "Japan", "Ghana"],
        C: ["Mexico", "Croatia", "South Korea", "Panama"],
        D: ["Argentina", "Denmark", "Tunisia", "Saudi Arabia"],
        E: ["France", "Colombia", "Scotland", "Qatar"],
        F: ["Spain", "Morocco", "Senegal", "Costa Rica"],
        G: ["Brazil", "Serbia", "Australia", "Jamaica"],
        H: ["England", "Ecuador", "Iran", "South Africa"],
        I: ["Portugal", "Austria", "Cameroon", "Honduras"],
        J: ["Netherlands", "Poland", "Algeria", "Iraq"],
        K: ["Belgium", "United States Playoff", "Nigeria", "UAE"],
        L: ["Germany", "Norway", "Ivory Coast", "Bolivia"]
      };
      
      const groupDates = {
        A: ["Jun 11", "Jun 12", "Jun 18", "Jun 18", "Jun 24", "Jun 24"],
        B: ["Jun 12", "Jun 13", "Jun 19", "Jun 19", "Jun 25", "Jun 25"],
        C: ["Jun 13", "Jun 14", "Jun 20", "Jun 20", "Jun 26", "Jun 26"],
        D: ["Jun 14", "Jun 15", "Jun 21", "Jun 21", "Jun 27", "Jun 27"],
        E: ["Jun 15", "Jun 16", "Jun 22", "Jun 22", "Jun 27", "Jun 27"],
        F: ["Jun 16", "Jun 17", "Jun 23", "Jun 23", "Jun 26", "Jun 26"],
        G: ["Jun 17", "Jun 18", "Jun 24", "Jun 24", "Jun 27", "Jun 27"],
        H: ["Jun 18", "Jun 19", "Jun 25", "Jun 25", "Jun 26", "Jun 26"],
        I: ["Jun 19", "Jun 20", "Jun 26", "Jun 26", "Jun 27", "Jun 27"],
        J: ["Jun 20", "Jun 21", "Jun 26", "Jun 26", "Jun 27", "Jun 27"],
        K: ["Jun 21", "Jun 22", "Jun 25", "Jun 25", "Jun 27", "Jun 27"],
        L: ["Jun 22", "Jun 23", "Jun 26", "Jun 26", "Jun 27", "Jun 27"]
      };
      
      const groups = groupLetters.map((letter) => {
        const teams = groupTeams[letter];
        const dates = groupDates[letter];
      
        return {
          name: `Group ${letter}`,
          teams,
          matches: [
            {
              date: dates[0],
              home: teams[0],
              away: teams[1]
            },
            {
              date: dates[1],
              home: teams[2],
              away: teams[3]
            },
            {
              date: dates[2],
              home: teams[0],
              away: teams[2]
            },
            {
              date: dates[3],
              home: teams[3],
              away: teams[1]
            },
            {
              date: dates[4],
              home: teams[3],
              away: teams[0]
            },
            {
              date: dates[5],
              home: teams[1],
              away: teams[2]
            }
          ]
        };
      });
  
    /*
      Temporary ranking strength for autofill.
      Lower number means stronger team.
  
      Example:
      A1 is treated as stronger than A2,
      A2 stronger than A3,
      etc.
  
      Once actual 2026 teams are added, this can be replaced with real FIFA rankings.
    */
  
      const fifaRanks = {
        Argentina: 1,
        France: 2,
        Brazil: 3,
        England: 4,
        Portugal: 5,
        Netherlands: 6,
        Spain: 7,
        Belgium: 8,
        Italy: 9,
        Germany: 10,
        Croatia: 11,
        Uruguay: 12,
        Morocco: 13,
        Colombia: 14,
        Mexico: 15,
        Switzerland: 16,
        "United States": 17,
        Senegal: 18,
        Japan: 19,
        Denmark: 20,
        Iran: 21,
        "South Korea": 22,
        Austria: 23,
        Australia: 24,
        Ukraine: 25,
        Serbia: 26,
        Poland: 27,
        Canada: 28,
        Ecuador: 29,
        Tunisia: 30,
        Egypt: 31,
        Norway: 32,
        Algeria: 33,
        Scotland: 34,
        Nigeria: 35,
        "Ivory Coast": 36,
        Cameroon: 37,
        Ghana: 38,
        Panama: 39,
        "South Africa": 40,
        Qatar: 41,
        "Saudi Arabia": 42,
        "Costa Rica": 43,
        Jamaica: 44,
        Honduras: 45,
        Iraq: 46,
        UAE: 47,
        Bolivia: 48,
        "New Zealand": 49,
        "United States Playoff": 50
      };
  
    let predictions = loadPredictions();
  
    renderGroups();
    updateAllTables();
  
    if (autofillSelect) {
      autofillSelect.addEventListener("change", () => {
        const option = autofillSelect.value;
  
        if (!option) return;
  
        if (option === "clear") {
          clearAllScores();
        } else {
          autofillScores(option);
        }
  
        savePredictionsToLocalStorage();
        updateAllTables();
  
        autofillSelect.value = "";
      });
    }
  
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        savePredictionsToLocalStorage();
        alert("Predictions saved!");
      });
    }
  
    function renderGroups() {
      groupsContainer.innerHTML = "";
  
      groups.forEach((group, groupIndex) => {
        const groupCard = document.createElement("article");
        groupCard.className = "group-card";
  
        groupCard.innerHTML = `
          <div class="group-card-header">
            <h2>${group.name}</h2>
            <span>Top 2 + best 3rd-place teams advance</span>
          </div>
  
          <div class="group-content">
            <div class="matches-panel">
              ${group.matches
                .map((match, matchIndex) => {
                  const matchId = getMatchId(groupIndex, matchIndex);
                  const savedMatch = predictions[matchId] || {};
  
                  return `
                    <div class="match-row">
                      <div class="match-date">${match.date}</div>
  
                      <div class="team-name home-team">${match.home}</div>
  
                      <input
                        type="number"
                        min="0"
                        class="score-input"
                        data-match-id="${matchId}"
                        data-score-type="home"
                        value="${savedMatch.homeScore ?? ""}"
                        aria-label="${match.home} score"
                      />
  
                      <input
                        type="number"
                        min="0"
                        class="score-input"
                        data-match-id="${matchId}"
                        data-score-type="away"
                        value="${savedMatch.awayScore ?? ""}"
                        aria-label="${match.away} score"
                      />
  
                      <div class="team-name away-team">${match.away}</div>
                    </div>
                  `;
                })
                .join("")}
            </div>
  
            <div class="table-panel">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody id="table-${groupIndex}">
                </tbody>
              </table>
            </div>
          </div>
        `;
  
        groupsContainer.appendChild(groupCard);
      });
  
      const scoreInputs = document.querySelectorAll(".score-input");
  
      scoreInputs.forEach((input) => {
        input.addEventListener("input", handleScoreInput);
      });
    }
  
    function handleScoreInput(event) {
      const input = event.target;
      const matchId = input.dataset.matchId;
      const scoreType = input.dataset.scoreType;
  
      if (!predictions[matchId]) {
        predictions[matchId] = {};
      }
  
      predictions[matchId][`${scoreType}Score`] = input.value;
  
      savePredictionsToLocalStorage();
      updateAllTables();
    }
  
    function updateAllTables() {
      groups.forEach((group, groupIndex) => {
        const standings = calculateStandings(group, groupIndex);
        renderStandingsTable(standings, groupIndex);
      });
    }
  
    function calculateStandings(group, groupIndex) {
      const standings = {};
  
      group.teams.forEach((team) => {
        standings[team] = {
          team,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        };
      });
  
      group.matches.forEach((match, matchIndex) => {
        const matchId = getMatchId(groupIndex, matchIndex);
        const prediction = predictions[matchId];
  
        if (
          !prediction ||
          prediction.homeScore === "" ||
          prediction.awayScore === "" ||
          prediction.homeScore === undefined ||
          prediction.awayScore === undefined
        ) {
          return;
        }
  
        const homeScore = Number(prediction.homeScore);
        const awayScore = Number(prediction.awayScore);
  
        if (
          Number.isNaN(homeScore) ||
          Number.isNaN(awayScore) ||
          homeScore < 0 ||
          awayScore < 0
        ) {
          return;
        }
  
        const home = standings[match.home];
        const away = standings[match.away];
  
        home.played += 1;
        away.played += 1;
  
        home.goalsFor += homeScore;
        home.goalsAgainst += awayScore;
  
        away.goalsFor += awayScore;
        away.goalsAgainst += homeScore;
  
        if (homeScore > awayScore) {
          home.wins += 1;
          away.losses += 1;
          home.points += 3;
        } else if (homeScore < awayScore) {
          away.wins += 1;
          home.losses += 1;
          away.points += 3;
        } else {
          home.draws += 1;
          away.draws += 1;
          home.points += 1;
          away.points += 1;
        }
      });
  
      const tableRows = Object.values(standings).map((team) => {
        team.goalDifference = team.goalsFor - team.goalsAgainst;
        return team;
      });
  
      tableRows.sort((a, b) => {
        return (
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          b.goalsFor - a.goalsFor ||
          a.team.localeCompare(b.team)
        );
      });
  
      return tableRows;
    }
  
    function renderStandingsTable(standings, groupIndex) {
      const tableBody = document.getElementById(`table-${groupIndex}`);
  
      if (!tableBody) return;
  
      tableBody.innerHTML = standings
        .map((row) => {
          const gd =
            row.goalDifference > 0
              ? `+${row.goalDifference}`
              : row.goalDifference;
  
          return `
            <tr>
              <td>${row.team}</td>
              <td>${row.played}</td>
              <td>${row.wins}</td>
              <td>${row.draws}</td>
              <td>${row.losses}</td>
              <td>${row.goalsFor}</td>
              <td>${row.goalsAgainst}</td>
              <td>${gd}</td>
              <td class="points-cell">${row.points}</td>
            </tr>
          `;
        })
        .join("");
    }
  
    function autofillScores(option) {
      groups.forEach((group, groupIndex) => {
        group.matches.forEach((match, matchIndex) => {
          const matchId = getMatchId(groupIndex, matchIndex);
  
          let homeScore = 0;
          let awayScore = 0;
  
          if (option === "favorites") {
            const homeRank = fifaRanks[match.home] || 100;
            const awayRank = fifaRanks[match.away] || 100;
            const rankDifference = Math.abs(homeRank - awayRank);
  
            if (rankDifference <= 1) {
              homeScore = 1;
              awayScore = 1;
            } else if (homeRank < awayRank) {
              homeScore = rankDifference > 2 ? 2 : 1;
              awayScore = 0;
            } else {
              homeScore = 0;
              awayScore = rankDifference > 2 ? 2 : 1;
            }
          }
  
          if (option === "balanced") {
            const possibleScores = [
              [1, 1],
              [0, 0],
              [2, 1],
              [1, 0],
              [2, 2],
              [1, 2]
            ];
  
            const chosen =
              possibleScores[(groupIndex + matchIndex) % possibleScores.length];
  
            homeScore = chosen[0];
            awayScore = chosen[1];
          }
  
          if (option === "random") {
            homeScore = getRandomScore();
            awayScore = getRandomScore();
          }
  
          predictions[matchId] = {
            homeScore: String(homeScore),
            awayScore: String(awayScore)
          };
        });
      });
  
      renderGroups();
    }
  
    function clearAllScores() {
      predictions = {};
      localStorage.removeItem(STORAGE_KEY);
      renderGroups();
    }
  
    function getRandomScore() {
      const scores = [0, 0, 1, 1, 1, 2, 2, 3, 4];
      return scores[Math.floor(Math.random() * scores.length)];
    }
  
    function getMatchId(groupIndex, matchIndex) {
      return `group-${groupIndex}-match-${matchIndex}`;
    }
  
    function loadPredictions() {
      const savedPredictions = localStorage.getItem(STORAGE_KEY);
  
      if (!savedPredictions) {
        return {};
      }
  
      try {
        return JSON.parse(savedPredictions);
      } catch (error) {
        console.error("Could not load predictions:", error);
        return {};
      }
    }
  
    function savePredictionsToLocalStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
    }
  });