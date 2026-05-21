/**
 * Relay Particle Backdrop — "Human Baton Pass"
 * A single-canvas, low-node-count particle system themed around
 * energy relay / baton passing between nodes.
 *
 * Requirements enforced:
 *   - Canvas only, zero DOM particles
 *   - Respects prefers-reduced-motion (static fallback)
 *   - Pauses on visibilitychange / blur
 *   - DPR-aware, resize-aware
 *   - Pointer parallax (subtle)
 *   - Does not obscure content (fixed background layer)
 *   - Node-node collision & separation
 *   - Boundary bounce with radius
 *   - Smooth mouse attraction
 */

(function () {
  'use strict';

  /* ---------- Config ---------- */
  const CFG = {
    nodeCount: 28,               // relay stations
    particleCount: 18,           // batons in transit
    connectionDist: 220,         // px — max link length
    connectionMax: 3,            // max links per node
    trailLength: 12,             // baton tail segments
    baseSpeed: 0.6,
    parallaxStrength: 0.04,
    mouseAttractRadius: 350,     // px — mouse influence radius
    mouseAttractStrength: 0.008, // velocity increment per frame
    collisionDamping: 0.9,       // energy retention on node-node bounce
    colors: {
      cyan: { r: 0, g: 240, b: 255 },
      amber: { r: 255, g: 176, b: 0 },
    },
  };

  /* ---------- Reduced motion ---------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Canvas setup ---------- */
  const canvas = document.createElement('canvas');
  canvas.id = 'relay-particle-bg';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { alpha: true });

  /* Insert as first child of body so it sits behind everything */
  document.body.insertBefore(canvas, document.body.firstChild);

  /* Style via inline to avoid external CSS dependency */
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '0',
    pointerEvents: 'none',
    display: 'block',
  });

  /* ---------- State ---------- */
  let W = 0, H = 0, DPR = 1;
  let nodes = [];
  let particles = [];
  let rafId = null;
  let isVisible = true;
  let pointer = { x: 0.5, y: 0.5, active: false };
  let parallaxOffset = { x: 0, y: 0 };

  /* ---------- Helpers ---------- */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ---------- Classes ---------- */

  class Node {
    constructor() {
      this.x = rand(W * 0.05, W * 0.95);
      this.y = rand(H * 0.05, H * 0.95);
      this.vx = rand(-0.15, 0.15);
      this.vy = rand(-0.15, 0.15);
      this.radius = rand(1.5, 3);
      this.pulse = rand(0, Math.PI * 2);
      this.pulseSpeed = rand(0.01, 0.03);
      // Color bias: 70% cyan, 30% amber
      this.isAmber = Math.random() < 0.3;
      this.baseAlpha = this.isAmber ? 0.45 : 0.35;
    }

    update(mouseX, mouseY) {
      // Smooth mouse attraction — modifies velocity gradually, no teleport
      if (pointer.active) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < CFG.mouseAttractRadius) {
          const force = CFG.mouseAttractStrength * (1 - d / CFG.mouseAttractRadius);
          this.vx += (dx / d) * force;
          this.vy += (dy / d) * force;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Boundary bounce with radius (prevent clipping outside canvas)
      if (this.x < this.radius) {
        this.x = this.radius;
        this.vx *= -1;
      } else if (this.x > W - this.radius) {
        this.x = W - this.radius;
        this.vx *= -1;
      }

      if (this.y < this.radius) {
        this.y = this.radius;
        this.vy *= -1;
      } else if (this.y > H - this.radius) {
        this.y = H - this.radius;
        this.vy *= -1;
      }

      this.pulse += this.pulseSpeed;
    }

    draw(ctx, px, py) {
      const alpha = this.baseAlpha + Math.sin(this.pulse) * 0.12;
      const c = this.isAmber ? CFG.colors.amber : CFG.colors.cyan;
      ctx.beginPath();
      ctx.arc(this.x + px, this.y + py, this.radius * (1 + Math.sin(this.pulse) * 0.2), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${Math.max(0, alpha)})`;
      ctx.fill();
    }
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      const src = nodes[Math.floor(Math.random() * nodes.length)];
      let dst = nodes[Math.floor(Math.random() * nodes.length)];
      while (dst === src) dst = nodes[Math.floor(Math.random() * nodes.length)];
      this.src = src;
      this.dst = dst;
      this.t = 0;
      this.speed = rand(0.003, 0.008) * CFG.baseSpeed;
      this.trail = [];
      // 80% cyan batons, 20% amber batons
      this.isAmber = Math.random() < 0.2;
      this.size = rand(1.2, 2.2);
    }

    update() {
      this.t += this.speed;
      if (this.t >= 1) {
        this.reset();
        return;
      }
      const x = this.src.x + (this.dst.x - this.src.x) * this.t;
      const y = this.src.y + (this.dst.y - this.src.y) * this.t;
      this.trail.push({ x, y });
      if (this.trail.length > CFG.trailLength) this.trail.shift();
    }

    draw(ctx, px, py) {
      if (this.trail.length < 2) return;
      const c = this.isAmber ? CFG.colors.amber : CFG.colors.cyan;

      // Draw trail
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x + px, this.trail[0].y + py);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x + px, this.trail[i].y + py);
      }
      const grad = ctx.createLinearGradient(
        this.trail[0].x + px, this.trail[0].y + py,
        this.trail[this.trail.length - 1].x + px, this.trail[this.trail.length - 1].y + py
      );
      grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0)`);
      grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0.6)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = this.size * 0.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw head glow
      const head = this.trail[this.trail.length - 1];
      ctx.beginPath();
      ctx.arc(head.x + px, head.y + py, this.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.25)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(head.x + px, head.y + py, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.9)`;
      ctx.fill();
    }
  }

  /* ---------- Collision resolution ---------- */
  function resolveNodeCollisions() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (d > 0 && d < minDist) {
          // Overlap resolution — push apart so nodes do not overlap
          const overlap = minDist - d;
          const nx = dx / d;
          const ny = dy / d;

          // Separate proportional to inverse mass (mass ~ radius)
          const totalRadius = a.radius + b.radius;
          const aRatio = b.radius / totalRadius;
          const bRatio = a.radius / totalRadius;

          a.x -= nx * overlap * aRatio;
          a.y -= ny * overlap * aRatio;
          b.x += nx * overlap * bRatio;
          b.y += ny * overlap * bRatio;

          // Velocity reflection along collision normal with damping
          const dvx = b.vx - a.vx;
          const dvy = b.vy - a.vy;
          const velAlongNormal = dvx * nx + dvy * ny;

          if (velAlongNormal < 0) {
            const impulse = -(1 + CFG.collisionDamping) * velAlongNormal * 0.5;
            a.vx -= impulse * nx;
            a.vy -= impulse * ny;
            b.vx += impulse * nx;
            b.vy += impulse * ny;
          }
        }
      }
    }
  }

  /* ---------- Static fallback for reduced motion ---------- */
  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    // Deep background already handled by body CSS; draw a subtle radial glow
    const cx = W / 2 + parallaxOffset.x;
    const cy = H / 2 + parallaxOffset.y;
    const r = Math.max(W, H) * 0.6;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(0,240,255,0.04)');
    g.addColorStop(0.5, 'rgba(255,176,0,0.02)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Draw static nodes
    for (const n of nodes) {
      n.draw(ctx, parallaxOffset.x, parallaxOffset.y);
    }

    // Draw static connections (very faint)
    for (let i = 0; i < nodes.length; i++) {
      let links = 0;
      for (let j = i + 1; j < nodes.length && links < CFG.connectionMax; j++) {
        const d = dist(nodes[i], nodes[j]);
        if (d < CFG.connectionDist) {
          links++;
          const alpha = 0.06 * (1 - d / CFG.connectionDist);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x + parallaxOffset.x, nodes[i].y + parallaxOffset.y);
          ctx.lineTo(nodes[j].x + parallaxOffset.x, nodes[j].y + parallaxOffset.y);
          ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ---------- Dynamic frame ---------- */
  function tick() {
    if (!isVisible || document.hidden) {
      rafId = null;
      return;
    }

    ctx.clearRect(0, 0, W, H);

    // Subtle parallax toward pointer
    if (pointer.active) {
      const targetX = (pointer.x - 0.5) * W * CFG.parallaxStrength;
      const targetY = (pointer.y - 0.5) * H * CFG.parallaxStrength;
      parallaxOffset.x += (targetX - parallaxOffset.x) * 0.05;
      parallaxOffset.y += (targetY - parallaxOffset.y) * 0.05;
    } else {
      parallaxOffset.x += (0 - parallaxOffset.x) * 0.05;
      parallaxOffset.y += (0 - parallaxOffset.y) * 0.05;
    }

    const px = parallaxOffset.x;
    const py = parallaxOffset.y;

    // Mouse in canvas coordinates
    const mouseX = pointer.x * W;
    const mouseY = pointer.y * H;

    // Update nodes
    for (const n of nodes) n.update(mouseX, mouseY);

    // Resolve node-node collisions & separation
    resolveNodeCollisions();

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      let links = 0;
      for (let j = i + 1; j < nodes.length && links < CFG.connectionMax; j++) {
        const d = dist(nodes[i], nodes[j]);
        if (d < CFG.connectionDist) {
          links++;
          const alpha = 0.12 * (1 - d / CFG.connectionDist);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x + px, nodes[i].y + py);
          ctx.lineTo(nodes[j].x + px, nodes[j].y + py);
          ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) n.draw(ctx, px, py);

    // Update & draw particles (batons)
    for (const p of particles) {
      p.update();
      p.draw(ctx, px, py);
    }

    rafId = requestAnimationFrame(tick);
  }

  /* ---------- Initialization ---------- */
  function initWorld() {
    nodes = [];
    for (let i = 0; i < CFG.nodeCount; i++) nodes.push(new Node());

    particles = [];
    for (let i = 0; i < CFG.particleCount; i++) particles.push(new Particle());
  }

  function start() {
    resize();
    initWorld();
    if (prefersReducedMotion) {
      drawStatic();
    } else {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    }
  }

  /* ---------- Event bindings ---------- */
  window.addEventListener('resize', () => {
    resize();
    initWorld();
    if (prefersReducedMotion) drawStatic();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (!prefersReducedMotion && !rafId) {
      isVisible = true;
      rafId = requestAnimationFrame(tick);
    }
  });

  window.addEventListener('blur', () => {
    isVisible = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  window.addEventListener('focus', () => {
    isVisible = true;
    if (!prefersReducedMotion && !rafId) {
      rafId = requestAnimationFrame(tick);
    }
  });

  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / W;
    pointer.y = e.clientY / H;
    pointer.active = true;
  });

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  // Reduced-motion changes at runtime
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      drawStatic();
    } else {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }
  });

  /* ---------- Kick off ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
