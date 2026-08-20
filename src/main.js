import './style.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LANGS, DEFAULT_LANG, applyLanguage, translate } from './i18n.js';

gsap.registerPlugin(ScrollTrigger);

/* ---------------- Language ---------------- */
let currentLang = localStorage.getItem('mira-lux-lang');
if (!LANGS.includes(currentLang)) currentLang = DEFAULT_LANG;

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('mira-lux-lang', lang);
  applyLanguage(lang);
  const langCode = document.getElementById('lang-code');
  if (langCode) langCode.textContent = lang.toUpperCase();
}
setLang(currentLang);

const langBtn = document.getElementById('lang-btn');
langBtn?.addEventListener('click', () => {
  setLang(LANGS[(LANGS.indexOf(currentLang) + 1) % LANGS.length]);
});

/* ---------------- Search bar -> Telegram ---------------- */
const searchForm = document.getElementById('search-form');
searchForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const destination = document.getElementById('search-destination').value;
  const checkin = document.getElementById('search-checkin').value;
  const checkout = document.getElementById('search-checkout').value;
  const travelers = document.getElementById('search-travelers').value || '2';

  const lines = [translate(currentLang, 'search.msg.greeting')];
  if (destination) lines.push(`${translate(currentLang, 'search.msg.destination')}: ${destination}`);
  if (checkin) lines.push(`${translate(currentLang, 'search.msg.checkin')}: ${checkin}`);
  if (checkout) lines.push(`${translate(currentLang, 'search.msg.checkout')}: ${checkout}`);
  lines.push(`${translate(currentLang, 'search.msg.travelers')}: ${travelers}`);

  const url = `https://t.me/Miralux_travel?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank', 'noopener');
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
const isFinePointer = window.matchMedia('(pointer: fine)').matches;

/* ---------------- Smooth scroll ---------------- */
let lenis;
if (!reduceMotion) {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------------- Loader ---------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const word = document.querySelector('.loader-word');
  const tl = gsap.timeline({
    onComplete: () => {
      loader.classList.add('is-hidden');
      ScrollTrigger.refresh();
    },
  });
  tl.to(word, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    .to(word, { opacity: 1, duration: 0.3 })
    .to(loader, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, '+=0.15')
    .call(() => heroIntro());
});

/* ---------------- Split text into chars ---------------- */
function splitChars(el) {
  const words = el.textContent.split(' ');
  el.textContent = '';
  words.forEach((word, wi) => {
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';
    [...word].forEach((ch) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'split-char';
      charSpan.textContent = ch;
      wordSpan.appendChild(charSpan);
    });
    el.appendChild(wordSpan);
    if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return el.querySelectorAll('.split-char');
}

const heroLines = document.querySelectorAll('[data-split-line]');
const heroChars = [];
heroLines.forEach((line) => heroChars.push(...splitChars(line)));
if (reduceMotion) {
  heroChars.forEach((c) => (c.style.opacity = 1));
}

/* ---------------- Hero intro ---------------- */
function heroIntro() {
  if (reduceMotion) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero-img', { scale: 1.18, duration: 2, ease: 'power2.out' }, 0)
    .from(heroChars, {
      y: '110%',
      rotate: 6,
      opacity: 0,
      duration: 1,
      stagger: 0.018,
    }, 0.3)
    .from('#hero [data-reveal]', {
      y: 24,
      opacity: 0,
      duration: 0.9,
      stagger: 0.08,
    }, 1)
    .from('.hero-badge', { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(2)' }, 1.2);
}

/* ---------------- Nav scroll state ---------------- */
const nav = document.getElementById('site-nav');
ScrollTrigger.create({
  start: 'top -80',
  end: 99999,
  onUpdate: (self) => {
    nav.classList.toggle('scrolled', self.scroll() > 80);
  },
});

/* ---------------- Mobile menu ---------------- */
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;
function setMenu(open) {
  menuOpen = open;
  menuBtn.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) lenis?.stop(); else lenis?.start();
}
menuBtn?.addEventListener('click', () => setMenu(!menuOpen));
mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

/* ---------------- Cursor ring ---------------- */
if (!reduceMotion && isFinePointer) {
  const ring = document.getElementById('cursor-ring');
  const dot = document.getElementById('cursor-dot');
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
  window.addEventListener('mousemove', (e) => {
    ringX(e.clientX); ringY(e.clientY);
    dotX(e.clientX); dotY(e.clientY);
  });
  document.querySelectorAll('a, button, [data-magnetic]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('is-active');
      gsap.to(ring, { scale: 1.8, duration: 0.25, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('is-active');
      gsap.to(ring, { scale: 1, duration: 0.25, ease: 'power3.out' });
    });
  });
} else {
  document.getElementById('cursor-ring')?.remove();
  document.getElementById('cursor-dot')?.remove();
}

/* ---------------- Magnetic buttons ---------------- */
if (!reduceMotion && isFinePointer) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.35);
      qy((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('mouseleave', () => { qx(0); qy(0); });
  });
}

/* ---------------- Hero mouse tilt ---------------- */
const tiltScene = document.querySelector('[data-tilt-scene]');
if (!reduceMotion && isFinePointer && tiltScene) {
  const layers = document.querySelectorAll('[data-tilt-layer]');
  const hero = document.getElementById('hero');
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.tiltLayer);
      gsap.to(layer, { x: px * 18 * depth, y: py * 12 * depth, duration: 0.8, ease: 'power3.out' });
    });
  });
}

/* ---------------- Marquee ---------------- */
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  if (!reduceMotion) {
    const marqueeTween = gsap.to(marqueeTrack, {
      xPercent: -50,
      duration: 28,
      ease: 'none',
      repeat: -1,
    });
    marqueeTrack.closest('.marquee-band').addEventListener('mouseenter', () => marqueeTween.timeScale(0.25));
    marqueeTrack.closest('.marquee-band').addEventListener('mouseleave', () => marqueeTween.timeScale(1));
  }
}

/* ---------------- Rotating hero badge ---------------- */
const badgeRing = document.querySelector('.hero-badge-ring');
if (badgeRing && !reduceMotion) {
  gsap.to(badgeRing, { rotate: 360, duration: 22, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
}

/* ---------------- Scroll reveals ---------------- */
if (!reduceMotion) {
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    if (el.closest('#hero')) return;
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.way-item').forEach((el, i) => {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      rotate: i % 2 === 0 ? -12 : 12,
      duration: 0.8,
      delay: i * 0.06,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: el.closest('.way-row'),
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  /* Parallax background images */
  gsap.utils.toArray('[data-speed]').forEach((img) => {
    const speed = parseFloat(img.dataset.speed);
    gsap.to(img, {
      yPercent: (1 - speed) * 30,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* Ken Burns slow zoom */
  gsap.utils.toArray('[data-kenburns]').forEach((img) => {
    gsap.fromTo(img, { scale: 1 }, {
      scale: 1.12,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* Curtain reveal */
  gsap.utils.toArray('.curtain-panel').forEach((panel) => {
    gsap.to(panel, {
      scaleX: 0,
      duration: 1.1,
      ease: 'power4.inOut',
      scrollTrigger: {
        trigger: panel.closest('.curtain-frame'),
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });
  });
} else {
  document.querySelectorAll('[data-reveal], .way-item, .split-char').forEach((el) => {
    el.style.opacity = 1;
  });
  document.querySelectorAll('.curtain-panel').forEach((p) => (p.style.transform = 'scaleX(0)'));
}

/* ---------------- Destinations horizontal scroll hijack (desktop only) ---------------- */
const hpanWrap = document.getElementById('dest-hpan-wrap');
const hpanTrack = document.getElementById('dest-hpan-track');
if (hpanWrap && hpanTrack && !reduceMotion && isDesktop) {
  let st;
  const setup = () => {
    st?.kill();
    const distance = hpanTrack.scrollWidth - window.innerWidth + 80;
    if (distance <= 0) return;
    gsap.set(hpanTrack, { x: 0 });
    st = ScrollTrigger.create({
      trigger: hpanWrap,
      start: 'top top+=76',
      end: () => `+=${distance + 500}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      animation: gsap.to(hpanTrack, { x: -distance, ease: 'none' }),
    });
  };
  window.addEventListener('load', () => {
    setup();
    ScrollTrigger.refresh();
  });
}

/* ---------------- Dest card tilt (desktop only) ---------------- */
if (!reduceMotion && isFinePointer) {
  document.querySelectorAll('.dest-card').forEach((card) => {
    const quickX = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power3.out' });
    const quickY = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power3.out' });
    card.style.transformPerspective = 700;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      quickX(px * 12);
      quickY(-py * 12);
    });
    card.addEventListener('mouseleave', () => {
      quickX(0);
      quickY(0);
    });
  });
}

/* ---------------- Spotlight cards ---------------- */
document.querySelectorAll('.spotlight-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--sx', `${e.clientX - r.left}px`);
    card.style.setProperty('--sy', `${e.clientY - r.top}px`);
  });
});

/* ---------------- Play film / video buttons ---------------- */
document.querySelectorAll('#play-film, .play-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    gsap.fromTo(btn, { scale: 1 }, { scale: 0.9, duration: 0.12, yoyo: true, repeat: 1 });
  });
});

/* ---------------- Resize safety ---------------- */
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});
