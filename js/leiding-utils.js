// ============================================================
// leiding-utils.js — 102e FOS De Albatros
// Gedeelde logica voor leiding laden/renderen + CRUD modal
// ============================================================

window.LeidingUtils = (function() {

const LEIDING_BUCKET = 'leiding-fotos';

const TAK_CONFIG = {
  bevers:          { kleur: '#E24B4A', label: 'Bevers',          email: 'bevers@dealbatros.be'          },
  welpen:          { kleur: '#EF9F27', label: 'Welpen',          email: 'welpen@dealbatros.be'          },
  jvg:             { kleur: '#2D6A1F', label: "JVG's",           email: 'jvg@dealbatros.be'             },
  vg:              { kleur: '#1A5276', label: "VG's",            email: 'vg@dealbatros.be'              },
  seniors:         { kleur: '#7F77DD', label: 'Seniors',         email: 'seniors@dealbatros.be'         },
  stam:            { kleur: '#5a5a6a', label: 'Stam',            email: 'stam@dealbatros.be'            },
  eenheidsleiding: { kleur: 'var(--yellow)', label: 'Eenheidsleiding', email: 'eenheidsleiding@dealbatros.be' },
};

async function waitForSb(maxMs = 6000) {
  const t = Date.now();
  while (!window.AlbatrosAuth?.supabase) {
    if (Date.now() - t > maxMs) throw new Error('Supabase niet beschikbaar.');
    await new Promise(r => setTimeout(r, 100));
  }
  return window.AlbatrosAuth.supabase;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function initialen(naam) {
  return naam.trim().split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
}

// ── Één kaart renderen ────────────────────────────────────────
// tak: de tak van deze rij (bepaalt kleur/email)
// context: 'tak' = op takpagina, 'overzicht' = op leiding.html
function renderKaart(l, tak, context) {
  const cfg   = TAK_CONFIG[tak] || TAK_CONFIG.bevers;
  const kleur = cfg.kleur;

  const avatar = l.foto_url
    ? `<img src="${esc(l.foto_url)}" alt="${esc(l.totemnaam)}" class="leiding-foto" loading="lazy">`
    : `<div class="leiding-avatar" style="background:${kleur}">${esc(initialen(l.totemnaam))}</div>`;

  // Namenblok: welpen tonen welpennaam eerst
  let namen = '';
  if (tak === 'welpen' && l.welpennaam) {
    namen = `<div class="leiding-welpennaam">${esc(l.welpennaam)}</div>
             <h4>${esc(l.totemnaam)}</h4>
             <div class="leiding-echtenaam">${esc(l.echte_naam)}</div>`;
  } else {
    namen = `<h4>${esc(l.totemnaam)}</h4>
             <div class="leiding-echtenaam">${esc(l.echte_naam)}</div>`;
  }

  // Extra info: TL-badge + email + gsm (enkel voor takleiding)
  let extra = '';
  if (l.is_takleiding) {
    extra += `<span class="leiding-tl-badge">Takleiding</span>`;
    if (cfg.email) extra += `<a href="mailto:${esc(cfg.email)}" class="leiding-contact-link"><i class="ti ti-mail"></i>${esc(cfg.email)}</a>`;
    if (l.gsm)     extra += `<a href="tel:${esc(l.gsm)}" class="leiding-contact-link"><i class="ti ti-phone"></i>${esc(l.gsm)}</a>`;
  } else if (l.is_eenheidsleiding && context === 'overzicht') {
    // Op overzichtspagina tonen we ook gsm van EL
    if (l.gsm) extra += `<a href="tel:${esc(l.gsm)}" class="leiding-contact-link"><i class="ti ti-phone"></i>${esc(l.gsm)}</a>`;
  }

  // Edit knop (enkel zichtbaar als ingelogd met canManageEvents)
  const editBtn = `<button class="leiding-edit-btn" onclick="LeidingUtils.openModal('${esc(l.id)}')" title="Bewerken"><i class="ti ti-pencil"></i></button>`;

  return `
    <div class="leiding-card" style="border-top:3px solid ${kleur};position:relative">
      ${editBtn}
      ${avatar}
      <div class="leiding-card-body">
        ${namen}
        ${extra}
      </div>
    </div>`;
}

// ── Leiding laden voor één tak ────────────────────────────────
async function laadVoorTak(tak, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="leiding-loading"><i class="ti ti-loader-2 spin"></i></div>';

  let sb;
  try { sb = await waitForSb(); } catch(e) {
    container.innerHTML = '<p class="leiding-fout">Leiding kon niet geladen worden.</p>';
    return;
  }

  const { data, error } = await sb
    .from('leiding')
    .select('*')
    .eq('tak', tak)
    .eq('actief', true)
    .order('volgorde', { ascending: true });

  if (error) {
    container.innerHTML = '<p class="leiding-fout">Leiding kon niet geladen worden.</p>';
    return;
  }

  if (!data.length) {
    container.innerHTML = '<p class="leiding-fout">Nog geen leiding toegevoegd.</p>';
    return;
  }

  container.innerHTML = `<div class="leiding-grid">${data.map(l => renderKaart(l, tak, 'tak')).join('')}</div>`;
}

// ── Volledig overzicht laden (leiding.html) ───────────────────
async function laadVolledigOverzicht(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="leiding-loading"><i class="ti ti-loader-2 spin"></i> Leiding laden…</div>';

  let sb;
  try { sb = await waitForSb(); } catch(e) {
    container.innerHTML = '<p class="leiding-fout">Leiding kon niet geladen worden.</p>';
    return;
  }

  const { data, error } = await sb
    .from('leiding')
    .select('*')
    .eq('actief', true)
    .order('volgorde', { ascending: true });

  if (error || !data) {
    container.innerHTML = '<p class="leiding-fout">Leiding kon niet geladen worden.</p>';
    return;
  }

  const takVolgorde = ['eenheidsleiding','bevers','welpen','jvg','vg','seniors','stam'];
  const takEmoji    = { eenheidsleiding:'🦅', bevers:'🦫', welpen:'🐺', jvg:'🌿', vg:'⚜️', seniors:'🔥', stam:'🏕️' };
  const takTitels   = { eenheidsleiding:'Eenheidsleiding', bevers:'Beverleiding', welpen:'Welpenleiding',
                        jvg:'JVG-leiding', vg:'VG-leiding', seniors:'Senior Moderator', stam:'Stam Verantwoordelijke' };

  // Groepeer per tak
  const perTak = {};
  takVolgorde.forEach(t => { perTak[t] = []; });
  data.forEach(l => { if (perTak[l.tak]) perTak[l.tak].push(l); });

  let html = '';
  takVolgorde.forEach(tak => {
    const leden = perTak[tak];
    if (!leden.length) return;
    const cfg = TAK_CONFIG[tak];

    // EL sectie: grote kaarten met extra info
    if (tak === 'eenheidsleiding') {
      html += `
        <div class="section">
          <div class="section-label">Eenheidsleiding</div>
          <div class="section-title">De groepsverantwoordelijken</div>
          <div class="section-sub">De eenheidsleiding coördineert alle takken en is het eerste aanspreekpunt voor algemene vragen.</div>
          <div class="leiding-grid leiding-grid-lg" style="margin-top:1rem">
            ${leden.map(l => renderELKaart(l)).join('')}
          </div>
        </div>
        <div class="divider"></div>`;
    } else {
      html += `
        <div class="section">
          <div class="section-label" style="color:${cfg.kleur}">${takEmoji[tak]} ${cfg.label}</div>
          <div class="section-title">${takTitels[tak]}</div>
          <div class="leiding-grid" style="margin-top:.8rem">
            ${leden.map(l => renderKaart(l, tak, 'overzicht')).join('')}
          </div>
        </div>
        <div class="divider"></div>`;
    }
  });

  container.innerHTML = html;
}

// Grote EL-kaart (enkel op leiding.html, boven de takken)
function renderELKaart(l) {
  const avatar = l.foto_url
    ? `<img src="${esc(l.foto_url)}" alt="${esc(l.totemnaam)}" class="leiding-foto-lg" loading="lazy">`
    : `<div class="leiding-avatar-lg" style="background:var(--blue)">${esc(initialen(l.totemnaam))}</div>`;

  const editBtn = `<button class="leiding-edit-btn" onclick="LeidingUtils.openModal('${esc(l.id)}')" title="Bewerken"><i class="ti ti-pencil"></i></button>`;

  return `
    <div class="leiding-card-lg" style="border-top-color:var(--yellow);position:relative">
      ${editBtn}
      ${avatar}
      <h4>${esc(l.totemnaam)}</h4>
      <div class="leiding-totem-name">${esc(l.echte_naam)}</div>
      ${l.gsm ? `<a href="tel:${esc(l.gsm)}" class="leiding-email"><i class="ti ti-phone"></i>${esc(l.gsm)}</a>` : ''}
    </div>`;
}

// ── Activiteiten laden voor takpagina ─────────────────────────
// Haalt de 3 eerstvolgende evenementen op voor deze tak + 'Alle takken'
const MAANDEN = ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];

async function laadActiviteiten(tak, containerId, takKleur, takLabel) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let sb;
  try { sb = await waitForSb(); } catch(e) {
    container.innerHTML = '<p class="leiding-fout">Activiteiten konden niet geladen worden.</p>';
    return;
  }

  const nu = new Date().toISOString().split('T')[0];

  // Haal evenementen op die matchen met deze tak OF 'Alle takken'
  const cfg = TAK_CONFIG[tak];
  const takLabel2 = cfg ? cfg.label : tak;

  const { data, error } = await sb
    .from('evenementen')
    .select('*')
    .gte('datum', nu)
    .or(`tak.eq.${takLabel2},tak.eq.Alle takken,tak.eq.Kamp`)
    .order('datum', { ascending: true })
    .limit(3);

  if (error || !data?.length) {
    container.innerHTML = '<p style="font-size:.82rem;color:var(--text-muted)">Geen geplande activiteiten.</p>';
    return;
  }

  container.innerHTML = data.map(ev => {
    const d   = new Date(ev.datum + 'T00:00:00');
    const dag = String(d.getDate()).padStart(2, '0');
    const mnd = MAANDEN[d.getMonth()];
    return `
      <div class="kalender-card">
        <div class="kal-date"><span class="day">${dag}</span><span class="mon">${mnd}</span></div>
        <div class="kal-info">
          <h3>${esc(ev.titel)}</h3>
          ${ev.beschrijving ? `<p>${esc(ev.beschrijving)}</p>` : ''}
        </div>
        <div class="kal-tag" style="background:${takKleur}22;color:${takKleur}">${esc(ev.tak)}</div>
      </div>`;
  }).join('');
}

// ── CRUD Modal ────────────────────────────────────────────────
let _allLeiding  = [];
let _bewerkId    = null;
let _fotoFile    = null;
let _bestaandeFoto = null;

function injectModal() {
  if (document.getElementById('leidingModal')) return;
  const el = document.createElement('div');
  el.innerHTML = `
<div id="leidingModal" class="modal" onclick="if(event.target===this)LeidingUtils.closeModal()">
  <div class="modal-content event-modal-box" style="width:min(95%,520px);max-height:90vh;overflow-y:auto">
    <button class="close-btn" onclick="LeidingUtils.closeModal()"><i class="ti ti-x"></i></button>
    <h2 id="leidingModalTitel">Leidingslid toevoegen</h2>

    <!-- Foto upload -->
    <div class="foto-upload-zone" id="leidingFotoZone" onclick="document.getElementById('leidingFotoInput').click()" style="min-height:100px">
      <div class="foto-preview-inner" id="leidingFotoPreview">
        <i class="ti ti-user-circle" style="font-size:2.5rem;color:var(--blue-light)"></i>
        <span>Klik om foto te uploaden</span>
        <small>JPG, PNG of WEBP · max 10MB</small>
      </div>
      <input type="file" id="leidingFotoInput" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="LeidingUtils._handleFoto(event)">
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem">
      <div class="login-field"><label>Totemnaam</label><input type="text" id="ldTotem" placeholder="bv. Vlugge Bever"></div>
      <div class="login-field"><label>Echte naam</label><input type="text" id="ldEcht" placeholder="bv. Jan Janssen"></div>
    </div>
    <div class="login-field"><label>Welpennaam <span style="font-weight:400;opacity:.6">(enkel voor welpen)</span></label><input type="text" id="ldWelpen" placeholder="bv. Snelle Wolf"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem">
      <div class="login-field">
        <label>Tak</label>
        <select id="ldTak" class="ev-select">
          <option value="eenheidsleiding">Eenheidsleiding</option>
          <option value="bevers">Bevers</option>
          <option value="welpen">Welpen</option>
          <option value="jvg">JVG's</option>
          <option value="vg">VG's</option>
          <option value="seniors">Seniors</option>
          <option value="stam">Stam</option>
        </select>
      </div>
      <div class="login-field"><label>GSM</label><input type="tel" id="ldGsm" placeholder="+32 ..."></div>
    </div>
    <div style="display:flex;gap:1.5rem;padding:.2rem 0">
      <label style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;font-weight:700;cursor:pointer">
        <input type="checkbox" id="ldIsTL" style="accent-color:var(--blue);width:16px;height:16px"> Takleiding (TL)
      </label>
      <label style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;font-weight:700;cursor:pointer">
        <input type="checkbox" id="ldIsEL" style="accent-color:var(--blue);width:16px;height:16px"> Eenheidsleiding (EL)
      </label>
    </div>
    <div class="login-field"><label>Volgorde <span style="font-weight:400;opacity:.6">(lager = eerder)</span></label><input type="number" id="ldVolgorde" placeholder="0" min="0" style="width:100px"></div>

    <div id="leidingModalError" class="login-error"></div>
    <div id="leidingUploadVoortgang" style="display:none;font-size:.8rem;color:var(--blue-light);align-items:center;gap:.4rem"><i class="ti ti-loader-2 spin"></i> Foto uploaden…</div>

    <div style="display:flex;gap:.6rem;margin-top:.4rem">
      <button id="leidingSaveBtn" class="btn-login-submit" onclick="LeidingUtils.save()" style="flex:1"><i class="ti ti-check"></i> Opslaan</button>
      <button id="leidingDeleteBtn" class="btn-delete" onclick="LeidingUtils.remove()" style="display:none"><i class="ti ti-trash"></i></button>
    </div>
  </div>
</div>`;
  document.body.appendChild(el.firstElementChild);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') LeidingUtils.closeModal(); });
}

async function openModal(id = null) {
  injectModal();
  _bewerkId     = id;
  _fotoFile     = null;
  _bestaandeFoto = null;

  const err = document.getElementById('leidingModalError');
  err.textContent = '';

  // Reset foto zone
  const zone = document.getElementById('leidingFotoZone');
  zone.innerHTML = `
    <div class="foto-preview-inner" id="leidingFotoPreview">
      <i class="ti ti-user-circle" style="font-size:2.5rem;color:var(--blue-light)"></i>
      <span>Klik om foto te uploaden</span>
      <small>JPG, PNG of WEBP · max 10MB</small>
    </div>
    <input type="file" id="leidingFotoInput" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="LeidingUtils._handleFoto(event)">`;
  zone.onclick = () => document.getElementById('leidingFotoInput').click();

  const deleteBtn = document.getElementById('leidingDeleteBtn');

  if (id) {
    // Bestaand lid — haal op uit Supabase
    const sb = window.AlbatrosAuth?.supabase;
    const { data } = await sb.from('leiding').select('*').eq('id', id).single();
    if (!data) return;

    document.getElementById('leidingModalTitel').textContent = 'Leidingslid bewerken';
    document.getElementById('ldTotem').value    = data.totemnaam || '';
    document.getElementById('ldEcht').value     = data.echte_naam || '';
    document.getElementById('ldWelpen').value   = data.welpennaam || '';
    document.getElementById('ldTak').value      = data.tak || 'bevers';
    document.getElementById('ldGsm').value      = data.gsm || '';
    document.getElementById('ldIsTL').checked   = !!data.is_takleiding;
    document.getElementById('ldIsEL').checked   = !!data.is_eenheidsleiding;
    document.getElementById('ldVolgorde').value = data.volgorde ?? 0;
    deleteBtn.style.display = 'flex';

    if (data.foto_url) {
      _bestaandeFoto = data.foto_url;
      zone.innerHTML = `
        <img src="${esc(data.foto_url)}" alt="Huidige foto" style="width:100%;height:120px;object-fit:cover;display:block;border-radius:10px">
        <input type="file" id="leidingFotoInput" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="LeidingUtils._handleFoto(event)">`;
      zone.onclick = () => document.getElementById('leidingFotoInput').click();
    }
  } else {
    document.getElementById('leidingModalTitel').textContent = 'Leidingslid toevoegen';
    document.getElementById('ldTotem').value    = '';
    document.getElementById('ldEcht').value     = '';
    document.getElementById('ldWelpen').value   = '';
    document.getElementById('ldTak').value      = 'bevers';
    document.getElementById('ldGsm').value      = '';
    document.getElementById('ldIsTL').checked   = false;
    document.getElementById('ldIsEL').checked   = false;
    document.getElementById('ldVolgorde').value = '0';
    deleteBtn.style.display = 'none';
  }

  document.getElementById('leidingModal').style.display = 'flex';
  setTimeout(() => document.getElementById('ldTotem')?.focus(), 50);
}

function closeModal() {
  const m = document.getElementById('leidingModal');
  if (m) m.style.display = 'none';
  _bewerkId = null; _fotoFile = null;
}

function _handleFoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { alert('Foto te groot. Max 10MB.'); return; }
  _fotoFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const zone = document.getElementById('leidingFotoZone');
    zone.innerHTML = `
      <img src="${e.target.result}" style="width:100%;height:120px;object-fit:cover;display:block;border-radius:10px">
      <input type="file" id="leidingFotoInput" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="LeidingUtils._handleFoto(event)">`;
    zone.onclick = () => document.getElementById('leidingFotoInput').click();
  };
  reader.readAsDataURL(file);
}

