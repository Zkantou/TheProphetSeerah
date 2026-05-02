/* ============================================================
   SEERAH AL-NOUR — Theme & Language Controller
   سيرة النور | Dark/Light Mode + Language Switching
   ============================================================ */

const ThemeManager = {
  current: 'light',

  init() {
    const saved = localStorage.getItem('seerah-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    this.set(initial, false);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('seerah-theme')) {
        this.set(e.matches ? 'dark' : 'light', true);
      }
    });
  },

  set(theme, animate = true) {
    this.current = theme;
    localStorage.setItem('seerah-theme', theme);

    if (animate) {
      document.documentElement.classList.add('theme-transitioning');
      setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 600);
    }

    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');

    // Update toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('data-current-theme', theme);
    });

    // Update icons
    document.querySelectorAll('.theme-icon-sun').forEach(el => {
      el.style.display = theme === 'dark' ? 'block' : 'none';
    });
    document.querySelectorAll('.theme-icon-moon').forEach(el => {
      el.style.display = theme === 'dark' ? 'none' : 'block';
    });

    document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
  },

  toggle() {
    this.set(this.current === 'dark' ? 'light' : 'dark');
  },

  isDark() { return this.current === 'dark'; },
};

/* ============================================================
   LANGUAGE SWITCHER UI
   ============================================================ */
const LangSwitcher = {
  init() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang-btn');
        LangManager.set(lang);
        this.updateUI(lang);
      });
    });
    this.updateUI(LangManager.current);
  },

  updateUI(lang) {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const isActive = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
  },
};

/* ============================================================
   READING PROGRESS BAR
   ============================================================ */
const ReadingProgress = {
  bar: null,

  init() {
    this.bar = document.getElementById('reading-progress');
    if (!this.bar) return;
    window.addEventListener('scroll', this.update.bind(this), { passive: true });
    this.update();
  },

  update() {
    if (!this.bar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.bar.style.width = `${Math.min(100, progress)}%`;
    if (progress > 5) {
      this.bar.classList.add('progress-glow');
    } else {
      this.bar.classList.remove('progress-glow');
    }
  },
};

/* ============================================================
   SCROLL REVEAL OBSERVER
   ============================================================ */
const ScrollReveal = {
  observer: null,

  init() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (entry.target.classList.contains('arabesque-path')) {
            entry.target.classList.add('is-drawn');
          }
          if (!entry.target.classList.contains('animate-persist')) {
            this.observer.unobserve(entry.target);
          }
        }
      });
    }, options);

    document.querySelectorAll('.reveal, .reveal-stagger, .arabesque-path, .line-expand').forEach(el => {
      this.observer.observe(el);
    });
  },

  observe(el) {
    if (this.observer && el) this.observer.observe(el);
  },
};

/* ============================================================
   BOOKMARK SYSTEM
   ============================================================ */
const BookmarkManager = {
  KEY: 'seerah-bookmarks',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch {
      return [];
    }
  },

  has(id) {
    return this.getAll().includes(id);
  },

  toggle(id, btn = null) {
    const bookmarks = this.getAll();
    const idx = bookmarks.indexOf(id);
    if (idx > -1) {
      bookmarks.splice(idx, 1);
      if (btn) {
        btn.classList.remove('bookmarked');
        btn.setAttribute('aria-pressed', 'false');
      }
    } else {
      bookmarks.push(id);
      if (btn) {
        btn.classList.add('bookmarked');
        btn.setAttribute('aria-pressed', 'true');
        this.burstAnimation(btn);
      }
    }
    localStorage.setItem(this.KEY, JSON.stringify(bookmarks));
    document.dispatchEvent(new CustomEvent('bookmarksChanged', { detail: { bookmarks } }));
    return !bookmarks.includes(id); // returns true if now bookmarked
  },

  burstAnimation(btn) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('span');
      particle.className = 'bookmark-particle';
      const angle = (i / 8) * 360;
      const distance = 30 + Math.random() * 20;
      const px = Math.cos((angle * Math.PI) / 180) * distance;
      const py = Math.sin((angle * Math.PI) / 180) * distance;
      particle.style.setProperty('--px', `${px}px`);
      particle.style.setProperty('--py', `${py}px`);
      btn.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove());
    }
  },

  initButtons() {
    document.querySelectorAll('[data-bookmark]').forEach(btn => {
      const id = btn.getAttribute('data-bookmark');
      if (this.has(id)) btn.classList.add('bookmarked');
      btn.addEventListener('click', () => this.toggle(id, btn));
    });
  },
};

