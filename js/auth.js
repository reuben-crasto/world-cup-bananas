document.addEventListener("DOMContentLoaded", () => {
  const signInBtn = document.getElementById("signInBtn");
  const signUpBtn = document.getElementById("signUpBtn");

  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");

  const authMessage = document.getElementById("authMessage");

  if (!signInBtn || !signUpBtn || !signInForm || !signUpForm || !authMessage) {
    console.error("One or more login page elements are missing.");
    console.log({
      signInBtn,
      signUpBtn,
      signInForm,
      signUpForm,
      authMessage
    });
    return;
  }

  signInBtn.addEventListener("click", () => {
    signInBtn.classList.add("active");
    signUpBtn.classList.remove("active");

    signInForm.classList.remove("hidden");
    signUpForm.classList.add("hidden");

    authMessage.textContent = "";
    authMessage.classList.remove("success");
  });

  signUpBtn.addEventListener("click", () => {
    signUpBtn.classList.add("active");
    signInBtn.classList.remove("active");

    signUpForm.classList.remove("hidden");
    signInForm.classList.add("hidden");

    authMessage.textContent = "";
    authMessage.classList.remove("success");
  });

  signInForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value.trim();

    if (!email || !password) {
      showMessage("Please enter your email and password.", false);
      return;
    }

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Signin failed.", false);
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("fullName", data.user.fullName);
      localStorage.setItem("userEmail", data.user.email);

      window.location.href = "index.html";
    } catch (error) {
      console.error("Signin error:", error);
      showMessage("Could not connect to the server.", false);
    }
  });

  signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("signUpEmail").value.trim();
    const password = document.getElementById("signUpPassword").value.trim();

    if (!fullName || !email || !password) {
      showMessage("Please fill in all fields.", false);
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.", false);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Signup failed.", false);
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("fullName", data.user.fullName);
      localStorage.setItem("userEmail", data.user.email);

      window.location.href = "index.html";
    } catch (error) {
      console.error("Signup error:", error);
      showMessage("Could not connect to the server.", false);
    }
  });

  function showMessage(message, success) {
    authMessage.textContent = message;

    if (success) {
      authMessage.classList.add("success");
    } else {
      authMessage.classList.remove("success");
    }
  }
});