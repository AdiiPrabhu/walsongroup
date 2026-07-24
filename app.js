/* Walson Group — site interactions */
(function () {
  // ---- current year ----
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ---- mobile nav ----
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close menu after tapping a link
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- scroll reveal ----
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".section-head, .card, .stat, .strength");
  targets.forEach(function (el) { el.classList.add("reveal"); });

  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = (e.target.dataset.delay || "0ms");
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    // small stagger within each grid
    document.querySelectorAll(".grid, .stats").forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (child, i) {
        if (child.classList.contains("reveal")) {
          child.dataset.delay = Math.min(i * 60, 320) + "ms";
        }
      });
    });

    targets.forEach(function (el) { io.observe(el); });
  }

  // ---- contact form (client-side only) ----
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form && note) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#cf-name");
      var email = form.querySelector("#cf-email");
      var msg = form.querySelector("#cf-msg");
      if (!name.value.trim() || !email.checkValidity() || !msg.value.trim()) {
        note.textContent = "Please fill in your name, a valid email, and a message.";
        note.className = "form-note is-error";
        return;
      }
      note.textContent = "Thanks, " + name.value.trim().split(" ")[0] + "! We'll be in touch soon.";
      note.className = "form-note is-ok";
      form.reset();
    });
  }
})();