/* ============================================================
   SMART SEARCH
   ============================================================ */
const SearchManager = {
  index: [],
  modal: null,

  buildIndex() {
    const t = TRANSLATIONS;
    const lang = LangManager.current;
    const events = t[lang]?.events || t.ar.events;

    this.index = events.map(e => ({
      id: e.id,
      title: e.title,
      subtitle: e.subtitle || '',
      body: e.body || '',
      year: e.year || '',
      tags: (e.tags || []).join(' '),
      type: 'event',
    }));

    const companions = (t[lang]?.companions || t.ar.companions).map(c => ({
      id: c.id,
      title: c.name,
      subtitle: c.role || '',
      body: c.desc || '',
      type: 'companion',
    }));

    this.index = [...this.index, ...companions];
  },

  search(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return this.index.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      item.tags?.toLowerCase().includes(q) ||
      item.year?.includes(q)
    ).slice(0, 12);
  },

  init() {
    this.buildIndex();
    document.addEventListener('langChange', () => this.buildIndex());

    const inputs = document.querySelectorAll('[data-search-input]');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const results = this.search(e.target.value);
        this.renderResults(results, e.target.closest('[data-search-container]'));
      });
    });
  },

  renderResults(results, container) {
    if (!container) return;
    let resultsEl = container.querySelector('[data-search-results]');
    if (!resultsEl) return;

    if (results.length === 0) {
      resultsEl.innerHTML = '';
      resultsEl.style.display = 'none';
      return;
    }

    resultsEl.style.display = 'block';
    resultsEl.innerHTML = results.map(r => `
      <a href="${r.type === 'event' ? '#event-' + r.id : 'companions.html#' + r.id}"
         class="search-result-item" data-type="${r.type}">
        <span class="search-result-type">${r.type === 'event' ? '📅' : '👤'}</span>
        <span class="search-result-title">${r.title}</span>
        <span class="search-result-sub">${r.year || r.subtitle || ''}</span>
      </a>
    `).join('');
  },
};

/* ============================================================
   NAVIGATION — Sticky + Shrink on scroll
   ============================================================ */
const NavManager = {
  nav: null,
  lastScroll: 0,

  init() {
    this.nav = document.getElementById('main-nav');
    if (!this.nav) return;
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
  },

  onScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      this.nav.classList.add('nav-scrolled');
    } else {
      this.nav.classList.remove('nav-scrolled');
    }

    this.lastScroll = scrollY;
  },
};

/* ============================================================
   MOBILE MENU
   ============================================================ */
const MobileMenu = {
  isOpen: false,
  btn: null,
  menu: null,

  init() {
    this.btn = document.getElementById('menu-toggle');
    this.menu = document.getElementById('mobile-menu');
    if (!this.btn || !this.menu) return;

    this.btn.addEventListener('click', () => this.toggle());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menu.contains(e.target) && !this.btn.contains(e.target)) {
        this.close();
      }
    });
  },

  toggle() {
    this.isOpen ? this.close() : this.open();
  },

  open() {
    this.isOpen = true;
    this.menu.classList.add('is-open');
    this.btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.isOpen = false;
    this.menu.classList.remove('is-open');
    this.btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },
};

/* ============================================================
   INITIALIZE ALL SYSTEMS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  LangManager.init();
  LangSwitcher.init();
  ReadingProgress.init();
  ScrollReveal.init();
  BookmarkManager.initButtons();
  SearchManager.init();
  NavManager.init();
  MobileMenu.init();

  // Theme toggle buttons
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => ThemeManager.toggle());
  });
});

window.ThemeManager = ThemeManager;
window.BookmarkManager = BookmarkManager;
window.SearchManager = SearchManager;
