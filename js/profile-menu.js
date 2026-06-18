(function () {
  "use strict";

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

  var ADMIN_EMAIL = "crasto.reuben15@gmail.com";
  var btn = document.getElementById("profileBtn");
  var dropdown = document.getElementById("profileDropdown");
  var nameEl = document.getElementById("profileName");
  var uploadLink = document.getElementById("uploadLink");
  var logoutBtn = document.getElementById("logoutBtn");

  if (!btn || !dropdown) return;

  var fullName = localStorage.getItem("fullName") || "Player";
  var email = (localStorage.getItem("userEmail") || "").toLowerCase();

  if (nameEl) nameEl.textContent = fullName;
  if (uploadLink && email !== ADMIN_EMAIL) {
    uploadLink.style.display = "none";
  }

  var picks = {};
  try { picks = JSON.parse(localStorage.getItem("knockoutPicks2026")) || {}; } catch (e) {}
  var champion = picks["4-0"];
  var code = champion ? TEAM_CODES[champion] : null;
  if (code) {
    btn.innerHTML = '<img src="' + FLAG_BASE + code + '.svg" alt="' + champion + '" width="36" height="36" style="border-radius:50%;display:block;" />';
  }

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("is-open");
  });

  document.addEventListener("click", function () {
    dropdown.classList.remove("is-open");
  });

  dropdown.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
})();
