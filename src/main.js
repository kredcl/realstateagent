import './style.css';
import Lenis from 'lenis';
import { animate, stagger, svg } from 'animejs';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const RM = root.classList.contains('rm');

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const mix = (a, b, t) => a + (b - a) * t;
const out3 = (t) => 1 - (1 - t) ** 3;
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

let vw = innerWidth;
let vh = innerHeight;

/* ---------- Palabras grandes: una letra por caja ---------- */
$$('[data-split]').forEach((el) => {
  const txt = el.textContent.trim();
  el.setAttribute('aria-label', txt);
  el.innerHTML = [...txt].map((c) => `<span class="l" aria-hidden="true"><span>${c}</span></span>`).join('');
});

/* ---------- Modo cine (escritorio con movimiento) ---------- */
const mq = matchMedia('(min-width: 900px) and (min-height: 560px)');
let cine = false;
const touched = new Set();
const st = (el, prop, val) => {
  if (!el) return;
  touched.add(el);
  if (el.style[prop] !== val) el.style[prop] = val;
};
function resetInline() {
  touched.forEach((el) => {
    el.style.transform = '';
    el.style.opacity = '';
    el.style.clipPath = '';
    el.style.visibility = '';
  });
  touched.clear();
  $$('.is-ink').forEach((el) => el.classList.remove('is-ink'));
  clearBigWords();
  chapters.forEach((c) => (c.last = -1));
}

/* ---------- Scroll suave ---------- */
const lenis = RM ? null : new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 });
if (lenis) {
  lenis.on('scroll', () => {});
}
function scrollToEl(target) {
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else target.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
}

/* ---------- Capítulos ---------- */
const chapters = $$('[data-ch]').map((el) => ({ el, name: el.dataset.ch, last: -1, lastPre: -1 }));

function letters(word, t, axis = 'Y') {
  if (!word) return;
  const ls = word._ls || (word._ls = $$('.l > span', word));
  const n = ls.length;
  ls.forEach((s, i) => {
    const k = out3(clamp01((t - (i / n) * 0.45) / 0.55));
    st(s, 'transform', `translate${axis}(${((1 - k) * 110).toFixed(2)}%)`);
  });
}
function reveal(els, p, a, span = 0.12, step = 0.035) {
  els.forEach((el, i) => {
    const t = out3(seg(p, a + i * step, a + i * step + span));
    st(el, 'opacity', t.toFixed(3));
    st(el, 'transform', `translateY(${((1 - t) * 34).toFixed(1)}px)`);
  });
}
const px = (v) => `${v.toFixed(1)}px`;

/* La palabra se compone grande (nítida) y se achica con scale() < 1 */
const scaleCache = new WeakMap();
function bigWord(word) {
  if (scaleCache.has(word)) return scaleCache.get(word);
  word.style.fontSize = '';
  const base = parseFloat(getComputedStyle(word).fontSize) || 16;
  const w = word.offsetWidth || 1;
  const m = parseFloat(getComputedStyle(root).getPropertyValue('--m')) || 40;
  const s0 = Math.max(1, (vw - 2 * m) / w);
  word.style.fontSize = `${(base * s0).toFixed(2)}px`;
  const info = { s0, H: word.offsetHeight };
  scaleCache.set(word, info);
  return info;
}
function clearBigWords() {
  $$('[data-split]').forEach((w) => { scaleCache.delete(w); w.style.fontSize = ''; });
}

