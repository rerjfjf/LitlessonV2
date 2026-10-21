(() => {
'use strict';

/* ================= утилиты ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem('vs_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('vs_' + k, JSON.stringify(v)); } catch (e) {} }
};
function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
function img(src, alt) {
  const i = document.createElement('img');
  i.src = src; i.alt = alt || ''; i.loading = 'lazy';
  i.addEventListener('error', () => i.classList.add('img-missing'));
  return i;
}
const COLORS = ['#FFB02E', '#2FD3A3', '#FF7EB6', '#38BDF8', '#BDA8FF', '#FF8A5B', '#F2503B'];

/* ================= звук ================= */
let soundOn = true, ac = null;
function actx() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (ac && ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(freq, t0, dur, type = 'sine', vol = .15) {
  const a = actx(); if (!a || !soundOn) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .03);
}
const sfx = {
  ok() { [523, 659, 784].forEach((f, i) => tone(f, i * .09, .28, 'triangle')); },
  bad() { tone(190, 0, .3, 'square', .06); },
  knock() { [0, .22, .44].forEach(t => { tone(120, t, .14, 'sine', .4); tone(75, t, .14, 'sine', .4); }); },
  ding() { tone(880, 0, .6); tone(1320, .15, .7); },
  pop() { tone(660, 0, .12, 'triangle', .1); }
};

/* ================= конфетти ================= */
const cv = $('#confetti'), cx = cv.getContext('2d');
let parts = [], raf = 0;
function fit() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', fit); fit();
function confetti(n = 150, ox, oy) {
  if (rm) return;
  for (let i = 0; i < n; i++) {
    parts.push({ x: ox ?? innerWidth / 2, y: oy ?? innerHeight * .65, vx: (Math.random() - .5) * 16, vy: -Math.random() * 15 - 4,
      g: .36, s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .4,
      c: COLORS[Math.floor(Math.random() * COLORS.length)], life: 0 });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  for (const p of parts) {
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr; p.life++;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); cx.restore();
  }
  parts = parts.filter(p => p.y < innerHeight + 30 && p.life < 240);
  if (parts.length) raf = requestAnimationFrame(tick); else { raf = 0; cx.clearRect(0, 0, cv.width, cv.height); }
}

/* ================= картинки ================= */
$$('img').forEach(i => {
  i.addEventListener('error', () => i.classList.add('img-missing'));
  if (i.complete && i.naturalWidth === 0) i.classList.add('img-missing');
});

/* ================= заголовок героя: окна загораются ================= */
(function title() {
  const t = $('#heroTitle'); let i = 0;
  $$('.w', t).forEach(w => {
    const txt = w.textContent; w.textContent = '';
    [...txt].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; w.appendChild(s); });
  });
  requestAnimationFrame(() => t.classList.add('lit'));
})();

/* ================= ночная сцена ================= */
const NS = 'http://www.w3.org/2000/svg';
function el(n, a, p) { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
(function scene() {
  const r = rng(11);
  const stars = $('#stars');
  for (let i = 0; i < 90; i++) {
    el('circle', { cx: r() * 1600, cy: r() * 330, r: (r() * 1.8 + .4).toFixed(2), fill: '#fff', opacity: (.5 + r() * .5).toFixed(2),
      class: r() < .4 ? 'tw' : '', style: `animation-delay:${(r() * 3).toFixed(2)}s` }, stars);
  }
  const town = $('#town'), cols = ['#2B2F82', '#34388F', '#3B2F86', '#272C70'];
  let x = -30;
  while (x < 1620) {
    const w = 80 + r() * 90, h = 150 + r() * 220, y = 590 - h;
    if (x + w > 1030 && x < 1320) { x = 1320; continue; }
    el('rect', { x, y, width: w, height: h, fill: cols[Math.floor(r() * cols.length)] }, town);
    if (r() < .5) el('polygon', { points: `${x - 6},${y} ${x + w / 2},${y - 34} ${x + w + 6},${y}`, fill: '#1D2266' }, town);
    for (let wy = y + 18; wy < 560; wy += 36) for (let wx = x + 14; wx < x + w - 26; wx += 30) {
      const lit = r() < .32;
      el('rect', { x: wx, y: wy, width: 14, height: 20, rx: 2, fill: lit ? '#FFB02E' : '#161A55',
        class: lit && r() < .18 ? 'fl' : '', style: `animation-delay:${(r() * 5).toFixed(2)}s` }, town);
    }
    x += w + 8;
  }
  const sl = $('#sleepers');
  for (let sx = 0; sx < 1600; sx += 26) el('rect', { x: sx, y: 600, width: 9, height: 38, fill: '#241C66' }, sl);
  for (let c = 0; c < 4; c++) {
    const g = $('#car' + c), ox = c * 245;
    el('rect', { x: ox, y: 536, width: 235, height: 68, rx: 9, fill: '#12A37F', stroke: '#0B4F3C', 'stroke-width': 3 }, g);
    el('rect', { x: ox, y: 582, width: 235, height: 8, fill: '#E2402A' }, g);
    for (let k = 0; k < 5; k++) el('rect', { x: ox + 14 + k * 43, y: 546, width: 31, height: 28, rx: 4, fill: '#FFD27A' }, g);
    el('circle', { cx: ox + 40, cy: 606, r: 9, fill: '#15153B' }, g);
    el('circle', { cx: ox + 195, cy: 606, r: 9, fill: '#15153B' }, g);
    if (c === 3) el('polygon', { points: `${ox + 235},536 ${ox + 262},580 ${ox + 262},604 ${ox + 235},604`, fill: '#0F8E6E', stroke: '#0B4F3C', 'stroke-width': 3 }, g);
  }
})();

(function sceneFit() {
  const svg = $('#scene');
  const set = () => svg.setAttribute('preserveAspectRatio', innerWidth < 700 ? 'xMaxYMax slice' : 'xMidYMax slice');
  set(); addEventListener('resize', set);
})();

/* ================= стук в окно ================= */
const bubble = $('#bubble'), knockBtn = $('#knockBtn');
const KNOCK_LINES = ['Кто там?', 'Мы опоздали на электричку. Можно у вас переночевать?', 'Проходите, чего стоять на пороге.'];
let knocks = 0, bubbleTimer;
function say(txt) {
  bubble.textContent = txt; bubble.classList.add('on');
  clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => bubble.classList.remove('on'), 3800);
}
function enterHouse() {
  let w = $('.lightwash');
  if (!w) { w = document.createElement('div'); w.className = 'lightwash'; document.body.appendChild(w); }
  w.classList.remove('on'); void w.offsetWidth; w.classList.add('on');
  sfx.ok();
  setTimeout(() => { $('#plan').scrollIntoView({ behavior: rm ? 'auto' : 'smooth' }); }, 380);
  setTimeout(() => w.classList.remove('on'), 1000);
}
function knock() {
  if (knocks >= KNOCK_LINES.length) { enterHouse(); return; }
  sfx.knock();
  const w = $('#knockWin'); w.classList.remove('knockshake'); void w.getBoundingClientRect(); w.classList.add('knockshake');
  say(KNOCK_LINES[knocks]); knocks++;
  if (knocks >= KNOCK_LINES.length) knockBtn.textContent = 'Войти в дом';
}
knockBtn.addEventListener('click', knock);
const kw = $('#knockWin');
kw.addEventListener('click', knock);
kw.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); knock(); } });

