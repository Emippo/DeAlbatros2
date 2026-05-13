// ============================================================
// auth.js — 102e FOS De Albatros
// Supabase auth + role-based permissions
// ============================================================

const SUPABASE_URL = 'https://vycijnudgeqqgxpkxrih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5Y2lqbnVkZ2VxcWd4cGt4cmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzczNjYsImV4cCI6MjA5MzgxMzM2Nn0.d4TQEKisc20O-LgSpxz_7QZGZREhZe0fxlVmEKVum34';

const ROLE_PERMISSIONS = {
  eenheidsleiding: {
    canEditAlbums:    true,
    canManageEvents:  true,
    canEditAllTakken: true,
    canEditTakken:    ['bevers','welpen','jvg','vg','seniors','stam'],
    label: 'Eenheidsleiding'
  },
  bever_leiding:  { canEditAlbums: false, canManageEvents: false, canEditAllTakken: false, canEditTakken: ['bevers'],  label: 'Beverleiding' },
  welpen_leiding:  { canEditAlbums: false, canManageEvents: false, canEditAllTakken: false, canEditTakken: ['welpen'],  label: 'Welpenleiding' },
  jvg_leiding:     { canEditAlbums: false, canManageEvents: false, canEditAllTakken: false, canEditTakken: ['jvg'],     label: 'JVG-leiding' },
  vg_leiding:      { canEditAlbums: false, canManageEvents: false, canEditAllTakken: false, canEditTakken: ['vg'],      label: 'VG-leiding' },
  senior_leiding: { canEditAlbums: false, canManageEvents: false, canEditAllTakken: false, canEditTakken: ['seniors'], label: 'Seniormoderator' },
  stam_leiding:    { canEditAlbums: false, canManageEvents: false, canEditAllTakken: false, canEditTakken: ['stam'],    label: 'Stamleiding' }
};

window.AlbatrosAuth = {
  user:         null,
  role:         null,
  permissions:  null,
  supabase:     null,
  _initialized: false,

  async init() {
    if (this._initialized) return;
    this._initialized = true;

    // Stap 1: laad Supabase library en vang de return waarde op
    let supabaseLib;
    try {
      supabaseLib = await this._loadSupabase();
    } catch (e) {
      console.error('[AlbatrosAuth] Supabase library laden mislukt:', e);
      return;
    }

    // Stap 2: maak client aan via de teruggegeven library — NIET via window.supabase
    try {
      this.supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
      console.error('[AlbatrosAuth] Client aanmaken mislukt:', e);
      return;
    }

    // Stap 3: bestaande sessie ophalen
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      if (data?.session?.user) this._setUser(data.session.user);
    } catch (e) {
      console.error('[AlbatrosAuth] getSession mislukt:', e);
    }

    // Stap 4: luister naar toekomstige wijzigingen
    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this._setUser(session.user);
      } else {
        this._clearUser();
      }
      this._updateUI();
    });

    this._updateUI();
  },

  _loadSupabase() {
    return new Promise((resolve, reject) => {
      // Al beschikbaar? Geef direct terug.
      if (window.supabase?.createClient) {
        resolve(window.supabase);
        return;
      }
      document.querySelectorAll('script[data-supabase]').forEach(s => s.remove());
      const s = document.createElement('script');
      s.setAttribute('data-supabase', '1');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload = () => {
        if (window.supabase?.createClient) {
          resolve(window.supabase);   // <-- geeft het object terug, niet void
        } else {
          reject(new Error('Supabase geladen maar createClient niet gevonden.'));
        }
      };
      s.onerror = () => reject(new Error('Supabase kon niet geladen worden (netwerk?).'));
      document.head.appendChild(s);
    });
  },

  _setUser(user) {
    this.user = user;
    const role = user.user_metadata?.role;
    if (role && ROLE_PERMISSIONS[role]) {
      this.role        = role;
      this.permissions = ROLE_PERMISSIONS[role];
    } else {
      console.warn(`[AlbatrosAuth] Onbekende rol: "${role}". Geen rechten.`);
      this.role        = null;
      this.permissions = null;
    }
  },

  _clearUser() {
    this.user = null; this.role = null; this.permissions = null;
  },

  async login(email, password) {
    if (!this.supabase) throw new Error('Auth niet beschikbaar. Herlaad de pagina.');
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    if (!this.supabase) return;
    await this.supabase.auth.signOut();
    this._clearUser();
    this._updateUI();
  },

  isLoggedIn()     { return !!this.user; },
  can(permission)  { return this.permissions ? !!this.permissions[permission] : false; },
  canEditTak(tak)  { return this.permissions?.canEditTakken?.includes(tak) ?? false; },

  _updateUI() {
    const loggedIn = this.isLoggedIn();
    document.body.classList.toggle('logged-in', loggedIn);

    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = loggedIn ? '' : 'none';
    });
    document.querySelectorAll('[data-permission]').forEach(el => {
      el.style.display = (loggedIn && this.can(el.dataset.permission)) ? '' : 'none';
    });
    document.querySelectorAll('[data-edit-tak]').forEach(el => {
      el.style.display = (loggedIn && this.canEditTak(el.dataset.editTak)) ? '' : 'none';
    });

    const loginBtn = document.getElementById('loginBtn');
    const userChip = document.getElementById('userChip');
    if (loginBtn && userChip) {
      if (loggedIn) {
        loginBtn.style.display = 'none';
        userChip.style.display = 'flex';
        const label = this.permissions?.label || 'Leiding';
        userChip.innerHTML =
          `<i class="ti ti-user-check"></i>` +
          `<span>${label}</span>` +
          `<button onclick="AlbatrosAuth.logout()" title="Uitloggen"><i class="ti ti-logout"></i></button>`;
      } else {
        loginBtn.style.display = '';
        userChip.style.display = 'none';
      }
    }

    // Event zodat pagina's weten wanneer auth écht klaar is
    document.dispatchEvent(new CustomEvent('albatros-auth-ready', { detail: { loggedIn } }));
  }
};

