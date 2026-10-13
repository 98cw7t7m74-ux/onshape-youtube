import './style.css';

const $ = (id) => document.getElementById(id);
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
  const ref = parseYouTube(q);
  if (ref) play(ref);
  else $('msg').textContent = "That doesn't look like a YouTube link.";
});