/* ================= редактируемые поля ================= */
$$('.meta dd').forEach(d => {
  const saved = store.get('meta_' + d.dataset.key, null);
  if (saved) d.textContent = saved;
  d.addEventListener('input', () => store.set('meta_' + d.dataset.key, d.textContent.trim()));
  d.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); d.blur(); } });
});

/* ================= шапка: прогресс и активная станция ================= */
const SEC_IDS = ['start', 'plan', 'enter', 'author', 'heroes', 'plot', 'who', 'roles', 'film', 'quiz', 'debate', 'cinquain', 'finale'];
const secs = SEC_IDS.map(id => document.getElementById(id));
const links = $$('.route__nav a'), nav = $('.route__nav');
const fill = $('#routeFill'), train = $('#routeTrain');
let curId = '';
function onScroll() {
  const y = scrollY + innerHeight * .35; let cur = secs[0];
  secs.forEach(s => { if (s.offsetTop <= y) cur = s; });
  if (cur.id !== curId) {
    curId = cur.id;
    links.forEach(a => {
      const on = a.dataset.st === curId; a.classList.toggle('on', on);
      if (on) nav.scrollTo({ left: a.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
    });
  }
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, scrollY / max) : 0;
  fill.style.width = p * 100 + '%'; train.style.left = p * 100 + '%';
}
addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

/* ================= кнопки режимов ================= */
const btnSound = $('#btnSound'), btnNotes = $('#btnNotes'), btnPresent = $('#btnPresent');
function setPressed(b, v) { b.setAttribute('aria-pressed', String(v)); }
function toggleSound() { soundOn = !soundOn; setPressed(btnSound, soundOn); btnSound.textContent = soundOn ? 'Звук' : 'Тихо'; if (soundOn) sfx.pop(); }
function toggleNotes() { const v = document.body.classList.toggle('teacher'); setPressed(btnNotes, v); }
function togglePresent() { const v = document.body.classList.toggle('present'); setPressed(btnPresent, v); }
btnSound.addEventListener('click', toggleSound);
btnNotes.addEventListener('click', toggleNotes);
btnPresent.addEventListener('click', togglePresent);
addEventListener('keydown', e => {
  const t = e.target;
  if (t.closest && t.closest('input,select,textarea,[contenteditable="true"]')) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === 't' || k === 'е') toggleNotes();
  else if (k === 'p' || k === 'з') togglePresent();
  else if (k === 'm' || k === 'ь') toggleSound();
});

/* ================= таймер преподавателя ================= */
(function clock() {
  const box = $('#clock'), out = $('#clockOut'), start = $('#clockStart');
  let left = 300, base = 300, run = null;
  const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const draw = () => { out.textContent = fmt(left); };
  const stop = () => { clearInterval(run); run = null; start.textContent = 'Старт'; };
  start.addEventListener('click', () => {
    if (run) { stop(); return; }
    if (left <= 0) left = base;
    box.classList.remove('end'); start.textContent = 'Пауза';
    run = setInterval(() => {
      left--; draw();
      if (left <= 0) { stop(); sfx.ding(); box.classList.add('end'); setTimeout(() => box.classList.remove('end'), 2200); }
    }, 1000);
    draw();
  });
  $('#clockPlus').addEventListener('click', () => { left += 60; if (!run) base = left; draw(); });
  $('#clockMinus').addEventListener('click', () => { left = Math.max(0, left - 60); if (!run) base = left; draw(); });
  $('#clockReset').addEventListener('click', () => { stop(); left = base; draw(); });
  $('#clockToggle').addEventListener('click', e => {
    const min = box.classList.toggle('min'); e.currentTarget.setAttribute('aria-expanded', String(!min));
  });
  draw();
})();

/* ================= вход: голосование ================= */
(function poll() {
  const OPTS = ['Постучусь в первую дверь с горящим окном', 'Пойду к знакомым, даже если уже поздно', 'Дождусь утра на платформе', 'Придумаю историю, чтобы меня впустили'];
  const MSG = [
    'Смело. Правда, чужая дверь может и не открыться.',
    'Надёжно, если такие знакомые есть.',
    'Терпеливо. У Бусыгина и Сильвы другой план: они идут искать ночлег.',
    'Именно так поступил Сильва. Вопрос на подумать: придумать легенду и поверить в неё — это одно и то же?'
  ];
  let votes = store.get('poll', [0, 0, 0, 0]);
  const box = $('#poll'), msg = $('#pollMsg');
  const btns = OPTS.map((t, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'poll__opt';
    b.innerHTML = '<span><em></em><b>0</b></span>'; $('em', b).textContent = t; $('em', b).style.fontStyle = 'normal';
    b.addEventListener('click', () => { votes[i]++; store.set('poll', votes); draw(); msg.textContent = MSG[i]; sfx.pop(); });
    box.appendChild(b); return b;
  });
  function draw() {
    const total = votes.reduce((a, b) => a + b, 0);
    btns.forEach((b, i) => { $('b', b).textContent = votes[i]; b.style.setProperty('--w', total ? (votes[i] / total * 100) + '%' : '0%'); });
  }
  $('#pollReset').addEventListener('click', () => { votes = [0, 0, 0, 0]; store.set('poll', votes); draw(); msg.textContent = 'Голоса обнулены. Можно голосовать заново.'; });
  draw();
})();

