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
      { id: 'takken',         href: prefix + 'takken.html',         icon: 'ti-users',        label: 'Takken' },
      { id: 'fotos',          href: prefix + 'fotos.html',          icon: 'ti-photo',        label: "Foto's" },
      { id: 'kalender',       href: prefix + 'kalender.html',       icon: 'ti-calendar',     label: 'Kalender' },
      { id: 'albatrossertje', href: prefix + 'albatrossertje.html', icon: 'ti-news',         label: "'t Albatrossertje" },
      { id: 'fosshop',        href: prefix + 'fosshop.html',        icon: 'ti-shirt',        label: 'FOS-shop' },
      { id: 'contact',        href: prefix + 'contact.html',        icon: 'ti-mail',         label: 'Contact' },
      { id: 'contact',        href: 'http://www.facebook.com/FOSalbatros',   icon:'ti-brand-facebook', label: 'Facebook' },
      { id: 'contact',        href: 'https://www.instagram.com/de_albatros/', icon:'ti-brand-instagram', label: 'Instagram'}
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

// ── Logo scroll-shrink met hysteresis ───────────────────
let scrollTicking = false;
let navScrolled = false;

window.addEventListener('scroll', function () {
  if (!scrollTicking) {
    requestAnimationFrame(function () {
      const nav = document.getElementById('mainNav');
      if (!nav) return;
      const y = window.scrollY;
      // Alleen klein maken boven 80px 
      if (!navScrolled && y > 80) {
        navScrolled = true;
        nav.classList.add('nav-scrolled');}
      // Alleen terug groot maken onder 45px
      else if (navScrolled && y < 40) {
        navScrolled = false;
        nav.classList.remove('nav-scrolled');}
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
