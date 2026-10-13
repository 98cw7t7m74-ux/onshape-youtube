import './style.css';

const $ = (id) => document.getElementById(id);
const store = {
  get: (k) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
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

function play({ video, list }) {
  const base = video ? `https://www.youtube-nocookie.com/embed/${video}` : 'https://www.youtube-nocookie.com/embed/videoseries';
  const params = new URLSearchParams({ autoplay: '1', rel: '0' });
  if (list) params.set('list', list);
  $('player').src = `${base}?${params}`;
  $('player-wrap').hidden = false;
  $('msg').textContent = '';
}

async function search(q) {
  const key = store.get('yt_api_key');
  if (!key) {
    $('msg').textContent = 'Paste a YouTube link, or click ⚙ and add an API key to enable search.';
    return;
  }
  $('msg').textContent = 'Searching…';
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.search = new URLSearchParams({ part: 'snippet', type: 'video', maxResults: '12', videoEmbeddable: 'true', q, key });
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || res.statusText);
    $('msg').textContent = data.items.length ? '' : 'No results.';
    const ul = $('results');
    ul.replaceChildren(...data.items.map((it) => {
      const li = document.createElement('li');
      const img = document.createElement('img');
      img.src = it.snippet.thumbnails.default.url;
      img.alt = '';
      const span = document.createElement('span');
      span.textContent = it.snippet.title;
      li.append(img, span);
      li.addEventListener('click', () => play({ video: it.id.videoId }));
      return li;
    }));
  } catch (e) {
    $('msg').textContent = `Search failed: ${e.message}`;
  }
}

$('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('q').value.trim();
  if (!q) return;
  const ref = parseYouTube(q);
  if (ref) { $('results').replaceChildren(); play(ref); } else { search(q); }
});
$('settings-btn').addEventListener('click', () => { $('settings').hidden = !$('settings').hidden; });
$('key').value = store.get('yt_api_key');
$('save-key').addEventListener('click', () => {
  store.set('yt_api_key', $('key').value.trim());
  $('settings').hidden = true;
});
