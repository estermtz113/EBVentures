# Xeta Music Label — website

Static site: **Home, Videos, Artist, Contact Us**. Just open `index.html` in a browser, or
upload the whole folder to any host (Netlify, GitHub Pages, Vercel, cPanel...).

```
Xeta-music/
├── index.html      Home — banner + music player
├── videos.html     6 YouTube videos
├── artist.html     Artist cards + bio pop-up
├── contact.html    Email form
├── css/styles.css  All styling
├── js/main.js      Player, modal, form logic
├── assets/         Logo, album cover, artist photos (SVG placeholders — replace these)
└── audio/          Drop your track.mp3 here
```

Replace the SVG files in `assets/` with your real logo and photos (keep the same filenames,
or update the `src` in the HTML). For artist photos, `.jpg`/`.png` work fine — just point the
`<img src>` at the new file.

---

## 1. Music player (Home)

Built as a **custom HTML5 audio player** (your own play button, album art, song/artist name,
seek bar). To make it play:

1. Put your file at `audio/track.mp3` (or change the `src` in the `<audio>` tag in `index.html`).
2. Update the song name, artist, and cover image in the `.player` block of `index.html`.

**Why MP3 over SoundCloud?** MP3 gives you full control of the look. If you'd rather host on
SoundCloud and keep a custom button, use the SoundCloud Widget API instead: embed a hidden
SoundCloud iframe and control it with `SC.Widget(iframe).play()` / `.pause()`. It works, but it's
more setup and you depend on SoundCloud being up. The MP3 route is simpler and fully yours.

---

## 2. Videos page — making the top 6 automatic

Right now the page has **6 manual embeds**. Replace each `VIDEO_ID_n` in `videos.html` with a real
YouTube ID (the part after `watch?v=`). Zero setup, but you update it by hand.

**To make it automatic** (pull the 6 newest videos from your channel) you need the free
**YouTube Data API v3**:

1. Create a project at <https://console.cloud.google.com>, enable *YouTube Data API v3*, make an API key.
2. Find your channel's **uploads playlist ID** (it's your channel ID with `UC` → `UU`).
3. Drop this into `videos.html` (replace the static grid):

```html
<script>
const API_KEY = 'AIzaSyAd_rF15hF7Em-x9Jctn0BlI1FO6LK8T5c';
const UPLOADS = 'UU0CqEw42SWBKOrhz3zh_h6Q'; // starts with UU...
const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=6&playlistId=${UPLOADS}&key=${API_KEY}`;

fetch(url).then(r => r.json()).then(data => {
  document.getElementById('video-grid').innerHTML = data.items.map(item => {
    const id = item.snippet.resourceId.videoId;
    const title = item.snippet.title;
    return `<article class="video-card">
      <div class="video-embed">
        <iframe src="https://www.youtube.com/embed/${id}" allowfullscreen loading="lazy"></iframe>
      </div>
      <div class="video-info"><h3>${title}</h3><p>Xeta Music Label</p></div>
    </article>`;
  }).join('');
});
</script>
```

Notes: "top" = **most recent 6** with this snippet. For **most-viewed**, you'd query the `search`
endpoint with `order=viewCount`. Heads up — your API key is visible in client-side code, so in the
Google Console restrict it to your website's domain (HTTP referrer restriction).

---

## 3. Contact form

The form posts to **Formspree** (free, no backend needed):

1. Sign up at <https://formspree.io>, create a form, copy your form ID.
2. In `contact.html`, replace `YOUR_FORM_ID` in the `action="https://formspree.io/f/YOUR_FORM_ID"`.

Until you do that, the form shows a "not configured yet" message instead of failing silently.
The JS submits in the background so the page doesn't reload, and shows a success/error line.

**No-signup fallback:** change the form to a simple `mailto:` — set
`action="mailto:hello@Xetamusic.com" method="POST"`. This opens the visitor's email app instead
of sending from the site (clunkier, but zero setup).
```