const run = {
  comprar(c, p, pre) {
    const el = c.el;
    const q = c.q || (c.q = {
      word: $('[data-cm-word]', el), photo: $('[data-cm-photo]', el), img: $('[data-cm-photo] img', el),
      circle: $('[data-cm-circle]', el), cimg: $('[data-cm-circle] img', el),
      copy: $$('[data-cm-copy] > *', el), plus: $('[data-cm-plus]', el),
      quote: $('[data-cm-quote]', el), pimg: $('.cm-portrait img', el), qtext: $('.cm-quote blockquote', el),
      orb1: $('.cm-orb1', el), orb2: $('.cm-orb2', el),
    });
    const hh = 100;
    letters(q.word, seg(pre, 0.3, 1) * 0.85 + seg(p, 0, 0.05) * 0.15);
    const t1 = inOut(seg(p, 0.07, 0.36));
    const { s0, H } = bigWord(q.word);
    const ty = mix(H / s0 / 2 - H / 2, 0, t1);
    st(q.word, 'transform', `translateY(${px(ty)}) scale(${mix(1, 1 / s0, t1).toFixed(5)})`);
    st(q.photo, 'clipPath', `inset(${px(t1 * (hh + vh * 0.03))} ${px(t1 * vw * 0.33)} 0px ${px(t1 * vw * 0.31)})`);
    st(q.img, 'transform', `scale(${mix(1.14, 1, out3(seg(pre, 0, 1) * 0.4 + seg(p, 0, 0.4) * 0.6)).toFixed(4)})`);
    const t2 = out3(seg(p, 0.3, 0.48));
    st(q.circle, 'opacity', t2.toFixed(3));
    st(q.circle, 'transform', `translateY(${px((1 - t2) * 60)}) scale(${mix(0.7, 1, t2).toFixed(3)})`);
    st(q.cimg, 'transform', `scale(${mix(1.3, 1.05, seg(p, 0.3, 1)).toFixed(3)})`);
    reveal([...q.copy, q.plus], p, 0.34);
    q.orb1._ex = (1 - out3(seg(p, 0.28, 0.52))) * vw * 0.45;
    q.orb2._ey = (1 - out3(seg(p, 0.32, 0.56))) * vh * 0.6;
    const t3 = inOut(seg(p, 0.6, 0.82));
    st(q.quote, 'transform', `translateX(${((t3 - 1) * 112).toFixed(2)}%)`);
    st(q.pimg, 'transform', `scale(${mix(1.25, 1, t3).toFixed(3)})`);
    const t4 = out3(seg(p, 0.74, 0.88));
    st(q.qtext, 'opacity', t4.toFixed(3));
    st(q.qtext, 'transform', `translateY(${px((1 - t4) * 30)})`);
  },

  vender(c, p, pre) {
    const el = c.el;
    const q = c.q || (c.q = {
      word: $('[data-vd-word]', el), img: $('[data-vd-photo] img', el), field: $('[data-vd-field]', el),
      copy: $$('[data-vd-copy] > *', el), plus: $('[data-vd-plus]', el), cols: $$('[data-vd-col]', el),
      panel: $('[data-vd-panel]', el), pcopy: $$('.vd-panel-copy .lead, .steps li', el), oval: $('.vd-oval', el),
      seed: $('.vd-seed', el),
    });
    letters(q.word, seg(pre, 0.35, 1));
    st(q.img, 'transform', `scale(${mix(1.16, 1, seg(pre, 0, 1) * 0.5 + seg(p, 0, 0.2) * 0.5).toFixed(4)})`);
    const t1 = inOut(seg(p, 0.1, 0.32));
    st(q.field, 'clipPath', `inset(${((1 - t1) * 100).toFixed(2)}% 0% 0% 0%)`);
    const { s0 } = bigWord(q.word);
    st(q.word, 'transform', `scale(${mix(1, 1 / s0, inOut(seg(p, 0.12, 0.36))).toFixed(5)})`);
    q.word.classList.toggle('is-ink', t1 > 0.45);
    c.tone = t1 > 0.9 ? 'light' : 'dark';
    reveal([...q.copy, q.plus], p, 0.3);
    q.cols.forEach((col, i) => {
      const t = out3(seg(p, 0.27 + i * 0.05, 0.5 + i * 0.05));
      st(col, 'transform', `translateY(${px((1 - t) * vh * 0.85)})`);
    });
    const t3 = inOut(seg(p, 0.58, 0.8));
    st(q.panel, 'transform', `translateX(${((1 - t3) * 112).toFixed(2)}%)`);
    st(q.oval, 'transform', `scale(${mix(0.86, 1, t3).toFixed(3)})`);
    reveal(q.pcopy, p, 0.7, 0.1, 0.022);
    q.seed._ex = (1 - out3(seg(p, 0.15, 0.5))) * -vw * 0.4;
    q.seed._ey = (1 - out3(seg(p, 0.15, 0.5))) * -vh * 0.5;
  },

  arrendar(c, p, pre) {
    const el = c.el;
    const q = c.q || (c.q = {
      word: $('[data-ar-word]', el), photo: $('[data-ar-photo]', el), img: $('[data-ar-photo] img', el),
      copy: $('[data-ar-copy]', el), copyKids: $$('[data-ar-copy] > *', el), plus: $('[data-ar-plus]', el),
      panel: $('[data-ar-panel]', el), icons: $$('.icons li', el), strip: $('[data-ar-strip] img', el),
      sword: $('.ar-strip-word', el), note: $('[data-ar-note]', el), ring: $('.ar-ring', el), leaf: $('.ar-leaf1', el),
    });
    const tIn = out3(seg(pre, 0.25, 1));
    st(q.photo, 'clipPath', `inset(${((1 - tIn) * 100).toFixed(2)}% 0% 0% 0%)`);
    st(q.img, 'transform', `scale(${mix(1.2, 1, seg(pre, 0.25, 1) * 0.5 + seg(p, 0, 0.4) * 0.5).toFixed(4)})`);
    letters(q.word, seg(pre, 0.45, 1) * 0.8 + seg(p, 0, 0.06) * 0.2);
    const tOut = seg(p, 0.5, 0.62);
    st(q.word, 'opacity', (1 - tOut).toFixed(3));
    st(q.word, 'transform', `translateX(${px((1 - out3(seg(pre, 0.4, 1))) * vw * 0.12 - tOut * 40)})`);
    reveal([...q.copyKids, q.plus], p, 0.12);
    st(q.copy, 'opacity', (1 - tOut).toFixed(3));
    st(q.photo, 'opacity', (1 - seg(p, 0.56, 0.7)).toFixed(3));
    q.ring._ey = (1 - out3(seg(p, 0.08, 0.4))) * vh * 0.7;
    const t3 = inOut(seg(p, 0.48, 0.68));
    st(q.panel, 'transform', `translateX(${((t3 - 1) * 105).toFixed(2)}%)`);
    reveal(q.icons, p, 0.6, 0.1, 0.03);
    const t4 = inOut(seg(p, 0.55, 0.76));
    st(q.strip, 'clipPath', `inset(0% ${((1 - t4) * 100).toFixed(2)}% 0% 0%)`);
    st(q.strip, 'transform', `scale(${mix(1.15, 1, t4).toFixed(3)})`);
    const t5 = out3(seg(p, 0.7, 0.84));
    st(q.sword, 'opacity', t5.toFixed(3));
    st(q.sword, 'transform', `translateY(${px((1 - t5) * 60)})`);
    reveal([q.note], p, 0.74);
    q.leaf._ey = (1 - out3(seg(p, 0.45, 0.8))) * -vh * 0.45;
  },

  zonas(c, p, pre) {
    const el = c.el;
    const q = c.q || (c.q = {
      word: $('[data-zn-word]', el), video: $('[data-zn-video]', el),
      copy: $$('[data-zn-copy] > *', el), map: $('[data-zn-map]', el),
      river: $('.map-river', el), pts: $$('.map-pts g, .map-office, .map-coast', el), mapHead: $$('.zn-map-head > *, .zn-route', el),
      leaf1: $('.zn-leaf1', el), leaf2: $('.zn-leaf2', el), seed: $('.zn-seed', el),
    });
    letters(q.word, seg(pre, 0.35, 1), 'X');
    const t = inOut(seg(p, 0.1, 0.38));
    const top = t * (100 + vh * 0.03);
    const bot = t * vh * 0.04;
    const rx = (t * (vw - t * vw * 0.7)) / 2;
    const ry = (t * (vh - top - bot)) / 2;
    st(q.video, 'clipPath', `inset(${px(top)} ${px(t * vw * 0.31)} ${px(bot)} ${px(t * vw * 0.39)} round ${px(rx)} / ${px(ry)})`);
    q.word.classList.toggle('is-ink', t > 0.55);
    c.tone = t > 0.3 ? 'light' : 'dark';
    reveal(q.copy, p, 0.3);
    const t2 = inOut(seg(p, 0.58, 0.8));
    st(q.map, 'transform', `translateY(${((1 - t2) * 106).toFixed(2)}%)`);
    if (q.river) {
      if (!q.river._len) { q.river.setAttribute('pathLength', '1'); q.river.style.strokeDasharray = '1'; q.river._len = 1; }
      q.river.style.strokeDashoffset = (1 - seg(p, 0.72, 0.9)).toFixed(4);
    }
    q.pts.forEach((g, i) => st(g, 'opacity', out3(seg(p, 0.74 + i * 0.018, 0.8 + i * 0.018)).toFixed(3)));
    reveal(q.mapHead, p, 0.7, 0.1, 0.03);
    q.leaf1._ex = (1 - out3(seg(p, 0.05, 0.5))) * -vw * 0.35;
    q.leaf2._ex = (1 - out3(seg(p, 0.2, 0.7))) * vw * 0.4;
    q.seed._ex = (1 - out3(seg(p, 0.45, 0.85))) * -vw * 0.3;
  },

  props(c, p, pre) {
    const el = c.el;
    const q = c.q || (c.q = {
      word: $('[data-pr-word]', el), copy: $$('[data-pr-copy] > *', el), oval: $('[data-pr-oval]', el),
      img1: $('.pr-img1 img', el), img2: $('[data-pr-img2]', el), cta: $('[data-pr-cta]', el),
      lamp: $('[data-pr-lamp]', el), orb: $('.pr-orb', el),
    });
    letters(q.word, seg(pre, 0.4, 1) * 0.8 + seg(p, 0, 0.06) * 0.2);
    const t = out3(seg(pre, 0.15, 1) * 0.7 + seg(p, 0, 0.12) * 0.3);
    st(q.oval, 'transform', `translateX(${px((1 - t) * vw * 0.42)}) rotate(${((1 - t) * 14).toFixed(2)}deg)`);
    st(q.img1, 'transform', `scale(${mix(1.25, 1.02, seg(p, 0, 0.6)).toFixed(4)})`);
    reveal(q.copy, p, 0.08);
    const tc = out3(seg(p, 0.18, 0.3));
    st(q.cta, 'opacity', tc.toFixed(3));
    st(q.cta, 'transform', `scale(${mix(0.6, 1, tc).toFixed(3)})`);
    const t2 = inOut(seg(p, 0.42, 0.64));
    st(q.img2, 'opacity', t2 > 0 ? '1' : '0');
    st(q.img2, 'clipPath', `circle(${(t2 * 75).toFixed(2)}% at 50% 100%)`);
    const t3 = out3(seg(p, 0.5, 0.72));
    st(q.lamp, 'transform', `translateY(${((t3 - 1) * 100).toFixed(2)}%)`);
    q.orb._ex = (1 - out3(seg(p, 0.2, 0.55))) * -vw * 0.5;
  },
};

