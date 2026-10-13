import './style.css';

const $ = (id) => document.getElementById(id);
// Onshape passes documentId/elementId in the query string; remember one link per document.
const params = new URLSearchParams(location.search);
const storageKey = `link:${params.get('documentId') || 'default'}:${params.get('elementId') || ''}`;
const store = {
  get: () => { try { return localStorage.getItem(storageKey) || ''; } catch { return ''; } },
  set: (v) => { try { localStorage.setItem(storageKey, v); } catch { /* storage unavailable */ } },
};

// Extract a video or playlist reference from a pasted URL / bare ID.
export function parseYouTube(input) {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return { video: s };
  let u;
  try { u = new URL(/^https?:\/\//.test(s) ? s : `https://${s}`); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') return { video: u.pathname.slice(1, 12) };
  if (host === 'youtube.com' || host === 'music.youtube.com') {
    const v = u.searchParams.get('v');
    const list = u.searchParams.get('list');
    if (v) return { video: v, list };
    if (list) return { list };
    const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/);
    if (m) return { video: m[1] };
  }
  return null;
}

// Edpuzzle sends X-Frame-Options: SAMEORIGIN, so it can't be embedded; open it in a popup window instead.
export function parseEdpuzzle(input) {
  try {
    const u = new URL(/^https?:\/\//.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
    const host = u.hostname.replace(/^www\./, '');
    return host === 'edpuzzle.com' || host.endsWith('.edpuzzle.com') ? u.href : null;
  } catch { return null; }
}

function openEdpuzzle(href) {
  const w = window.open(href, 'edpuzzle', 'popup,width=1100,height=750');
  $('player-wrap').hidden = true;
  $('player').src = 'about:blank';
  $('msg').textContent = w
    ? 'Edpuzzle opened in a separate window (it can\u2019t be shown inside Onshape).'
    : 'Your browser blocked the popup. Allow popups for this page and press Go again.';
}

function play({ video, list }) {
  const base = video ? `https://www.youtube-nocookie.com/embed/${video}` : 'https://www.youtube-nocookie.com/embed/videoseries';
  const params = new URLSearchParams({ autoplay: '1', rel: '0' });
  if (list) params.set('list', list);
  $('player').src = `${base}?${params}`;
  $('player-wrap').hidden = false;
  $('msg').textContent = '';
}

$('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('q').value.trim();
  if (!q) return;
  const ed = parseEdpuzzle(q);
  const ref = ed ? null : parseYouTube(q);
  if (ed) { store.set(q); openEdpuzzle(ed); }
  else if (ref) { store.set(q); play(ref); }
  else $('msg').textContent = "That doesn't look like a YouTube or Edpuzzle link.";
});

// Restore this document's last link. YouTube auto-loads; Edpuzzle needs a click (popups need a user gesture).
const saved = store.get();
if (saved) {
  $('q').value = saved;
  if (parseEdpuzzle(saved)) $('msg').textContent = 'Press Go to reopen your saved Edpuzzle link.';
  else { const ref = parseYouTube(saved); if (ref) play(ref); }
}
