(function () {
  if (localStorage.getItem("isLoggedIn") === "true") {
    window.location.href = localStorage.getItem("groupStageLocked2026") === "true" ? "brackets.html" : "welcome.html";
  }
})();