/* ---------- Elementos flotantes (parallax) ---------- */
const floats = $$('[data-float]').map((el) => ({
  el, depth: parseFloat(el.dataset.float) || 0, rot: parseFloat(el.dataset.rot) || 0,
  host: el.closest('[data-ch], section, footer'),
}));
function updateFloats() {
  floats.forEach((f) => {
    const r = f.host.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 2) return;
    let q;
    if (cine && f.host.matches('[data-ch]')) q = clamp01(-r.top / Math.max(1, r.height - vh));
    else q = clamp01((vh - r.top) / (vh + r.height));
    const y = (0.5 - q) * f.depth * vh * (cine ? 0.38 : 0.4) + (cine ? f.el._ey || 0 : 0);
    const x = cine ? f.el._ex || 0 : 0;
    st(f.el, 'transform', `translate3d(${px(x)}, ${px(y)}, 0) rotate(${((q - 0.5) * f.rot).toFixed(2)}deg)`);
  });
}

/* ---------- Héroe: parallax de salida ---------- */
const hero = $('[data-hero]');
const heroPhoto = $('[data-hero-photo] img');
const heroMark = $('[data-hero-mark]');
const heroOval = $('[data-hero-oval]');
let heroReady = RM;
function updateHero() {
  if (!heroReady || RM) return;
  const y = scrollY;
  if (y > vh * 1.3) return;
  st(heroMark, 'transform', `translateY(${px(y * 0.18)})`);
}