/* ================= вход: облако слов ================= */
(function cloud() {
  const box = $('#cloud'), form = $('#cloudForm'), input = $('#cloudInput');
  let words = store.get('cloud', ['дом', 'семья']);
  function place(b) {
    const W = box.clientWidth, H = box.clientHeight;
    const x = 10 + Math.random() * Math.max(10, W - b.offsetWidth - 20);
    const y = 10 + Math.random() * Math.max(10, H - b.offsetHeight - 20);
    b.style.left = x + 'px'; b.style.top = y + 'px';
  }
  function bubbleFor(w, isNew) {
    const b = document.createElement('span'); b.className = 'bub' + (isNew ? ' pop' : ''); b.textContent = w;
    b.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    b.style.fontSize = (.95 + Math.random() * .95).toFixed(2) + 'rem';
    b.style.setProperty('--d', (4 + Math.random() * 3).toFixed(1) + 's');
    box.appendChild(b); place(b);
  }
  function draw() {
    box.innerHTML = '';
    if (!words.length) { const e = document.createElement('div'); e.className = 'cloud__empty'; e.textContent = 'Слова класса появятся здесь. Напишите первое.'; box.appendChild(e); return; }
    words.forEach(w => bubbleFor(w, false));
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const w = input.value.trim().toLowerCase(); if (!w) return;
    if (!words.length) box.innerHTML = '';
    words.push(w); store.set('cloud', words); bubbleFor(w, true); input.value = ''; input.focus(); sfx.pop();
  });
  $('#cloudClear').addEventListener('click', () => { words = []; store.set('cloud', words); draw(); });
  addEventListener('resize', draw);
  draw();
})();

/* ================= автор ================= */
(function author() {
  const btn = $('#secretBtn'), ans = $('#secretAns'), q = $('#secretQ');
  btn.addEventListener('click', () => {
    const open = ans.hidden; ans.hidden = !open; q.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Спрятать' : 'Открыть первое название';
    if (open) sfx.ok();
  });
  const TL = [
    { y: '1937', c: '#FFB02E', i: 'Kutulik1.png', t: '19 августа Александр Вампилов родился в посёлке Кутулик в Иркутской области.', q: 'Как сибирская окраина могла повлиять на героев его пьес?' },
    { y: '1960', c: '#2FD3A3', i: 'Irkutsk1.png', t: 'Окончил филологический факультет Иркутского университета.', q: 'Что филологическое образование даёт драматургу? Заметно ли это в тексте пьесы?' },
    { y: '1964–1967', c: '#FF7EB6', i: 'Vampilov2.png', t: 'Рождается пьеса. Ранние записи датируются 1964 годом, работа шла с 1965 по 1967 год. Первое название: «Предместье».', q: 'Какую роль играет место действия: окраина города, последняя электричка, чужая квартира?' },
    { y: '1970', c: '#38BDF8', i: 'Book1.png', t: 'Переработанная автором пьеса выходит отдельной книгой в издательстве «Искусство» под названием «Старший сын».', q: 'Чего вы ждёте от пьесы, если судить по названию? Совпало ли ожидание с прочитанным?' },
    { y: '1972', c: '#BDA8FF', i: 'Vampilov3.png', t: '17 августа Вампилов погиб на Байкале. Ему было тридцать четыре года.', q: 'Что в его пьесах остаётся живым спустя десятилетия?' },
    { y: '1972', c: '#FF8A5B', i: 'Theatre1.png', t: 'В ноябре «Старший сын» впервые появляется на московской сцене.', q: 'Чем спектакль отличается от чтения? Что вы хотели бы увидеть на сцене?' },
    { y: '1976', c: '#FFB02E', i: 'Film1.png', t: 'Виталий Мельников снимает телефильм. Сарафанова играет Евгений Леонов, Бусыгина Николай Караченцов, Сильву Михаил Боярский.', q: 'Совпал ли фильмовый Сарафанов с тем, которого вы представили, читая?' },
    { y: '1983', c: '#2FD3A3', i: '', t: 'По пьесе написана опера. Композитор Геннадий Гладков.', q: 'Что музыка способна выразить в этой истории лучше слов?' }
  ];
  const box = $('#timeline');
  TL.forEach(d => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tl__item'; b.style.setProperty('--c', d.c);
    if (d.i) b.appendChild(img(d.i, d.t));
    const body = document.createElement('div'); body.className = 'tl__body';
    body.innerHTML = '<span class="tl__year"></span><p></p><div class="tl__q"><span></span></div>';
    $('.tl__year', body).textContent = d.y; $('p', body).textContent = d.t; $('.tl__q span', body).textContent = 'Вопрос классу: ' + d.q;
    b.appendChild(body);
    b.addEventListener('click', () => { b.classList.toggle('open'); sfx.pop(); });
    box.appendChild(b);
  });
})();

/* ================= герои ================= */
(function heroes() {
  const H = [
    { n: 'Сарафанов', r: 'Андрей Григорьевич, музыкант', c: '#FFB02E', i: 'Sarafanov1.png', b: 'С',
      tr: ['одинокий и доверчивый человек', 'сочиняет оратории «Все люди — братья»', 'отец Васеньки и Нины'], q: 'Почему он так легко поверил в «старшего сына»?' },
    { n: 'Бусыгин', r: 'Владимир, 21 год, студент мединститута', c: '#2FD3A3', i: 'Busygin1.png', b: 'Б',
      tr: ['тот, кого называют «старшим сыном»', 'сомневается и рефлексирует', 'в конце признаётся, что не сын Сарафанову'], q: 'В какой момент ложь перестала быть игрой?' },
    { n: 'Сильва', r: 'Семён Севостьянов, торговый агент', c: '#FF7EB6', i: 'Silva1.png', b: 'Си',
      tr: ['приятель Бусыгина', 'придумывает легенду о родстве', 'поступает так, как удобнее'], q: 'Он злодей или просто человек без тормозов?' },
    { n: 'Васенька', r: 'сын Сарафанова', c: '#38BDF8', i: 'Vasenka1.png', b: 'В',
      tr: ['живёт в одном доме с отцом', 'в одной из современных постановок его называют нонконформистом'], q: 'Как появление «старшего брата» меняет жизнь Васеньки?' },
    { n: 'Нина', r: 'дочь Сарафанова', c: '#BDA8FF', i: 'Nina1.png', b: 'Н',
      tr: ['живёт в одном доме с отцом и братом'], q: 'Как появление Бусыгина меняет её взгляд на отца?' }
  ];
  const box = $('#cards');
  H.forEach(h => {
    const w = document.createElement('button'); w.type = 'button'; w.className = 'win'; w.style.setProperty('--c', h.c);
    w.setAttribute('aria-label', 'Карточка героя: ' + h.n + '. Нажмите, чтобы повернуть.');
    const inn = document.createElement('span'); inn.className = 'win__in';
    const f = document.createElement('span'); f.className = 'win__f'; f.appendChild(img(h.i, h.n));
    const bd = document.createElement('span'); bd.className = 'win__badge'; bd.textContent = h.b; f.appendChild(bd);
    const cap = document.createElement('span'); cap.className = 'win__cap'; cap.innerHTML = '<b></b><span></span>';
    $('b', cap).textContent = h.n; $('span', cap).textContent = h.r; f.appendChild(cap);
    const back = document.createElement('span'); back.className = 'win__b';
    back.innerHTML = '<h4></h4><ul></ul><span class="q"></span>';
    $('h4', back).textContent = h.n;
    h.tr.forEach(t => { const li = document.createElement('li'); li.textContent = t; $('ul', back).appendChild(li); });
    $('.q', back).textContent = h.q;
    inn.appendChild(f); inn.appendChild(back); w.appendChild(inn);
    w.addEventListener('click', () => { w.classList.toggle('flipped'); sfx.pop(); });
    box.appendChild(w);
  });
  const T = [
    { i: 'Door1.png', t: 'Дверь', a: 'Граница между своим и чужим. Постучать в неё ночью значит попросить о доверии.' },
    { i: 'Clarinet1.png', t: 'Кларнет и ноты', a: 'Музыка Сарафанова и его мечта об оратории «Все люди — братья». Ею он держится, когда жить трудно.' },
    { i: 'Train1.png', t: 'Последняя электричка', a: 'Случайность, с которой начинается сюжет. Уйди она позже, герои бы не встретились.' },
    { i: 'Window1.png', t: 'Окно со светом', a: 'Знак жилья и ожидания: свет в окне говорит, что там ещё не спят и, возможно, откроют.' }
  ];
  const tb = $('#things');
  T.forEach(t => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'thing';
    b.appendChild(img(t.i, t.t));
    const s = document.createElement('span'); s.className = 'thing__t'; s.textContent = t.t; b.appendChild(s);
    const a = document.createElement('span'); a.className = 'thing__a'; const sp = document.createElement('span'); sp.textContent = 'Одна из версий: ' + t.a; a.appendChild(sp); b.appendChild(a);
    b.addEventListener('click', () => { b.classList.toggle('open'); sfx.pop(); });
    tb.appendChild(b);
  });
})();

