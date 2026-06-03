/* ══════════════════════════════════════════════
   METABUSCADOR SEMÁNTICO — UMSS Web Semántica
   app.js v4 — Backend RDFLib + SPARQLWrapper + i18n
   ══════════════════════════════════════════════ */

const API = 'http://localhost:5000';

// ══════════════════════════════════════════════
// MULTILINGUALIDAD (i18n)
// ══════════════════════════════════════════════
let currentLanguage = 'es';

function initLanguage() {
  // 1. Leer localStorage primero
  const savedLang = localStorage.getItem('language');
  if (savedLang && ['es', 'en'].includes(savedLang)) {
    currentLanguage = savedLang;
  } else {
    // 2. Detectar idioma del navegador
    const navLang = navigator.language || navigator.userLanguage;
    if (navLang.startsWith('en')) {
      currentLanguage = 'en';
    } else {
      currentLanguage = 'es'; // Default a español
    }
    localStorage.setItem('language', currentLanguage);
  }

  // 3. Actualizar UI
  updateLanguageButton();
  translateDOM(currentLanguage);
}

function toggleLanguage() {
  currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
  localStorage.setItem('language', currentLanguage);
  updateLanguageButton();
  translateDOM(currentLanguage);
  buscarUnificado(); // Re-buscar con nuevo idioma
}

function updateLanguageButton() {
  const btn = document.getElementById('langToggle');
  if (btn) {
    btn.textContent = currentLanguage === 'es' ? 'EN' : 'ES';
  }
}

// ══════════════════════════════════════════════
// TEMA CLARO / OSCURO
// ══════════════════════════════════════════════
function toggleTheme() {
  const html     = document.documentElement;
  const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  document.getElementById('themeToggle').textContent = newTheme === 'light' ? '🌙' : '🌞';
}
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// ══════════════════════════════════════════════
// DATOS GLOBALES
// ══════════════════════════════════════════════
let currentFilter = '';
let currentQuery  = '';
let ontologiaCargada = false;

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('themeToggle').textContent = savedTheme === 'light' ? '🌙' : '🌞';

  // Inicializar idioma
  initLanguage();

  // Listener para botón de idioma
  document.getElementById('langToggle').addEventListener('click', toggleLanguage);

  // Un único listener para el Enter — llama siempre a la búsqueda unificada
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') buscarUnificado();
  });

  await verificarBackend();
});

// ══════════════════════════════════════════════
// VERIFICAR BACKEND Y AUTO-CARGA
// ══════════════════════════════════════════════
async function verificarBackend() {
  try {
    const resp = await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await resp.json();

    if (data.ontologia_cargada) {
      ontologiaCargada = true;
      await cargarEstadisticas();
      renderApp();
    } else {
      mostrarCargador();
    }
  } catch(e) {
    document.getElementById('loaderSection').innerHTML = `
      <div class="search-section" style="max-width:500px; margin:0 auto; text-align:center;">
        <span style="font-size:36px; display:block; margin-bottom:12px;">⚠️</span>
        <p style="color:var(--text); font-weight:700; margin-bottom:8px;">Backend no encontrado</p>
        <p style="color:var(--muted); font-size:12px; font-family:'Space Mono',monospace;">
          Ejecuta en tu terminal:<br><br>
          <code style="color:var(--accent3)">cd backend</code><br>
          <code style="color:var(--accent3)">python server.py</code>
        </p>
      </div>`;
  }
}

function mostrarCargador() {
  document.getElementById('loaderSection').style.display = 'block';
}

// ══════════════════════════════════════════════
// CARGA DE ARCHIVO OWL
// ══════════════════════════════════════════════
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropzone').style.borderColor = 'var(--border)';
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
}

