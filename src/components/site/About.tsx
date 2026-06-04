"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, type Lang } from "@/lib/content";
import { observeOnce } from "@/lib/motion";
import { Placeholder } from "./Placeholder";

const portrait = {
  w: 4,
  h: 5,
  dimensions: "",
  id: "portrait",
  ph: { a: "#C7B89C", b: "#8E7C5E", c: "#4A3D2C", angle: "90deg" },
};

export function About({ lang }: { lang: Lang }) {
  const t = I18N[lang];
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = observeOnce(ref.current, () => setVisible(true));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="about-section"
      style={{
        background: "var(--paper-2)",
        borderTop: "1px solid rgba(26,26,26,0.12)",
        borderBottom: "1px solid rgba(26,26,26,0.12)",
      }}
    >
      <div
        ref={ref}
        className={`reveal-cols about-grid ${visible ? "is-visible" : ""}`}
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.3fr)",
          alignItems: "start",
        }}
      >
        <div className="col-left">
          <Placeholder work={portrait} tag={t.portraitTag} />
        </div>
        <div className="col-right">
          <div className="label" style={{ marginBottom: 28 }}>
            — {t.aboutTitle}
          </div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(30px, 7.5vw, 44px)",
              lineHeight: 1.1,
              fontWeight: 400,
              margin: 0,
              marginBottom: 6,
              letterSpacing: "-0.01em",
            }}
          >
            <em>{t.aboutLead}</em>
          </h2>
          <svg className="penline" viewBox="0 0 260 18" aria-hidden="true">
            <path
              d="M 3 12 C 52 4, 96 15, 142 9 S 214 5, 257 11"
              pathLength="1"
              strokeDasharray="1"
            />
          </svg>
          <div
            style={{
              maxWidth: 540,
              color: "var(--ink-soft)",
              marginTop: 34,
            }}
          >
            {t.aboutBody.map((p, i) => (
              <p
                key={i}
                className="stagger-p"
                style={{
                  margin: 0,
                  marginBottom: 18,
                  fontSize: 16,
                  lineHeight: 1.75,
                  transitionDelay: `${300 + i * 100}ms`,
                }}
              >
                {p}
              </p>
            ))}
          </div>

          <hr
            className="rule-soft"
            style={{ margin: "44px 0 28px", maxWidth: 540 }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              columnGap: 44,
              rowGap: 14,
              maxWidth: 540,
            }}
          >
            <div className="label">{t.bornLabel}</div>
            <div className="serif" style={{ fontStyle: "italic" }}>
              {t.bornValue}
            </div>
            <div className="label">{t.basedLabel}</div>
            <div className="serif" style={{ fontStyle: "italic" }}>
              {t.basedValue}
            </div>
            <div className="label">{t.practiceLabel}</div>
            <div className="serif" style={{ fontStyle: "italic" }}>
              {t.practiceValue}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