async function _uploadFoto(sb, file, id) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${id}.${ext}`;
  const { error } = await sb.storage.from(LEIDING_BUCKET).upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = sb.storage.from(LEIDING_BUCKET).getPublicUrl(path);
  return data.publicUrl + '?t=' + Date.now();
}

async function save() {
  const totemnaam        = document.getElementById('ldTotem').value.trim();
  const echte_naam       = document.getElementById('ldEcht').value.trim();
  const welpennaam       = document.getElementById('ldWelpen').value.trim();
  const tak              = document.getElementById('ldTak').value;
  const gsm              = document.getElementById('ldGsm').value.trim();
  const is_takleiding    = document.getElementById('ldIsTL').checked;
  const is_eenheidsleiding = document.getElementById('ldIsEL').checked;
  const volgorde         = parseInt(document.getElementById('ldVolgorde').value) || 0;
  const btn              = document.getElementById('leidingSaveBtn');
  const err              = document.getElementById('leidingModalError');
  const voortgang        = document.getElementById('leidingUploadVoortgang');

  err.textContent = '';
  if (!totemnaam) { err.textContent = 'Vul een totemnaam in.'; return; }
  if (!echte_naam){ err.textContent = 'Vul een echte naam in.'; return; }

  btn.disabled = true; btn.textContent = 'Bezig…';

  try {
    const sb = window.AlbatrosAuth?.supabase;
    if (!sb) throw new Error('Niet verbonden.');

    const targetId = _bewerkId || crypto.randomUUID();
    let foto_url   = _bestaandeFoto || null;

    if (_fotoFile) {
      voortgang.style.display = 'flex';
      foto_url = await _uploadFoto(sb, _fotoFile, targetId);
      voortgang.style.display = 'none';
    }

    const payload = { totemnaam, echte_naam, welpennaam: welpennaam || null, tak,
                      gsm: gsm || null, is_takleiding, is_eenheidsleiding,
                      volgorde, foto_url, actief: true };

    let error;
    if (_bewerkId) {
      ({ error } = await sb.from('leiding').update(payload).eq('id', _bewerkId));
    } else {
      ({ error } = await sb.from('leiding').insert({ id: targetId, ...payload }));
    }
    if (error) throw error;

    closeModal();
    // Herlaad de pagina zodat alle secties bijgewerkt worden
    window.dispatchEvent(new CustomEvent('leiding-updated'));
  } catch(e) {
    voortgang.style.display = 'none';
    err.textContent = e.message || 'Opslaan mislukt.';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-check"></i> Opslaan';
  }
}

async function remove() {
  if (!_bewerkId) return;
  if (!confirm('Dit leidingslid (deze rij) verwijderen?')) return;
  const btn = document.getElementById('leidingDeleteBtn');
  btn.disabled = true;
  try {
    const sb = window.AlbatrosAuth?.supabase;
    const { error } = await sb.from('leiding').update({ actief: false }).eq('id', _bewerkId);
    if (error) throw error;
    closeModal();
    window.dispatchEvent(new CustomEvent('leiding-updated'));
  } catch(e) {
    document.getElementById('leidingModalError').textContent = e.message || 'Verwijderen mislukt.';
    btn.disabled = false;
  }
}

// Publieke API
return { laadVoorTak, laadVolledigOverzicht, laadActiviteiten, openModal, closeModal, save, remove, _handleFoto, TAK_CONFIG };
})();
