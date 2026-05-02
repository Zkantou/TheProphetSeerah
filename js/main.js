/* ============================================================
   SEERAH AL-NOUR — Main Application
   سيرة النور | App Init · Timeline · Interactions
   ============================================================ */

/* ============================================================
   GEOMETRIC STAR PATTERN GENERATOR
   ============================================================ */
const GeometricPattern = {
  /* Returns SVG string of an 8-pointed Islamic star grid */
  createStarGrid(color = 'currentColor', opacity = 0.06) {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <defs>
        <pattern id="star-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <!-- 8-pointed star -->
          <polygon points="30,4 34,18 46,10 38,22 52,26 38,30 46,42 34,34 30,48 26,34 14,42 22,30 8,26 22,22 14,10 26,18"
            fill="none" stroke="${color}" stroke-width="0.6" opacity="${opacity}"/>
          <!-- Inner square -->
          <rect x="22" y="22" width="16" height="16" transform="rotate(45,30,30)"
            fill="none" stroke="${color}" stroke-width="0.4" opacity="${opacity * 0.6}"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#star-grid)"/>
    </svg>`;
  },

  createArabesque(id = 'ar') {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 60" preserveAspectRatio="none">
      <defs>
        <pattern id="arabesque-${id}" x="0" y="0" width="100" height="60" patternUnits="userSpaceOnUse">
          <path d="M0,30 C10,10 20,10 25,30 C30,50 40,50 50,30 C60,10 70,10 75,30 C80,50 90,50 100,30"
            fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>
          <path d="M0,30 C10,50 20,50 25,30 C30,10 40,10 50,30 C60,50 70,50 75,30 C80,10 90,10 100,30"
            fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.15"/>
          <circle cx="25" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>
          <circle cx="75" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="800" height="60" fill="url(#arabesque-${id})"/>
    </svg>`;
  },

  injectPatterns() {
    document.querySelectorAll('[data-pattern="star"]').forEach((el, i) => {
      const color = el.dataset.patternColor || 'currentColor';
      const opacity = parseFloat(el.dataset.patternOpacity || '0.06');
      el.innerHTML = this.createStarGrid(color, opacity);
      el.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(this.createStarGrid(color, opacity))}")`;
    });

    document.querySelectorAll('[data-pattern="arabesque"]').forEach((el, i) => {
      el.innerHTML = this.createArabesque('ar' + i);
    });
  },
};

/* ============================================================
   HERO STARS GENERATOR
   ============================================================ */
const HeroStars = {
  init(containerId = 'hero-stars') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const count = 60;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'hero-star';
      star.style.left   = `${Math.random() * 100}%`;
      star.style.top    = `${Math.random() * 100}%`;
      star.style.width  = `${Math.random() * 2 + 1}px`;
      star.style.height = star.style.width;
      star.style.animationDelay    = `${Math.random() * 8}s`;
      star.style.animationDuration = `${4 + Math.random() * 6}s`;
      container.appendChild(star);
    }
  },
};

/* ============================================================
   PARALLAX HANDLER
   ============================================================ */
