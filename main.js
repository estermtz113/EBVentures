/* ============================================================
   ZETA MUSIC LABEL — scripts
   ============================================================ */

/* ---------- Custom audio player (HOME) ---------- */
(function () {
  const audio    = document.getElementById('zeta-audio');
  if (!audio) return;

  const playBtn  = document.getElementById('play-btn');
  const cover    = document.querySelector('.player-cover');
  const fill     = document.getElementById('progress-fill');
  const bar      = document.getElementById('progress-bar');
  const curEl    = document.getElementById('time-current');
  const durEl    = document.getElementById('time-duration');

  const fmt = (s) => {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  playBtn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {/* no source yet */});
    else audio.pause();
  });

  audio.addEventListener('play', () => {
    playBtn.classList.add('playing');
    cover.classList.add('is-playing');
  });
  audio.addEventListener('pause', () => {
    playBtn.classList.remove('playing');
    cover.classList.remove('is-playing');
  });

  audio.addEventListener('loadedmetadata', () => { durEl.textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', () => {
    const pct = (audio.currentTime / audio.duration) * 100 || 0;
    fill.style.width = pct + '%';
    curEl.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('ended', () => { fill.style.width = '0%'; curEl.textContent = '0:00'; });

  bar.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = bar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });
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
