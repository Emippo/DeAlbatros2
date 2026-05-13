// ============================================================
// components.js — 102e FOS De Albatros
// Injects shared topbar, nav, footer & login modal
//
// Gebruik in elke pagina:
//   <script>window.ACTIVE_PAGE='index';</script>
//   <script src="js/components.js"></script>
//
// Voor pagina's in een submap (bv. Takken/bevers.html):
//   <script>window.ACTIVE_PAGE='takken'; window.COMPONENTS_DEPTH=1;</script>
//   <script src="../js/components.js"></script>
// ============================================================

(function () {

  const depth  = window.COMPONENTS_DEPTH || 0;
  const prefix = depth > 0 ? '../'.repeat(depth) : '';

  // ── Nav ──────────────────────────────────────────────────
  function buildNav(activePage) {
    const links = [
      { id: 'index',          href: prefix + 'index.html',          icon: 'ti-home',        label: 'Home' },
      { id: 'info',           href: prefix + 'info.html',           icon: 'ti-info-circle',  label: 'Info' },
      { id: 'takken',         href: prefix + 'info/leiding.html',   icon: 'ti-users',        label: 'Leiding' },
      { id: 'fotos',          href: prefix + 'fotos.html',          icon: 'ti-photo',        label: "Foto's" },
      { id: 'kalender',       href: prefix + 'kalender.html',       icon: 'ti-calendar',     label: 'Kalender' },
      { id: 'albatrossertje', href: prefix + 'albatrossertje.html', icon: 'ti-news',         label: "'t Albatrossertje" },
      { id: 'fosshop',        href: prefix + 'fosshop.html',        icon: 'ti-shirt',        label: 'FOS-shop' },
      { id: 'contact',        href: prefix + 'contact.html',        icon: 'ti-mail',         label: 'Contact' },
      { id: 'facebook',        href: 'http://www.facebook.com/FOSalbatros',   icon:'ti-brand-facebook', label: 'Facebook' },
      { id: 'instagram',        href: 'https://www.instagram.com/de_albatros/', icon:'ti-brand-instagram', label: 'Instagram'}
    ];

    const sidebarLinks = links.map(l => `
      <a href="${l.href}" class="sidebar-link${activePage === l.id ? ' active' : ''}">
        <i class="ti ${l.icon}"></i>
        <span>${l.label}</span>
      </a>`).join('');

    const takken = [
      { href: prefix + 'takken/bevers.html',  kleur: '#E24B4A', emoji: '🦫', label: 'Bevers' },
      { href: prefix + 'takken/welpen.html',  kleur: '#EF9F27', emoji: '🐺', label: 'Welpen' },
      { href: prefix + 'takken/jvg.html',     kleur: '#2D6A1F', emoji: '🌿', label: "JVG's" },
      { href: prefix + 'takken/vg.html',      kleur: '#1A5276', emoji: '⚜️', label: "VG's" },
      { href: prefix + 'takken/seniors.html', kleur: '#7F77DD', emoji: '🔥', label: 'Seniors' },
      { href: prefix + 'takken/stam.html',    kleur: '#5a5a6a', emoji: '🏕️', label: 'Stam' },
    ];
    const takkenLinks = takken.map(t => `
      <a href="${t.href}" class="sidebar-tak-link">
        <span class="sidebar-tak-dot" style="background:${t.kleur}">${t.emoji}</span>
        <span>${t.label}</span>
      </a>`).join('');

    return `
<nav id="mainNav">
  <a href="${prefix}index.html" class="nav-logo" id="navLogo">
    <img src="${prefix}img/logo.png" onerror="this.style.display='none'" alt="Logo 102e FOS De Albatros" id="navLogoImg">
    <div class="nav-logo-text" id="navLogoText">De Albatros<small>102e FOS · Knokke-Heist</small></div>
  </a>

  <button class="hamburger" id="hamburgerBtn" onclick="toggleSidebar()" aria-label="Menu openen">
    <span></span><span></span><span></span>
  </button>
</nav>

<!-- Sidebar overlay -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

<!-- Sidebar drawer -->
<div class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <a href="${prefix}index.html" class="sidebar-logo">
      <img src="${prefix}img/logo.png" onerror="this.style.display='none'" alt="">
      <div>
        <strong>De Albatros</strong>
        <small>102e FOS · Knokke-Heist</small>
      </div>
    </a>
    <button class="sidebar-close" onclick="closeSidebar()"><i class="ti ti-x"></i></button>
  </div>

  <div class="sidebar-body">
    <div class="sidebar-section-label">Navigatie</div>
    ${sidebarLinks}

    <div class="sidebar-divider"></div>
    <div class="sidebar-section-label">Takken</div>
    ${takkenLinks}

    <div class="sidebar-divider"></div>
    <a href="http://www.keeo.fos.be" class="sidebar-cta" target="_blank">
      <i class="ti ti-user-plus"></i> Lid worden
    </a>

    <div class="sidebar-divider"></div>
    <div class="sidebar-login-area">
      <button class="sidebar-login-btn" id="loginBtn" onclick="openLogin()">
        <i class="ti ti-user"></i> Inloggen als leiding
      </button>
      <div class="user-chip" id="userChip" style="display:none"></div>
    </div>
  </div>
</div>
`;
  }

  // ── Footer ───────────────────────────────────────────────
  function buildFooter() {
    return `
<footer>
  <div class="footer-inner">
    <div>
      <img src="${prefix}img/logo.png" onerror="this.style.display='none'" alt="Logo" style="width:52px;height:52px;border-radius:50%;margin-bottom:.6rem">
      <div><strong style="color:var(--yellow)">102e FOS De Albatros</strong></div>
      <div style="margin-top:.2rem;opacity:.6">Knokke-Heist · <a href="http://www.fos.be" style="color:rgba(255,255,255,.4)" target="_blank">FOS Open Scouting</a></div>
      <div class="footer-social">
        <a href="http://www.facebook.com/FOSalbatros" target="_blank"><i class="ti ti-brand-facebook"></i> Facebook</a>
        <a href="https://www.instagram.com/de_albatros/" target="_blank"><i class="ti ti-brand-instagram"></i> Instagram</a>
      </div>
    </div>
    <div class="footer-col"><h4>Navigatie</h4>
      <div class="footer-links-col">
        <a href="${prefix}takken.html">Onze takken</a>
        <a href="${prefix}fotos.html">Foto's</a>
        <a href="${prefix}kalender.html">Kalender</a>
        <a href="${prefix}albatrossertje.html">'t Albatrossertje</a>
        <a href="${prefix}contact.html">Contact</a>
      </div>
    </div>
    <div class="footer-col"><h4>Takken</h4>
      <div class="footer-links-col">
        <a href="${prefix}takken/bevers.html">Bevers</a>
        <a href="${prefix}takken/welpen.html">Welpen</a>
        <a href="${prefix}takken/jvg.html">JVG's</a>
        <a href="${prefix}takken/vg.html">VG's</a>
        <a href="${prefix}takken/seniors.html">Seniors</a>
        <a href="${prefix}takken/stam.html">Stam</a>
      </div>
    </div>
    <div class="footer-col"><h4>Info</h4>
      <div class="footer-links-col">
        <a href="${prefix}info.html">Algemene info</a>
        <a href="${prefix}fosshop.html">FOS-shop</a>
        <a href="${prefix}info/leiding.html" target="_blank">Onze Leiding</a>
        <a href="${prefix}info/kampen.html" target="_blank">Kampen</a>
        <a href="${prefix}info/vzw.html" target="_blank">VZW</a>
      </div>
    </div>
    <div class="footer-col"><h4>Contact</h4>
      <div class="footer-links-col">
        <a href="mailto:eenheidsleiding@dealbatros.be">eenheidsleiding@dealbatros.be</a>
        <a href="${prefix}contact.html">Contactpagina</a>
        <a href="http://www.keeo.fos.be" target="_blank">Keeo ouderportaal</a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">© 2026 102e FOS De Albatros · Knokke-Heist</div>
</footer>`;
  }

  // ── Login Modal ──────────────────────────────────────────
  function buildLoginModal() {
    return `
<div id="loginModal" class="modal" onclick="if(event.target===this)closeLogin()">
  <div class="modal-content login-modal-box">
    <button class="close-btn" onclick="closeLogin()"><i class="ti ti-x"></i></button>
    <div class="login-logo">
      <img src="${prefix}img/logo.png" onerror="this.style.background='var(--blue-pale)'" alt="">
    </div>
    <h2>Inloggen</h2>
    <p class="login-sub">Leiding van 102e FOS De Albatros</p>
    <div class="login-field">
      <label>E-mailadres</label>
      <input type="email" id="loginEmail" placeholder="jouw@email.be" autocomplete="email">
    </div>
    <div class="login-field">
      <label>Wachtwoord</label>
      <input type="password" id="loginPassword" placeholder="Wachtwoord" autocomplete="current-password">
    </div>
    <div id="loginError" class="login-error"></div>
    <button id="loginSubmitBtn" class="btn-login-submit" onclick="doLogin()">
      <i class="ti ti-login"></i> Inloggen
    </button>
    <p class="login-footer-note">Problemen met inloggen? Contacteer de eenheidsleiding.</p>
  </div>
</div>`;
  }

  // ── Inject everything ────────────────────────────────────
  function inject() {
    const activePage  = window.ACTIVE_PAGE  || 'index';

    const body = document.body;

    // Insert topbar + nav + modal BEFORE page content
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildNav(activePage) + buildLoginModal();
    while (wrapper.firstChild) {
      body.insertBefore(wrapper.firstChild, body.firstChild);
    }

    // Append footer AFTER page content
    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = buildFooter();
    body.appendChild(footerDiv.firstElementChild);

    // Load auth.js dynamically
    const authScript = document.createElement('script');
    authScript.src = prefix + 'js/auth.js';
    document.head.appendChild(authScript);

    // ── Sidebar functies ─────────────────────────────────────
    window.toggleSidebar = function() {
      const sidebar  = document.getElementById('sidebar');
      const overlay  = document.getElementById('sidebarOverlay');
      const hamburger = document.getElementById('hamburgerBtn');
      if (!sidebar) return;
      const open = sidebar.classList.toggle('open');
      overlay.classList.toggle('open', open);
      hamburger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    window.closeSidebar = function() {
      const sidebar  = document.getElementById('sidebar');
      const overlay  = document.getElementById('sidebarOverlay');
      const hamburger = document.getElementById('hamburgerBtn');
      if (!sidebar) return;
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    };

// ── Vloeiende scroll-animatie (geen CSS-transition, directe interpolatie) ──
(function () {
  // Scroll-bereik waarbinnen de nav krimpt
  const SCROLL_START = 0;   // px: begint te krimpen
  const SCROLL_END   = 120; // px: volledig gekrompen

  // Nav-waarden: [groot, klein]
  const PAD_TOP_BIG   = .65, PAD_TOP_SM   = .30; // rem
  const LOGO_BIG      = 74,  LOGO_SM      = 36;  // px
  const FONT_BIG      = 1.1, FONT_SM      = .82; // rem

  // Sponsor-slideshow interval (ms)
  const SLIDE_MS = 3000;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  let raf = null;
  let lastY = -1;

  function applyScroll() {
    const y = window.scrollY;
    if (y === lastY) { raf = null; return; }
    lastY = y;

    const t = clamp((y - SCROLL_START) / (SCROLL_END - SCROLL_START), 0, 1);

    const nav  = document.getElementById('mainNav');
    const img  = document.getElementById('navLogoImg');
    const txt  = document.getElementById('navLogoText');
    const small = txt?.querySelector('small');
    if (!nav || !img || !txt) { raf = null; return; }

    // Padding
    const pad = lerp(PAD_TOP_BIG, PAD_TOP_SM, t);
    nav.style.paddingTop    = pad + 'rem';
    nav.style.paddingBottom = pad + 'rem';

    // Logo grootte
    const sz = lerp(LOGO_BIG, LOGO_SM, t);
    img.style.width  = sz + 'px';
    img.style.height = sz + 'px';

    // Logo tekst
    const fs = lerp(FONT_BIG, FONT_SM, t);
    txt.style.fontSize = fs + 'rem';

    // Subtitel (102e FOS…) fade + inkrimpen
    if (small) {
      small.style.opacity   = 1 - t;
      small.style.maxHeight = lerp(20, 0, t) + 'px';
    }

    // Sponsor logo-modus ↔ naam-modus
    const logoWrap = document.getElementById('sponsorLogoWrap');
    const nameWrap = document.getElementById('sponsorNameWrap');
    if (logoWrap && nameWrap) {
      if (t < 0.5) {
        logoWrap.style.display = 'flex';
        logoWrap.style.opacity = 1 - t * 2;
        nameWrap.style.display = 'none';
      } else {
        logoWrap.style.display = 'none';
        nameWrap.style.display = 'flex';
        nameWrap.style.opacity = (t - 0.5) * 2;
      }
    }

    raf = null;
  }

  window.addEventListener('scroll', function () {
    if (!raf) raf = requestAnimationFrame(applyScroll);
  }, { passive: true });

  // Initieel toepassen (bij herladen terwijl al gescrolld)
  requestAnimationFrame(applyScroll);

  // ── Sponsor slideshow ─────────────────────────────────────
  let sponsorIdx = 0;
  function nextSponsor() {
    const logoSlides = document.querySelectorAll('[data-sponsor-logo]');
    const nameSlides = document.querySelectorAll('[data-sponsor-name]');
    if (!logoSlides.length) return;

    logoSlides.forEach(el => el.classList.remove('active'));
    nameSlides.forEach(el => el.classList.remove('active'));

    sponsorIdx = (sponsorIdx + 1) % logoSlides.length;
    logoSlides[sponsorIdx]?.classList.add('active');
    nameSlides[sponsorIdx]?.classList.add('active');
  }
  setInterval(nextSponsor, 3000);
})();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
