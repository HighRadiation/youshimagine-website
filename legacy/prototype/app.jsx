// Ahmet Emin Turgut — single-page portfolio.
// Architecture: one React tree, four sections (Hero / Works / About / Contact),
// a lightbox overlay, a thin language toggle, and a quiet top nav.

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ────────────────────────────── Motion hooks ──────────────────────────────
// Thin React bindings over window.Motion (vanilla helpers in motion.js).
function useMagnetic(opts) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.Motion) return;
    return window.Motion.magnetic(ref.current, opts || {});
  }, []);
  return ref;
}
// One-shot reveal that lives in React state, so the `is-visible` class
// survives re-renders (e.g. language toggle) instead of being clobbered.
function useRevealState(opts) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current || !window.Motion) return;
    const io = window.Motion.observeOnce(ref.current, () => setVisible(true), opts || {});
    return () => io.disconnect && io.disconnect();
  }, []);
  return [ref, visible];
}

// ────────────────────────────── Placeholder ──────────────────────────────
// Striped two-tone "paper" stand-in for a real painting. Keeps the true
// aspect ratio of the work so the gallery wall still reads correctly.
// Replace with a real <img srcset> once final scans are available.
function Placeholder({ work, tag, className = "", style = {} }) {
  const { a, b, c, angle } = work.ph;
  const ratio = (work.h / work.w) * 100;
  return (
    <div
      className={`ph ${className}`}
      style={{
        ...style,
        paddingTop: `${ratio}%`,
        "--ph-a": a,
        "--ph-b": b,
        "--ph-bg": c,
        "--ph-angle": angle,
      }}
      aria-hidden="true"
    >
      {tag !== false && (
        <div className="ph-tag">
          {tag || `${work.id} · ${work.dimensions}`}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────── Top Nav ──────────────────────────────
function TopNav({ lang, setLang, onJump }) {
  const t = window.I18N[lang];
  const [scrolled, setScrolled] = useState(false);
  const worksRef = useMagnetic({ radius: 90, strength: 0.35, max: 3 });
  const aboutRef = useMagnetic({ radius: 90, strength: 0.35, max: 3 });
  const contactRef = useMagnetic({ radius: 90, strength: 0.35, max: 3 });
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        background: scrolled
          ? "rgba(245,241,234,0.86)"
          : "rgba(245,241,234,0)",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(26,26,26,0.08)" : "1px solid transparent",
        transition: "background 600ms ease, border-color 600ms ease",
      }}
    >
      <nav
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          padding: "22px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="serif"
          style={{
            fontSize: 19,
            letterSpacing: 0.2,
            lineHeight: 1,
            display: "flex",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <span>Ahmet Emin Turgut</span>
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: "0.22em", color: "var(--ink-mute)", textTransform: "uppercase" }}>
            youshimagine
          </span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <button ref={worksRef} onClick={() => onJump("works")} className="nav-link label magnetic">{t.nav.works}</button>
          <button ref={aboutRef} onClick={() => onJump("about")} className="nav-link label magnetic">{t.nav.about}</button>
          <button ref={contactRef} onClick={() => onJump("contact")} className="nav-link label magnetic">{t.nav.contact}</button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 24, borderLeft: "1px solid rgba(26,26,26,0.18)" }}>
            <button
              onClick={() => setLang("tr")}
              className="label"
              aria-pressed={lang === "tr"}
              style={{
                color: lang === "tr" ? "var(--ink)" : "var(--ink-quiet)",
                fontWeight: lang === "tr" ? 500 : 400,
              }}
            >TR</button>
            <span className="label" style={{ color: "var(--ink-quiet)" }}>/</span>
            <button
              onClick={() => setLang("en")}
              className="label"
              aria-pressed={lang === "en"}
              style={{
                color: lang === "en" ? "var(--ink)" : "var(--ink-quiet)",
                fontWeight: lang === "en" ? 500 : 400,
              }}
            >EN</button>
          </div>
        </div>
      </nav>
    </header>
  );
}

