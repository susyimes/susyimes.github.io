(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.id = "archive-atmosphere";
  canvas.setAttribute("aria-hidden", "true");
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext("2d", { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;
  let tick = 0;
  let stars = [];
  let streams = [];
  let pointer = { x: 0.5, y: 0.5, active: false };

  const palette = [
    [139, 92, 246],
    [56, 189, 248],
    [45, 212, 191],
    [244, 114, 182],
  ];

  const rand = (min, max) => Math.random() * (max - min) + min;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const starCount = Math.max(130, Math.floor((width * height) / 7600));
    stars = Array.from({ length: starCount }, () => ({
      x: rand(0, width),
      y: rand(0, height),
      r: rand(0.4, 1.35),
      a: rand(0.18, 0.82),
      tw: rand(0.003, 0.012),
      phase: rand(0, Math.PI * 2),
      color: palette[Math.floor(rand(0, palette.length))],
    }));

    const streamCount = Math.max(12, Math.floor(width / 120));
    streams = Array.from({ length: streamCount }, (_, index) => ({
      x: rand(-width * 0.15, width * 1.1),
      y: rand(-height * 0.1, height * 1.1),
      length: rand(170, 460),
      speed: rand(0.08, 0.24),
      angle: rand(-1.2, -0.72),
      color: palette[index % palette.length],
      alpha: rand(0.05, 0.15),
    }));
  }

  function drawStars() {
    const driftX = (pointer.x - 0.5) * 16;
    const driftY = (pointer.y - 0.5) * 10;

    stars.forEach((star) => {
      const [r, g, b] = star.color;
      const pulse = reduceMotion ? 0 : Math.sin(tick * star.tw + star.phase) * 0.22;
      ctx.beginPath();
      ctx.arc(star.x + driftX * star.r, star.y + driftY * star.r, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0.08, star.a + pulse)})`;
      ctx.fill();
    });
  }

  function drawStreams() {
    const driftX = (pointer.x - 0.5) * 28;
    const driftY = (pointer.y - 0.5) * 18;

    streams.forEach((stream) => {
      const [r, g, b] = stream.color;
      const x1 = stream.x + driftX;
      const y1 = stream.y + driftY;
      const x2 = x1 + Math.cos(stream.angle) * stream.length;
      const y2 = y1 + Math.sin(stream.angle) * stream.length;
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
      gradient.addColorStop(0.52, `rgba(${r},${g},${b},${stream.alpha})`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      if (!reduceMotion) {
        stream.y += stream.speed;
        stream.x += stream.speed * 0.18;
        if (stream.y - stream.length > height + 80) {
          stream.y = -80;
          stream.x = rand(-width * 0.15, width * 1.1);
        }
      }
    });
  }

  function drawAurora() {
    const cx = width * (0.5 + (pointer.x - 0.5) * 0.05);
    const cy = height * (0.1 + (pointer.y - 0.5) * 0.04);

    const purple = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.72);
    purple.addColorStop(0, "rgba(139,92,246,0.18)");
    purple.addColorStop(0.42, "rgba(56,189,248,0.08)");
    purple.addColorStop(1, "rgba(2,4,13,0)");
    ctx.fillStyle = purple;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i += 1) {
      const y = height * (0.18 + i * 0.12);
      const grad = ctx.createLinearGradient(0, y, width, y + 80);
      grad.addColorStop(0, "rgba(139,92,246,0)");
      grad.addColorStop(0.45, "rgba(139,92,246,0.065)");
      grad.addColorStop(0.62, "rgba(56,189,248,0.06)");
      grad.addColorStop(1, "rgba(45,212,191,0)");
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(width * 0.28, y - 90, width * 0.62, y + 120, width, y - 20);
      ctx.strokeStyle = grad;
      ctx.stroke();
    }
    ctx.restore();
  }

  function frame() {
    tick += 1;
    ctx.clearRect(0, 0, width, height);
    drawAurora();
    drawStars();
    drawStreams();

    if (!reduceMotion && !document.hidden) {
      rafId = window.requestAnimationFrame(frame);
    }
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) frame();
  });

  window.addEventListener("pointermove", (event) => {
    pointer = {
      x: event.clientX / Math.max(1, width),
      y: event.clientY / Math.max(1, height),
      active: true,
    };
  });

  window.addEventListener("pointerleave", () => {
    pointer = { x: 0.5, y: 0.5, active: false };
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !rafId && !reduceMotion) {
      frame();
    }
  });

  resize();
  frame();
}());
