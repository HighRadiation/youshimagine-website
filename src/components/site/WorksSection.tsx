"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { I18N, type Lang } from "@/lib/content";
import {
  MEDIUM_FILTERS,
  THEME_FILTERS,
  WORKS,
  type Work,
} from "@/lib/works";
import { createRevealObserver, prefersReducedMotion } from "@/lib/motion";
import { Placeholder } from "./Placeholder";

type MediumKey = "all" | Work["mediumKey"];
type ThemeKey = "all" | Work["theme"];

type Props = {
  lang: Lang;
  onOpen: (id: string) => void;
};

function Filters({
  lang,
  mediumFilter,
  themeFilter,
  setMedium,
  setTheme,
  count,
}: {
  lang: Lang;
  mediumFilter: MediumKey;
  themeFilter: ThemeKey;
  setMedium: (k: MediumKey) => void;
  setTheme: (k: ThemeKey) => void;
  count: number;
}) {
  const t = I18N[lang];
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
        <div className="label" style={{ marginBottom: 18 }}>
          {t.medium}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 24px",
          }}
        >
          {MEDIUM_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setMedium(f.key)}
              className={`chip serif ${mediumFilter === f.key ? "active" : ""}`}
              style={{
                fontSize: 19,
                fontStyle: mediumFilter === f.key ? "italic" : "normal",
                color:
                  mediumFilter === f.key ? "var(--ink)" : "var(--ink-mute)",
                transition: "color 300ms ease",
              }}
            >
              {f[lang]}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          borderLeft: "1px solid rgba(26,26,26,0.15)",
          paddingLeft: 48,
        }}
      >
        <div className="label" style={{ marginBottom: 18 }}>
          {t.theme}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 24px",
          }}
        >
          {THEME_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTheme(f.key)}
              className={`chip serif ${themeFilter === f.key ? "active" : ""}`}
              style={{
                fontSize: 19,
                fontStyle: themeFilter === f.key ? "italic" : "normal",
                color:
                  themeFilter === f.key ? "var(--ink)" : "var(--ink-mute)",
                transition: "color 300ms ease",
              }}
            >
              {f[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="label" style={{ whiteSpace: "nowrap" }}>
        {String(count).padStart(2, "0")} {t.worksCountSuffix}
      </div>
    </div>
  );
}

function WorksGrid({
  lang,
  onOpen,
  mediumFilter,
  themeFilter,
  exiting,
}: {
  lang: Lang;
  onOpen: (id: string) => void;
  mediumFilter: MediumKey;
  themeFilter: ThemeKey;
  exiting: boolean;
}) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  const t = I18N[lang];

  const filtered = useMemo(
    () =>
      WORKS.filter((w) => {
        const m = mediumFilter === "all" || w.mediumKey === mediumFilter;
        const th = themeFilter === "all" || w.theme === themeFilter;
        return m && th;
      }),
    [mediumFilter, themeFilter],
  );

  useEffect(() => {
    setRevealed({});
    if (!gridRef.current) return;
    const io = createRevealObserver(
      (el, delay) => {
        const id = (el as HTMLElement).getAttribute("data-id");
        if (!id) return;
        setRevealed((prev) =>
          prev[id] !== undefined ? prev : { ...prev, [id]: delay },
        );
      },
      { stagger: 80 },
    );
    const tiles = gridRef.current.querySelectorAll(".tile");
    tiles.forEach((tile) => io.observe(tile));
    return () => io.disconnect();
  }, [mediumFilter, themeFilter]);

  return (
    <div
      ref={gridRef}
      className={`masonry ${exiting ? "is-exiting" : ""}`}
      key={`${mediumFilter}-${themeFilter}`}
    >
      {filtered.map((w) => {
        const num = WORKS.findIndex((x) => x.id === w.id) + 1;
        const isVisible = revealed[w.id] !== undefined;
        return (
          <button
            key={w.id}
            data-id={w.id}
            onClick={() => onOpen(w.id)}
            className={`tile reveal ${isVisible ? "is-visible" : ""}`}
            style={{
              width: "100%",
              textAlign: "left",
              display: "block",
              ["--reveal-delay" as string]: `${revealed[w.id] || 0}ms`,
            }}
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
              <div
                className="serif"
                style={{
                  fontSize: 17,
                  fontStyle: "italic",
                  lineHeight: 1.2,
                  color: "var(--ink)",
                }}
              >
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
        <div
          className="serif"
          style={{
            fontStyle: "italic",
            color: "var(--ink-mute)",
            padding: "64px 0",
          }}
        >
          {t.emptyState}
        </div>
      )}
    </div>
  );
}

export function WorksSection({ lang, onOpen }: Props) {
  const t = I18N[lang];
  const [medium, setMedium] = useState<MediumKey>("all");
  const [theme, setTheme] = useState<ThemeKey>("all");
  const [exiting, setExiting] = useState(false);

  const count = useMemo(
    () =>
      WORKS.filter((w) => {
        const m = medium === "all" || w.mediumKey === medium;
        const th = theme === "all" || w.theme === theme;
        return m && th;
      }).length,
    [medium, theme],
  );

  const applyFilter = <K extends string>(
    setter: (v: K) => void,
    val: K,
    current: K,
  ) => {
    if (val === current) return;
    if (prefersReducedMotion()) {
      setter(val);
      return;
    }
    setExiting(true);
    window.setTimeout(() => {
      setter(val);
      setExiting(false);
    }, 350);
  };

  return (
    <section
      id="works"
      style={{
        padding: "60px 48px 140px",
        maxWidth: 1480,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 64,
        }}
      >
        <h2
          className="serif"
          style={{
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 1,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {t.selected}
        </h2>
        <div className="label">i — xxxi</div>
      </div>

      <Filters
        lang={lang}
        mediumFilter={medium}
        themeFilter={theme}
        setMedium={(v) => applyFilter(setMedium, v, medium)}
        setTheme={(v) => applyFilter(setTheme, v, theme)}
        count={count}
      />

      <WorksGrid
        lang={lang}
        onOpen={onOpen}
        mediumFilter={medium}
        themeFilter={theme}
        exiting={exiting}
      />
    </section>
  );
}
