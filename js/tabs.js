(function () {
  var tabBtns = document.querySelectorAll(".tab-btn");
  var track = document.getElementById("tabTrack");
  var pill = document.getElementById("tabPill");
  var actionBars = { groups: document.getElementById("gs-actions"), knockout: document.getElementById("ko-actions") };

  function positionPill(btn) {
    pill.style.width = btn.offsetWidth + "px";
    pill.style.transform = "translateX(" + (btn.offsetLeft - 5) + "px)";
  }

  function switchTab(name) {
    tabBtns.forEach(function (b) { b.classList.toggle("is-active", b.dataset.tab === name); });
    track.dataset.active = name;
    if (actionBars.groups && actionBars.knockout) {
      Object.keys(actionBars).forEach(function (k) { actionBars[k].classList.toggle("is-active", k === name); });
    }
    tabBtns.forEach(function (b) { if (b.dataset.tab === name) positionPill(b); });
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { switchTab(btn.dataset.tab); });
  });

  var goToKnockout = document.getElementById("goToKnockoutBtn");
  var goToGroups = document.getElementById("goToGroupsBtn");
  if (goToKnockout) goToKnockout.addEventListener("click", function () { switchTab("knockout"); window.scrollTo(0, 0); });
  if (goToGroups) goToGroups.addEventListener("click", function () { switchTab("groups"); window.scrollTo(0, 0); });

  var initial = window.location.hash === "#knockout" ? "knockout" : "groups";
  pill.style.transition = "none";
  switchTab(initial);
  pill.offsetHeight;
  pill.style.transition = "";

  window.addEventListener("resize", function () {
    tabBtns.forEach(function (b) { if (b.classList.contains("is-active")) positionPill(b); });
  });
})();