/* ================= сюжет: порядок событий ================= */
(function plot() {
  const EV = [
    'Двое молодых людей, Бусыгин и Сильва, опаздывают на последнюю электричку и ищут ночлег.',
    'Чтобы остаться в доме, Сильва выдумывает легенду: Бусыгин — старший сын Сарафанова.',
    'Одинокий Сарафанов принимает «сына» всерьёз, и Бусыгин оказывается внутри жизни семьи.',
    'Бусыгин всё глубже входит в дела Сарафановых и сомневается: можно ли строить близость на обмане?',
    'Бусыгин признаётся, что он не сын Сарафанова.'
  ];
  let order = [], dragId = null;
  const list = $('#sortlist'), msg = $('#plotMsg'), trainEl = $('#trackTrain');
  function newOrder() {
    do { order = shuffle(EV.map((_, i) => i)); } while (order.every((v, i) => v === i));
  }
  function setTrain(k) { trainEl.style.left = `calc((100% - 2.4rem) * ${k / 5})`; }
  function clearMarks() { $$('.sortitem', list).forEach(li => li.classList.remove('good', 'bad')); }
  function move(from, to) {
    if (to < 0 || to >= order.length) return;
    const [v] = order.splice(from, 1); order.splice(to, 0, v); msg.textContent = ''; setTrain(0); draw(); sfx.pop();
  }
  function draw() {
    list.innerHTML = '';
    order.forEach((id, pos) => {
      const li = document.createElement('li'); li.className = 'sortitem'; li.draggable = true; li.dataset.pos = pos;
      li.innerHTML = '<span class="n"></span><p></p><span class="mv"><button type="button" aria-label="Выше">▲</button><button type="button" aria-label="Ниже">▼</button></span>';
      $('.n', li).textContent = pos + 1; $('p', li).textContent = EV[id];
      const [up, down] = $$('button', li);
      up.addEventListener('click', () => move(pos, pos - 1));
      down.addEventListener('click', () => move(pos, pos + 1));
      li.addEventListener('dragstart', e => { dragId = pos; li.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(pos)); } catch (x) {} });
      li.addEventListener('dragend', () => { li.classList.remove('drag'); $$('.over', list).forEach(x => x.classList.remove('over')); });
      li.addEventListener('dragover', e => { e.preventDefault(); li.classList.add('over'); });
      li.addEventListener('dragleave', () => li.classList.remove('over'));
      li.addEventListener('drop', e => { e.preventDefault(); if (dragId !== null && dragId !== pos) move(dragId, pos); dragId = null; });
      list.appendChild(li);
    });
  }
  $('#plotCheck').addEventListener('click', () => {
    clearMarks();
    const items = $$('.sortitem', list); let ok = 0;
    order.forEach((id, pos) => { const good = id === pos; if (good) ok++; items[pos].classList.add(good ? 'good' : 'bad'); });
    setTrain(ok);
    if (ok === order.length) {
      msg.textContent = 'Порядок верный. Электричка дошла до последней станции, а герои дошли до правды.';
      sfx.ok(); confetti(160);
    } else {
      msg.textContent = `На своих местах ${ok} из ${order.length}. Красные события стоит переставить.`; sfx.bad();
    }
  });
  $('#plotShuffle').addEventListener('click', () => { newOrder(); msg.textContent = ''; setTrain(0); draw(); });
  newOrder(); draw(); setTrain(0);
})();

/* ================= кто есть кто ================= */
(function who() {
  const TR = [
    ['сомневается и рефлексирует', 0], ['студент мединститута', 0], ['ему 21 год', 0],
    ['торговый агент', 1], ['придумывает легенду о родстве', 1], ['поступает так, как удобнее', 1],
    ['одинокий человек', 2], ['сочиняет ораторию', 2], ['музыкант', 2]
  ];
  const WHO = [
    { n: 'Бусыгин', s: 'Владимир, студент', c: '#2FD3A3' },
    { n: 'Сильва', s: 'Семён Севостьянов', c: '#FFB02E' },
    { n: 'Сарафанов', s: 'Андрей Григорьевич', c: '#BDA8FF' }
  ];
  const chips = $('#chips'), buckets = $('#buckets'), msg = $('#whoMsg'), score = $('#whoScore');
  let sel = null, errors = 0, left = TR.length;
  const bEls = WHO.map((w, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'bucket'; b.style.setProperty('--c', w.c);
    b.innerHTML = '<h3></h3><small></small><span class="in"></span>';
    $('h3', b).textContent = w.n; $('small', b).textContent = w.s;
    b.addEventListener('click', () => place(i));
    b.addEventListener('dragover', e => { e.preventDefault(); b.classList.add('hot'); });
    b.addEventListener('dragleave', () => b.classList.remove('hot'));
    b.addEventListener('drop', e => { e.preventDefault(); b.classList.remove('hot'); place(i); });
    buckets.appendChild(b); return b;
  });
  shuffle(TR.map((t, i) => i)).forEach(idx => {
    const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = TR[idx][0]; c.draggable = true; c.dataset.idx = idx;
    c.addEventListener('click', () => { $$('.chip', chips).forEach(x => x.classList.remove('sel')); sel = c; c.classList.add('sel'); msg.textContent = ''; });
    c.addEventListener('dragstart', e => { sel = c; $$('.chip', chips).forEach(x => x.classList.remove('sel')); c.classList.add('sel'); try { e.dataTransfer.setData('text/plain', c.dataset.idx); } catch (x) {} });
    chips.appendChild(c);
  });
  function place(bi) {
    if (!sel) { msg.textContent = 'Сначала выберите карточку.'; return; }
    const idx = +sel.dataset.idx;
    if (TR[idx][1] === bi) {
      const s = document.createElement('span'); s.textContent = TR[idx][0]; $('.in', bEls[bi]).appendChild(s);
      sel.remove(); sel = null; left--; sfx.ok(); msg.textContent = '';
      if (!left) {
        msg.textContent = errors === 0 ? 'Без единой ошибки. Вы читали пьесу внимательно.' : `Готово. Ошибок: ${errors}. Каждую можно обсудить: что сбило с толку?`;
        confetti(120);
      }
    } else {
      errors++; score.textContent = 'Ошибок: ' + errors;
      const c = sel; c.classList.remove('no'); void c.offsetWidth; c.classList.add('no'); sfx.bad();
      msg.textContent = 'Не подходит. Попробуйте другого героя.';
    }
  }
})();

