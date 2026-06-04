"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, type Lang } from "@/lib/content";
import { magnetic } from "@/lib/motion";

type Props = {
  lang: Lang;
  setLang: (l: Lang) => void;
  onJump: (id: string) => void;
};

function useMagnetic(opts?: Parameters<typeof magnetic>[1]) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    return magnetic(ref.current, opts ?? {});
  }, [opts]);
  return ref;
}

export function TopNav({ lang, setLang, onJump }: Props) {
  const t = I18N[lang];
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const worksRef = useMagnetic({ radius: 90, strength: 0.35, max: 3 });
  const aboutRef = useMagnetic({ radius: 90, strength: 0.35, max: 3 });
  const contactRef = useMagnetic({ radius: 90, strength: 0.35, max: 3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const jumpFrom = (id: string) => {
    setMenuOpen(false);
    onJump(id);
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background:
            scrolled || menuOpen
              ? "rgba(245,241,234,0.86)"
              : "rgba(245,241,234,0)",
          backdropFilter: scrolled || menuOpen ? "blur(8px)" : "none",
          WebkitBackdropFilter:
            scrolled || menuOpen ? "blur(8px)" : "none",
          borderBottom:
            scrolled || menuOpen
              ? "1px solid rgba(26,26,26,0.08)"
              : "1px solid transparent",
          transition: "background 600ms ease, border-color 600ms ease",
        }}
      >
        <nav
          className="nav-shell"
          style={{
            maxWidth: 1480,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="serif"
            style={{
              fontSize: 19,
              letterSpacing: 0.2,
              lineHeight: 1,
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              minWidth: 0,
            }}
          >
            <span>Ahmet Emin Turgut</span>
            <span
              className="mono nav-brand-tag"
              style={{
                fontSize: 9.5,
                letterSpacing: "0.22em",
                color: "var(--ink-mute)",
                textTransform: "uppercase",
              }}
            >
              youshimagine
            </span>
          </button>

          <div className="nav-links">
            <button
              ref={worksRef}
              onClick={() => onJump("works")}
              className="nav-link label magnetic"
            >
              {t.nav.works}
            </button>
            <button
              ref={aboutRef}
              onClick={() => onJump("about")}
              className="nav-link label magnetic"
            >
              {t.nav.about}
            </button>
            <button
              ref={contactRef}
              onClick={() => onJump("contact")}
              className="nav-link label magnetic"
            >
              {t.nav.contact}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 24,
                borderLeft: "1px solid rgba(26,26,26,0.18)",
              }}
            >
              <button
                onClick={() => setLang("tr")}
                className="label"
                aria-pressed={lang === "tr"}
                style={{
                  color: lang === "tr" ? "var(--ink)" : "var(--ink-quiet)",
                  fontWeight: lang === "tr" ? 500 : 400,
                }}
              >
                TR
              </button>
              <span className="label" style={{ color: "var(--ink-quiet)" }}>
                /
              </span>
              <button
                onClick={() => setLang("en")}
                className="label"
                aria-pressed={lang === "en"}
                style={{
                  color: lang === "en" ? "var(--ink)" : "var(--ink-quiet)",
                  fontWeight: lang === "en" ? 500 : 400,
                }}
              >
                EN
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="nav-burger label"
            style={{ gap: 10 }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 22,
                height: 12,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: menuOpen ? 5 : 0,
                  height: 1,
                  background: "var(--ink)",
                  transform: menuOpen ? "rotate(45deg)" : "none",
                  transition: "transform 300ms ease, top 300ms ease",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: menuOpen ? 5 : 11,
                  height: 1,
                  background: "var(--ink)",
                  transform: menuOpen ? "rotate(-45deg)" : "none",
                  transition: "transform 300ms ease, top 300ms ease",
                }}
              />
            </span>
            <span>{menuOpen ? "Close" : "Menu"}</span>
          </button>
        </nav>
      </header>

      <div
        className={`nav-sheet ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <button
          onClick={() => jumpFrom("works")}
          className="serif"
          style={{
            fontSize: 32,
            fontStyle: "italic",
            textAlign: "left",
            lineHeight: 1.1,
          }}
        >
          {t.nav.works}
        </button>
        <button
          onClick={() => jumpFrom("about")}
          className="serif"
          style={{
            fontSize: 32,
            fontStyle: "italic",
            textAlign: "left",
            lineHeight: 1.1,
          }}
        >
          {t.nav.about}
        </button>
        <button
          onClick={() => jumpFrom("contact")}
          className="serif"
          style={{
            fontSize: 32,
            fontStyle: "italic",
            textAlign: "left",
            lineHeight: 1.1,
          }}
        >
          {t.nav.contact}
        </button>
        <div
          style={{
            marginTop: 16,
            paddingTop: 24,
            borderTop: "1px solid rgba(26,26,26,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            onClick={() => setLang("tr")}
            className="label"
            aria-pressed={lang === "tr"}
            style={{
              color: lang === "tr" ? "var(--ink)" : "var(--ink-quiet)",
              fontWeight: lang === "tr" ? 500 : 400,
            }}
          >
            TR
          </button>
          <span className="label" style={{ color: "var(--ink-quiet)" }}>
            /
          </span>
          <button
            onClick={() => setLang("en")}
            className="label"
            aria-pressed={lang === "en"}
            style={{
              color: lang === "en" ? "var(--ink)" : "var(--ink-quiet)",
              fontWeight: lang === "en" ? 500 : 400,
            }}
          >
            EN
          </button>
        </div>
      </div>
    </>
  );
}
