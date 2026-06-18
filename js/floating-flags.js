(function () {
  "use strict";

  var FLAG_BASE = "https://hatscripts.github.io/circle-flags/flags/";
  var CODES = [
    "ar","fr","br","gb-eng","pt","nl","es","be","de","hr",
    "uy","ma","co","mx","ch","us","sn","jp","ec","at",
    "au","tr","kr","ca","tn","eg","no","dz","gb-sct","ci",
    "gh","pa","za","qa","ir","nz","sa","cv","iq","jo",
    "cd","uz","py","se","ht","cz","ba","cw"
  ];

  var container = document.getElementById("floatingFlags");
  if (!container || typeof gsap === "undefined") return;

  var shuffled = CODES.slice().sort(function () { return 0.5 - Math.random(); });
  var picked = shuffled.slice(0, 22);

  var cw = container.offsetWidth;
  var ch = container.offsetHeight;
  var spacing = cw / (picked.length + 1);

  picked.forEach(function (code, i) {
    var img = document.createElement("img");
    img.className = "floating-flag";
    img.src = FLAG_BASE + code + ".svg";
    img.alt = "";
    var size = 32 + Math.random() * 28;
    img.width = size;
    img.height = size;
    container.appendChild(img);

    var x = spacing * (i + 1) - size / 2 + (Math.random() - 0.5) * 20;
    var y = ch - size - 12 - Math.random() * 30;

    gsap.set(img, { x: x, y: -50, opacity: 0, scale: 0.5 });

    gsap.to(img, {
      x: x,
      y: y,
      opacity: 1,
      scale: 1,
      duration: 0.9 + Math.random() * 0.5,
      delay: i * 0.06,
      ease: "bounce.out"
    });

    var drift = 8 + Math.random() * 12;
    var dur = 6 + Math.random() * 4;
    gsap.to(img, {
      x: "+=" + drift,
      y: y - 3,
      duration: dur,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1.5 + Math.random() * 2
    });
  });
})();
