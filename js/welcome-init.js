(function () {
  var isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") { window.location.href = "login.html"; return; }

  var name = localStorage.getItem("fullName");
  var el = document.getElementById("greetName");
  if (name && el) el.textContent = name.split(" ")[0];
})();