const Parallax = {
  elements: [],

  init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.elements = Array.from(document.querySelectorAll('[data-parallax]'));
    if (!this.elements.length) return;
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
  },

  onScroll() {
    const scrollY = window.scrollY;
    this.elements.forEach(el => {
      const speed  = parseFloat(el.dataset.parallax || '0.3');
      const rect   = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (window.innerHeight / 2 - center) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  },
};

/* ============================================================
   SCROLL-TO-TOP BUTTON
   ============================================================ */
const ScrollTop = {
  btn: null,

  init() {
    this.btn = document.getElementById('scroll-top');
    if (!this.btn) return;
    this.btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      this.btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
  },
};

/* ============================================================
   COUNTER ANIMATION — Stats Section
   ============================================================ */
const CounterAnim = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.getAttribute('data-count');
          if (!target) return;
          this.animate(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  },

  animate(el, targetStr) {
    const isNumeric = /^\d+$/.test(targetStr.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    const isArabic  = /[٠-٩]/.test(targetStr);
    const numericTarget = parseInt(targetStr.replace(/[^0-9٠-٩]/g, '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    if (isNaN(numericTarget)) return;

    const duration = 1800;
    const startTime = performance.now();
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

    const toArabic = n => String(n).replace(/\d/g, d => arabicDigits[d]);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * numericTarget);
      el.textContent = isArabic ? toArabic(current) : current;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = targetStr;
    };

    requestAnimationFrame(step);
  },
};

/* ============================================================
   ERA SCROLL DETECTOR — Timeline Background Shifts
   ============================================================ */
const EraScrollDetector = {
  sections: [],
  currentEra: 0,

  init() {
    this.sections = Array.from(document.querySelectorAll('[data-era-section]'));
    if (!this.sections.length) return;
    window.addEventListener('scroll', this.detect.bind(this), { passive: true });
    this.detect();
  },

  detect() {
    const viewportMid = window.scrollY + window.innerHeight / 2;
    let active = 0;
    this.sections.forEach(sec => {
      const top = sec.offsetTop;
      if (viewportMid >= top) active = parseInt(sec.dataset.eraSection);
    });

    if (active !== this.currentEra) {
      this.currentEra = active;
      document.documentElement.setAttribute('data-current-era', active);
      document.dispatchEvent(new CustomEvent('eraChange', { detail: { era: active } }));
    }
  },
};

/* ============================================================
   HIJRI DATE LOOKUP & HELPERS
   ============================================================ */
const HIJRI_DATES = {
  'birth':             { h: 53, era: 'bh' },
  'aminah-death':      { h: 46, era: 'bh' },
  'sham-journey':      { h: 38, era: 'bh' },
  'khadijah-marriage': { h: 25, era: 'bh' },
  'black-stone':       { h: 15, era: 'bh' },
  'first-revelation':  { h: 13, era: 'bh' },
  'public-dawah':      { h: 10, era: 'bh' },
  'abyssinia':         { h:  8, era: 'bh' },
  'boycott':           { h:  7, era: 'bh' },
  'year-of-sorrow':    { h:  4, era: 'bh' },
  'taif-journey':      { h:  3, era: 'bh' },
  'isra-miraj':        { h:  2, era: 'bh' },
  'hijrah':            { h:  1, era: 'ah' },
  'madinah-arrival':   { h:  1, era: 'ah' },
  'brotherhood':       { h:  2, era: 'ah' },
  'qiblah-change':     { h:  2, era: 'ah' },
  'badr':              { h:  2, era: 'ah' },
  'uhud':              { h:  3, era: 'ah' },
  'khandaq':           { h:  5, era: 'ah' },
  'hudaybiyyah':       { h:  6, era: 'ah' },
  'letters-to-kings':  { h:  7, era: 'ah' },
  'makkah-conquest':   { h:  8, era: 'ah' },
  'farewell-hajj':     { h: 10, era: 'ah' },
};

function _hijriLabel(era, lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  return era === 'bh' ? (t.ui?.bh || 'BH') : (t.ui?.ah || 'AH');
}

function getEventHijri(id, lang) {
  const d = HIJRI_DATES[id];
  if (!d) return null;
  return `${d.h} ${_hijriLabel(d.era, lang)}`;
}

function getCompanionHijri(islamDate, lang) {
  if (!islamDate) return null;
  const m = islamDate.match(/\b(\d{3,4})\b/);
  if (!m) return null;
  const ce = parseInt(m[1], 10);
  if (ce < 570 || ce > 700) return null;
  let h, era;
  if (ce < 622) {
    h = Math.round((622 - ce) * 1.030684);
    era = 'bh';
  } else {
    h = Math.max(1, Math.round((ce - 622) * 1.030684) + 1);
    era = 'ah';
  }
  return `${h} ${_hijriLabel(era, lang)}`;
}

/* ============================================================
   MODAL SYSTEM — Event Detail Overlay
   ============================================================ */
const Modal = {
  overlay: null,
  activeId: null,

  init() {
    this.overlay = document.getElementById('event-modal');
    if (!this.overlay) return;

    // Close handlers
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.activeId) this.close();
    });

    document.querySelector('#event-modal .modal-close')?.addEventListener('click', () => this.close());
  },

  open(eventId) {
    if (!this.overlay) return;
    this.activeId = eventId;
    const lang = LangManager.current;
    const events = TRANSLATIONS[lang]?.events || TRANSLATIONS.ar.events;
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    // Populate modal
    const modalYear     = document.getElementById('modal-year');
    const modalTitle    = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalBody     = document.getElementById('modal-body');
    if (modalYear) {
      const hijri = getEventHijri(eventId, lang);
      modalYear.textContent = hijri ? `${ev.year || ''} | ${hijri}` : (ev.year || '');
    }
    if (modalTitle)    modalTitle.textContent     = ev.title;
    if (modalSubtitle) modalSubtitle.textContent  = ev.subtitle || '';
    if (modalBody)     modalBody.textContent      = ev.body || '';

    const quoteEl = document.getElementById('modal-quote');
    if (quoteEl) {
      quoteEl.style.display = ev.quote ? 'block' : 'none';
      if (ev.quote) {
        document.getElementById('modal-quote-text').textContent = ev.quote;
        document.getElementById('modal-quote-source').textContent = ev.quoteSource || '';
      }
    }

    const tagsEl = document.getElementById('modal-tags');
    if (tagsEl && ev.tags) {
      tagsEl.innerHTML = ev.tags.map(t => `<span class="event-tag">${t}</span>`).join('');
    }

    const bkBtn = document.getElementById('modal-bookmark');
    if (bkBtn) {
      bkBtn.setAttribute('data-bookmark', eventId);
      bkBtn.classList.toggle('bookmarked', BookmarkManager.has(eventId));
    }

    this.overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    this.activeId = null;
  },
};

