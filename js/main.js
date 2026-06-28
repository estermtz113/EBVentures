/* ============================================================
   ZETA MUSIC LABEL — scripts
   ============================================================ */

/* ---------- Waveform audio player (HOME) ---------- */
(function () {
  const audio = document.getElementById('zeta-audio');
  if (!audio) return;

  const playBtn = document.getElementById('play-btn');
  const wave    = document.getElementById('wave');

  /* Build a deterministic pseudo-waveform.
     Swap this for real audio analysis later if you want exact bars. */
  let bars = [];
  function buildWave() {
    wave.innerHTML = '';
    bars = [];
    const count = Math.max(40, Math.min(120, Math.floor(wave.clientWidth / 7)));
    for (let i = 0; i < count; i++) {
      const b = document.createElement('span');
      b.className = 'bar';
      // layered sines + a little jitter give a lively, music-like shape
      const base =
        0.5 +
        0.32 * Math.sin(i * 0.45) +
        0.18 * Math.sin(i * 1.7 + 1) +
        0.12 * Math.sin(i * 0.13);
      const jitter = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
      let h = Math.abs(base) * 0.7 + jitter * 0.3;
      h = Math.max(0.12, Math.min(1, h));
      b.style.height = (h * 100) + '%';
      wave.appendChild(b);
      bars.push(b);
    }
    paint();
  }

  function paint() {
    const frac = audio.duration ? audio.currentTime / audio.duration : 0;
    const cut = Math.round(frac * bars.length);
    bars.forEach((b, i) => b.classList.toggle('on', i < cut));
  }

  function seekFromX(clientX) {
    if (!audio.duration) return;
    const rect = wave.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = frac * audio.duration;
    paint();
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {/* no file at audio/track.mp3 yet */});
    else audio.pause();
  });

  audio.addEventListener('play',  () => playBtn.classList.add('playing'));
  audio.addEventListener('pause', () => playBtn.classList.remove('playing'));
  audio.addEventListener('timeupdate', paint);
  audio.addEventListener('ended', () => { playBtn.classList.remove('playing'); paint(); });

  wave.addEventListener('click', (e) => seekFromX(e.clientX));
  wave.addEventListener('keydown', (e) => {
    if (!audio.duration) return;
    if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    else if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
    else return;
    e.preventDefault();
    paint();
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildWave, 200); });
  buildWave();
})();

/* ---------- Artist modal (ARTIST) ---------- */
(function () {
  const cards = document.querySelectorAll('[data-artist]');
  const modal = document.getElementById('artist-modal');
  if (!cards.length || !modal) return;

  const mImg  = modal.querySelector('.modal-card img');
  const mName = modal.querySelector('h3');
  const mRole = modal.querySelector('.role');
  const mBio  = modal.querySelector('p');
  const closeBtn = modal.querySelector('.modal-close');

  const open = (card) => {
    mImg.src       = card.querySelector('img').src;
    mName.textContent = card.dataset.name;
    mRole.textContent = card.dataset.role;
    mBio.textContent  = card.dataset.bio;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  cards.forEach((c) => c.addEventListener('click', () => open(c)));
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

/* ---------- Contact form (CONTACT) ---------- */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    // If the action still points at the Formspree placeholder, stop and warn.
    if (form.action.includes('YOUR_FORM_ID')) {
      e.preventDefault();
      status.textContent = 'Form not configured yet — add your Formspree ID (see instructions).';
      status.className = 'form-status err';
      return;
    }

    // Progressive enhancement: submit via fetch so the page doesn't reload.
    e.preventDefault();
    status.textContent = 'Sending…';
    status.className = 'form-status';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        status.textContent = 'Thanks — your message is on its way.';
        status.className = 'form-status ok';
        form.reset();
      } else {
        throw new Error('bad response');
      }
    } catch (err) {
      status.textContent = 'Something went wrong. Please email us directly instead.';
      status.className = 'form-status err';
    }
  });
})();
