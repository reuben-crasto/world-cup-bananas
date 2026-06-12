(function () {
  var tabSignin = document.getElementById("tabSignin");
  var tabSignup = document.getElementById("tabSignup");
  var signinForm = document.getElementById("signinForm");
  var signupForm = document.getElementById("signupForm");
  var authMsg = document.getElementById("authMsg");
  var authTitle = document.getElementById("authTitle");

  if (!tabSignin || !tabSignup || !signinForm || !signupForm || !authMsg) return;

  function setMode(mode) {
    var signin = mode === "signin";
    tabSignin.classList.toggle("is-active", signin);
    tabSignup.classList.toggle("is-active", !signin);
    signinForm.classList.toggle("is-hidden", !signin);
    signupForm.classList.toggle("is-hidden", signin);
    if (authTitle) authTitle.textContent = signin ? "Welcome back" : "Create your account";
    authMsg.textContent = "";
    authMsg.className = "auth-msg";
  }

  tabSignin.addEventListener("click", function () { setMode("signin"); });
  tabSignup.addEventListener("click", function () { setMode("signup"); });

  if (location.hash === "#signup") setMode("signup");

  function showMsg(text, ok) {
    authMsg.textContent = text;
    authMsg.className = "auth-msg " + (ok ? "ok" : "err");
  }

  signinForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var email = document.getElementById("siEmail").value.trim();
    var password = document.getElementById("siPass").value.trim();

    if (!email || !password) {
      showMsg("Please enter your email and password.", false);
      return;
    }

    try {
      var response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
      });
      var data = await response.json();

      if (!response.ok) {
        showMsg(data.message || "Sign in failed.", false);
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("fullName", data.user.fullName);
      localStorage.setItem("userEmail", data.user.email);

      showMsg("Signed in. Loading your bracket…", true);
      setTimeout(function () { window.location.href = "welcome.html"; }, 650);
    } catch (error) {
      showMsg("Could not connect to the server.", false);
    }
  });

  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var fullName = document.getElementById("suName").value.trim();
    var email = document.getElementById("suEmail").value.trim();
    var password = document.getElementById("suPass").value;

    if (!fullName || !email || !password) {
      showMsg("Please fill in all fields.", false);
      return;
    }
    if (password.length < 6) {
      showMsg("Password must be at least 6 characters.", false);
      return;
    }

    try {
      var response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName, email: email, password: password })
      });
      var data = await response.json();

      if (!response.ok) {
        showMsg(data.message || "Sign up failed.", false);
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("fullName", data.user.fullName);
      localStorage.setItem("userEmail", data.user.email);

      showMsg("Account created. Welcome to the game!", true);
      setTimeout(function () { window.location.href = "welcome.html"; }, 650);
    } catch (error) {
      showMsg("Could not connect to the server.", false);
    }
  });
})();
