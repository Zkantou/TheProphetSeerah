/* ============================================================
   SEERAH AL-NOUR — Interactive Timeline Engine
   سيرة النور | Vertical Scroll Timeline with Era Shifts
   ============================================================ */

const TimelineApp = {
  currentEra: 0,
  activeFilter: 0,
  rendered: [],

  ERA_COLORS: {
    1: { bg: 'var(--era1-bg)',  accent: 'var(--era1-accent)',  text: 'var(--era1-text)' },
    2: { bg: 'var(--era2-bg)',  accent: 'var(--era2-accent)',  text: 'var(--era2-text)' },
    3: { bg: 'var(--era3-bg)',  accent: 'var(--era3-accent)',  text: 'var(--era3-text)' },
    4: { bg: 'var(--era4-bg)',  accent: 'var(--era4-accent)',  text: 'var(--era4-text)' },
    5: { bg: 'var(--era5-bg)',  accent: 'var(--era5-accent)',  text: 'var(--era5-text)' },
    6: { bg: 'var(--era6-bg)',  accent: 'var(--era6-accent)',  text: 'var(--era6-text)' },
  },

  ERA_NAMES_AR: {
    1: 'قبل البعثة',
    2: 'مكة المكرمة الأولى',
    3: 'مكة المكرمة الأخيرة',
    4: 'الهجرة المباركة',
    5: 'المدينة المنورة',
    6: 'عام الوداع',
  },

  init(lang = 'ar') {
    this.lang = lang;
    this.renderTimeline(lang);
    this.initScrollSpy();
    this.initFilters();
    this.initEraNav();
    this.handleURLParam();
  },

  handleURLParam() {
    const params = new URLSearchParams(window.location.search);
    const era = parseInt(params.get('era'));
    if (era && era >= 1 && era <= 6) {
      setTimeout(() => {
        const section = document.querySelector(`[data-era-block="${era}"]`);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  },

  renderTimeline(lang = 'ar') {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
    const events = (TRANSLATIONS[lang]?.events || TRANSLATIONS.ar.events)
      .filter(ev => (!this.activeFilter || ev.era === this.activeFilter)
                 && ev.era >= (this.eraMin || 1));

    // Group by era
    const byEra = {};
    events.forEach(ev => {
      if (!byEra[ev.era]) byEra[ev.era] = [];
      byEra[ev.era].push(ev);
    });

    container.innerHTML = Object.entries(byEra).map(([eraNum, eraEvents]) => {
      const era = parseInt(eraNum);
      const eraName = t.eras[`era${era}`]?.name || this.ERA_NAMES_AR[era];
      const eraYears = t.eras[`era${era}`]?.years || '';

      return `
      <section class="timeline-era-block" data-era-block="${era}" id="era-${era}">
        <!-- Era Header -->
        <div class="timeline-era-header" data-era="${era}">
          <div class="timeline-era-header-inner">
            <span class="timeline-era-num">${era}</span>
            <div>
              <h2 class="timeline-era-title">${eraName}</h2>
              <p class="timeline-era-years">${eraYears}</p>
            </div>
          </div>
          <div class="timeline-era-desc">${t.eras[`era${era}`]?.desc || ''}</div>
        </div>

        <!-- Timeline events for this era -->
        <div class="timeline-track">
          <!-- Vertical line -->
          <div class="timeline-line" data-era="${era}"></div>

          ${eraEvents.map((ev, idx) => this.renderEvent(ev, idx, lang)).join('')}
        </div>
      </section>`;
    }).join('');

    // Re-init observers after render
    setTimeout(() => {
      if (window.ScrollReveal) ScrollReveal.init();
      if (window.BookmarkManager) BookmarkManager.initButtons();
      this.initNodeHovers();
    }, 100);
  },

  renderEvent(ev, idx, lang = 'ar') {
    const side = idx % 2 === 0 ? 'left' : 'right';
    const isBookmarked = window.BookmarkManager?.has(ev.id);

    return `
    <div class="timeline-event" data-side="${side}" data-era="${ev.era}" id="tl-${ev.id}">
      <!-- Node -->
      <div class="timeline-node-wrap">
        <button class="timeline-node" data-era="${ev.era}"
          onclick="TimelineApp.openEvent('${ev.id}')"
          aria-label="${ev.title}"
          aria-describedby="tl-desc-${ev.id}">
          <span class="timeline-node-inner"></span>
        </button>
        <span class="timeline-node-year">${ev.year || ''}</span>
      </div>

      <!-- Card -->
      <article class="timeline-card reveal" data-era="${ev.era}"
               id="tl-desc-${ev.id}">
        <div class="timeline-card-era-bar" data-era="${ev.era}"></div>
        <div class="timeline-card-body">
          <p class="timeline-event-year">${ev.year || ''}</p>
          <h3 class="timeline-event-title">${ev.title}</h3>
          ${ev.subtitle ? `<p class="timeline-event-location">📍 ${ev.subtitle}</p>` : ''}
          <p class="timeline-event-body">${(ev.body || '').slice(0, 200)}${ev.body?.length > 200 ? '…' : ''}</p>

          ${ev.quote ? `
          <blockquote class="timeline-event-quote">
            <span class="event-quote-text">${ev.quote}</span>
            ${ev.quoteSource ? `<cite class="event-quote-source">— ${ev.quoteSource}</cite>` : ''}
          </blockquote>` : ''}

          <div class="timeline-card-footer">
            <div class="event-tags">
              ${(ev.tags || []).slice(0, 3).map(t => `<span class="event-tag">${t}</span>`).join('')}
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm btn-outline-gold"
                      onclick="TimelineApp.openEvent('${ev.id}')">
                القصة كاملة
              </button>
              <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}"
                      data-bookmark="${ev.id}"
                      aria-pressed="${isBookmarked || false}">
                <svg width="14" height="14" viewBox="0 0 24 24"
                     fill="${isBookmarked ? 'currentColor' : 'none'}"
                     stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>`;
  },

  openEvent(id) {
    if (window.Modal) Modal.open(id);
  },

  /* ── Scroll spy: detect current era as user scrolls ── */
  initScrollSpy() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const era = parseInt(entry.target.dataset.eraBlock);
          if (era && era !== this.currentEra) {
            this.currentEra = era;
            this.updateActiveEra(era);
          }
        }
      });
    }, { threshold: 0.2, rootMargin: '-100px 0px -50% 0px' });

    document.querySelectorAll('[data-era-block]').forEach(el => observer.observe(el));
  },

  updateActiveEra(era) {
    // Update era indicator
    const indicator = document.getElementById('era-indicator');
    if (indicator) {
      indicator.textContent = this.ERA_NAMES_AR[era] || '';
      indicator.setAttribute('data-era', era);
    }

    // Update era nav pills
    document.querySelectorAll('.era-nav-pill').forEach(pill => {
      pill.classList.toggle('active', parseInt(pill.dataset.era) === era);
    });

    // Shift page background subtly
    const body = document.getElementById('timeline-bg');
    if (body) {
      body.setAttribute('data-current-era', era);
    }
  },

  /* ── Filter tabs ── */
  initFilters() {
    document.querySelectorAll('[data-timeline-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-timeline-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = parseInt(btn.dataset.timelineFilter) || 0;
        this.renderTimeline(this.lang || LangManager.current);
      });
    });
  },

  /* ── Era side nav ── */
  initEraNav() {
    document.querySelectorAll('.era-nav-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const era = pill.dataset.era;
        const target = document.getElementById(`era-${era}`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  },

  /* ── Node hover ripple ── */
  initNodeHovers() {
    document.querySelectorAll('.timeline-node').forEach(node => {
      node.addEventListener('mouseenter', () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const ripple = document.createElement('span');
        ripple.className = 'node-ripple';
        node.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  },
};

/* ── Language change: re-render timeline ── */
document.addEventListener('langChange', ({ detail: { lang } }) => {
  if (document.body.dataset.page === 'timeline') {
    TimelineApp.lang = lang;
    TimelineApp.renderTimeline(lang);
    TimelineApp.initScrollSpy();
    TimelineApp.initNodeHovers();
  }
});

window.TimelineApp = TimelineApp;
