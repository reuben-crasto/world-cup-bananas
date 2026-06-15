(function () {
  var isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) { window.location.href = "login.html"; return; }

  var ADMIN_EMAIL = "crasto.reuben15@gmail.com";
  var email = (localStorage.getItem("userEmail") || "").toLowerCase();
  if (email !== ADMIN_EMAIL) {
    window.location.href = "brackets.html";
    return;
  }

  var dropZone = document.getElementById("dropZone");
  var fileInput = document.getElementById("fileInput");
  var browseLink = document.getElementById("browseLink");
  var statusEl = document.getElementById("importStatus");

  browseLink.addEventListener("click", function () { fileInput.click(); });

  fileInput.addEventListener("change", function () {
    if (fileInput.files.length) handleImportXlsx(fileInput.files[0], statusEl);
  });

  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropZone.classList.add("is-dragover");
  });
  dropZone.addEventListener("dragleave", function () {
    dropZone.classList.remove("is-dragover");
  });
  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropZone.classList.remove("is-dragover");
    if (e.dataTransfer.files.length) handleImportXlsx(e.dataTransfer.files[0], statusEl);
  });
})();
