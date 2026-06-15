(function () {
  "use strict";

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
