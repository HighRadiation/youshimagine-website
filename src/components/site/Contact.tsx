"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, type Lang } from "@/lib/content";
import { observeOnce } from "@/lib/motion";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact({ lang }: { lang: Lang }) {
  const t = I18N[lang];
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = observeOnce(ref.current, () => setVisible(true));
    return () => io.disconnect();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      const r = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, lang }),
      });
      if (!r.ok) throw new Error("send failed");
      setStatus("sent");
      window.setTimeout(() => {
        setStatus("idle");
        setForm({ name: "", email: "", message: "" });
      }, 4000);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <section
      id="contact"
      className="contact-section"
      style={{ maxWidth: 1280, margin: "0 auto" }}
    >
      <div
        ref={ref}
        className={`reveal-cols contact-grid ${visible ? "is-visible" : ""}`}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
          alignItems: "start",
        }}
      >
        <div className="col-left">
          <div className="label" style={{ marginBottom: 28 }}>
            — {t.contactTitle}
          </div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(30px, 7.5vw, 44px)",
              lineHeight: 1.1,
              fontWeight: 400,
              margin: 0,
              marginBottom: 40,
              letterSpacing: "-0.01em",
            }}
          >
            <em>{t.contactLead}</em>
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              maxWidth: 380,
            }}
          >
            <div>
              <div className="label" style={{ marginBottom: 6 }}>
                E-mail
              </div>
              <a
                href="mailto:studio@youshimagine.com"
                className="serif"
                style={{ fontSize: 22, fontStyle: "italic" }}
              >
                studio@youshimagine.com
              </a>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>
                Instagram
              </div>
              <a
                href="https://instagram.com/youshimagine"
                target="_blank"
                rel="noreferrer"
                className="serif"
                style={{ fontSize: 22, fontStyle: "italic" }}
              >
                @youshimagine
              </a>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>
                {t.studioLabel}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 18,
                  fontStyle: "italic",
                  color: "var(--ink-soft)",
                }}
              >
                {t.studioValue}
                <br />
                {t.studioNote}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="col-right"
          style={{ position: "relative" }}
        >
          <div className="label" style={{ marginBottom: 28 }}>
            — {t.inquiryLabel}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <input
              className="field"
              placeholder={t.nameField}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              className="field"
              placeholder={t.emailField}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <textarea
              className="field"
              rows={5}
              placeholder={t.msgField}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              type="submit"
              disabled={status === "sending"}
              className="label"
              style={{
                paddingBottom: 8,
                borderBottom: "1px solid var(--ink)",
                color: "var(--ink)",
                opacity: status === "sending" ? 0.5 : 1,
              }}
            >
              {t.send} →
            </button>
            <div
              className="serif"
              style={{
                fontStyle: "italic",
                color:
                  status === "error" ? "#9a3030" : "var(--ink-mute)",
                opacity: status === "sent" || status === "error" ? 1 : 0,
                transition: "opacity 400ms ease",
              }}
            >
              {status === "error" ? t.sendError : t.sent}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
