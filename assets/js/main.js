/* =============================================================
   CORGENT — Interactions
   ============================================================= */
(function () {
  "use strict";
  const doc = document;
  const root = doc.documentElement;

  /* ---------- Language ---------- */
  const STORE_KEY = "corgent-lang";
  const SUPPORTED = ["en", "zh"];

  function applyPlaceholders(lang) {
    doc.querySelectorAll("[data-ph-en]").forEach((el) => {
      const v = el.getAttribute("data-ph-" + lang);
      if (v !== null) el.setAttribute("placeholder", v);
    });
  }

  function setLang(lang, persist) {
    if (!SUPPORTED.includes(lang)) lang = "en";
    root.setAttribute("lang", lang === "zh" ? "zh" : "en");
    doc.querySelectorAll("[data-lang-btn]").forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-lang-btn") === lang);
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang-btn") === lang));
    });
    applyPlaceholders(lang);
    if (persist) {
      try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    }
  }

  // init language: stored > browser > en
  let initial = "en";
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) initial = saved;
    else if ((navigator.language || "").toLowerCase().startsWith("zh")) initial = "zh";
  } catch (e) {}
  setLang(initial, false);

  doc.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang-btn"), true));
  });

  /* ---------- Header scroll state ---------- */
  const header = doc.querySelector(".header");
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = doc.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", () => {
      doc.body.classList.toggle("menu-open");
      const open = doc.body.classList.contains("menu-open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }
  doc.querySelectorAll(".mobile-nav a").forEach((a) =>
    a.addEventListener("click", () => doc.body.classList.remove("menu-open"))
  );

  /* ---------- Scroll reveal ---------- */
  const reveals = doc.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    const decimals = (el.getAttribute("data-decimals") || "0") | 0;
    const dur = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = decimals
        ? val.toFixed(decimals)
        : Math.round(val).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = doc.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            animateCount(en.target);
            co.unobserve(en.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = el.getAttribute("data-count")));
  }

  /* ---------- Year ---------- */
  doc.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Capability card -> contact form interest preselect ---------- */
  doc.querySelectorAll("[data-interest]").forEach((a) => {
    a.addEventListener("click", () => {
      const v = a.getAttribute("data-interest");
      const sel = doc.querySelector("select[name=interest]");
      if (!sel) return;
      const lang = root.getAttribute("lang") || "en";
      const opts = Array.from(sel.options);
      const opt =
        opts.find((o) => o.value === v && o.getAttribute("data-lang") === lang) ||
        opts.find((o) => o.value === v);
      if (opt) opt.selected = true;
    });
  });

  /* ---------- Contact form (front-end demo) ---------- */
  const form = doc.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = form.querySelector(".form__ok");
      if (ok) ok.classList.add("show");
      form.querySelectorAll("input, textarea, select").forEach((f) => (f.disabled = true));
      const btn = form.querySelector("button[type=submit]");
      if (btn) btn.style.display = "none";
    });
  }
})();