// ── Modal helpers ────────────────────────────────────────────

function openLogin() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('loginEmail')?.focus(), 50);
}

function closeLogin() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.style.display = 'none';
  const err = document.getElementById('loginError');
  const pw  = document.getElementById('loginPassword');
  if (err) err.textContent = '';
  if (pw)  pw.value = '';
}

async function doLogin() {
  const emailEl    = document.getElementById('loginEmail');
  const passwordEl = document.getElementById('loginPassword');
  const btn        = document.getElementById('loginSubmitBtn');
  const err        = document.getElementById('loginError');
  if (!emailEl || !passwordEl || !btn || !err) return;

  const email    = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) { err.textContent = 'Vul e-mail en wachtwoord in.'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Vul een geldig e-mailadres in.'; return; }

  btn.disabled    = true;
  btn.textContent = 'Bezig…';
  err.textContent = '';

  try {
    await AlbatrosAuth.login(email, password);
    closeLogin();
  } catch (e) {
    const msg = e.message || '';
    if      (msg.includes('Invalid login credentials')) err.textContent = 'Ongeldig e-mailadres of wachtwoord.';
    else if (msg.includes('Email not confirmed'))        err.textContent = 'E-mailadres nog niet bevestigd. Controleer je inbox.';
    else if (msg.includes('Too many requests'))          err.textContent = 'Te veel pogingen. Wacht even en probeer opnieuw.';
    else                                                 err.textContent = msg || 'Inloggen mislukt. Probeer opnieuw.';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Inloggen';
  }
}

document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('loginModal');
  if (!modal || modal.style.display !== 'flex') return;
  if (e.key === 'Enter')  doLogin();
  if (e.key === 'Escape') closeLogin();
});

// components.js laadt auth.js dynamisch — DOMContentLoaded is al voorbij.
// Initialiseer dus direct, zonder te wachten op een event.
AlbatrosAuth.init();
