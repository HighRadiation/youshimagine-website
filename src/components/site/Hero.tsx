"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, type Lang } from "@/lib/content";
import { HERO_IDS, WORKS } from "@/lib/works";
import { magnetic } from "@/lib/motion";
import { Placeholder } from "./Placeholder";

type Props = { lang: Lang; onJump: (id: string) => void };

export function Hero({ lang, onJump }: Props) {
  const t = I18N[lang];
  const heroes = HERO_IDS.map((id) => WORKS.find((w) => w.id === id)!).filter(
    Boolean,
  );
  const [i, setI] = useState(0);
  const [heroIn, setHeroIn] = useState(false);
  const ctaRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!ctaRef.current) return;
    return magnetic(ctaRef.current, { radius: 80, strength: 0.3, max: 3 });
  }, []);

  useEffect(() => {
    if (heroes.length === 0) return;
    const id = window.setInterval(
      () => setI((prev) => (prev + 1) % heroes.length),
      6500,
    );
    return () => window.clearInterval(id);
  }, [heroes.length]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setHeroIn(true));
    const to = window.setTimeout(() => setHeroIn(true), 250);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(to);
    };
  }, []);

  if (heroes.length === 0) return null;
  const current = heroes[i];

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
        <div
          className="label"
          style={{
            marginBottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span
            style={{
              width: 28,
              height: 1,
              background: "var(--ink)",
              display: "inline-block",
            }}
          ></span>
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
          <span className="mask-line">
            <span className="mask-inner" style={{ transitionDelay: "0ms" }}>
              Ahmet
            </span>
          </span>
          <span className="mask-line">
            <span className="mask-inner" style={{ transitionDelay: "120ms" }}>
              Emin
            </span>
          </span>
          <span className="mask-line">
            <span className="mask-inner" style={{ transitionDelay: "440ms" }}>
              <em style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                Turgut
              </em>
            </span>
          </span>
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
        <p
          style={{
            color: "var(--ink-mute)",
            margin: 0,
            marginBottom: 56,
            maxWidth: 380,
          }}
        >
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
            <div
              className="serif"
              style={{
                fontSize: 18,
                fontStyle: "italic",
                color: "var(--ink-soft)",
              }}
            >
              {current.title[lang]}
            </div>
            <div className="label" style={{ marginTop: 4 }}>
              {current.medium[lang]} · {current.year}
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
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
