document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const fullName = localStorage.getItem("fullName");
    const userEmail = localStorage.getItem("userEmail");
  
    const userGreeting = document.getElementById("userGreeting");
    const logoutBtn = document.getElementById("logoutBtn");
  
    if (isLoggedIn !== "true") {
      window.location.href = "login.html";
      return;
    }
  
    if (userGreeting) {
      if (fullName) {
        userGreeting.textContent = `Welcome, ${fullName}! Read the rules and start your bracket.`;
      } else if (userEmail) {
        userGreeting.textContent = `Welcome, ${userEmail}! Read the rules and start your bracket.`;
      } else {
        userGreeting.textContent = "Welcome! Read the rules and start your bracket.";
      }
    }
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
      });
    }
  });