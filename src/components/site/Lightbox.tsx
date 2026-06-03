"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { I18N, type Lang } from "@/lib/content";
import { THEME_FILTERS, WORKS } from "@/lib/works";
import { prefersReducedMotion } from "@/lib/motion";
import { Placeholder } from "./Placeholder";

type Phase = "init" | "open" | "closing";

type Props = {
  workId: string;
  lang: Lang;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export function Lightbox({ workId, lang, onClose, onNext, onPrev }: Props) {
  const t = I18N[lang];
  const work = WORKS.find((w) => w.id === workId);
  const [phase, setPhase] = useState<Phase>("init");
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPhase("open");
      return;
    }
    setPhase("init");
    let r2: number | undefined;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setPhase("open"));
    });
    const to = window.setTimeout(() => setPhase("open"), 80);
    return () => {
      cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
      window.clearTimeout(to);
    };
  }, [workId]);

  const requestClose = useCallback(() => {
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    setPhase("closing");
    closeTimer.current = window.setTimeout(onClose, 600);
  }, [onClose]);

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

  const phaseClass =
    phase === "open" ? "open" : phase === "closing" ? "closing" : "";

  const themeLabel =
    THEME_FILTERS.find((f) => f.key === work.theme)?.[lang] ?? "";

  return (
    <div
      className={`lb lightbox-backdrop ${phaseClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={work.title[lang]}
      onClick={requestClose}
    >
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
        <button
          onClick={requestClose}
          className="label"
          style={{ color: "rgba(232,226,212,0.85)" }}
        >
          {t.close} ✕
        </button>
      </div>

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            minHeight: 0,
          }}
        >
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

        <div style={{ color: "#E8E2D4", maxWidth: 360 }}>
          <div
            className="lb-cap-line"
            style={{ ["--d" as string]: "0ms" }}
          >
            <div
              className="label"
              style={{
                marginBottom: 18,
                color: "rgba(232,226,212,0.55)",
              }}
            >
              №{" "}
              {String(
                WORKS.findIndex((w) => w.id === workId) + 1,
              ).padStart(2, "0")}
            </div>
            <h3
              className="serif"
              style={{
                fontSize: 42,
                lineHeight: 1.05,
                fontWeight: 400,
                margin: 0,
                marginBottom: 4,
                letterSpacing: "-0.005em",
              }}
            >
              <em>{work.title[lang]}</em>
            </h3>
            <div
              className="serif"
              style={{
                fontSize: 20,
                color: "rgba(232,226,212,0.6)",
                marginBottom: 32,
              }}
            >
              {work.year}
            </div>
          </div>

          <div
            className="lb-cap-line"
            style={{
              ["--d" as string]: "180ms",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              columnGap: 28,
              rowGap: 12,
            }}
          >
            <div className="label" style={{ color: "rgba(232,226,212,0.5)" }}>
              {t.medium}
            </div>
            <div
              className="serif"
              style={{ fontStyle: "italic", fontSize: 16 }}
            >
              {work.medium[lang]}
            </div>
            <div className="label" style={{ color: "rgba(232,226,212,0.5)" }}>
              {t.sizeLabel}
            </div>
            <div
              className="serif"
              style={{ fontStyle: "italic", fontSize: 16 }}
            >
              {work.dimensions}
            </div>
            <div className="label" style={{ color: "rgba(232,226,212,0.5)" }}>
              {t.theme}
            </div>
            <div
              className="serif"
              style={{
                fontStyle: "italic",
                fontSize: 16,
                textTransform: "capitalize",
              }}
            >
              {themeLabel}
            </div>
          </div>

          <div
            className="lb-cap-line"
            style={{ ["--d" as string]: "360ms" }}
          >
            <hr
              className="rule-soft"
              style={{
                margin: "32px 0",
                borderColor: "rgba(232,226,212,0.18)",
              }}
            />
            <p
              className="serif"
              style={{
                fontSize: 18,
                fontStyle: "italic",
                lineHeight: 1.5,
                color: "rgba(232,226,212,0.8)",
                margin: 0,
              }}
            >
              “{work.note[lang]}”
            </p>
          </div>
        </div>
      </div>

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
        <button
          onClick={onPrev}
          className="label"
          style={{ color: "rgba(232,226,212,0.85)" }}
        >
          ← {t.prev}
        </button>
        <div className="label" style={{ color: "rgba(232,226,212,0.45)" }}>
          {t.navHint}
        </div>
        <button
          onClick={onNext}
          className="label"
          style={{ color: "rgba(232,226,212,0.85)" }}
        >
          {t.next} →
        </button>
      </div>
    </div>
  );
}