async function handleFile(file) {
  if (!file) return;

  document.getElementById('loaderSection').innerHTML = `
    <div style="padding:60px 0; text-align:center;">
      <div class="spinner"></div>
      <p style="color:var(--muted); font-family:'Space Mono',monospace; font-size:12px;">
        Cargando ontología con RDFLib...
      </p>
    </div>`;

  const formData = new FormData();
  formData.append('owl_file', file);

  try {
    const resp = await fetch(`${API}/cargar_archivo`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000)
    });
    const data = await resp.json();

    if (data.ok) {
      ontologiaCargada = true;
      await cargarEstadisticas();
      renderApp();
    } else {
      document.getElementById('loaderSection').innerHTML = `
        <div style="text-align:center; padding:40px;">
          <p style="color:#ff6b6b;">Error: ${escapeHtml(data.error)}</p>
        </div>`;
    }
  } catch(e) {
    document.getElementById('loaderSection').innerHTML = `
      <div style="text-align:center; padding:40px;">
        <p style="color:#ff6b6b;">No se pudo conectar al backend: ${escapeHtml(e.message)}</p>
      </div>`;
  }
}

// ══════════════════════════════════════════════
// CARGAR ESTADÍSTICAS Y FILTROS DE CLASE
// ══════════════════════════════════════════════
async function cargarEstadisticas() {
  try {
    const [statsResp, clasesResp] = await Promise.all([
      fetch(`${API}/stats`),
      fetch(`${API}/clases`)
    ]);
    const stats  = await statsResp.json();
    const clases = await clasesResp.json();

    if (stats.ok) {
      const buscarResp = await fetch(`${API}/buscar?term=`);
      const buscarData = await buscarResp.json();
      const nInd = buscarData.ok ? buscarData.total : '—';

      document.getElementById('statIndividuals').textContent = nInd;
      document.getElementById('statClasses').textContent     = stats.clases || '—';
      document.getElementById('statProps').textContent       = stats.propiedades || '—';
      document.getElementById('statTriples').textContent     = (stats.triples || 0).toLocaleString();
    }

    if (clases.ok) {
      const clasesConIndividuos = clases.clases
        .filter(c => c.total > 0 && !['Thing','NamedIndividual'].includes(c.clase))
        .slice(0, 20);

      // Botones de filtro por clase
      document.getElementById('filterBtns').innerHTML = clasesConIndividuos.map(c =>
        `<button class="filter-btn" onclick="setFilter('${escapeAttr(c.clase)}', this)">
           ${escapeHtml(c.clase)} <span style="opacity:0.5">(${c.total})</span>
         </button>`
      ).join('');

      // Explorador de ontología (chips clickeables)
      document.getElementById('classGrid').innerHTML = clasesConIndividuos.map(c =>
        `<div class="class-chip" onclick="searchByClass('${escapeAttr(c.clase)}')">
           ${escapeHtml(c.clase)}<span class="count">${c.total}</span>
         </div>`
      ).join('');
    }
  } catch(e) {
    console.error('Error cargando estadísticas:', e);
  }
}

// ══════════════════════════════════════════════
// RENDER APP
// ══════════════════════════════════════════════
function renderApp() {
  document.getElementById('loaderSection').style.display = 'none';
  document.getElementById('appSection').style.display    = 'block';
  buscarUnificado(); // muestra todos al inicio
}

// ══════════════════════════════════════════════
// SPARQL BUILDERS (para mostrar en pantalla)
// ══════════════════════════════════════════════
function buildSPARQLQuery(term, claseFilter) {
  const base = 'http://www.umss.edu.bo/ontologias/electrodomesticos.owl#';
  let q = `<span class="comment"># MetaBuscador Semántico — RDFLib + SPARQL</span>\n`;
  q += `<span class="comment"># Ejecutado por: Python RDFLib en el backend</span>\n\n`;
  q += `<span class="kw">PREFIX</span> : &lt;${base}&gt;\n`;
  q += `<span class="kw">PREFIX</span> rdf:  &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#&gt;\n`;
  q += `<span class="kw">PREFIX</span> rdfs: &lt;http://www.w3.org/2000/01/rdf-schema#&gt;\n`;
  q += `<span class="kw">PREFIX</span> owl:  &lt;http://www.w3.org/2002/07/owl#&gt;\n\n`;
  q += `<span class="kw">SELECT DISTINCT</span> <span class="var">?individuo</span> <span class="var">?clase</span>\n`;
  q += `<span class="kw">WHERE</span> {\n`;
  q += `  <span class="var">?individuo</span> rdf:type <span class="var">?clase</span> .\n`;
  q += `  <span class="var">?clase</span> rdf:type owl:Class .\n`;
  if (claseFilter) {
    q += `  <span class="kw">FILTER</span>(<span class="kw">CONTAINS</span>(<span class="kw">LCASE</span>(<span class="kw">STR</span>(<span class="var">?clase</span>)), <span class="str">"${escapeHtml(claseFilter.toLowerCase())}"</span>))\n`;
  }
  if (term) {
    const terminos = term.split(',').map(t => t.trim()).filter(t => t);
    if (terminos.length > 1) {
      q += `  <span class="comment"># Búsqueda múltiple (OR)</span>\n`;
      const filtros = terminos.map(t =>
        `<span class="kw">CONTAINS</span>(<span class="kw">LCASE</span>(<span class="kw">STR</span>(<span class="var">?individuo</span>)), <span class="str">"${escapeHtml(t.toLowerCase())}"</span>)`
      );
      q += `  <span class="kw">FILTER</span>( ${filtros.join(' || ')} )\n`;
    } else {
      q += `  <span class="kw">FILTER</span>(<span class="kw">CONTAINS</span>(<span class="kw">LCASE</span>(<span class="kw">STR</span>(<span class="var">?individuo</span>)), <span class="str">"${escapeHtml(term.toLowerCase())}"</span>))\n`;
    }
  }
  q += `}\n<span class="kw">ORDER BY</span> <span class="var">?clase</span> <span class="var">?individuo</span>\n<span class="kw">LIMIT</span> 200`;
  return q;
}

