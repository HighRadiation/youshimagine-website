// Vanilla choreography helpers. IntersectionObserver + requestAnimationFrame.
// Respects prefers-reduced-motion and (hover/pointer: fine) capability.

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

type RevealOpts = { stagger?: number; rootMargin?: string; threshold?: number };

// Batched reveal observer — elements that intersect in the same ~45ms window
// share a stagger group. Hands `(element, delayMs)` to the callback so the
// caller can drive React state (instead of mutating the DOM directly).
export function createRevealObserver(
  onReveal: (el: Element, delayMs: number) => void,
  opts: RevealOpts = {},
): IntersectionObserver {
  const stagger = opts.stagger ?? 80;
  const batch: Element[] = [];
  let timer: number | null = null;

  const flush = () => {
    const items = batch.slice();
    batch.length = 0;
    items.forEach((el, i) => onReveal(el, i * stagger));
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        if (prefersReducedMotion()) {
          onReveal(e.target, 0);
          return;
        }
        batch.push(e.target);
        if (timer != null) window.clearTimeout(timer);
        timer = window.setTimeout(flush, 45);
      });
    },
    {
      rootMargin: opts.rootMargin ?? "0px 0px -8% 0px",
      threshold: opts.threshold ?? 0.12,
    },
  );
  return io;
}

export function observeOnce(
  el: Element,
  cb: (el: Element) => void,
  opts: { rootMargin?: string; threshold?: number } = {},
): { disconnect: () => void } {
  if (prefersReducedMotion()) {
    cb(el);
    return { disconnect: () => {} };
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          io.unobserve(e.target);
          cb(e.target);
        }
      });
    },
    {
      rootMargin: opts.rootMargin ?? "0px 0px -12% 0px",
      threshold: opts.threshold ?? 0.15,
    },
  );
  io.observe(el);
  return io;
}

// Magnetic cursor-follow on fine-pointer devices.
export function magnetic(
  el: HTMLElement,
  opts: { radius?: number; strength?: number; max?: number } = {},
): () => void {
  if (!isFinePointer() || prefersReducedMotion()) return () => {};
  const radius = opts.radius ?? 80;
  const strength = opts.strength ?? 0.3;
  const max = opts.max ?? 3;
  let raf: number | null = null;
  let tx = 0;
  let ty = 0;

  const apply = () => {
    raf = null;
    el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
  };
  const schedule = () => {
    if (raf == null) raf = requestAnimationFrame(apply);
  };
  const onMove = (ev: MouseEvent) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = ev.clientX - cx;
    const dy = ev.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const engage = radius + Math.max(r.width, r.height) / 2;
    if (dist < engage) {
      tx = Math.max(-max, Math.min(max, dx * strength));
      ty = Math.max(-max, Math.min(max, dy * strength));
    } else {
      tx = 0;
      ty = 0;
    }
    schedule();
  };
  const relax = () => {
    tx = 0;
    ty = 0;
    schedule();
  };

  el.style.transition = "transform 400ms cubic-bezier(.22,.61,.36,1)";
  window.addEventListener("mousemove", onMove, { passive: true });
  el.addEventListener("mouseleave", relax);
  return () => {
    window.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseleave", relax);
    el.style.transform = "";
    el.style.transition = "";
  };
}