/* ============================================================
   EVENT CARDS RENDERER
   ============================================================ */
const EventRenderer = {
  renderCard(ev, lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
    const isBookmarked = BookmarkManager.has(ev.id);

    return `
    <article class="event-card card-lift reveal" data-era="${ev.era}" id="event-${ev.id}">
      <div class="event-card-era-bar"></div>
      <div class="event-card-body">
        <p class="event-year">${ev.year || ''}${getEventHijri(ev.id, lang) ? `<span class="event-year-sep">|</span>${getEventHijri(ev.id, lang)}` : ''}</p>
        <h3 class="event-title">${ev.title}</h3>
        ${ev.subtitle ? `<p class="event-subtitle">${ev.subtitle}</p>` : ''}
        <p class="event-body">${ev.body || ''}</p>
        ${ev.quote ? `
        <blockquote class="event-quote">
          <span class="event-quote-text">${ev.quote}</span>
          ${ev.quoteSource ? `<cite class="event-quote-source">— ${ev.quoteSource}</cite>` : ''}
        </blockquote>` : ''}
        <div class="event-card-footer">
          <div class="event-tags">
            ${(ev.tags || []).map(tag => `<span class="event-tag">${tag}</span>`).join('')}
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="btn btn-sm btn-outline-gold" onclick="Modal.open('${ev.id}')">
              ${t.ui?.readMore || 'اقرأ المزيد'}
            </button>
            <button class="bookmark-btn" data-bookmark="${ev.id}"
              aria-label="${t.bookmarks?.save || 'حفظ'}"
              aria-pressed="${isBookmarked}"
              ${isBookmarked ? 'class="bookmark-btn bookmarked"' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>`;
  },

  renderAll(containerId, filterEra = 0, lang = 'ar') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const events = TRANSLATIONS[lang]?.events || TRANSLATIONS.ar.events;
    const filtered = filterEra ? events.filter(e => e.era === filterEra) : events;
    container.innerHTML = filtered.map(ev => this.renderCard(ev, lang)).join('');
    ScrollReveal.init();
    BookmarkManager.initButtons();
  },
};

/* ============================================================
   COMPANION CARDS RENDERER
   ============================================================ */
