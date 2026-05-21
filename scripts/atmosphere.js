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
  let frame = 0;
  let rafId = null;
  let pointer = { x: 0.5, y: 0.5, active: false };
  let lines = [];

  const palette = [
    [200, 155, 60],
    [47, 111, 100],
    [98, 217, 255],
    [122, 30, 44],
  ];

  const rand = (min, max) => Math.random() * (max - min) + min;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(18, Math.floor(width / 70));
    lines = Array.from({ length: count }, (_, index) => {
      const color = palette[index % palette.length];
      return {
        x: rand(-width * 0.12, width * 1.12),
        y: rand(-height * 0.1, height * 1.1),
        length: rand(120, 420),
        speed: rand(0.08, 0.26),
        drift: rand(-0.18, 0.18),
        color,
        alpha: rand(0.08, 0.22),
      };
    });
  }

  function drawPerspective() {
    const vanishingX = width * (0.48 + (pointer.x - 0.5) * 0.05);
    const vanishingY = height * (0.34 + (pointer.y - 0.5) * 0.03);

    ctx.save();
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 15; i += 1) {
      const bottomX = (i / 14) * width;
      ctx.beginPath();
      ctx.moveTo(bottomX, height);
      ctx.lineTo(vanishingX, vanishingY);
      ctx.strokeStyle = "rgba(200,155,60,0.055)";
      ctx.stroke();
    }

    for (let y = height * 0.42; y < height; y += 70) {
      const scale = (y - height * 0.42) / (height * 0.58);
      ctx.beginPath();
      ctx.moveTo(width * 0.06 * scale, y);
      ctx.lineTo(width - width * 0.06 * scale, y);
      ctx.strokeStyle = "rgba(243,232,208,0.035)";
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLines() {
    lines.forEach((line) => {
      const [r, g, b] = line.color;
      const offsetX = (pointer.x - 0.5) * 18;
      const offsetY = (pointer.y - 0.5) * 12;

      ctx.beginPath();
      ctx.moveTo(line.x + offsetX, line.y + offsetY);
      ctx.lineTo(line.x + line.length * 0.42 + offsetX, line.y - line.length + offsetY);
      ctx.strokeStyle = `rgba(${r},${g},${b},${line.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (!reduceMotion) {
        line.y += line.speed;
        line.x += line.drift;
        if (line.y - line.length > height + 60) {
          line.y = -60;
          line.x = rand(-width * 0.12, width * 1.12);
        }
      }
    });
  }

  function tick() {
    frame += 1;
    ctx.clearRect(0, 0, width, height);
    drawPerspective();
    drawLines();

    if (!reduceMotion) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) tick();
  });

  window.addEventListener("pointermove", (event) => {
    pointer = {
      x: event.clientX / Math.max(1, width),
      y: event.clientY / Math.max(1, height),
      active: true,
    };
  });

  window.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointer.x = 0.5;
    pointer.y = 0.5;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !rafId && !reduceMotion) {
      tick();
    }
  });

  resize();
  tick();
}());