/* ---------- Héroe: dos imágenes con máscara ovalada que se abren con el mouse ---------- */
const heroHalves = matchMedia('(min-width: 900px) and (hover: hover)');
hero.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || !heroHalves.matches) return;
  hero.classList.toggle('r-open', e.clientX > innerWidth / 2);
});

/* ---------- Cabecera: tono según la sección ---------- */
const hdr = $('[data-hdr]');
const toneEls = $$('[data-tone]');
function updateHeader() {
  const line = 50;
  let tone = 'dark';
  for (const el of toneEls) {
    const r = el.getBoundingClientRect();
    if (r.top <= line && r.bottom > line) {
      const c = cine && chapters.find((ch) => ch.el === el);
      tone = (c && c.tone) || el.dataset.tone;
      break;
    }
  }
  hdr.classList.toggle('on-light', tone === 'light');
  hdr.classList.toggle('at-hero', scrollY < vh * 0.55);
}

/* ---------- Marquesina del pie ---------- */
const track = $('[data-marquee]');
let itemW = 0;
function measureMarquee() {
  const s = track && track.querySelector('svg');
  if (!s) return;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  itemW = s.getBoundingClientRect().width + gap;
}
let mqX = 0;
let lastY = scrollY;
function updateMarquee(dt) {
  if (!track || RM || !itemW) return;
  const r = track.getBoundingClientRect();
  const dy = scrollY - lastY;
  lastY = scrollY;
  if (r.bottom < 0 || r.top > vh) return;
  mqX -= dt * 0.04 + Math.abs(dy) * 0.6;
  mqX %= itemW;
  track.style.transform = `translate3d(${px(mqX)}, 0, 0)`;
}