function buildDbpSPARQLQuery(term) {
  const terminos = term.split(/[,\s]+/).map(t => t.trim()).filter(t => t);
  const bif  = terminos.map(t => `'${escapeHtml(t)}'`).join(' AND ');

  return `<span class="comment"># BC Remota — DBpedia SPARQL</span>
<span class="comment"># Endpoint: https://dbpedia.org/sparql</span>
<span class="comment"># Búsqueda de texto completo con Virtuoso bif:contains</span>

<span class="kw">PREFIX</span> rdfs: &lt;http://www.w3.org/2000/01/rdf-schema#&gt;
<span class="kw">PREFIX</span> dbo:  &lt;http://dbpedia.org/ontology/&gt;
<span class="kw">PREFIX</span> foaf: &lt;http://xmlns.com/foaf/0.1/&gt;

<span class="kw">SELECT DISTINCT</span> <span class="var">?recurso</span> <span class="var">?nombre</span> <span class="var">?desc</span> <span class="var">?imagen</span> <span class="var">?wiki</span>
<span class="kw">WHERE</span> {
  <span class="var">?recurso</span> rdfs:label <span class="var">?nombre</span> .
  <span class="var">?nombre</span> bif:contains <span class="str">"${bif}"</span> .
  <span class="kw">FILTER</span>(<span class="kw">lang</span>(<span class="var">?nombre</span>) = <span class="str">"en"</span> || <span class="kw">lang</span>(<span class="var">?nombre</span>) = <span class="str">"es"</span>)
  <span class="kw">OPTIONAL</span> { <span class="var">?recurso</span> rdfs:comment <span class="var">?desc</span> . }
  <span class="kw">OPTIONAL</span> { <span class="var">?recurso</span> dbo:thumbnail <span class="var">?imagen</span> . }
  <span class="kw">OPTIONAL</span> { <span class="var">?recurso</span> foaf:isPrimaryTopicOf <span class="var">?wiki</span> . }
}
<span class="kw">LIMIT</span> 15`;
}