/* ================= викторина ================= */
(function quiz() {
  const Q = [
    { q: 'В каком году Вампилов завершил работу над пьесой «Старший сын»?', o: ['1957', '1967', '1972', '1983'], a: 1, e: 'Работа шла с 1965 по 1967 год. Отдельной книгой пьеса вышла в 1970 году.' },
    { q: 'Как называлась пьеса в первой редакции?', o: ['«Предместье»', '«Последняя электричка»', '«Ночной гость»', '«Отцы и дети»'], a: 0, e: 'Первое название было «Предместье».' },
    { q: 'Почему Бусыгин и Сильва оказались в доме Сарафановых?', o: ['Заблудились в лесу', 'Опоздали на последнюю электричку', 'Их пригласила Нина', 'Искали работу'], a: 1, e: 'Проводив девушек, они опоздали на электричку и стали искать ночлег.' },
    { q: 'Кто придумал легенду, что Бусыгин — сын Сарафанова?', o: ['Бусыгин', 'Васенька', 'Сильва', 'Сам Сарафанов'], a: 2, e: 'Легенду выдумывает Сильва, чтобы им позволили остаться в доме.' },
    { q: 'Чем занимается Сарафанов?', o: ['Он врач', 'Он музыкант', 'Он инженер', 'Он директор школы'], a: 1, e: 'Сарафанов музыкант и сочиняет ораторию «Все люди — братья».' },
    { q: 'Где учится Бусыгин?', o: ['В консерватории', 'В мединституте', 'В юридическом вузе', 'В лётном училище'], a: 1, e: 'Бусыгину 21 год, он студент мединститута.' },
    { q: 'Как называется неоконченная оратория Сарафанова?', o: ['«Все люди — братья»', '«Дом на окраине»', '«Старший сын»', '«Ночной поезд»'], a: 0, e: 'Эта фраза стала и главной мыслью пьесы, и взглядом самого Вампилова.' },
    { q: 'Кто сыграл Сарафанова в телефильме 1976 года?', o: ['Андрей Миронов', 'Евгений Леонов', 'Олег Табаков', 'Юрий Никулин'], a: 1, e: 'Режиссёром фильма был Виталий Мельников.' },
    { q: 'Где погиб Александр Вампилов?', o: ['На Байкале', 'На Волге', 'В Москве', 'На Енисее'], a: 0, e: '17 августа 1972 года. Ему было тридцать четыре года.' }
  ];
  const TEAMS = ['Бусыгины', 'Сарафановы'];
  const SECS = 20;
  const $q = id => document.getElementById(id);
  let i, score, locked, tLeft, tid, order;
  const timerOn = $q('timerOn'), bar = $q('qBar');

  function start() { i = 0; score = [0, 0]; draw(); }
  function stopTimer() { clearInterval(tid); tid = null; }
  function draw() {
    stopTimer(); locked = false;
    const d = Q[i], team = i % 2;
    $q('scoreA').textContent = score[0]; $q('scoreB').textContent = score[1];
    $q('teamA').classList.toggle('turn', team === 0); $q('teamB').classList.toggle('turn', team === 1);
    $q('qCount').textContent = `Вопрос ${i + 1} из ${Q.length}`;
    $q('qTurn').textContent = `Отвечает команда «${TEAMS[team]}»`;
    $q('qText').textContent = d.q; $q('qFb').textContent = ''; $q('qNext').hidden = true;
    order = shuffle(d.o.map((t, k) => k));
    const box = $q('qOpts'); box.innerHTML = '';
    order.forEach(k => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = d.o[k]; b.dataset.k = k;
      b.addEventListener('click', () => answer(k, b)); box.appendChild(b);
    });
    bar.style.width = '100%'; bar.style.background = '';
    if (timerOn.checked) {
      tLeft = SECS * 10;
      tid = setInterval(() => {
        tLeft--; bar.style.width = (tLeft / (SECS * 10) * 100) + '%';
        if (tLeft < SECS * 3) bar.style.background = '#F2503B';
        if (tLeft <= 0) { stopTimer(); timeout(); }
      }, 100);
    }
  }
  function reveal() {
    const d = Q[i];
    $$('.opt', $q('qOpts')).forEach(b => { b.disabled = true; if (+b.dataset.k === d.a) b.classList.add('ok'); });
  }
  function finishQ(text) {
    locked = true; $q('qFb').textContent = text; const nx = $q('qNext'); nx.hidden = false;
    nx.textContent = i === Q.length - 1 ? 'Показать итоги' : 'Дальше'; nx.focus({ preventScroll: true });
  }
  function answer(k, btn) {
    if (locked) return; stopTimer();
    const d = Q[i], team = i % 2;
    if (k === d.a) { score[team]++; sfx.ok(); confetti(40, btn.getBoundingClientRect().left + 40, btn.getBoundingClientRect().top); }
    else { btn.classList.add('no'); sfx.bad(); }
    reveal();
    $q('scoreA').textContent = score[0]; $q('scoreB').textContent = score[1];
    finishQ((k === d.a ? 'Верно. ' : 'Неверно. ') + d.e);
  }
  function timeout() { if (locked) return; reveal(); sfx.bad(); finishQ('Время вышло. ' + Q[i].e); }
  $q('qNext').addEventListener('click', () => { if (i < Q.length - 1) { i++; draw(); } else end(); });
  timerOn.addEventListener('change', () => { if (!locked) draw(); });
  function end() {
    stopTimer(); $q('teamA').classList.remove('turn'); $q('teamB').classList.remove('turn');
    const [a, b] = score;
    $q('qCount').textContent = 'Игра окончена'; $q('qTurn').textContent = '';
    $q('qText').textContent = a === b ? 'Ничья. Оба дома остаются при своих.' : `Побеждают «${a > b ? TEAMS[0] : TEAMS[1]}»`;
    $q('qFb').textContent = `Счёт ${a} : ${b}. Разберите вопросы, на которых команды ошибались.`;
    $q('qNext').hidden = true; bar.style.width = '0%';
    const box = $q('qOpts'); box.innerHTML = '';
    const r = document.createElement('button'); r.type = 'button'; r.className = 'btn btn--amber'; r.textContent = 'Сыграть ещё раз'; r.addEventListener('click', start);
    box.appendChild(r);
    sfx.ok(); confetti(220);
  }
  start();
})();