const CompanionRenderer = {
  renderCard(companion, lang) {
    const hijri = getCompanionHijri(companion.islamDate, lang);
    const ceMatch = companion.islamDate && companion.islamDate.match(/\b(\d{3,4})\b/);
    const ceYear = ceMatch ? ceMatch[1] : null;
    const ceLabel = lang === 'ar' ? 'م' : 'CE';
    const dateLine = (ceYear && hijri)
      ? `<p class="companion-year">${ceYear} ${ceLabel} <span class="event-year-sep">|</span> ${hijri}</p>`
      : '';
    return `
    <article class="companion-card reveal" id="companion-${companion.id}">
      <div class="companion-avatar">${companion.name[0]}</div>
      <h3 class="companion-name">${companion.name}</h3>
      <p class="companion-honorific">${companion.honorific}</p>
      ${dateLine}
      <p class="companion-role">${companion.role}</p>
      ${companion.quote ? `<p class="companion-quote">"${companion.quote}"</p>` : ''}
    </article>`;
  },

  renderAll(containerId, lang = 'ar', limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let companions = TRANSLATIONS[lang]?.companions || TRANSLATIONS.ar.companions;
    if (limit) companions = companions.slice(0, limit);
    container.innerHTML = companions.map(c => this.renderCard(c, lang)).join('');
    ScrollReveal.init();
  },
};

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, icon = '✨', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-gold';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity 300ms, transform 300ms';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
};

/* ============================================================
   FILTER TABS — Events/Timeline Filter
   ============================================================ */
const FilterTabs = {
  init(containerId, targetId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const era = parseInt(btn.dataset.filter) || 0;
        EventRenderer.renderAll(targetId, era, LangManager.current);
      });
    });
  },
};

/* ============================================================
   HOMEPAGE — Featured Events (3 most significant)
   ============================================================ */
const HomePageFeatured = {
  FEATURED_IDS: ['first-revelation', 'hijrah', 'makkah-conquest'],

  render(lang = 'ar') {
    const container = document.getElementById('featured-events');
    if (!container) return;
    const events = TRANSLATIONS[lang]?.events || TRANSLATIONS.ar.events;
    const featured = this.FEATURED_IDS.map(id => events.find(e => e.id === id)).filter(Boolean);
    container.innerHTML = featured.map(ev => EventRenderer.renderCard(ev, lang)).join('');
    ScrollReveal.init();
    BookmarkManager.initButtons();
  },
};

/* ============================================================
   ERA CARDS RENDERER
   ============================================================ */
const EraRenderer = {
  render(containerId, lang = 'ar') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
    const eras = t.eras;

    container.innerHTML = Object.entries(eras).map(([key, era], i) => {
      const num = i + 1;
      return `
      <a href="timeline.html?era=${num}" class="era-card reveal" data-era="${num}">
        <span class="era-number">${num}</span>
        <span class="era-badge">${era.years}</span>
        <h3 class="era-name">${era.name}</h3>
        <p class="era-desc">${era.desc}</p>
      </a>`;
    }).join('');

    ScrollReveal.init();
  },
};

/* ============================================================
   STATS RENDERER
   ============================================================ */
const StatsRenderer = {
  render(containerId, lang = 'ar') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const stats = TRANSLATIONS[lang]?.stats || TRANSLATIONS.ar.stats;

    container.innerHTML = stats.map(stat => `
    <div class="stat-card reveal">
      <span class="stat-icon">${stat.icon}</span>
      <div class="stat-number" data-count="${stat.number}">${stat.number}</div>
      <p class="stat-label">${stat.label}</p>
    </div>`).join('');

    CounterAnim.init();
    ScrollReveal.init();
  },
};

/* ============================================================
   CHARACTER TRAITS RENDERER
   ============================================================ */
const TraitsRenderer = {
  render(containerId, lang = 'ar') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const traits = TRANSLATIONS[lang]?.character?.traits || TRANSLATIONS.ar.character.traits;

    container.innerHTML = traits.map(trait => `
    <div class="trait-card reveal">
      <span class="trait-icon">${trait.icon}</span>
      <h3 class="trait-name">${trait.name}</h3>
      <p class="trait-desc">${trait.desc}</p>
    </div>`).join('');

    ScrollReveal.init();
  },
};