// ══════════════════════════════════════════════
// BÚSQUEDA UNIFICADA — local + DBpedia en paralelo
// ══════════════════════════════════════════════
async function buscarUnificado() {
  const input = document.getElementById('searchInput').value.trim();
  currentQuery = input.toLowerCase();

  // Actualizar paneles SPARQL
  document.getElementById('sparqlDisplay').innerHTML    = buildSPARQLQuery(input, currentFilter);
  document.getElementById('dbpSparqlDisplay').innerHTML = buildDbpSPARQLQuery(input || 'lavadora');

  const container = document.getElementById('unifiedResults');
  const countEl   = document.getElementById('unifiedResultsCount');

  // Indicador de carga
  container.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:60px;"><div class="spinner"></div><p style="margin-top:15px; color:var(--accent);">${t('search.loading.local') || 'Buscando...'}</p></div>`;
  countEl.innerHTML = '';
  document.getElementById('dbpEndpointStatus').textContent = '';

  // Construir parámetros
  const params = new URLSearchParams();
  if (input)         params.set('term',  input);
  if (currentFilter) params.set('clase', currentFilter);
  params.set('lang', currentLanguage);  // NUEVO: agregar idioma

  try {
    // Ambas peticiones en paralelo
    const [resLocal, resDbp] = await Promise.all([
      fetch(`${API}/buscar?${params}`,                              { signal: AbortSignal.timeout(15000) }),
      fetch(`${API}/dbpedia?term=${encodeURIComponent(input)}&lang=${currentLanguage}`, { signal: AbortSignal.timeout(30000) })
    ]);

    const dataLocal = await resLocal.json();
    const dataDbp   = await resDbp.json();

    let localRes = [];
    let dbpRes = [];
    
    if (dataLocal.ok) localRes = dataLocal.resultados || [];
    if (dataDbp.ok) {
      dbpRes = dataDbp.resultados || [];
      document.getElementById('dbpEndpointStatus').textContent = t('dbpedia.status') || 'Endpoint: dbpedia.org/sparql';
    }
    
    renderUnifiedResults(localRes, dbpRes, input);

  } catch(error) {
    container.innerHTML = `<div class="state-msg" style="grid-column: 1 / -1;"><span class="icon">⚠️</span><h3>${t('error.network') || 'Error de red'}</h3><p>${escapeHtml(error.message)}</p></div>`;
  }
}

// ══════════════════════════════════════════════
// FILTROS POR CLASE
// ══════════════════════════════════════════════
function setFilter(cls, btn) {
  const term = document.getElementById('searchInput').value.trim().toLowerCase();
  currentQuery = term;

  // Toggle: si ya estaba activo, lo quita
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    currentFilter = '';
  } else {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = cls;
  }

  buscarUnificado();
}

function searchByClass(cls) {
  document.getElementById('searchInput').value = '';
  currentQuery  = '';
  currentFilter = cls;

  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
    if (b.textContent.includes(cls)) b.classList.add('active');
  });

  buscarUnificado();
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

// ══════════════════════════════════════════════
// RENDER RESULTADOS UNIFICADOS
// ══════════════════════════════════════════════
const KEY_PROPS = [
  'consumo potencia','capacidad litros','capacidad lavado','capacidad refrigeracion',
  'eficiencia energetica','tamano pantalla','voltaje aparato','peso aparato',
  'numero hornillas','capacidad tazas','capacidad carga','rpm centrifugado',
  'potencia microondas','area cobertura','numero velocidades','memoria ram',
  'almacenamiento interno','capacidad congelacion','vida util estimada',
  'tecnologia inverter','tv smart','portable','conectividad red',
  'fabricado por','tiene componente','pais origen marca','ano creacion marca'
];

