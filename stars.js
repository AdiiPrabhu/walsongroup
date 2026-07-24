/* Walson Group — drifting "pollen" starfield (vanilla canvas, no deps) */
(function () {
  const canvas = document.getElementById("stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fresh, healthy palette — limes, greens, cream, a little gold
  const COLORS = ["#c6ee8f", "#a8e6a1", "#8bc34a", "#f3f0e4", "#f6d365"];

  const rand = (a, b) => a + Math.random() * (b - a);

  let w = 0, h = 0, dpr = 1;
  let stars = [];
  const sprites = {};

  // Pre-render a soft glowing dot per color once (cheap to blit each frame)
  function buildSprite(color) {
    const size = 64;
    const s = document.createElement("canvas");
    s.width = s.height = size;
    const c = s.getContext("2d");
    const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, color);
    g.addColorStop(0.25, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, size, size);
    return s;
  }

  function makeStars() {
    const area = w * h;
    const count = Math.min(160, Math.round(area / 9000)); // scales with screen
    stars = [];
    for (let i = 0; i < count; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: rand(1.2, 3.6),
        color,
        baseAlpha: rand(0.25, 0.9),
        twSpeed: rand(0.4, 1.6),
        twPhase: rand(0, Math.PI * 2),
        vx: rand(-0.06, 0.06),
        vy: rand(-0.16, -0.03), // gentle upward drift
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
  }

  function draw(alphaFor) {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter"; // additive glow
    for (const st of stars) {
      const a = alphaFor(st);
      if (a <= 0.01) continue;
      const spr = sprites[st.color] || (sprites[st.color] = buildSprite(st.color));
      const d = st.size * 4;
      ctx.globalAlpha = a;
      ctx.drawImage(spr, st.x - d / 2, st.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  let t = 0;
  function animate() {
    t += 0.016;
    for (const st of stars) {
      st.x += st.vx;
      st.y += st.vy;
      if (st.y < -10) st.y = h + 10;
      if (st.x < -10) st.x = w + 10;
      else if (st.x > w + 10) st.x = -10;
    }
    draw((st) => st.baseAlpha * (0.55 + 0.45 * Math.sin(t * st.twSpeed + st.twPhase)));
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();

  if (reduceMotion) {
    draw((st) => st.baseAlpha); // static, no motion/twinkle
  } else {
    animate();
  }
})();