/* ============================================================
   NAV TRANSLATOR — updates nav/mobile/footer link text on lang change
   ============================================================ */
const NavTranslator = {
  _map: {
    'index.html':       'home',
    'timeline.html':    'timeline',
    'events.html':      'events',
    'companions.html':  'companions',
    'about.html':       'about',
    'character.html':   'character',
    'family-tree.html': 'family',
    'bookmarks.html':   'bookmarks',
  },
  update(lang) {
    const nav = (TRANSLATIONS[lang] || TRANSLATIONS.ar).nav || {};
    document.querySelectorAll('.nav-link, .mobile-nav-link, .footer-link').forEach(el => {
      const file = (el.getAttribute('href') || '').replace(/^.*\//, '');
      const key  = this._map[file];
      if (key && nav[key]) el.textContent = nav[key];
    });
  },
};

/* ============================================================
   CHARACTER PAGE RENDERER
   ============================================================ */
const CharacterPage = {
  renderDetailTraits(lang) {
    const container = document.getElementById('detail-traits-grid');
    if (!container) return;
    const ch = TRANSLATIONS[lang]?.character || TRANSLATIONS.ar.character;
    const traits = ch.detailTraits || [];
    container.innerHTML = traits.map(t => `
      <div class="trait-detail-card reveal">
        <div class="trait-detail-header">
          <span class="trait-detail-icon">${t.icon}</span>
          <h3 class="trait-detail-name">${t.name}</h3>
        </div>
        <div class="trait-detail-body">
          <p class="trait-detail-desc">${t.desc}</p>
          <blockquote class="trait-hadith">
            <span class="trait-hadith-text">${t.hadith}</span>
            <cite class="trait-hadith-source">${t.source}</cite>
          </blockquote>
        </div>
      </div>`).join('');
    ScrollReveal.init();
  },

  renderShamail(lang) {
    const container = document.getElementById('shamail-list');
    if (!container) return;
    const ch = TRANSLATIONS[lang]?.character || TRANSLATIONS.ar.character;
    const items = ch.shamailItems || [];
    container.innerHTML = items.map(item => `
      <div class="shamail-item reveal">
        <span class="shamail-num">${item.num}</span>
        <div class="shamail-content">
          <h3 class="shamail-title">${item.title}</h3>
          <p class="shamail-text">${item.text}</p>
        </div>
      </div>`).join('');
    ScrollReveal.init();
  },

  renderPage(lang) {
    const ch = TRANSLATIONS[lang]?.character || TRANSLATIONS.ar.character;
    TraitsRenderer.render('traits-grid', lang);
    this.renderDetailTraits(lang);
    this.renderShamail(lang);

    const setText = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
    setText('char-eyebrow',         ch.eyebrow);
    setText('char-quick-eyebrow',   ch.quickEyebrow);
    setText('char-detail-eyebrow',  ch.detailEyebrow);
    setText('char-detail-title',    ch.detailTitle);
    setText('char-shamail-eyebrow', ch.shamailEyebrow);
    setText('char-shamail-title',   ch.shamailTitle);
    setText('char-shamail-sub',     ch.shamailSub);
    setText('char-closing-source',  ch.closingVerseSource);
    setText('char-cta-timeline',    ch.ctaTimeline);
    setText('char-cta-companions',  ch.ctaCompanions);

    const intro = document.getElementById('aisha-intro');
    const quote = document.getElementById('aisha-quote');
    const attr  = document.getElementById('aisha-attr');
    if (intro) intro.textContent = ch.aishaIntro || '';
    if (quote) quote.innerHTML   = `<strong style="color:var(--color-gold-light);">${ch.aishaQuote || ''}</strong>`;
    if (attr)  attr.textContent  = ch.aishaAttr  || '';

    const closing = document.getElementById('char-closing-verse');
    if (closing && ch.closingVerse) closing.textContent = ch.closingVerse;
  },
};

/* ============================================================
   GLOBAL LANG CHANGE HANDLER
   ============================================================ */
document.addEventListener('langChange', ({ detail: { lang } }) => {
  const page = document.body.dataset.page;
  NavTranslator.update(lang);

  if (page === 'home') {
    HomePageFeatured.render(lang);
    EraRenderer.render('eras-grid', lang);
    StatsRenderer.render('stats-grid', lang);
    CompanionRenderer.renderAll('companions-grid', lang, 12);
    TraitsRenderer.render('traits-grid', lang);
  }

  if (page === 'events') {
    EventRenderer.renderAll('events-container', 0, lang);
    FilterTabs.init('filter-tabs', 'events-container');
  }

  if (page === 'companions') {
    CompanionRenderer.renderAll('companions-container', lang);
  }

  if (page === 'character') {
    CharacterPage.renderPage(lang);
  }
});

/* ============================================================
   BOOKMARKS PAGE RENDERER
   ============================================================ */
const BookmarksPage = {
  render(containerId, lang = 'ar') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const ids = BookmarkManager.getAll();
    const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

    if (!ids.length) {
      container.innerHTML = `
      <div style="text-align:center;padding:80px 20px;color:var(--text-muted);">
        <div style="font-size:3rem;margin-bottom:1rem;">🔖</div>
        <p style="font-family:var(--font-arabic);font-size:1.1rem;">${t.bookmarks?.empty || 'لا توجد مفضلات'}</p>
        <p style="font-size:0.9rem;margin-top:0.5rem;">${t.bookmarks?.emptyHint || ''}</p>
      </div>`;
      return;
    }

    const events = TRANSLATIONS[lang]?.events || TRANSLATIONS.ar.events;
    const bookmarked = ids.map(id => events.find(e => e.id === id)).filter(Boolean);
    container.innerHTML = `<div class="events-grid">${bookmarked.map(ev => EventRenderer.renderCard(ev, lang)).join('')}</div>`;
    BookmarkManager.initButtons();
    ScrollReveal.init();
  },
};

