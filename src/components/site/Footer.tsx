"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, type Lang } from "@/lib/content";
import { observeOnce } from "@/lib/motion";

export function Footer({ lang }: { lang: Lang }) {
  const t = I18N[lang];
  const ref = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  const letters = "youshimagine".split("");

  useEffect(() => {
    if (!ref.current) return;
    const io = observeOnce(ref.current, () => setVisible(true), {
      rootMargin: "0px 0px -4% 0px",
    });
    return () => io.disconnect();
  }, []);

  return (
    <footer
      className="footer-shell"
      style={{
        borderTop: "1px solid rgba(26,26,26,0.15)",
      }}
    >
      <div
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div className="label">{t.footerNote}</div>
        <div className="label" style={{ display: "flex", gap: 24 }}>
          <span
            ref={ref}
            className={`sig ${visible ? "is-visible" : ""}`}
            aria-label="youshimagine"
          >
            {letters.map((c, i) => (
              <span
                key={i}
                className="sig-letter"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {c}
              </span>
            ))}
          </span>
          <span style={{ color: "var(--ink-quiet)" }}>
            {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