/* ================= дебаты ================= */
(function debate() {
  let v = store.get('debate', [0, 0]);
  const vA = $('#vA'), vB = $('#vB'), msg = $('#scaleMsg');
  const beam = $('#sBeam'), pL = $('#panL'), pR = $('#panR');
  function apply(deg, immediate) {
    const rad = deg * Math.PI / 180, dx = 120 * Math.cos(rad), dy = 120 * Math.sin(rad);
    if (immediate) [beam, pL, pR].forEach(e => e.style.transition = 'none');
    beam.style.transform = `rotate(${deg}deg)`;
    pL.style.transform = `translate(${150 - dx}px, ${60 - dy}px)`;
    pR.style.transform = `translate(${150 + dx}px, ${60 + dy}px)`;
    if (immediate) { void beam.getBoundingClientRect(); [beam, pL, pR].forEach(e => e.style.transition = ''); }
  }
  function draw(immediate) {
    const [a, b] = v, t = a + b;
    vA.textContent = a; vB.textContent = b;
    apply(t ? (b - a) / t * 16 : 0, immediate);
    msg.textContent = !t ? 'Весы ждут голосов.' : a === b ? 'Поровну. Значит, доводы одинаково сильны.' : a > b ? 'Класс чаще видит в Бусыгине самозванца.' : 'Класс чаще видит в Бусыгине спасителя.';
  }
  $$('[data-vote]').forEach(b => b.addEventListener('click', () => { v[b.dataset.vote === 'a' ? 0 : 1]++; store.set('debate', v); draw(); sfx.pop(); }));
  $$('[data-unvote]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.unvote === 'a' ? 0 : 1; v[k] = Math.max(0, v[k] - 1); store.set('debate', v); draw(); }));
  $('#voteReset').addEventListener('click', () => { v = [0, 0]; store.set('debate', v); draw(); });
  draw(true);
})();

/* ================= синквейн ================= */
(function cinquain() {
  const f = { t: $('#cqTopic'), a: $('#cq2'), b: $('#cq3'), c: $('#cq4'), d: $('#cq5') };
  const out = [$('#pc1'), $('#pc2'), $('#pc3'), $('#pc4'), $('#pc5')];
  const get = () => [f.t.value, f.a.value.trim() || '…', f.b.value.trim() || '…', f.c.value.trim() || '…', f.d.value.trim() || '…'];
  function draw() { get().forEach((t, i) => { out[i].textContent = t; }); }
  Object.values(f).forEach(e => e.addEventListener('input', draw)); draw();
  function wrap(g, text, maxW) {
    const words = text.split(' '), lines = []; let line = '';
    words.forEach(w => { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    lines.push(line); return lines;
  }
  $('#cqDownload').addEventListener('click', async () => {
    try { await document.fonts.load('64px "Marck Script"'); await document.fonts.load('700 30px Unbounded'); } catch (e) {}
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#FFB02E'); gr.addColorStop(.55, '#FF7EB6'); gr.addColorStop(1, '#7C63F0');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#15153B'; g.lineWidth = 14; g.strokeRect(7, 7, W - 14, H - 14);
    g.strokeStyle = 'rgba(21,21,59,.55)'; g.lineWidth = 4; g.setLineDash([18, 14]); g.strokeRect(46, 46, W - 92, H - 92); g.setLineDash([]);
    const spec = [[130, true], [70, false], [70, false], [70, false], [104, true]];
    const L = get().map((t, i) => {
      g.font = `${spec[i][1] ? '700 ' : ''}${spec[i][0]}px "Marck Script", "Segoe Script", cursive`;
      return { lines: wrap(g, t, W - 220), size: spec[i][0], bold: spec[i][1] };
    });
    const lh = s => s * 1.3, gap = 40;
    const total = L.reduce((s, b) => s + b.lines.length * lh(b.size), 0) + gap * 4;
    let y = (H - total) / 2 + 40;
    g.fillStyle = '#15153B'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    L.forEach(b => {
      g.font = `${b.bold ? '700 ' : ''}${b.size}px "Marck Script", "Segoe Script", cursive`;
      b.lines.forEach(ln => { y += lh(b.size); g.fillText(ln, W / 2, y - b.size * .25); });
      y += gap;
    });
    g.font = '700 30px Unbounded, Arial, sans-serif'; g.fillText('Старший сын. А. Вампилов', W / 2, H - 90);
    c.toBlob(blob => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sinkvein.png';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
    sfx.ok();
  });
})();

/* ================= финал: окна ================= */
(function finale() {
  const M = [
    { t: 'Доверие', c: '#FFB02E' }, { t: 'Смелость признаться', c: '#FF7EB6' }, { t: 'Семья не только по крови', c: '#2FD3A3' },
    { t: 'Умение слушать', c: '#38BDF8' }, { t: 'Юмор в трудную минуту', c: '#BDA8FF' }, { t: 'Сомнение — это нормально', c: '#FF8A5B' }
  ];
  const GOAL = 20;
  const moods = $('#moods'), house = $('#house'), count = $('#houseCount');
  let cur = 0, celebrated = false;
  const mb = M.map((m, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'mood'; b.textContent = m.t; b.style.setProperty('--c', m.c);
    b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(i === 0));
    b.addEventListener('click', () => { cur = i; mb.forEach((x, k) => x.setAttribute('aria-checked', String(k === i))); });
    moods.appendChild(b); return b;
  });
  const wins = [];
  for (let k = 0; k < 40; k++) {
    const w = document.createElement('button'); w.type = 'button'; w.className = 'hw-win'; w.setAttribute('aria-label', 'Окно ' + (k + 1) + ', не горит');
    w.addEventListener('click', () => {
      if (w.classList.contains('lit') && w.dataset.m === String(cur)) { w.classList.remove('lit', 'p'); delete w.dataset.m; w.title = ''; w.setAttribute('aria-label', 'Окно ' + (k + 1) + ', не горит'); }
      else { w.style.setProperty('--c', M[cur].c); w.dataset.m = cur; w.title = M[cur].t; w.classList.remove('p'); w.classList.add('lit'); void w.offsetWidth; w.classList.add('p'); w.setAttribute('aria-label', 'Окно ' + (k + 1) + ', горит: ' + M[cur].t); sfx.pop(); }
      update();
    });
    house.appendChild(w); wins.push(w);
  }
  function update() {
    const n = wins.filter(w => w.classList.contains('lit')).length;
    count.textContent = `${plural(n, 'Горит', 'Горит', 'Горит')} ${n} ${plural(n, 'окно', 'окна', 'окон')} из ${GOAL}`;
    if (n >= GOAL && !celebrated) {
      celebrated = true; $('#finaleBig').hidden = false; sfx.ok(); confetti(260);
      setTimeout(() => $('#finaleBig').scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'center' }), 300);
    }
  }
  update();
})();


/* ================= чтение по ролям ================= */
(function roles() {
  const EP = [
    { t: 'Ночной стук', d: 'Бусыгин и Сильва, опоздав на электричку, приходят в квартиру Сарафановых и просят о ночлеге.',
      need: ['Ведущий', 'Бусыгин', 'Сильва', 'Сарафанов'],
      task: 'Гости просят о ночлеге, но говорят не всё. Хозяин не ждал никого. Сыграйте неловкость первой минуты, не торопите паузы.',
      qs: ['Что гости скрывают от хозяев в начале сцены?', 'Какая ремарка или пауза здесь важнее всего?'] },
    { t: 'Легенда', d: 'Сильва выдумывает, что Бусыгин — старший сын Сарафанова.',
      need: ['Ведущий', 'Сильва', 'Бусыгин', 'Сарафанов'],
      task: 'Сильва говорит уверенно, будто это общеизвестный факт. Бусыгин растерян. Сарафанов слышит новость, которую, возможно, хочет услышать.',
      qs: ['Верит ли Сарафанов или хочет верить? Чем это отличается?', 'Где в этой сцене Сильва выдаёт себя?'] },
    { t: 'Признание', d: 'Бусыгин признаётся, что он не сын Сарафанова.',
      need: ['Ведущий', 'Бусыгин', 'Сарафанов'],
      task: 'Бусыгин говорит правду без оправданий. Сарафанов отвечает паузой не меньше, чем словами. Найдите в тексте слова, за которыми стоит больше, чем сказано.',
      qs: ['Что для Сарафанова важнее: правда или то, что он больше не один?', 'Как эта сцена меняет ваше отношение к Бусыгину?'] }
  ];
  const ROLES = ['Ведущий', 'Сарафанов', 'Бусыгин', 'Сильва', 'Васенька', 'Нина'];
  const ROLE_NOTE = { 'Ведущий': 'читает ремарки' };
  const OBS = ['следит за интонацией', 'следит за паузами и жестами', 'ищет подтекст', 'сверяет текст', 'хронометрист'];
  let cur = 0, assign = {};
  const tabs = $('#epTabs'), box = $('#epBox'), list = $('#castList'), obsBox = $('#obsBox'), hint = $('#castHint'), names = $('#names');
  names.value = store.get('names', '');
  names.addEventListener('input', () => store.set('names', names.value));
  const pages = store.get('pages', {});

  function drawEp() {
    const e = EP[cur];
    box.innerHTML = '<div><h3></h3><p class="d"></p><div class="ep__need" aria-label="Нужные роли"></div><div class="ep__task"></div><label class="ep__pages">Страницы в вашем издании: <input placeholder="например, 25–31"></label></div><div><h3>Вопросы после чтения</h3><ul></ul></div>';
    $('h3', box).textContent = e.t; $('.d', box).textContent = e.d;
    e.need.forEach(r => { const s = document.createElement('span'); s.textContent = r; $('.ep__need', box).appendChild(s); });
    $('.ep__task', box).textContent = 'Задача чтецов. ' + e.task;
    e.qs.forEach(q => { const li = document.createElement('li'); li.textContent = q; $('ul', box).appendChild(li); });
    const inp = $('input', box); inp.value = pages[cur] || '';
    inp.addEventListener('input', () => { pages[cur] = inp.value; store.set('pages', pages); });
    tabs.querySelectorAll('.eptab').forEach((b, i) => b.setAttribute('aria-selected', String(i === cur)));
    drawCast();
  }
  EP.forEach((e, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'eptab'; b.setAttribute('role', 'tab'); b.textContent = e.t;
    b.addEventListener('click', () => { cur = i; drawEp(); sfx.pop(); }); tabs.appendChild(b);
  });
  function orderedRoles() {
    const need = EP[cur].need;
    return [...ROLES.filter(r => need.includes(r)), ...ROLES.filter(r => !need.includes(r))];
  }
  function drawCast() {
    list.innerHTML = '';
    const need = EP[cur].need;
    orderedRoles().forEach(r => {
      const li = document.createElement('li'); li.dataset.role = r;
      if (!need.includes(r)) li.classList.add('opt-role');
      li.innerHTML = '<small></small><b></b>';
      $('small', li).textContent = r + (ROLE_NOTE[r] ? ' (' + ROLE_NOTE[r] + ')' : '') + (need.includes(r) ? '' : ', если есть в сцене');
      $('b', li).textContent = assign[r] || '—';
      list.appendChild(li);
    });
  }
  function drawObs(rest) {
    obsBox.innerHTML = '';
    rest.forEach((n, i) => {
      const s = document.createElement('span'); s.innerHTML = '<b></b> <em></em>';
      $('b', s).textContent = n; $('em', s).textContent = OBS[i % OBS.length]; obsBox.appendChild(s);
    });
  }
  $('#castBtn').addEventListener('click', () => {
    const pool = [...new Set(names.value.split('\n').map(x => x.trim()).filter(Boolean))];
    if (!pool.length) { hint.textContent = 'Впишите хотя бы одно имя.'; return; }
    hint.textContent = '';
    const sh = shuffle(pool), roles = orderedRoles();
    assign = {}; roles.forEach((r, i) => { assign[r] = sh[i] || ''; });
    const rest = sh.slice(roles.length);
    obsBox.innerHTML = '';
    const items = $$('li', list); let done = 0;
    items.forEach((li, idx) => {
      li.classList.add('spin'); li.classList.remove('done');
      const iv = setInterval(() => { $('b', li).textContent = pool[Math.floor(Math.random() * pool.length)]; }, 70);
      setTimeout(() => {
        clearInterval(iv); li.classList.remove('spin'); li.classList.add('done');
        $('b', li).textContent = assign[li.dataset.role] || '—'; sfx.pop();
        if (++done === items.length) { drawObs(rest); sfx.ok(); if (pool.length >= 3) confetti(60); }
      }, rm ? 10 : 700 + idx * 260);
    });
    if (pool.length < EP[cur].need.length) hint.textContent = 'Имён меньше, чем нужных ролей. Часть ролей можно прочитать по очереди.';
  });
  drawEp();

  /* таймер чтения */
  const out = $('#rtOut'), bt = $('#rtStart'), wrapT = $('.rtimer');
  let left = 180, run = null;
  const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const stop = () => { clearInterval(run); run = null; bt.textContent = 'Продолжить'; };
  bt.addEventListener('click', () => {
    if (run) { stop(); return; }
    if (left <= 0) left = 180;
    wrapT.classList.remove('end'); bt.textContent = 'Пауза';
    run = setInterval(() => {
      left--; out.textContent = fmt(left);
      if (left <= 0) { stop(); bt.textContent = 'Начать чтение'; sfx.ding(); wrapT.classList.add('end'); setTimeout(() => wrapT.classList.remove('end'), 2000); }
    }, 1000);
  });
  $('#rtReset').addEventListener('click', () => { stop(); left = 180; out.textContent = fmt(left); bt.textContent = 'Начать чтение'; });

  /* оценка наблюдателей */
  const CR = ['Интонация передаёт характер героя', 'Паузы и молчание работают', 'Подтекст слышен', 'Текст прочитан точно'];
  let sc = CR.map(() => 0);
  const rub = $('#rubric'), bar = $('#rubBar'), msg = $('#rubMsg');
  function drawRub() {
    rub.innerHTML = '';
    CR.forEach((c, ci) => {
      const row = document.createElement('div'); row.className = 'rub-row';
      row.innerHTML = '<span></span><div class="stars" role="group"></div>'; $('span', row).textContent = c;
      for (let k = 1; k <= 5; k++) {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = k; b.setAttribute('aria-label', `${c}: ${k} из 5`);
        if (sc[ci] >= k) b.classList.add('on');
        b.addEventListener('click', () => { sc[ci] = k; sfx.pop(); drawRub(); });
        $('.stars', row).appendChild(b);
      }
      rub.appendChild(row);
    });
    const rated = sc.filter(Boolean);
    const avg = rated.length ? rated.reduce((a, b) => a + b, 0) / rated.length : 0;
    bar.style.width = (avg / 5 * 100) + '%';
    msg.textContent = !rated.length ? 'Поставьте оценки после чтения.' :
      rated.length < CR.length ? `Средняя оценка ${avg.toFixed(1)}. Оценены не все критерии.` :
      avg >= 4.3 ? `Средняя оценка ${avg.toFixed(1)}. Сцена прозвучала убедительно: назовите, что сработало лучше всего.` :
      avg >= 3 ? `Средняя оценка ${avg.toFixed(1)}. Хорошая основа: выберите критерий с самой низкой оценкой и прочитайте реплику ещё раз.` :
      `Средняя оценка ${avg.toFixed(1)}. Попробуйте перечитать сцену медленнее и с паузами.`;
  }
  $('#rubReset').addEventListener('click', () => { sc = CR.map(() => 0); drawRub(); });
  drawRub();
})();

/* ================= пьеса и фильм ================= */
(function film() {
  const src = $('#filmSrc'), vid = $('#filmVideo').closest('.vid');
  src.addEventListener('error', () => { $('#vidNote').textContent = 'Видео не найдено. Положите фрагмент рядом с этим файлом под именем fragment.mp4, остальное задание работает и без него.'; });
  $('#filmVideo').addEventListener('loadeddata', () => vid.classList.add('ok'));

  const cmp = $('#cmp'), rng = $('#cmpRange');
  rng.addEventListener('input', () => cmp.style.setProperty('--p', rng.value + '%'));

  const ROWS = [
    'Сарафанов: каким вы его представляли и каким он в фильме',
    'Бусыгин: растерянность и честность',
    'Сильва: обаяние или цинизм',
    'Дом Сарафановых: свет, вещи, атмосфера',
    'Сцена признания: как показан момент правды',
    'Баланс комедии и драмы'
  ];
  const OPT = [{ t: 'Совпало с текстом', c: '#9FEFD2' }, { t: 'Иначе, чем я читал(а)', c: '#FFD27A' }, { t: 'Добавлено или убрано', c: '#FFB1C8' }];
  let v = store.get('film', ROWS.map(() => [0, 0, 0]));
  if (v.length !== ROWS.length) v = ROWS.map(() => [0, 0, 0]);
  const box = $('#matrix'), sum = $('#matrixSum'), els = [];
  ROWS.forEach((r, ri) => {
    const row = document.createElement('div'); row.className = 'mrow';
    row.innerHTML = '<h4></h4><div class="mrow__opts"></div><div class="mrow__bar"></div><button type="button" class="btn btn--small mrow__un">Убрать голос</button>';
    $('h4', row).textContent = r;
    const btns = OPT.map((o, oi) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'mopt'; b.style.setProperty('--c', o.c);
      b.innerHTML = '<span></span><b>0</b>'; $('span', b).textContent = o.t;
      b.addEventListener('click', () => { v[ri][oi]++; store.set('film', v); draw(); sfx.pop(); last[ri] = oi; });
      $('.mrow__opts', row).appendChild(b);
      const seg = document.createElement('i'); seg.style.setProperty('--c', o.c); $('.mrow__bar', row).appendChild(seg);
      return b;
    });
    $('.mrow__un', row).addEventListener('click', () => { const oi = last[ri]; if (oi != null && v[ri][oi] > 0) { v[ri][oi]--; store.set('film', v); draw(); } });
    box.appendChild(row); els.push({ btns, segs: $$('.mrow__bar i', row) });
  });
  const last = {};
  function draw() {
    const tot = [0, 0, 0];
    v.forEach((row, ri) => {
      const t = row.reduce((a, b) => a + b, 0);
      row.forEach((n, oi) => { tot[oi] += n; $('b', els[ri].btns[oi]).textContent = n; els[ri].segs[oi].style.width = t ? (n / t * 100) + '%' : '0%'; });
    });
    const all = tot.reduce((a, b) => a + b, 0);
    if (!all) { sum.textContent = 'Голосов пока нет.'; return; }
    const m = tot.indexOf(Math.max(...tot));
    sum.textContent = `Всего голосов: ${all}. Чаще всего группа выбирает: «${OPT[m].t}». Спросите, почему именно так.`;
  }
  draw();
  ['fNote1', 'fNote2'].forEach(id => {
    const t = document.getElementById(id); t.value = store.get(id, '');
    t.addEventListener('input', () => store.set(id, t.value));
  });
})();

})();