/* ============================================================
   APPLICATION INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || 'home';
  const lang = LangManager.current;

  // Universal
  Toast.init();
  HeroStars.init();
  Parallax.init();
  ScrollTop.init();
  GeometricPattern.injectPatterns();
  EraScrollDetector.init();
  Modal.init();
  NavTranslator.update(lang);

  // Page-specific
  if (page === 'home') {
    HomePageFeatured.render(lang);
    EraRenderer.render('eras-grid', lang);
    StatsRenderer.render('stats-grid', lang);
    CompanionRenderer.renderAll('companions-grid', lang, 12);
    TraitsRenderer.render('traits-grid', lang);
  }

  if (page === 'events') {
    EventRenderer.renderAll('events-container', 0, lang);
    FilterTabs.init('filter-tabs', 'events-container');
  }

  if (page === 'companions') {
    CompanionRenderer.renderAll('companions-container', lang);
  }

  if (page === 'character') {
    CharacterPage.renderPage(lang);
  }

  if (page === 'bookmarks') {
    BookmarksPage.render('bookmarks-container', lang);
    document.addEventListener('bookmarksChanged', () => BookmarksPage.render('bookmarks-container', LangManager.current));
  }

  if (page === 'timeline') {
    TimelineApp?.init?.(lang);
  }

  // Bookmark change toast
  document.addEventListener('bookmarksChanged', () => {
    const t = TRANSLATIONS[LangManager.current];
    Toast.show(t?.bookmarks?.saved || 'تم الحفظ', '🔖');
  });

  // Scroll-to-top
  document.getElementById('scroll-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Copy link
  document.querySelectorAll('[data-copy-link]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const t = TRANSLATIONS[LangManager.current];
        Toast.show(t?.ui?.copied || 'تم النسخ', '✅');
      });
    });
  });
});

/* ============================================================
   EXPOSE GLOBALS
   ============================================================ */
window.Modal           = Modal;
window.EventRenderer   = EventRenderer;
window.CompanionRenderer = CompanionRenderer;
window.Toast           = Toast;
window.GeometricPattern= GeometricPattern;
window.BookmarksPage   = BookmarksPage;
