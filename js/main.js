/* ============================================================
   XETA MUSIC LABEL — scripts
   ============================================================ */

/* ---------- Modern audio player (HOME) ---------- */
(function () {
  const audio = document.getElementById('xeta-audio');
  if (!audio) return;

  const playBtn = document.getElementById('play-btn');
  const bar     = document.getElementById('progress-bar');
  const fill    = document.getElementById('progress-fill');
  const knob    = document.getElementById('progress-knob');
  const curEl   = document.getElementById('time-current');
  const durEl   = document.getElementById('time-duration');
  const titleEl  = document.querySelector('.np-title');
  const artistEl = document.querySelector('.np-artist');
  const tracks   = document.querySelectorAll('.np-track');

  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  function paint() {
    const frac = audio.duration ? audio.currentTime / audio.duration : 0;
    const pct = (frac * 100).toFixed(2) + '%';
    fill.style.width = pct;
    knob.style.left = pct;
    curEl.textContent = fmt(audio.currentTime);
  }

  function seekFromX(clientX) {
    if (!audio.duration) return;
    const rect = bar.getBoundingClientRect();
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
  audio.addEventListener('loadedmetadata', () => { durEl.textContent = fmt(audio.duration); paint(); });
  audio.addEventListener('timeupdate', paint);
  audio.addEventListener('ended', () => { playBtn.classList.remove('playing'); audio.currentTime = 0; paint(); });

  /* click + drag to scrub */
  let dragging = false;
  bar.addEventListener('pointerdown', (e) => { dragging = true; bar.setPointerCapture(e.pointerId); seekFromX(e.clientX); });
  bar.addEventListener('pointermove', (e) => { if (dragging) seekFromX(e.clientX); });
  bar.addEventListener('pointerup',   () => { dragging = false; });
  bar.addEventListener('keydown', (e) => {
    if (!audio.duration) return;
    if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    else if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
    else return;
    e.preventDefault();
    paint();
  });

  /* tracklist: click a row to load it into the player */
  tracks.forEach((row) => {
    row.addEventListener('click', () => {
      audio.src = row.dataset.src;
      if (titleEl)  titleEl.textContent  = row.dataset.title;
      if (artistEl) artistEl.textContent = row.dataset.artist;
      tracks.forEach((t) => t.classList.remove('active'));
      row.classList.add('active');
      fill.style.width = '0%';
      knob.style.left = '0%';
      curEl.textContent = '0:00';
      durEl.textContent = '0:00';
      audio.load();
      audio.play().catch(() => {/* file not added yet */});
    });
  });

  paint();
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
