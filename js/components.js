// ============================================================
// components.js — 102e FOS De Albatros
// Injects shared header, nav, footer & login modal
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

  // ── Nav links ─────────────────────────────────────────────
  const NAV_LINKS = [
    { id: 'leiding',        href: prefix + 'info/leiding.html',   label: 'Leiding' },
    { id: 'takken',         href: prefix + 'takken.html',         label: 'Takken' },
    { id: 'kalender',       href: prefix + 'kalender.html',       label: 'Events' },
    { id: 'albatrossertje', href: prefix + 'albatrossertje.html', label: 'Albatrossertje' },
    { id: 'kampen',         href: prefix + 'info/kampen.html',    label: 'Kamp' },
    { id: 'vzw',            href: prefix + 'info/vzw.html',       label: 'VZW' },
  ];

  const SIDEBAR_EXTRA = [
    { id: 'index',    href: prefix + 'index.html',   icon: 'ti-home',            label: 'Home' },
    { id: 'fotos',    href: prefix + 'fotos.html',   icon: 'ti-photo',           label: "Foto's" },
    { id: 'fosshop',  href: prefix + 'fosshop.html', icon: 'ti-shirt',           label: 'FOS-shop' },
    { id: 'contact',  href: prefix + 'contact.html', icon: 'ti-mail',            label: 'Contact' },
    { id: 'facebook', href: 'http://www.facebook.com/FOSalbatros',    icon: 'ti-brand-facebook',  label: 'Facebook' },
    { id: 'insta',    href: 'https://www.instagram.com/de_albatros/', icon: 'ti-brand-instagram', label: 'Instagram' },
  ];

  const TAKKEN = [
    { href: prefix + 'takken/bevers.html',  kleur: '#E24B4A', emoji: '🦫', label: 'Bevers' },
    { href: prefix + 'takken/welpen.html',  kleur: '#EF9F27', emoji: '🐺', label: 'Welpen' },
    { href: prefix + 'takken/jvg.html',     kleur: '#2D6A1F', emoji: '🌿', label: "JVG's" },
    { href: prefix + 'takken/vg.html',      kleur: '#1A5276', emoji: '⚜️', label: "VG's" },
    { href: prefix + 'takken/seniors.html', kleur: '#7F77DD', emoji: '🔥', label: 'Seniors' },
    { href: prefix + 'takken/stam.html',    kleur: '#5a5a6a', emoji: '🏕️', label: 'Stam' },
  ];

  // ── Header bouwen ─────────────────────────────────────────
  function buildNav(activePage) {

    const desktopLinks = NAV_LINKS.map(l => `
      <a href="${l.href}" class="hn-link${activePage === l.id ? ' active' : ''}">${l.label}</a>`
    ).join('');

    const allSidebarLinks = [
      ...NAV_LINKS.map(l => ({ ...l, icon: 'ti-chevron-right' })),
      ...SIDEBAR_EXTRA,
    ];

    const sidebarLinks = allSidebarLinks.map(l => `
      <a href="${l.href}" class="sidebar-link${activePage === l.id ? ' active' : ''}">
        <i class="ti ${l.icon || 'ti-chevron-right'}"></i>
        <span>${l.label}</span>
      </a>`).join('');

    const takkenLinks = TAKKEN.map(t => `
      <a href="${t.href}" class="sidebar-tak-link">
        <span class="sidebar-tak-dot" style="background:${t.kleur}">${t.emoji}</span>
        <span>${t.label}</span>
      </a>`).join('');

    return `
<header id="siteHeader">
  <div class="hn-inner">
    <a href="${prefix}index.html" class="hn-logo">
      <img src="${prefix}img/logo.png" onerror="this.style.display='none'" alt="Logo 102e FOS De Albatros" id="navLogoImg">
    </a>
    <nav class="hn-links" aria-label="Hoofdnavigatie">
      ${desktopLinks}
    </nav>
    <button class="hamburger" id="hamburgerBtn" onclick="toggleSidebar()" aria-label="Menu openen">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

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
      <img src="${prefix}img/logo.png" onerror="this.style.display='none'" alt="Logo" style="width:52px;height:52px;border-radius:50%;margin-bottom:.6rem;border:2px solid rgba(245,197,24,.4)">
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

  // ── Inject ───────────────────────────────────────────────
  function inject() {
    const activePage = window.ACTIVE_PAGE || 'index';
    const body = document.body;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildNav(activePage) + buildLoginModal();
    while (wrapper.firstChild) body.insertBefore(wrapper.firstChild, body.firstChild);

    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = buildFooter();
    body.appendChild(footerDiv.firstElementChild);

    const authScript = document.createElement('script');
    authScript.src = prefix + 'js/auth.js';
    document.head.appendChild(authScript);

    window.toggleSidebar = function () {
      const sidebar   = document.getElementById('sidebar');
      const overlay   = document.getElementById('sidebarOverlay');
      const hamburger = document.getElementById('hamburgerBtn');
      if (!sidebar) return;
      const open = sidebar.classList.toggle('open');
      overlay.classList.toggle('open', open);
      hamburger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    window.closeSidebar = function () {
      const sidebar   = document.getElementById('sidebar');
      const overlay   = document.getElementById('sidebarOverlay');
      const hamburger = document.getElementById('hamburgerBtn');
      if (!sidebar) return;
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