/* ---------- Bucle ---------- */
function updateChapters() {
  if (!cine) return;
  chapters.forEach((c) => {
    const r = c.el.getBoundingClientRect();
    const pre = clamp01(1 - r.top / vh);
    const p = clamp01(-r.top / Math.max(1, r.height - vh));
    if (r.top > vh * 1.05 && c.last === 0 && c.lastPre === 0) return;
    if (p === c.last && pre === c.lastPre) return;
    c.last = p;
    c.lastPre = pre;
    run[c.name](c, p, pre);
  });
}
let prevT = performance.now();
function frame(t) {
  const dt = Math.min(64, t - prevT);
  prevT = t;
  if (lenis) lenis.raf(t);
  updateChapters();
  updateFloats();
  updateHero();
  updateHeader();
  updateMarquee(dt);
  requestAnimationFrame(frame);
}

function setMode() {
  const want = !RM && mq.matches;
  if (want === cine && root.classList.contains('cine') === want) return;
  cine = want;
  root.classList.toggle('cine', cine);
  resetInline();
}
function onResize() {
  vw = innerWidth;
  vh = innerHeight;
  setMode();
  clearBigWords();
  chapters.forEach((c) => (c.last = -1));
  measureMarquee();
}
setMode();
measureMarquee();
addEventListener('resize', onResize);
mq.addEventListener('change', onResize);
requestAnimationFrame(frame);
document.fonts && document.fonts.ready.then(() => { clearBigWords(); chapters.forEach((c) => (c.last = -1)); measureMarquee(); });

/* ---------- Revelado al entrar (teléfono y secciones normales) ---------- */
if (!RM) {
  const groups = new Map();
  $$('[data-reveal]').forEach((el) => {
    const key = el.parentElement;
    const i = groups.get(key) || 0;
    el.style.setProperty('--i', Math.min(i, 6));
    groups.set(key, i + 1);
  });
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  $$('[data-reveal]').forEach((el) => io.observe(el));
}

/* ---------- Videos: solo corren cuando se ven ---------- */
const vio = new IntersectionObserver((entries) => entries.forEach((e) => {
  const v = e.target;
  if (e.isIntersecting && !RM) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); }
  else v.pause();
}), { threshold: 0.05 });
$$('video').forEach((v) => vio.observe(v));

