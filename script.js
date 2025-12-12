// script.js (LIMPIO: solo INDEX, sin promo.html)
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // ===== Helpers (color desde CSS var --morado / --azul / etc.) =====
  const getCssVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const hexToRgb = (hex) => {
    const h = (hex || "").replace("#", "").trim();
    if (![3, 6].includes(h.length)) return null;
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };

  const accentRGB = (() => {
    const morado = getCssVar("--morado");
    const rgb = hexToRgb(morado);
    return rgb ? `${rgb.r},${rgb.g},${rgb.b}` : "0,255,255";
  })();

  /* ==========================================================
     LIGHT SWEEP (Barrido de luz)
  ========================================================== */
  const prefersReduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SWEEP = {
    duration: 1750,
    interval: 3000,
    easing: "cubic-bezier(.18,.92,.2,1)",
    opacityPeak: 0.92,
    widthPct: 92,
    skewDeg: -20,
    lockMs: 1900,
  };

  const ensureOverlayHost = (el) => {
    const cs = getComputedStyle(el);
    if (cs.position === "static") el.style.position = "relative";
    el.style.overflow = "hidden";
  };

  const runSweep = (el) => {
    if (!el || prefersReduce) return;
    if (el.__sweeping) return;
    el.__sweeping = true;

    ensureOverlayHost(el);

    const sweep = document.createElement("span");
    sweep.setAttribute("aria-hidden", "true");

    Object.assign(sweep.style, {
      position: "absolute",
      top: "-60%",
      bottom: "-60%",
      left: "-95%",
      width: `${SWEEP.widthPct}%`,
      pointerEvents: "none",
      zIndex: "9999",
      opacity: "0",
      transform: `translateX(-180%) skewX(${SWEEP.skewDeg}deg)`,
      background:
        "linear-gradient(90deg," +
        "rgba(255,255,255,0) 0%," +
        "rgba(255,255,255,.06) 32%," +
        `rgba(${accentRGB},.10) 40%,` +
        "rgba(255,255,255,.38) 46%," +
        "rgba(255,255,255,.98) 50%," +
        "rgba(255,255,255,.38) 54%," +
        `rgba(${accentRGB},.10) 60%,` +
        "rgba(255,255,255,.06) 70%," +
        "rgba(255,255,255,0) 100%)",
      mixBlendMode: "screen",
      filter: "blur(.7px) brightness(1.18) saturate(1.08)",
      boxShadow: `0 0 32px rgba(255,255,255,.20), 0 0 58px rgba(${accentRGB},.14)`,
    });

    el.appendChild(sweep);

    const anim = sweep.animate(
      [
        { transform: `translateX(-190%) skewX(${SWEEP.skewDeg}deg)`, opacity: 0 },
        { opacity: SWEEP.opacityPeak, offset: 0.22 },
        { opacity: SWEEP.opacityPeak, offset: 0.62 },
        { transform: `translateX(290%) skewX(${SWEEP.skewDeg}deg)`, opacity: 0 },
      ],
      { duration: SWEEP.duration, easing: SWEEP.easing, fill: "forwards" }
    );

    const cleanup = () => {
      try { sweep.remove(); } catch (_) {}
      el.__sweeping = false;
    };

    anim.onfinish = cleanup;
    window.setTimeout(cleanup, SWEEP.lockMs);
  };

  const isVisibleEnough = (el) => {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    const inVp = r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
    if (!inVp) return false;
    const cs = getComputedStyle(el);
    return cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
  };

  const attachInteractiveSweep = (selector) => {
    const els = Array.from(document.querySelectorAll(selector));
    els.forEach((el) => {
      el.addEventListener("pointerenter", () => runSweep(el), { passive: true });
      el.addEventListener("pointerdown", () => runSweep(el), { passive: true });
      el.addEventListener("click", () => runSweep(el));
    });
    return els;
  };

  const timers = new Map();
  let visibilityHooked = false;

  const startAutoSweep = (key, elements) => {
    if (prefersReduce) return;
    if (timers.has(key)) clearInterval(timers.get(key));

    const tick = () => {
      if (document.hidden) return;
      if (!elements?.length) return;
      elements.forEach((el) => isVisibleEnough(el) && runSweep(el));
    };

    tick();
    timers.set(key, setInterval(tick, SWEEP.interval));

    if (!visibilityHooked) {
      visibilityHooked = true;
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) timers.forEach(() => tick());
      });
    }
  };

  /* ==========================================================
     INDEX: botón comprar (único)
  ========================================================== */
  const indexBtns = attachInteractiveSweep(".btn--buy");
  if (indexBtns.length) startAutoSweep("indexBtns", indexBtns);

  /* ==========================================================
     Navegación: menú + submenú redes
  ========================================================== */
  attachInteractiveSweep(".menu__link, .menu__sublink");

  // Click FX (is-pressed)
  const pressables = document.querySelectorAll(
    ".btn, .menu__link, .menu__sublink, .social__icon, .menu__close, .burger"
  );
  pressables.forEach((el) => {
    el.addEventListener("pointerdown", () => {
      el.classList.add("is-pressed");
      setTimeout(() => el.classList.remove("is-pressed"), 180);
    });
  });

  // OFFCANVAS + SUBMENU
  const btnMenu = $("#btnMenu");
  const btnClose = $("#btnClose");
  const menu = $("#menu");
  const backdrop = $("#backdrop");

  const btnRedes = $("#btnRedes");
  const submenuRedes = $("#submenuRedes");

  const setRedesOpen = (open) => {
    if (!btnRedes || !submenuRedes) return;

    btnRedes.classList.toggle("is-open", open);
    btnRedes.setAttribute("aria-expanded", String(open));

    if (open) {
      submenuRedes.hidden = false;
      submenuRedes.offsetHeight; // reflow
      submenuRedes.classList.add("is-open");
      runSweep(btnRedes);
    } else {
      submenuRedes.classList.remove("is-open");
      window.setTimeout(() => {
        if (!submenuRedes.classList.contains("is-open")) submenuRedes.hidden = true;
      }, 220);
    }
  };

  if (btnRedes && submenuRedes) {
    btnRedes.setAttribute("aria-expanded", "false");
    submenuRedes.hidden = true;
    submenuRedes.classList.remove("is-open");
  }

  const openMenu = () => {
    if (!menu || !backdrop) return;
    menu.classList.add("is-open");
    backdrop.classList.add("is-open");
    document.documentElement.classList.add("no-scroll");
    btnMenu?.setAttribute("aria-expanded", "true");

    const links = menu.querySelectorAll(".menu__link, .menu__sublink");
    links.forEach((el, i) => setTimeout(() => runSweep(el), 90 + i * 55));
  };

  const closeMenu = () => {
    if (!menu || !backdrop) return;
    setRedesOpen(false);
    menu.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.documentElement.classList.remove("no-scroll");
    btnMenu?.setAttribute("aria-expanded", "false");
  };

  btnMenu?.addEventListener("click", openMenu);
  btnClose?.addEventListener("click", closeMenu);
  backdrop?.addEventListener("click", closeMenu);
  window.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  btnRedes?.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = btnRedes.getAttribute("aria-expanded") === "true";
    setRedesOpen(!isOpen);
  });

  menu?.addEventListener("click", (e) => {
    const a = e.target.closest("a,button");
    if (!a) return;
    runSweep(a);
    if (a.id === "btnRedes") return;
    if (a.classList.contains("menu__sublink")) { closeMenu(); return; }
    if (a.matches("a")) closeMenu();
  });

  /* ==========================================================
     HUD CANVAS NASA
  ========================================================== */
  const canvas = $("#hud");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const state = { w: 0, h: 0, pts: [], count: 70 };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    state.w = w;
    state.h = h;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!state.pts.length) {
      state.pts = Array.from({ length: state.count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 0.8,
      }));
    }
  };

  resize();
  window.addEventListener("resize", resize);

  const drawGrid = () => {
    const step = 42;
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;

    for (let x = 0; x < state.w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.h);
      ctx.stroke();
    }
    for (let y = 0; y < state.h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.w, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const animate = () => {
    ctx.clearRect(0, 0, state.w, state.h);
    drawGrid();

    ctx.save();
    for (let i = 0; i < state.pts.length; i++) {
      const p = state.pts[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -30) p.x = state.w + 30;
      if (p.x > state.w + 30) p.x = -30;
      if (p.y < -30) p.y = state.h + 30;
      if (p.y > state.h + 30) p.y = -30;

      for (let j = i + 1; j < state.pts.length; j++) {
        const q = state.pts[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        const max = 165 * 165;

        if (d2 < max) {
          const a = 1 - d2 / max;
          ctx.globalAlpha = 0.18 * a;
          ctx.strokeStyle = `rgba(${accentRGB},0.55)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    ctx.save();
    for (const p of state.pts) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = "rgba(255,255,255,0.60)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    requestAnimationFrame(animate);
  };

  animate();
})();