// ────────────────────────────── Hero ──────────────────────────────
function Hero({ lang, onJump }) {
  const t = window.I18N[lang];
  const heroes = window.HERO_IDS.map(id => window.WORKS.find(w => w.id === id));
  const [i, setI] = useState(0);
  const [heroIn, setHeroIn] = useState(false);
  const ctaRef = useMagnetic({ radius: 80, strength: 0.3, max: 3 });
  useEffect(() => {
    const id = setInterval(() => setI(prev => (prev + 1) % heroes.length), 6500);
    return () => clearInterval(id);
  }, [heroes.length]);
  useEffect(() => {
    // rAF for a clean first-frame start; setTimeout fallback guarantees the
    // reveal fires even if rAF is starved (backgrounded/non-painting tab).
    const raf = requestAnimationFrame(() => setHeroIn(true));
    const to = setTimeout(() => setHeroIn(true), 250);
    return () => { cancelAnimationFrame(raf); clearTimeout(to); };
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        padding: "140px 48px 80px",
        maxWidth: 1480,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
        gap: 96,
        alignItems: "center",
      }}
    >
      <div className={heroIn ? "hero-in" : ""}>
        <div className="label" style={{ marginBottom: 36, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 28, height: 1, background: "var(--ink)", display: "inline-block" }}></span>
          <span>{t.period}</span>
        </div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(56px, 8vw, 124px)",
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: "-0.015em",
            margin: 0,
            marginBottom: 28,
          }}
        >
          <span className="mask-line"><span className="mask-inner" style={{ transitionDelay: "0ms" }}>Ahmet</span></span>
          <span className="mask-line"><span className="mask-inner" style={{ transitionDelay: "120ms" }}>Emin</span></span>
          <span className="mask-line"><span className="mask-inner" style={{ transitionDelay: "440ms" }}><em style={{ fontWeight: 400, color: "var(--ink-soft)" }}>Turgut</em></span></span>
        </h1>
        <p
          className="serif"
          style={{
            fontSize: 22,
            fontStyle: "italic",
            lineHeight: 1.4,
            color: "var(--ink-soft)",
            margin: 0,
            marginBottom: 18,
            maxWidth: 420,
            fontWeight: 300,
          }}
        >
          {t.heroSubtitle}
        </p>
        <p style={{ color: "var(--ink-mute)", margin: 0, marginBottom: 56, maxWidth: 380 }}>
          {t.heroNote}
        </p>

        <button
          ref={ctaRef}
          onClick={() => onJump("works")}
          className="label magnetic"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            paddingBottom: 8,
            borderBottom: "1px solid var(--ink)",
          }}
        >
          <span>↓ {t.scrollHint}</span>
        </button>
      </div>

      <div style={{ position: "relative" }}>
        <div
          className="hero-stack hero-kb"
          style={{
            paddingTop: `${(heroes[0].h / heroes[0].w) * 100}%`,
            position: "relative",
          }}
        >
          {heroes.map((w, idx) => (
            <div key={w.id} className={idx === i ? "on" : ""}>
              <Placeholder work={w} tag={false} />
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div>
            <div className="serif" style={{ fontSize: 18, fontStyle: "italic", color: "var(--ink-soft)" }}>
              {heroes[i].title[lang]}
            </div>
            <div className="label" style={{ marginTop: 4 }}>
              {heroes[i].medium[lang]} · {heroes[i].year}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {heroes.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === i ? 22 : 8,
                  height: 1,
                  background: idx === i ? "var(--ink)" : "var(--ink-quiet)",
                  transition: "all 600ms ease",
                }}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────── Filters ──────────────────────────────
function Filters({ lang, mediumFilter, themeFilter, setMedium, setTheme, count }) {
  const t = window.I18N[lang];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "end",
        gap: 48,
        marginBottom: 56,
        paddingBottom: 22,
        borderBottom: "1px solid rgba(26,26,26,0.15)",
      }}
    >
      <div>
        <div className="label" style={{ marginBottom: 18 }}>{t.medium}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
          {window.MEDIUM_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setMedium(f.key)}
              className={`chip serif ${mediumFilter === f.key ? "active" : ""}`}
              style={{
                fontSize: 19,
                fontStyle: mediumFilter === f.key ? "italic" : "normal",
                color: mediumFilter === f.key ? "var(--ink)" : "var(--ink-mute)",
                transition: "color 300ms ease",
              }}
            >
              {f[lang]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderLeft: "1px solid rgba(26,26,26,0.15)", paddingLeft: 48 }}>
        <div className="label" style={{ marginBottom: 18 }}>{t.theme}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
          {window.THEME_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setTheme(f.key)}
              className={`chip serif ${themeFilter === f.key ? "active" : ""}`}
              style={{
                fontSize: 19,
                fontStyle: themeFilter === f.key ? "italic" : "normal",
                color: themeFilter === f.key ? "var(--ink)" : "var(--ink-mute)",
                transition: "color 300ms ease",
              }}
            >
              {f[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="label" style={{ whiteSpace: "nowrap" }}>
        {String(count).padStart(2, "0")} {lang === "tr" ? "eser" : "works"}
      </div>
    </div>
  );
}

