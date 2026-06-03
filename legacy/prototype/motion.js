// motion.js — vanilla choreography helpers for the portfolio.
// No animation libraries: IntersectionObserver + requestAnimationFrame only.
// Everything respects prefers-reduced-motion and (hover/pointer) capability.

window.Motion = (function () {
  var reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fineMq = window.matchMedia("(hover: hover) and (pointer: fine)");

  function reduce() { return reduceMq.matches; }
  function finePointer() { return fineMq.matches; }

  // ── Batched reveal observer ───────────────────────────────────────────
  // Elements that scroll into view within the same ~45ms window are treated
  // as one "row" and given an incremental stagger delay. Instead of mutating
  // the DOM (which React would clobber on re-render), we hand each element and
  // its computed delay back to `onReveal` so the caller can drive React state.
  function createRevealObserver(onReveal, opts) {
    opts = opts || {};
    var stagger = opts.stagger != null ? opts.stagger : 80;
    var batch = [];
    var timer = null;

    function flush() {
      var items = batch.slice();
      batch.length = 0;
      items.forEach(function (el, i) {
        onReveal(el, i * stagger);
      });
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        if (reduce()) { onReveal(e.target, 0); return; }
        batch.push(e.target);
        window.clearTimeout(timer);
        timer = window.setTimeout(flush, 45);
      });
    }, {
      rootMargin: opts.rootMargin || "0px 0px -8% 0px",
      threshold: opts.threshold != null ? opts.threshold : 0.12
    });
    return io;
  }

  // ── One-shot reveal for a single element ──────────────────────────────
  function observeOnce(el, cb, opts) {
    opts = opts || {};
    if (reduce()) { cb(el); return { disconnect: function () {} }; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          io.unobserve(e.target);
          cb(e.target);
        }
      });
    }, {
      rootMargin: opts.rootMargin || "0px 0px -12% 0px",
      threshold: opts.threshold != null ? opts.threshold : 0.15
    });
    io.observe(el);
    return io;
  }

  // ── Magnetic cursor-follow ────────────────────────────────────────────
  // Pulls an element a few px toward the cursor when inside `radius`.
  // Fine-pointer only; underline/hover treatments are untouched.
  function magnetic(el, opts) {
    opts = opts || {};
    if (!finePointer() || reduce()) return function () {};
    var radius = opts.radius || 80;
    var strength = opts.strength || 0.3;
    var max = opts.max || 3;
    var raf = null;
    var tx = 0, ty = 0;

    function apply() {
      raf = null;
      el.style.transform = "translate(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px)";
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(apply);
    }
    function onMove(ev) {
      var r = el.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = ev.clientX - cx;
      var dy = ev.clientY - cy;
      var dist = Math.hypot(dx, dy);
      var engage = radius + Math.max(r.width, r.height) / 2;
      if (dist < engage) {
        tx = Math.max(-max, Math.min(max, dx * strength));
        ty = Math.max(-max, Math.min(max, dy * strength));
      } else {
        tx = 0; ty = 0;
      }
      schedule();
    }
    function relax() { tx = 0; ty = 0; schedule(); }

    el.style.transition = "transform 400ms cubic-bezier(.22,.61,.36,1)";
    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", relax);
    return function () {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", relax);
      el.style.transform = "";
      el.style.transition = "";
    };
  }

  return {
    reduce: reduce,
    finePointer: finePointer,
    createRevealObserver: createRevealObserver,
    observeOnce: observeOnce,
    magnetic: magnetic
  };
})();