/* ---------- Carga: el nombre se dibuja ---------- */
function intro() {
  const loader = $('[data-loader]');
  const markSvg = $('[data-mark-svg]');
  const claim = $$('[data-hero-claim] span');
  const introEls = $$('[data-hero-intro] > *');
  const down = $('[data-hero-down]');
  if (RM || !root.classList.contains('loading')) {
    root.classList.remove('loading');
    heroReady = true;
    return;
  }
  lenis && lenis.stop();
  const paths = $$('path', markSvg);
  const drawables = svg.createDrawable(paths);
  animate(drawables, { draw: '0 0', duration: 0 });
  markSvg.style.opacity = '1';
  claim.forEach((s) => (s.style.transform = 'translateY(110%)'));
  claim.forEach((s) => (s.parentElement.style.overflow = 'hidden'));
  introEls.forEach((s) => { s.style.opacity = '0'; s.style.transform = 'translateY(24px)'; });
  hero.classList.add('is-intro');
  if (down) down.style.opacity = '0';

  const D = 1700;
  animate(drawables, { draw: ['0 0', '0 1'], duration: 950, delay: stagger(115), ease: 'inOutQuad' });
  animate(loader, { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'], duration: 1100, delay: D, ease: 'inOutQuart' });
  animate(heroPhoto, { scale: [1.18, 1], duration: 2000, delay: D, ease: 'outQuart' });
  setTimeout(() => hero.classList.remove('is-intro'), D + 300);
  animate(claim, { translateY: ['110%', '0%'], duration: 1100, delay: stagger(120, { start: D + 500 }), ease: 'outQuart' });
  animate(introEls, { opacity: [0, 1], translateY: [24, 0], duration: 900, delay: stagger(110, { start: D + 700 }), ease: 'outQuart' });
  if (down) animate(down, { opacity: [0, 1], duration: 700, delay: D + 1000 });
  setTimeout(() => {
    root.classList.remove('loading');
    lenis && lenis.start();
  }, D + 1150);
  setTimeout(() => {
    heroReady = true;
    heroPhoto.style.transform = '';
    claim.forEach((s) => { s.style.transform = ''; });
    introEls.forEach((s) => { s.style.transform = ''; s.style.opacity = ''; });
  }, D + 2200);
}
intro();

/* ---------- Anclas ---------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const target = id === '#inicio' ? document.body : $(id);
  if (!target) return;
  e.preventDefault();
  const menu = $('[data-menu]');
  if (menu.open) closeMenu();
  if (a.dataset.sim) setSimPrice(+a.dataset.sim);
  if (a.matches('[data-fav-link]')) setFilter('favoritas');
  scrollToEl(id === '#inicio' ? 0 : target);
  history.replaceState(null, '', id);
});

/* ---------- Menú ---------- */
const menu = $('[data-menu]');
const menuBtn = $('[data-menu-open]');
function closeMenu() {
  menu.close();
  menuBtn.setAttribute('aria-expanded', 'false');
  lenis && lenis.start();
}
menuBtn.addEventListener('click', () => {
  menu.showModal();
  menuBtn.setAttribute('aria-expanded', 'true');
  lenis && lenis.stop();
});
$('[data-menu-close]').addEventListener('click', closeMenu);
menu.addEventListener('close', () => { menuBtn.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); });

/* ---------- Agenda una visita ---------- */
const modal = $('[data-modal]');
const form = $('[data-visita-form]');
const body = $('[data-modal-body]');
const done = $('[data-modal-done]');
const propLine = $('[data-modal-prop]');
const interes = $('[data-interes]');
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-visita]');
  if (!b) return;
  form.reset();
  body.hidden = false;
  done.hidden = true;
  const want = b.dataset.visita;
  if (want) interes.value = want;
  else interes.value = 'Visitar propiedad';
  if (b.dataset.prop) { propLine.textContent = `Propiedad: ${b.dataset.prop}`; propLine.hidden = false; }
  else propLine.hidden = true;
  modal.showModal();
  lenis && lenis.stop();
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  body.hidden = true;
  done.hidden = false;
  $('.modal-t', done).focus();
});
$$('[data-modal-close]').forEach((b) => b.addEventListener('click', () => modal.close()));
modal.addEventListener('close', () => lenis && lenis.start());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

