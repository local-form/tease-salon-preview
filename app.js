(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const RM = matchMedia('(prefers-reduced-motion: reduce)');

  // Typical times are estimates (medium length); d = minutes added for short (-) / long (+).
  const LOOKS = [
    { id: 'red-curls', name: 'Red curls', svc: 'Vivid colour + curly cut', group: 'colour', len: 'medium', min: 210, d: 30, sw: '#8a1f2a' },
    { id: 'sunlit-balayage', name: 'Sunlit balayage', svc: 'Balayage + blowout', group: 'colour', len: 'long', min: 180, d: 30, sw: '#b48a5e' },
    { id: 'copper', name: 'Copper gloss', svc: 'All-over colour', group: 'colour', len: 'long', min: 120, d: 20, sw: '#c2501f' },
    { id: 'bridal-waves', name: 'Bridal waves', svc: 'Bridal & event styling', group: 'bridal', len: 'long', min: 90, d: 15, sw: '#6b5848' },
    { id: 'midnight-blue', name: 'Midnight blue', svc: 'Vivid colour', group: 'colour', len: 'medium', min: 210, d: 30, sw: '#1e2a78' },
    { id: 'icy-blonde', name: 'Icy blonde', svc: 'Highlights / balayage', group: 'colour', len: 'long', min: 180, d: 30, sw: '#cfc3ad' },
    { id: 'pink-bangs', name: 'Pink with bangs', svc: 'Vivid colour + cut', group: 'colour', len: 'medium', min: 225, d: 30, sw: '#c2366a' },
    { id: 'soft-layers', name: 'Soft layers', svc: 'Cut & blowout', group: 'cut', len: 'long', min: 60, d: 15, sw: '#a87a5c' },
    { id: 'brunette-dimension', name: 'Brunette dimension', svc: 'Highlights', group: 'colour', len: 'long', min: 165, d: 30, sw: '#5a3f2e' },
    { id: 'loose-waves', name: 'Loose waves', svc: 'Blowout & style', group: 'cut', len: 'long', min: 45, d: 15, sw: '#6e5843' },
    { id: 'half-up-bridal', name: 'Half-up bridal', svc: 'Bridal & event styling', group: 'bridal', len: 'long', min: 90, d: 15, sw: '#4a3a31' },
    { id: 'glossy-straight', name: 'Glossy straight', svc: 'Highlights + blowout', group: 'colour', len: 'long', min: 180, d: 30, sw: '#3d3230' },
    { id: 'bronde-lob', name: 'Bronde lob', svc: 'Balayage + cut', group: 'colour', len: 'medium', min: 180, d: 30, sw: '#8c6b52' },
    { id: 'bright-blonde', name: 'Bright blonde', svc: 'Highlights', group: 'colour', len: 'medium', min: 150, d: 30, sw: '#d6a77a' }
  ];
  const TILES = {
    ext: { id: 'extensions', name: 'Extensions', svc: 'Extensions consultation (method and colour match)', group: 'ext', len: 'long', min: 30, d: 0, sw: '#5f9a3e', img: null },
    own: { id: 'own-look', name: 'Your own look', svc: 'Consultation: bring a photo', group: 'own', len: 'medium', min: 30, d: 0, sw: '#ffffff', img: null }
  };
  const ALL = [...LOOKS, TILES.ext, TILES.own];
  const byId = id => ALL.find(l => l.id === id);

  // Services for the booking dropdown (typical times at medium length, d = +/- for long/short).
  const SERVICES = [
    { label: 'Haircut & blowout', min: 60, d: 15 },
    { label: 'Curly cut', min: 75, d: 15 },
    { label: 'Blowout & style', min: 45, d: 15 },
    { label: 'All-over colour', min: 120, d: 20 },
    { label: 'Highlights / balayage', min: 180, d: 30 },
    { label: 'Vivid colour', min: 210, d: 30 },
    { label: 'Platinum back to natural', min: 210, d: 30 },
    { label: 'Bridal & event styling', min: 90, d: 15 },
    { label: 'Keratin treatment', min: 150, d: 30 },
    { label: 'Deep conditioning', min: 30, d: 0 },
    { label: 'Scalp rejuvenation', min: 45, d: 0 },
    { label: 'Extensions consultation (method and colour match)', min: 30, d: 0 },
    { label: 'Consultation: bring a photo', min: 30, d: 0 }
  ];
  const lookSvc = l => ({ label: l.svc, min: l.min, d: l.d });
  const start = byId(new URLSearchParams(location.search).get('look')) || LOOKS[0];
  const state = { look: start, svc: lookSvc(start), len: start.len };

  const minutes = () => {
    const v = state.svc; if (!v.d) return v.min;
    return v.min + (state.len === 'short' ? -v.d : state.len === 'long' ? v.d : 0);
  };
  const fmt = m => {
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60), q = m % 60;
    const frac = q >= 45 ? '¾' : q >= 30 ? '½' : q >= 15 ? '¼' : '';
    return h + frac + (h === 1 && !frac ? ' hr' : ' hrs');
  };
  window.TEASE = { state, minutes, fmt, LOOKS, SERVICES, byId };

  // ---------- the wall ----------
  const wall = $('#wall');
  // The first 6 looks are on the first phone screen: load them right away, the first 2 at high priority.
  const card = (l, i) => `<button type="button" class="look" role="option" data-id="${l.id}" aria-selected="false" aria-label="${l.name}: ${l.svc}">
      <img src="${IMG[l.id][0]}" srcset="${IMG[l.id][0]} 480w${IMG[l.id][1] ? `, ${IMG[l.id][1]} 800w` : ''}" sizes="(min-width:1024px) 16vw, 148px" alt="${l.name}, real work from Tease Salon" width="480" height="600" loading="${i < 6 ? 'eager' : 'lazy'}"${i < 2 ? ' fetchpriority="high"' : ''} decoding="async">
      <span class="look-tag"><span class="sw" style="background:${l.sw}"></span>${l.name}</span></button>`;
  const extTile = `<button type="button" class="tile tile-ext" role="option" data-id="extensions" aria-selected="false"><b>Extensions</b><small>Clip-in, tape, microlinks, weft, keratin tip</small><span class="tile-go">Book a consult →</span></button>`;
  const ownTile = `<button type="button" class="tile tile-own" role="option" data-id="own-look" aria-selected="false"><b>Your own look</b><span class="tile-go">Bring a photo →</span></button>`;
  // Every photo file, written out in full (480 px always; 800 px where the original was big enough).
  const IMG = {
    'red-curls': ['assets/red-curls-480.webp', 'assets/red-curls-800.webp'],
    'sunlit-balayage': ['assets/sunlit-balayage-480.webp', 'assets/sunlit-balayage-800.webp'],
    'copper': ['assets/copper-480.webp'],
    'bridal-waves': ['assets/bridal-waves-480.webp', 'assets/bridal-waves-800.webp'],
    'midnight-blue': ['assets/midnight-blue-480.webp'],
    'icy-blonde': ['assets/icy-blonde-480.webp', 'assets/icy-blonde-800.webp'],
    'pink-bangs': ['assets/pink-bangs-480.webp'],
    'soft-layers': ['assets/soft-layers-480.webp', 'assets/soft-layers-800.webp'],
    'brunette-dimension': ['assets/brunette-dimension-480.webp', 'assets/brunette-dimension-800.webp'],
    'loose-waves': ['assets/loose-waves-480.webp', 'assets/loose-waves-800.webp'],
    'half-up-bridal': ['assets/half-up-bridal-480.webp'],
    'glossy-straight': ['assets/glossy-straight-480.webp', 'assets/glossy-straight-800.webp'],
    'bronde-lob': ['assets/bronde-lob-480.webp', 'assets/bronde-lob-800.webp'],
    'bright-blonde': ['assets/bright-blonde-480.webp']
  };
  const thumbOf = l => IMG[l.id] ? IMG[l.id][0] : IMG[l.group === 'ext' ? 'icy-blonde' : 'loose-waves'][0];

  const desk = matchMedia('(min-width:1024px)');
  function buildWall() {
    if (desk.matches) {
      const cols = [[], [], []];
      const items = [...LOOKS.map(card)];
      items.splice(4, 0, extTile); items.splice(11, 0, ownTile);
      items.forEach((h, i) => cols[i % 3].push(h));
      const durs = [74, 88, 80];
      // each column twice for a seamless loop; the copy is hidden from assistive tech
      wall.innerHTML = cols.map((c, i) => `<div class="col" style="--dur:${durs[i]}s">${c.join('')}<div class="col-copy" aria-hidden="true" style="display:contents">${c.join('').replace(/role="option"/g, 'tabindex="-1"')}</div></div>`).join('');
      wall.querySelectorAll('.col-copy img').forEach(i => i.alt = '');
    } else {
      const items = LOOKS.map(card);
      items.splice(5, 0, extTile); items.push(ownTile);
      wall.innerHTML = items.join('');
    }
    if (desk.matches) wall.querySelectorAll('.look img').forEach(i => { i.loading = 'eager'; });
    paint();
  }

  function paint() {
    const l = state.look, t = minutes();
    wall.querySelectorAll('[data-id]').forEach(b => b.setAttribute('aria-selected', b.dataset.id === l.id ? 'true' : 'false'));
    const img = $('#t-img');
    img.style.backgroundImage = `url(${thumbOf(l)})`;
    img.setAttribute('aria-label', l.name);
    $('#t-name').textContent = l.name;
    $('#t-svc').textContent = state.svc.label; $('#t-svc-m').textContent = ' · ' + state.svc.label;
    $('#t-sw').style.background = l.sw;
    $('#t-time').textContent = (l.d ? '' : '') + fmt(t);
    document.querySelectorAll('.len button').forEach(b => {
      b.setAttribute('aria-checked', b.dataset.len === state.len ? 'true' : 'false');
      b.disabled = !state.svc.d;
    });
    document.dispatchEvent(new CustomEvent('tease:change'));
  }

  function pick(id) {
    const l = byId(id); if (!l) return;
    state.look = l; state.svc = lookSvc(l); state.len = l.len; paint();
    const tk = $('#ticket'); tk.classList.remove('bump'); void tk.offsetWidth; tk.classList.add('bump');
  }

  wall.addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) pick(b.dataset.id); });
  document.querySelectorAll('.len button').forEach(b => b.addEventListener('click', () => { state.len = b.dataset.len; paint(); }));

  // pause drifting columns when the hero is off screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => wall.classList.toggle('paused', !e.isIntersecting))).observe(wall);
  }
  desk.addEventListener('change', buildWall);
  buildWall();

  // ---------- booking ----------
  // Hours from Google (checked 2026-11-08). [open, close] in minutes after midnight; Sunday closed.
  const HOURS = { 0: null, 1: [600, 1020], 2: [540, 1020], 3: [540, 1020], 4: [480, 1020], 5: [480, 900], 6: [480, 900] };
  const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAYL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const clock = m => { const h = Math.floor(m / 60), mm = m % 60, h12 = ((h + 11) % 12) + 1; return h12 + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h < 12 ? ' am' : ' pm'); };
  const nyNow = () => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).reduce((o, x) => (o[x.type] = x.value, o), {});
    return { y: +p.year, mo: +p.month - 1, d: +p.day, min: +p.hour * 60 + +p.minute };
  };
  const now = nyNow();
  const days = [];
  for (let i = 1; days.length < 12 && i < 30; i++) {
    const dt = new Date(Date.UTC(now.y, now.mo, now.d + i, 12));
    const wd = dt.getUTCDay(); if (!HOURS[wd]) continue;
    days.push({ wd, date: dt.getUTCDate(), mon: dt.getUTCMonth() });
  }
  const bk = { day: days[0], time: null, sty: 'No preference' };
  const sel = $('#b-svc');
  const fillSelect = () => {
    const own = lookSvc(state.look);
    sel.innerHTML = [`<option value="look">${own.label}</option>`]
      .concat(SERVICES.map((v, i) => v.label === own.label ? '' : `<option value="${i}">${v.label}</option>`)).join('');
    sel.value = state.svc.label === own.label ? 'look' : String(SERVICES.findIndex(v => v.label === state.svc.label));
  };
  sel.addEventListener('change', () => { state.svc = sel.value === 'look' ? lookSvc(state.look) : SERVICES[+sel.value]; paint(); });

  const dayBox = $('#b-days');
  dayBox.innerHTML = days.map((d, i) => `<button type="button" role="radio" data-i="${i}" aria-checked="${i === 0}" aria-label="${DAYL[d.wd]} ${MON[d.mon]} ${d.date}"><span>${DAYN[d.wd]}</span><b>${d.date}</b><span>${MON[d.mon]}</span></button>`).join('');
  dayBox.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; bk.day = days[+b.dataset.i]; renderBooking(); });
  $('#b-sty').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; bk.sty = b.dataset.v; renderBooking(); });
  const timeBox = $('#b-times');
  timeBox.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; bk.time = +b.dataset.m; renderBooking(); });

  function slots() {
    const [o, c] = HOURS[bk.day.wd], need = minutes(), out = [];
    for (let m = o; m + need <= c; m += 30) out.push(m);
    return out;
  }
  function renderBooking() {
    const l = state.look, t = minutes();
    const img = $('#b-img'); img.style.backgroundImage = `url(${thumbOf(l)})`; img.setAttribute('aria-label', l.name);
    $('#b-name').textContent = l.name;
    $('#b-time').textContent = fmt(t);
    fillSelect();
    dayBox.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', days[+b.dataset.i] === bk.day ? 'true' : 'false'));
    $('#b-sty').querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', b.dataset.v === bk.sty ? 'true' : 'false'));
    const [o, c] = HOURS[bk.day.wd], s = slots();
    if (bk.time != null && !s.includes(bk.time)) bk.time = null;
    $('#b-fit').innerHTML = s.length
      ? `Open ${clock(o)}–${clock(c)} · last start <b>${clock(s[s.length - 1])}</b>`
      : `Too long for ${DAYL[bk.day.wd]}’s hours. Pick another day or call.`;
    timeBox.innerHTML = s.map(m => `<button type="button" role="radio" data-m="${m}" aria-checked="${m === bk.time}">${clock(m)}</button>`).join('');
  }
  document.addEventListener('tease:change', renderBooking);
  renderBooking();

  const form = $('#bk'), err = $('#b-err'), done = $('#b-done');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nm = $('#b-nm').value.trim(), ph = $('#b-ph').value.replace(/\D/g, '');
    const miss = [];
    if (bk.time == null) miss.push('a start time');
    if (!nm) miss.push('your name');
    if (ph.length < 10) miss.push('a mobile number');
    if (miss.length) { err.textContent = 'Add ' + miss.join(', ').replace(/, ([^,]*)$/, ' and $1') + ' first.'; err.hidden = false; return; }
    err.hidden = true;
    const d = bk.day, notes = $('#b-notes').value.trim();
    $('#b-sum').textContent = `${state.look.name}: ${state.svc.label}, ${state.svc.d ? state.len + ' hair, ' : ''}about ${fmt(minutes())}. ${bk.sty === 'No preference' ? 'Any stylist' : 'With ' + bk.sty}, ${DAYL[d.wd]} ${MON[d.mon]} ${d.date} at ${clock(bk.time)}, for ${nm}.` + (notes ? ` Note: “${notes}”` : '');
    form.hidden = true; done.hidden = false; done.focus();
  });
  $('#b-again').addEventListener('click', () => { done.hidden = true; form.hidden = false; $('#b-nm').focus(); });

  // phone: tuck the floating ticket away once the booking is on screen
  const ticket = $('#ticket');
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => ticket.classList.toggle('away', e.isIntersecting || e.boundingClientRect.top < 0)), { rootMargin: '0px 0px -30% 0px' }).observe($('#book'));

  // open now (Visit)
  (() => {
    const wd = new Date(Date.UTC(now.y, now.mo, now.d, 12)).getUTCDay(), h = HOURS[wd];
    const row = document.querySelector(`.hours tr[data-d="${wd}"]`); if (row) row.classList.add('today');
    const on = h && now.min >= h[0] && now.min < h[1];
    const el = $('#open-now'); el.classList.toggle('is-open', !!on);
    el.innerHTML = '<span class="dot"></span>' + (on ? `Open now · until ${clock(h[1])}` : 'Closed now' + (h && now.min < h[0] ? ` · opens ${clock(h[0])}` : ''));
  })();

  // ---------- top bar: real height for scroll offsets, phone menu ----------
  const bar = $('.top');
  const setBar = () => document.documentElement.style.setProperty('--bar', bar.offsetHeight + 'px');
  setBar(); addEventListener('resize', setBar, { passive: true });
  const menuBtn = $('.menu-btn'), html = document.documentElement;
  const setMenu = open => { html.classList.toggle('nav-open', open); menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  menuBtn.addEventListener('click', () => setMenu(!html.classList.contains('nav-open')));
  $('#nav').addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && html.classList.contains('nav-open')) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener('click', e => { if (html.classList.contains('nav-open') && !e.target.closest('.top')) setMenu(false); });
  desk.addEventListener('change', () => setMenu(false));

  // ---------- reveal ----------
  (() => {
    const els = [...document.querySelectorAll('[data-reveal]')];
    if (RM.matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
    const n = new Map();
    els.forEach(e => { const p = e.parentElement, i = n.get(p) || 0; e.style.setProperty('--d', i * .08 + 's'); n.set(p, i + 1); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
    setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-visible'); }), 1500);
  })();
})();
