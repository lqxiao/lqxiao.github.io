// Light-touch interactivity: typing subtitle, scroll reveal, avatar confetti.
// All effects respect prefers-reduced-motion.
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 1. Typing rotator for the hero subtitle ---------- */
    const typeEl = document.getElementById('typed-interests');
    if (typeEl && !reduced) {
      const phrases = [
        'Recursive Self-Improvement',
        'LLM Alignment',
        'Reinforcement Learning',
        'Natural Language Processing',
        'Text Summarization'
      ];
      let pi = 0, ci = 0, deleting = false;
      (function tick() {
        const phrase = phrases[pi];
        ci += deleting ? -1 : 1;
        typeEl.textContent = phrase.slice(0, ci);
        let delay = deleting ? 35 : 75;
        if (!deleting && ci === phrase.length) { delay = 1800; deleting = true; }
        else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
        setTimeout(tick, delay);
      })();
    } else if (typeEl) {
      typeEl.textContent = 'Recursive Self-Improvement';
    }

    /* ---------- BibTeX copy buttons ---------- */
    document.querySelectorAll('.bib-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const src = btn.closest('.pub').querySelector('.bib-src');
        if (!src) return;
        navigator.clipboard.writeText(src.value).then(function () {
          const old = btn.textContent;
          btn.textContent = 'Copied ✓';
          btn.classList.add('copied');
          setTimeout(function () { btn.textContent = old; btn.classList.remove('copied'); }, 1600);
        }).catch(function () {
          // Clipboard API unavailable (e.g. http) — show the entry for manual copy
          src.hidden = !src.hidden;
        });
      });
    });

    /* ---------- 2. Confetti when clicking the profile photo ---------- */
    const photo = document.querySelector('.hero-photo img');
    if (photo) {
      photo.style.cursor = 'pointer';
      photo.title = 'Click me :)';
      let clicks = 0;
      photo.addEventListener('click', function () {
        clicks++;
        if (!reduced) burstConfetti(photo);
        if (clicks === 5) {
          photo.style.transition = 'transform 0.8s cubic-bezier(.2,.8,.2,1.2)';
          photo.style.transform = 'rotate(360deg)';
          setTimeout(function () { photo.style.transform = ''; }, 900);
          clicks = 0;
        }
      });
    }

    function burstConfetti(origin) {
      const canvas = document.createElement('canvas');
      canvas.className = 'confetti-canvas';
      canvas.width = innerWidth; canvas.height = innerHeight;
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const rect = origin.getBoundingClientRect();
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      const colors = ['#1d4ed8', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
      const parts = Array.from({ length: 60 }, function () {
        const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 6;
        return { x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3,
                 s: 3 + Math.random() * 4, c: colors[(Math.random() * colors.length) | 0],
                 r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3 };
      });
      let frames = 0;
      (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        parts.forEach(function (p) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.r += p.vr;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
          ctx.restore();
        });
        if (++frames < 110) requestAnimationFrame(draw);
        else canvas.remove();
      })();
    }

    /* ---------- 4. Konami-style surprise: type "rsi" anywhere ---------- */
    let buffer = '';
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      buffer = (buffer + e.key.toLowerCase()).slice(-3);
      if (buffer === 'rsi' && photo && !reduced) {
        burstConfetti(photo);
        buffer = '';
      }
    });
  });
})();