/* ---------- Listado: filtros y favoritas ---------- */
const cards = $$('[data-grid] .card');
const tabs = $$('[data-op]').filter((b) => b.classList.contains('tab'));
const comunaSel = $('[data-comuna]');
const empty = $('[data-empty]');
const KEY = 'arce:favoritas';
let favs = new Set();
try { favs = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { /* sin almacenamiento */ }
const state = { op: 'todas', comuna: '' };

function saveFavs() { try { localStorage.setItem(KEY, JSON.stringify([...favs])); } catch { /* sin almacenamiento */ } }
function paintFavs() {
  const n = favs.size;
  const badge = $('[data-fav-count]');
  badge.textContent = n;
  badge.hidden = n === 0;
  $('[data-fav-tab]').textContent = `(${n})`;
  cards.forEach((c) => {
    const h = $('[data-heart]', c);
    h.setAttribute('aria-pressed', favs.has(c.dataset.id) ? 'true' : 'false');
  });
}
function applyFilter() {
  let shown = 0;
  cards.forEach((c) => {
    const okOp = state.op === 'todas' || (state.op === 'favoritas' ? favs.has(c.dataset.id) : c.dataset.op === state.op);
    const okCom = !state.comuna || c.dataset.comuna === state.comuna;
    const show = okOp && okCom;
    if (show && c.hidden) { c.classList.remove('in'); requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add('in'))); }
    c.hidden = !show;
    if (show) shown++;
  });
  empty.hidden = shown > 0;
  tabs.forEach((t) => t.setAttribute('aria-pressed', t.dataset.op === state.op ? 'true' : 'false'));
}
function setFilter(op) { state.op = op; applyFilter(); }
tabs.forEach((t) => t.addEventListener('click', () => setFilter(t.dataset.op)));
comunaSel.addEventListener('change', () => { state.comuna = comunaSel.value; applyFilter(); });
cards.forEach((c) => {
  $('[data-heart]', c).addEventListener('click', (e) => {
    const id = c.dataset.id;
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    saveFavs();
    paintFavs();
    if (state.op === 'favoritas') applyFilter();
    if (!RM) animate(e.currentTarget, { scale: [0.8, 1.15, 1], duration: 420, ease: 'outQuad' });
  });
});
paintFavs();

/* ---------- Simulador de dividendo ---------- */
const simForm = $('[data-sim-form]');
const clp = (n) => '$' + (Math.round(n / 1000) * 1000).toLocaleString('es-CL');
const uf0 = (n) => 'UF ' + Math.round(n).toLocaleString('es-CL');
const uf1 = (n) => 'UF ' + n.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function calc() {
  const P = +$('#s-precio').value || 0;
  const pie = +$('#s-pie').value || 0;
  const n = +($('input[name="plazo"]:checked', simForm) || { value: 25 }).value * 12;
  const r = (+$('#s-tasa').value || 0) / 100 / 12;
  const uf = +$('#s-uf').value || 0;
  const pieUF = (P * pie) / 100;
  const cred = P - pieUF;
  const cuota = r > 0 ? (cred * r) / (1 - (1 + r) ** -n) : cred / n;
  $('[data-out-clp]').textContent = clp(cuota * uf);
  $('[data-out-uf]').textContent = uf1(cuota);
  $('[data-out-credito]').textContent = uf0(cred);
  $('[data-out-pie]').textContent = `${uf0(pieUF)} · ${clp(pieUF * uf)}`;
  $('[data-out-renta]').textContent = clp((cuota * uf) / 0.25);
}
$$('input[type="range"][data-link]', simForm).forEach((rng) => {
  const num = $('#' + rng.dataset.link);
  rng.addEventListener('input', () => { num.value = rng.value; calc(); });
  num.addEventListener('input', () => { rng.value = num.value; calc(); });
});
simForm.addEventListener('input', calc);
function setSimPrice(v) {
  $('#s-precio').value = v;
  $('input[data-link="s-precio"]').value = v;
  calc();
}
calc();
