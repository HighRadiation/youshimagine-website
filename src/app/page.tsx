"use client";

import { useCallback, useEffect, useState } from "react";
import { TopNav } from "@/components/site/TopNav";
import { Hero } from "@/components/site/Hero";
import { WorksSection } from "@/components/site/WorksSection";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Lightbox } from "@/components/site/Lightbox";
import { WORKS } from "@/lib/works";
import type { Lang } from "@/lib/content";

export default function Page() {
  const [lang, setLang] = useState<Lang>("tr");
  const [openId, setOpenId] = useState<string | null>(null);

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const open = (id: string) => setOpenId(id);
  const close = () => setOpenId(null);

  const next = useCallback(() => {
    setOpenId((curr) => {
      const idx = WORKS.findIndex((w) => w.id === curr);
      return WORKS[(idx + 1) % WORKS.length].id;
    });
  }, []);

  const prev = useCallback(() => {
    setOpenId((curr) => {
      const idx = WORKS.findIndex((w) => w.id === curr);
      return WORKS[(idx - 1 + WORKS.length) % WORKS.length].id;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
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
    </>
  );
}