// ────────────────────────────── Works grid ──────────────────────────────
function WorksGrid({ lang, onOpen, mediumFilter, themeFilter, exiting }) {
  const gridRef = useRef(null);
  const [revealed, setRevealed] = useState({}); // work id -> stagger delay (ms)
  const filtered = useMemo(() => {
    return window.WORKS.filter(w => {
      const m = mediumFilter === "all" || w.mediumKey === mediumFilter;
      const th = themeFilter === "all" || w.theme === themeFilter;
      return m && th;
    });
  }, [mediumFilter, themeFilter]);

  // (#3) observe tiles for the bottom-up clip-path reveal. Reveal state lives
  // in React so language toggles don't wipe it. Re-runs (and resets) whenever
  // the filtered set changes — the keyed remount yields fresh nodes.
  useEffect(() => {
    setRevealed({});
    if (!gridRef.current || !window.Motion) return;
    const io = window.Motion.createRevealObserver((el, delay) => {
      const id = el.getAttribute("data-id");
      if (!id) return;
      setRevealed(prev => (prev[id] !== undefined ? prev : Object.assign({}, prev, { [id]: delay })));
    }, { stagger: 80 });
    const tiles = gridRef.current.querySelectorAll(".tile");
    tiles.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, [mediumFilter, themeFilter]);

  return (
    <div
      ref={gridRef}
      className={`masonry ${exiting ? "is-exiting" : ""}`}
      key={`${mediumFilter}-${themeFilter}`}
    >
      {filtered.map((w) => {
        const num = window.WORKS.findIndex(x => x.id === w.id) + 1;
        const isVisible = revealed[w.id] !== undefined;
        return (
          <button
            key={w.id}
            data-id={w.id}
            onClick={() => onOpen(w.id)}
            className={`tile reveal ${isVisible ? "is-visible" : ""}`}
            style={{ width: "100%", textAlign: "left", display: "block", "--reveal-delay": (revealed[w.id] || 0) + "ms" }}
            aria-label={`${w.title[lang]}, ${w.year}`}
          >
            <div className="tile-art">
              <Placeholder work={w} tag={false} />
              <div className="tile-index">
                <span className="ix">№ {String(num).padStart(2, "0")}</span>
                <span className="tile-hairline"></span>
              </div>
            </div>
            <div className="tile-caption">
              <div className="serif" style={{ fontSize: 17, fontStyle: "italic", lineHeight: 1.2, color: "var(--ink)" }}>
                {w.title[lang]}
              </div>
              <div className="label" style={{ marginTop: 6 }}>
                {w.medium[lang]} · {w.year}
              </div>
            </div>
          </button>
        );
      })}
      {filtered.length === 0 && (
        <div className="serif" style={{ fontStyle: "italic", color: "var(--ink-mute)", padding: "64px 0" }}>
          {lang === "tr" ? "Bu seçim için eser bulunamadı." : "No works for this selection."}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────── Works section ──────────────────────────────
function WorksSection({ lang, onOpen }) {
  const t = window.I18N[lang];
  const [medium, setMedium] = useState("all");
  const [theme, setTheme] = useState("all");
  const [exiting, setExiting] = useState(false);
  const count = useMemo(() => {
    return window.WORKS.filter(w => {
      const m = medium === "all" || w.mediumKey === medium;
      const th = theme === "all" || w.theme === theme;
      return m && th;
    }).length;
  }, [medium, theme]);

  // (#4) dissolve the current wall, then build the new one.
  const applyFilter = (setter, val, current) => {
    if (val === current) return;
    if (!window.Motion || window.Motion.reduce()) { setter(val); return; }
    setExiting(true);
    setTimeout(() => { setter(val); setExiting(false); }, 350);
  };

  return (
    <section id="works" style={{ padding: "60px 48px 140px", maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 64 }}>
        <h2 className="serif" style={{ fontSize: 56, fontWeight: 400, lineHeight: 1, margin: 0, letterSpacing: "-0.01em" }}>
          {t.selected}
        </h2>
        <div className="label">i — xviii</div>
      </div>

      <Filters
        lang={lang}
        mediumFilter={medium}
        themeFilter={theme}
        setMedium={(v) => applyFilter(setMedium, v, medium)}
        setTheme={(v) => applyFilter(setTheme, v, theme)}
        count={count}
      />

      <WorksGrid lang={lang} onOpen={onOpen} mediumFilter={medium} themeFilter={theme} exiting={exiting} />
    </section>
  );
}

// ────────────────────────────── About ──────────────────────────────
function About({ lang }) {
  const t = window.I18N[lang];
  const [revealRef, revealed] = useRevealState();
  // a portrait-shaped placeholder
  const portrait = { w: 4, h: 5, dimensions: "", id: "portrait", ph: { a: "#C7B89C", b: "#8E7C5E", c: "#4A3D2C", angle: "90deg" } };

  return (
    <section id="about" style={{ background: "var(--paper-2)", padding: "140px 48px", borderTop: "1px solid rgba(26,26,26,0.12)", borderBottom: "1px solid rgba(26,26,26,0.12)" }}>
      <div ref={revealRef} className={`reveal-cols ${revealed ? "is-visible" : ""}`} style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.3fr)", gap: 96, alignItems: "start" }}>
        <div className="col-left">
          <Placeholder work={portrait} tag={t.portraitTag} />
        </div>
        <div className="col-right">
          <div className="label" style={{ marginBottom: 28 }}>— {t.aboutTitle}</div>
          <h2 className="serif" style={{ fontSize: 44, lineHeight: 1.1, fontWeight: 400, margin: 0, marginBottom: 6, letterSpacing: "-0.01em" }}>
            <em>{t.aboutLead}</em>
          </h2>
          <svg className="penline" viewBox="0 0 260 18" aria-hidden="true">
            <path d="M 3 12 C 52 4, 96 15, 142 9 S 214 5, 257 11" pathLength="1" strokeDasharray="1" />
          </svg>
          <div style={{ maxWidth: 540, color: "var(--ink-soft)", marginTop: 34 }}>
            {t.aboutBody.map((p, i) => (
              <p key={i} className="stagger-p" style={{ margin: 0, marginBottom: 18, fontSize: 16, lineHeight: 1.75, transitionDelay: (300 + i * 100) + "ms" }}>{p}</p>
            ))}
          </div>

          <hr className="rule-soft" style={{ margin: "44px 0 28px", maxWidth: 540 }} />

          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 44, rowGap: 14, maxWidth: 540 }}>
            <div className="label">{lang === "tr" ? "Doğum" : "Born"}</div>
            <div className="serif" style={{ fontStyle: "italic" }}>1992, {lang === "tr" ? "İstanbul" : "Istanbul"}</div>
            <div className="label">{lang === "tr" ? "Yaşadığı yer" : "Based"}</div>
            <div className="serif" style={{ fontStyle: "italic" }}>{lang === "tr" ? "İstanbul, Türkiye" : "Istanbul, Türkiye"}</div>
            <div className="label">{lang === "tr" ? "Çalışma" : "Practice"}</div>
            <div className="serif" style={{ fontStyle: "italic" }}>{lang === "tr" ? "Resim, çizim, karışık teknik" : "Painting, drawing, mixed media"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────── Contact ──────────────────────────────
function Contact({ lang }) {
  const t = window.I18N[lang];
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [revealRef, revealed] = useRevealState();

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: "", email: "", message: "" });
    }, 4000);
  };

  return (
    <section id="contact" style={{ padding: "140px 48px", maxWidth: 1280, margin: "0 auto" }}>
      <div ref={revealRef} className={`reveal-cols ${revealed ? "is-visible" : ""}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)", gap: 96, alignItems: "start" }}>
        <div className="col-left">
          <div className="label" style={{ marginBottom: 28 }}>— {t.contactTitle}</div>
          <h2 className="serif" style={{ fontSize: 44, lineHeight: 1.1, fontWeight: 400, margin: 0, marginBottom: 40, letterSpacing: "-0.01em" }}>
            <em>{t.contactLead}</em>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 380 }}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>E-mail</div>
              <a href="mailto:studio@youshimagine.com" className="serif" style={{ fontSize: 22, fontStyle: "italic" }}>
                studio@youshimagine.com
              </a>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Instagram</div>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="serif" style={{ fontSize: 22, fontStyle: "italic" }}>
                @youshimagine
              </a>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>{lang === "tr" ? "Stüdyo" : "Studio"}</div>
              <div className="serif" style={{ fontSize: 18, fontStyle: "italic", color: "var(--ink-soft)" }}>
                {lang === "tr" ? "Beyoğlu, İstanbul" : "Beyoğlu, Istanbul"}<br />
                {lang === "tr" ? "Randevu ile ziyaret" : "By appointment"}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="col-right" style={{ position: "relative" }}>
          <div className="label" style={{ marginBottom: 28 }}>— {lang === "tr" ? "Mesaj" : "Inquiry"}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <input
              className="field"
              placeholder={t.nameField}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              className="field"
              placeholder={t.emailField}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <textarea
              className="field"
              rows={5}
              placeholder={t.msgField}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div style={{ marginTop: 36, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              type="submit"
              className="label"
              style={{
                paddingBottom: 8,
                borderBottom: "1px solid var(--ink)",
                color: "var(--ink)",
              }}
            >
              {t.send} →
            </button>
            <div
              className="serif"
              style={{
                fontStyle: "italic",
                color: "var(--ink-mute)",
                opacity: sent ? 1 : 0,
                transition: "opacity 400ms ease",
              }}
            >
              {t.sent}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

// ────────────────────────────── Lightbox ──────────────────────────────
function Lightbox({ workId, lang, onClose, onNext, onPrev }) {
  const t = window.I18N[lang];
  const work = window.WORKS.find(w => w.id === workId);
  const [phase, setPhase] = useState("init"); // init → open ; closing
  const closeTimer = useRef(null);

  // (#7) re-run the four-way clip reveal on open and on every next/prev swap.
  useEffect(() => {
    if (window.Motion && window.Motion.reduce()) { setPhase("open"); return; }
    setPhase("init");
    let r2;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setPhase("open")); });
    const to = setTimeout(() => setPhase("open"), 80);
    return () => { cancelAnimationFrame(r1); if (r2) cancelAnimationFrame(r2); clearTimeout(to); };
  }, [workId]);

  const requestClose = useCallback(() => {
    if (!window.Motion || window.Motion.reduce()) { onClose(); return; }
    setPhase("closing");
    closeTimer.current = setTimeout(onClose, 600);
  }, [onClose]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") requestClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [requestClose, onNext, onPrev]);

  if (!work) return null;

  const phaseClass = phase === "open" ? "open" : phase === "closing" ? "closing" : "";

  return (
    <div
      className={`lb lightbox-backdrop ${phaseClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={work.title[lang]}
      onClick={requestClose}
    >
      {/* top bar */}
      <div
        style={{
          padding: "22px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#E8E2D4",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="label" style={{ color: "rgba(232,226,212,0.6)" }}>
          {t.katalogTag} · {work.id.toUpperCase()}
        </div>
        <button onClick={requestClose} className="label" style={{ color: "rgba(232,226,212,0.85)" }}>
          {t.close} ✕
        </button>
      </div>

      {/* image */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 2.4fr) minmax(0, 1fr)",
          gap: 56,
          padding: "20px 80px 60px",
          alignItems: "center",
          minHeight: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* art */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 0 }}>
          <div
            style={{
              maxHeight: "78vh",
              aspectRatio: `${work.w} / ${work.h}`,
              width: "auto",
              height: "78vh",
              maxWidth: "100%",
              position: "relative",
            }}
          >
            <div className="lb-art-clip">
              <Placeholder work={work} tag={false} />
            </div>
          </div>
        </div>

        {/* caption */}
        <div style={{ color: "#E8E2D4", maxWidth: 360 }}>
          <div className="lb-cap-line" style={{ "--d": "0ms" }}>
            <div className="label" style={{ marginBottom: 18, color: "rgba(232,226,212,0.55)" }}>
              № {String(window.WORKS.findIndex(w => w.id === workId) + 1).padStart(2, "0")}
            </div>
            <h3 className="serif" style={{ fontSize: 42, lineHeight: 1.05, fontWeight: 400, margin: 0, marginBottom: 4, letterSpacing: "-0.005em" }}>
              <em>{work.title[lang]}</em>
            </h3>
            <div className="serif" style={{ fontSize: 20, color: "rgba(232,226,212,0.6)", marginBottom: 32 }}>
              {work.year}
            </div>
          </div>

          <div className="lb-cap-line" style={{ "--d": "180ms", display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 28, rowGap: 12 }}>
            <div className="label" style={{ color: "rgba(232,226,212,0.5)" }}>{t.medium}</div>
            <div className="serif" style={{ fontStyle: "italic", fontSize: 16 }}>{work.medium[lang]}</div>
            <div className="label" style={{ color: "rgba(232,226,212,0.5)" }}>{lang === "tr" ? "Boyut" : "Size"}</div>
            <div className="serif" style={{ fontStyle: "italic", fontSize: 16 }}>{work.dimensions}</div>
            <div className="label" style={{ color: "rgba(232,226,212,0.5)" }}>{t.theme}</div>
            <div className="serif" style={{ fontStyle: "italic", fontSize: 16, textTransform: "capitalize" }}>
              {window.THEME_FILTERS.find(f => f.key === work.theme)[lang]}
            </div>
          </div>

          <div className="lb-cap-line" style={{ "--d": "360ms" }}>
            <hr className="rule-soft" style={{ margin: "32px 0", borderColor: "rgba(232,226,212,0.18)" }} />
            <p className="serif" style={{ fontSize: 18, fontStyle: "italic", lineHeight: 1.5, color: "rgba(232,226,212,0.8)", margin: 0 }}>
              “{work.note[lang]}”
            </p>
          </div>
        </div>
      </div>

      {/* footer / nav */}
      <div
        style={{
          padding: "22px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "rgba(232,226,212,0.75)",
          borderTop: "1px solid rgba(232,226,212,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onPrev} className="label" style={{ color: "rgba(232,226,212,0.85)" }}>
          ← {t.prev}
        </button>
        <div className="label" style={{ color: "rgba(232,226,212,0.45)" }}>
          {lang === "tr" ? "ok tuşları ile gezin · esc ile kapat" : "arrow keys to navigate · esc to close"}
        </div>
        <button onClick={onNext} className="label" style={{ color: "rgba(232,226,212,0.85)" }}>
          {t.next} →
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────── Footer ──────────────────────────────
function Footer({ lang }) {
  const t = window.I18N[lang];
  const [sigRef, sigVisible] = useRevealState({ rootMargin: "0px 0px -4% 0px" });
  const letters = "youshimagine".split("");
  return (
    <footer style={{ padding: "48px 48px 56px", borderTop: "1px solid rgba(26,26,26,0.15)" }}>
      <div style={{ maxWidth: 1480, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 24, flexWrap: "wrap" }}>
        <div className="label">{t.footerNote}</div>
        <div className="label" style={{ display: "flex", gap: 24 }}>
          <span ref={sigRef} className={`sig ${sigVisible ? "is-visible" : ""}`} aria-label="youshimagine">
            {letters.map((c, i) => (
              <span key={i} className="sig-letter" style={{ transitionDelay: (i * 60) + "ms" }}>{c}</span>
            ))}
          </span>
          <span style={{ color: "var(--ink-quiet)" }}>{new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────── App ──────────────────────────────
function App() {
  const [lang, setLang] = useState("tr");
  const [openId, setOpenId] = useState(null);

  const jump = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const open = (id) => setOpenId(id);
  const close = () => setOpenId(null);
  const next = useCallback(() => {
    setOpenId(curr => {
      const idx = window.WORKS.findIndex(w => w.id === curr);
      return window.WORKS[(idx + 1) % window.WORKS.length].id;
    });
  }, []);
  const prev = useCallback(() => {
    setOpenId(curr => {
      const idx = window.WORKS.findIndex(w => w.id === curr);
      return window.WORKS[(idx - 1 + window.WORKS.length) % window.WORKS.length].id;
    });
  }, []);

  // sets <html lang=...>
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <React.Fragment>
      <TopNav lang={lang} setLang={setLang} onJump={jump} />
      <main>
        <Hero lang={lang} onJump={jump} />
        <WorksSection lang={lang} onOpen={open} />
        <About lang={lang} />
        <Contact lang={lang} />
      </main>
      <Footer lang={lang} />
      {openId && (
        <Lightbox
          workId={openId}
          lang={lang}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      )}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