function renderUnifiedResults(localRes, dbpRes, term) {
  const container = document.getElementById('unifiedResults');
  const countEl   = document.getElementById('unifiedResultsCount');
  
  const total = localRes.length + dbpRes.length;
  
  if (total === 0) {
    countEl.innerHTML = '';
    container.innerHTML = `
      <div class="state-msg" style="grid-column: 1 / -1;">
        <span class="icon">🔍</span>
        <h3>${t('results.empty.local') || 'Sin resultados'}</h3>
        <p>${t('results.empty') || 'No se encontraron coincidencias para'} "<strong>${escapeHtml(term)}</strong>"</p>
      </div>`;
    return;
  }
  
  countEl.innerHTML = `<span>${total}</span> ${total !== 1 ? t('results.count.plural') || 'resultados' : t('results.count') || 'resultado'}`;
  
  const tokens = term ? term.split(/[\\s,]+/).filter(t => t.length >= 2) : [];
  
  // Local cards generator
  const localCardsHtml = localRes.slice(0, 60).map(ind => {
    const props = ind.propiedades || {};
    const shownProps = KEY_PROPS.filter(p => props[p] !== undefined).slice(0, 4);
    
    const propsHtml = shownProps.map(p => {
      let val = props[p], valClass = '';
      if (val === 'true')  { val = '✓ Sí'; valClass = 'bool-true'; }
      if (val === 'false') { val = '✗ No'; valClass = 'bool-false'; }
      return `<div class="prop-item">
        <span class="prop-key">${p.replace(/_/g,' ')}</span>
        <span class="prop-val ${valClass}">${escapeHtml(String(val))}</span>
      </div>`;
    }).join('');
    
    const nombre = highlightTokens(escapeHtml(ind.nombre), tokens);
    
    return `
      <div class="result-card" onclick='showDetail(${JSON.stringify(ind).replace(/'/g, "&#39;")})'>
        <div style="position:absolute; top:12px; right:12px; font-size:10px; padding:2px 8px; border-radius:10px; background:rgba(124,106,247,0.15); color:var(--accent); border:1px solid rgba(124,106,247,0.3); font-family:'Space Mono',monospace;">🏠 Local</div>
        <div class="card-top" style="margin-right: 60px;">
          <div class="card-name">${nombre}</div>
          <div class="card-class">${escapeHtml(ind.clase)}</div>
        </div>
        ${propsHtml
          ? `<div class="card-props">${propsHtml}</div>`
          : '<p style="color:var(--muted);font-size:12px;font-family:Space Mono,monospace">Sin propiedades registradas</p>'}
      </div>`;
  });

  // DBpedia helper
  function iconForName(nombre) {
    const n = (nombre || '').toLowerCase();
    if (n.includes('refriger') || n.includes('fridge'))   return '🧊';
    if (n.includes('wash')     || n.includes('laundry'))  return '🫧';
    if (n.includes('televisi') || n.includes('tv'))       return '📺';
    if (n.includes('computer') || n.includes('laptop'))   return '💻';
    if (n.includes('microwave')|| n.includes('oven'))     return '📡';
    if (n.includes('vacuum'))                             return '🌀';
    if (n.includes('air')      || n.includes('condition'))return '❄️';
    if (n.includes('coffee')   || n.includes('cafe'))     return '☕';
    return '🔌';
  }

  // DBpedia cards generator
  const dbpCardsHtml = dbpRes.map(r => {
    const icon = iconForName(r.nombre);
    const desc = r.descripcion
      ? (r.descripcion.length > 120 ? r.descripcion.slice(0, 120) + '...' : r.descripcion)
      : `<em style="opacity:0.5">${t('dbpedia.no.description') || 'Sin descripción'}</em>`;
      
    const imgHtml = r.imagen
      ? `<img class="dbp-img" style="width:60px;height:60px;" src="${r.imagen}" alt="${escapeHtml(r.nombre)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const placeholderHtml = `<div class="dbp-img-placeholder" style="width:60px;height:60px;font-size:24px;" ${r.imagen ? 'style="display:none"' : ''}>${icon}</div>`;

    return `
      <div class="dbp-card">
        <div style="position:absolute; top:12px; right:12px; font-size:10px; padding:2px 8px; border-radius:10px; background:rgba(0,229,204,0.1); color:var(--accent3); border:1px solid rgba(0,229,204,0.3); font-family:'Space Mono',monospace;">🌐 DBpedia</div>
        <div class="dbp-card-top" style="margin-right: 70px;">
          ${imgHtml}${placeholderHtml}
          <div class="dbp-info">
            <div class="dbp-name" style="font-size:15px;">${escapeHtml(r.nombre)}</div>
            <p class="dbp-abstract" style="font-size:12px;">${desc}</p>
          </div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;">
          <button class="dbp-link" style="background:var(--accent); color:#fff; border:none; cursor:pointer; padding:6px 12px; border-radius:8px;"
            onclick="guardarEnOntologia(event, '${escapeAttr(r.nombre)}', '${escapeAttr(r.recurso)}')">
            ${t('dbpedia.button.save') || 'Guardar'}
          </button>
          ${r.wikiPage ? `<a class="dbp-link" href="${r.wikiPage}" target="_blank" rel="noopener">Wikipedia</a>` : ''}
          ${r.dbpediaLink ? `<a class="dbp-link" style="border-color:rgba(124,106,247,0.3);color:var(--accent)" href="${r.dbpediaLink}" target="_blank" rel="noopener">Recurso RDF</a>` : ''}
        </div>
      </div>`;
  });

  // Mezclar resultados
  const combined = [...localCardsHtml, ...dbpCardsHtml];
  container.innerHTML = combined.join('');
  
  if (localRes.length > 60) {
    container.innerHTML += `
      <div class="state-msg" style="grid-column: 1 / -1; padding:20px;">
        <p>Mostrando 60 de ${localRes.length} locales. Refina tu búsqueda.</p>
      </div>`;
  }
}

// ══════════════════════════════════════════════
// MODAL DETALLE (resultado local)
// ══════════════════════════════════════════════
function showDetail(ind) {
  document.getElementById('modalName').textContent  = ind.nombre;
  document.getElementById('modalClass').innerHTML   = `<span class="card-class">${escapeHtml(ind.clase)}</span>`;
  const props = Object.entries(ind.propiedades || {});
  document.getElementById('modalProps').innerHTML   = props.length === 0
    ? '<p style="color:var(--muted);font-family:Space Mono,monospace;font-size:12px;">Sin propiedades registradas</p>'
    : props.map(([k, v]) => {
        let val = v, color = '';
        if (val === 'true')  { val = '✓ Sí'; color = 'color:var(--success)'; }
        if (val === 'false') { val = '✗ No'; color = 'color:#ff6b6b'; }
        return `<div class="modal-prop">
          <span class="modal-prop-key">${escapeHtml(k.replace(/_/g,' '))}</span>
          <span class="modal-prop-val" style="${color}">${escapeHtml(String(val))}</span>
        </div>`;
      }).join('');
  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  if (e.target === document.getElementById('modal'))
    document.getElementById('modal').classList.remove('open');
}

// ══════════════════════════════════════════════
// SPARQL TOGGLE
// ══════════════════════════════════════════════
function toggleSparql() {
  const body   = document.getElementById('sparqlBody');
  const toggle = document.getElementById('sparqlToggle');
  const open   = body.classList.toggle('open');
  toggle.textContent = open ? '▼ ocultar' : '▶ ver';
}
function toggleDbpSparql() {
  const body   = document.getElementById('dbpSparqlBody');
  const toggle = document.getElementById('dbpSparqlToggle');
  const open   = body.classList.toggle('open');
  toggle.textContent = open ? '▼ ocultar' : '▶ ver';
}

// ══════════════════════════════════════════════
// GUARDAR EN ONTOLOGÍA (desde DBpedia → local)
// CORREGIDO: firma (event, nombre, uri) — event es el objeto Event real
// ══════════════════════════════════════════════
async function guardarEnOntologia(event, nombre, uri) {
  const btn = event.currentTarget;
  const textoOriginal = btn.innerHTML;
  btn.innerHTML = `⏳ ${t('dbpedia.button.saving')}`;
  btn.disabled  = true;

  try {
    const resp = await fetch(`${API}/poblar`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nombre, uri })
    });
    const data = await resp.json();

    if (data.ok) {
      btn.innerHTML          = `✅ ${t('dbpedia.button.saved')}`;
      btn.style.background   = 'var(--success)';
      await cargarEstadisticas(); // refresca stats y filtros
    } else {
      btn.innerHTML        = t('dbpedia.button.error');
      btn.style.background = 'red';
      btn.disabled         = false;
      alert(t('alert.save.error') + ' ' + data.error);
    }
  } catch(err) {
    btn.innerHTML        = t('dbpedia.button.network.error');
    btn.style.background = 'red';
    btn.disabled         = false;
    alert(t('alert.network.error') + ' ' + err.message);
  }
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function highlightTokens(text, tokens) {
  if (!tokens.length) return text;
  let result = text;
  for (const tok of tokens) {
    if (tok.length < 2) continue;
    try {
      result = result.replace(new RegExp(`(${escapeReg(tok)})`, 'gi'),
        '<mark style="background:rgba(124,106,247,0.3);color:var(--accent);border-radius:3px;padding:0 2px">$1</mark>');
    } catch(e) {}
  }
  return result;
}

function escapeReg(s)  { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function escapeAttr(s) { return String(s).replace(/'/g, "\\'"); }
function escapeHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Exponer para uso inline (onclick en HTML generado dinámicamente)
window.guardarEnOntologia = guardarEnOntologia;