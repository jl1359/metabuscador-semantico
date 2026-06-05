/* ══════════════════════════════════════════════
   METABUSCADOR SEMÁNTICO — UMSS Web Semántica
   app.js v5 — Multi-búsqueda simultánea + agrupación visual
   ══════════════════════════════════════════════ */

const API = 'http://localhost:5000';

// ══════════════════════════════════════════════
// MULTILINGUALIDAD (i18n)
// ══════════════════════════════════════════════
let currentLanguage = 'es';

function initLanguage() {
  // 1. Leer localStorage primero
  const savedLang = localStorage.getItem('language');
  if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
    currentLanguage = savedLang;
  } else {
    // 2. Detectar idioma del navegador
    const navLang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
    if (navLang.startsWith('en')) {
      currentLanguage = 'en';
    } else if (navLang.startsWith('pt')) {
      currentLanguage = 'pt';
    } else {
      currentLanguage = 'es';
    }
    localStorage.setItem('language', currentLanguage);
  }

  // 3. Actualizar UI
  updateLanguageButton();
  translateDOM(currentLanguage);
}

function toggleLanguage() {
  // Cicla entre los 3 idiomas: es -> en -> pt -> es
  const currentIndex = SUPPORTED_LANGS.indexOf(currentLanguage);
  currentLanguage = SUPPORTED_LANGS[(currentIndex + 1) % SUPPORTED_LANGS.length];
  localStorage.setItem('language', currentLanguage);
  updateLanguageButton();
  translateDOM(currentLanguage);
  // Re-renderizar filtros/chips de clase con el nuevo idioma
  if (ontologiaCargada) cargarEstadisticas();
  // Re-buscar con nuevo idioma si hay una búsqueda activa
  if (typeof buscarUnificado === 'function') buscarUnificado();
}

function updateLanguageButton() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  // Muestra el idioma ACTIVO con su bandera
  const labels = { es: '🇪🇸 ES', en: '🇬🇧 EN', pt: '🇧🇷 PT' };
  btn.textContent = labels[currentLanguage] || currentLanguage.toUpperCase();
  btn.title = t('language.' + currentLanguage);
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
        <p style="color:var(--text); font-weight:700; margin-bottom:8px;">${t('backend.notfound')}</p>
        <p style="color:var(--muted); font-size:12px; font-family:'Space Mono',monospace;">
          ${t('backend.run.terminal')}<br><br>
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
        ${t('loader.loading.rdflib')}
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
          <p style="color:#ff6b6b;">${t('error.load.file')} ${escapeHtml(data.error)}</p>
        </div>`;
    }
  } catch(e) {
    document.getElementById('loaderSection').innerHTML = `
      <div style="text-align:center; padding:40px;">
        <p style="color:#ff6b6b;">${t('error.connect.backend')} ${escapeHtml(e.message)}</p>
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

      // Botones de filtro por clase (nombre traducido, filtro por nombre original)
      document.getElementById('filterBtns').innerHTML = clasesConIndividuos.map(c => {
        const claseLabel = tp('clase.' + c.clase) || escapeHtml(c.clase);
        return `<button class="filter-btn" onclick="setFilter('${escapeAttr(c.clase)}', this)">
           ${claseLabel} <span style="opacity:0.5">(${c.total})</span>
         </button>`;
      }).join('');

      // Explorador de ontología — chips con nombre traducido
      document.getElementById('classGrid').innerHTML = clasesConIndividuos.map(c => {
        const claseLabel = tp('clase.' + c.clase) || escapeHtml(c.clase);
        return `<div class="class-chip" onclick="searchByClass('${escapeAttr(c.clase)}')">
           ${claseLabel}<span class="count">${c.total}</span>
         </div>`;
      }).join('');
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
      q += `  <span class="comment"># Búsqueda simultánea — consultas en paralelo por cada término</span>\n`;
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

<span class="kw">SELECT DISTINCT</span> <span class="var">?recurso</span> <span class="var">?nombre</span> <span class="var">?desc</span> <span class="var">?abs</span> <span class="var">?imagen</span> <span class="var">?wiki</span>
<span class="kw">WHERE</span> {
  <span class="var">?recurso</span> rdfs:label <span class="var">?nombre</span> .
  <span class="var">?nombre</span> bif:contains <span class="str">"${bif}"</span> .
  <span class="kw">FILTER</span>(<span class="kw">lang</span>(<span class="var">?nombre</span>) = <span class="str">"en"</span> || <span class="kw">lang</span>(<span class="var">?nombre</span>) = <span class="str">"es"</span>)
  <span class="kw">OPTIONAL</span> { <span class="var">?recurso</span> dbo:abstract <span class="var">?abs</span> . }
  <span class="kw">OPTIONAL</span> { <span class="var">?recurso</span> rdfs:comment <span class="var">?desc</span> . }
  <span class="kw">OPTIONAL</span> { <span class="var">?recurso</span> dbo:thumbnail <span class="var">?imagen</span> . }
  <span class="kw">OPTIONAL</span> { <span class="var">?recurso</span> foaf:isPrimaryTopicOf <span class="var">?wiki</span> . }
}
<span class="kw">LIMIT</span> 15`;
}

// ══════════════════════════════════════════════
// BÚSQUEDA SIMULTÁNEA — multi-búsqueda paralela
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
  container.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:60px;"><div class="spinner"></div><p style="margin-top:15px; color:var(--accent);">${t('search.loading.local')}</p></div>`;
  countEl.innerHTML = '';
  document.getElementById('dbpEndpointStatus').textContent = '';

  // ── Dividir por comas para multi-búsqueda simultánea ──
  const searchTerms = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
  if (searchTerms.length === 0) searchTerms.push('');

  try {
    // Lanzar TODAS las búsquedas en paralelo: (local + DBpedia) × cada término
    const groupPromises = searchTerms.map(async (term) => {
      const params = new URLSearchParams();
      if (term) params.set('term', term);
      if (currentFilter) params.set('clase', currentFilter);
      params.set('lang', currentLanguage);

      const localP = fetch(`${API}/buscar?${params}`, { signal: AbortSignal.timeout(15000) }).then(r => r.json());
      const dbpP   = term
        ? fetch(`${API}/dbpedia?term=${encodeURIComponent(term)}&lang=${currentLanguage}`, { signal: AbortSignal.timeout(30000) }).then(r => r.json())
        : Promise.resolve({ ok: true, resultados: [] });

      const [dataLocal, dataDbp] = await Promise.all([localP, dbpP]);

      return {
        term,
        localRes: dataLocal.ok ? (dataLocal.resultados || []) : [],
        dbpRes:   dataDbp.ok   ? (dataDbp.resultados   || []) : []
      };
    });

    const groups = await Promise.all(groupPromises);

    if (groups.some(g => g.dbpRes.length > 0)) {
      document.getElementById('dbpEndpointStatus').textContent = t('dbpedia.status') || 'Endpoint: dbpedia.org/sparql';
    }

    renderGroupedResults(groups, searchTerms.length > 1);

  } catch(error) {
    container.innerHTML = `<div class="state-msg" style="grid-column: 1 / -1;"><span class="icon">⚠️</span><h3>${t('error.network')}</h3><p>${escapeHtml(error.message)}</p></div>`;
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
// CONSTANTES Y HELPERS DE RENDERIZADO
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

// ── Genera HTML de cards locales ──
function generateLocalCardsHtml(items, tokens) {
  return items.map(ind => {
    const props = ind.propiedades || {};
    const shownProps = KEY_PROPS.filter(p => props[p] !== undefined).slice(0, 4);

    const propsHtml = shownProps.map(p => {
      let val = props[p], valClass = '';
      if (val === 'true')  { val = tp('bool.true');  valClass = 'bool-true'; }
      if (val === 'false') { val = tp('bool.false'); valClass = 'bool-false'; }
      return `<div class="prop-item">
        <span class="prop-key">${tp(p)}</span>
        <span class="prop-val ${valClass}">${escapeHtml(String(val))}</span>
      </div>`;
    }).join('');

    const nombre = highlightTokens(escapeHtml(ind.nombre), tokens);
    // Clase traducida para el badge
    const claseTraducida = tp('clase.' + ind.clase) || escapeHtml(ind.clase);

    return `
      <div class="result-card" onclick='showDetail(${JSON.stringify(ind).replace(/'/g, "&#39;")})'>
        <div class="card-top">
          <div class="card-name">${nombre}</div>
          <div class="card-badges">
            <span class="source-badge source-local">🏠 Local</span>
            <div class="card-class">${claseTraducida}</div>
          </div>
        </div>
        ${propsHtml
          ? `<div class="card-props">${propsHtml}</div>`
          : '<p style="color:var(--muted);font-size:12px;font-family:Space Mono,monospace">' + (t('modal.no.properties') || 'Sin propiedades registradas') + '</p>'}
      </div>`;
  }).join('');
}

// ── Genera HTML de cards DBpedia ──
function generateDbpCardsHtml(items) {
  return items.map((r, i) => {
    const icon = iconForName(r.nombre);
    
    // We'll use a unique ID to update the description later if we fetch it from Wikipedia
    const descId = `dbp-desc-${i}-${Date.now()}`;
    let descHtml = '';
    
    if (r.descripcion) {
      const text = r.descripcion.length > 120 ? r.descripcion.slice(0, 120) + '...' : r.descripcion;
      descHtml = `<p class="dbp-abstract" id="${descId}">${text}</p>`;
    } else if (r.wikiPage) {
      descHtml = `<p class="dbp-abstract" id="${descId}">
                    <span style="opacity:0.6; font-size:11px;">${t('dbpedia.loading.desc')}</span>
                  </p>`;
      fetchWikipediaDesc(r.wikiPage, descId);
    } else {
      descHtml = `<p class="dbp-abstract" id="${descId}"><em style="opacity:0.5">${t('dbpedia.no.description')}</em></p>`;
    }

    const imgHtml = r.imagen
      ? `<img class="dbp-img" style="width:60px;height:60px;" src="${r.imagen}" alt="${escapeHtml(r.nombre)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const placeholderHtml = `<div class="dbp-img-placeholder" style="width:60px;height:60px;font-size:24px;" ${r.imagen ? 'style="display:none"' : ''}>${icon}</div>`;

    return `
      <div class="dbp-card">
        <div class="dbp-card-header">
          <span class="source-badge source-dbpedia">🌐 DBpedia</span>
        </div>
        <div class="dbp-card-top">
          ${imgHtml}${placeholderHtml}
          <div class="dbp-info">
            <div class="dbp-name">${escapeHtml(r.nombre)}</div>
            ${descHtml}
          </div>
        </div>
        <div class="dbp-actions">
          <button class="dbp-link dbp-save-btn"
            onclick="guardarEnOntologia(event, '${escapeAttr(r.nombre)}', '${escapeAttr(r.recurso)}')">
            ${t('dbpedia.button.save') || 'Guardar'}
          </button>
          ${r.wikiPage ? `<a class="dbp-link" href="${r.wikiPage}" target="_blank" rel="noopener">Wikipedia</a>` : ''}
          ${r.dbpediaLink ? `<a class="dbp-link dbp-rdf-link" href="${r.dbpediaLink}" target="_blank" rel="noopener">DBpedia</a>` : ''}
        </div>
      </div>`;
  }).join('');
}

// ── Fallback a Wikipedia API si DBpedia no tiene abstract ──
async function fetchWikipediaDesc(wikiUrl, elementId) {
  try {
    const title = wikiUrl.split('/').pop();
    const lang = wikiUrl.includes('es.wikipedia') ? 'es' : 'en';
    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`);
    const data = await res.json();
    const el = document.getElementById(elementId);
    if (el && data.extract) {
      const text = data.extract.length > 120 ? data.extract.slice(0, 120) + '...' : data.extract;
      el.innerHTML = text;
    } else if (el) {
      el.innerHTML = `<em style="opacity:0.5">${t('dbpedia.no.description') || 'Sin descripción'}</em>`;
    }
  } catch (e) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = `<em style="opacity:0.5">${t('dbpedia.no.description') || 'Sin descripción'}</em>`;
  }
}

// ══════════════════════════════════════════════
// RENDER RESULTADOS AGRUPADOS (multi-búsqueda)
// ══════════════════════════════════════════════
function renderGroupedResults(groups, isMultiSearch) {
  const container = document.getElementById('unifiedResults');
  const countEl   = document.getElementById('unifiedResultsCount');

  const totalResults = groups.reduce((sum, g) => sum + g.localRes.length + g.dbpRes.length, 0);

  if (totalResults === 0) {
    const termDisplay = groups.map(g => g.term).filter(x => x).join(', ');
    countEl.innerHTML = '';
    container.innerHTML = `
      <div class="state-msg" style="grid-column: 1 / -1;">
        <span class="icon">🔍</span>
        <h3>${t('results.empty.local') || 'Sin resultados'}</h3>
        <p>${t('results.empty') || 'No se encontraron coincidencias para'} "<strong>${escapeHtml(termDisplay)}</strong>"</p>
      </div>`;
    return;
  }

  countEl.innerHTML = `<span>${totalResults}</span> ${totalResults !== 1 ? t('results.count.plural') || 'resultados' : t('results.count') || 'resultado'}`;

  let html = '';

  for (const group of groups) {
    const groupTotal = group.localRes.length + group.dbpRes.length;
    const tokens = group.term ? group.term.split(/[\s]+/).filter(tok => tok.length >= 2) : [];

    // ── Encabezado del grupo (solo en multi-búsqueda) ──
    if (isMultiSearch) {
      const statusClass = groupTotal > 0 ? 'has-results' : 'no-results';
      html += `<div class="search-group-header ${statusClass}">
        <div class="group-title">
          <span class="group-icon">${groupTotal > 0 ? '🔎' : '🔍'}</span>
          <span class="group-term">"${escapeHtml(group.term)}"</span>
          <span class="group-count">${groupTotal} ${groupTotal !== 1 ? t('results.count.plural') || 'resultados' : t('results.count') || 'resultado'}</span>
          ${group.localRes.length > 0 ? `<span class="group-badge local-badge">🏠 ${group.localRes.length} local</span>` : ''}
          ${group.dbpRes.length > 0 ? `<span class="group-badge dbp-badge">🌐 ${group.dbpRes.length} DBpedia</span>` : ''}
        </div>
      </div>`;

      if (groupTotal === 0) {
        html += `<div class="state-msg" style="grid-column: 1 / -1; padding: 24px;">
          <p style="color:var(--muted); font-size:13px;">${t('results.empty') || 'Sin resultados'}</p>
        </div>`;
        continue;
      }
    }

    // ── Cards locales ──
    html += generateLocalCardsHtml(group.localRes.slice(0, 60), tokens);

    // ── Cards DBpedia ──
    html += generateDbpCardsHtml(group.dbpRes);

    if (group.localRes.length > 60) {
      html += `<div class="state-msg" style="grid-column: 1 / -1; padding:20px;">
        <p>${t('results.showing') || 'Mostrando'} 60 ${t('results.of') || 'de'} ${group.localRes.length}. ${t('results.refine') || 'Refina tu búsqueda.'}</p>
      </div>`;
    }
  }

  container.innerHTML = html;
}

// ══════════════════════════════════════════════
// MODAL DETALLE (resultado local)
// ══════════════════════════════════════════════
function showDetail(ind) {
  document.getElementById('modalName').textContent  = ind.nombre;
  // Clase traducida en el modal
  const claseTraducida = tp('clase.' + ind.clase) || escapeHtml(ind.clase);
  document.getElementById('modalClass').innerHTML   = `<span class="card-class">${claseTraducida}</span>`;
  const props = Object.entries(ind.propiedades || {});
  document.getElementById('modalProps').innerHTML   = props.length === 0
    ? `<p style="color:var(--muted);font-family:Space Mono,monospace;font-size:12px;">${t('modal.no.properties')}</p>`
    : props.map(([k, v]) => {
        let val = v, color = '';
        if (val === 'true')  { val = tp('bool.true');  color = 'color:var(--success)'; }
        if (val === 'false') { val = tp('bool.false'); color = 'color:#ff6b6b'; }
        const propKey = k.replace(/_/g,' ');
        return `<div class="modal-prop">
          <span class="modal-prop-key">${tp(propKey)}</span>
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
  toggle.textContent = open ? t('sparql.toggle.hide') : t('sparql.toggle.show.text');
}
function toggleDbpSparql() {
  const body   = document.getElementById('dbpSparqlBody');
  const toggle = document.getElementById('dbpSparqlToggle');
  const open   = body.classList.toggle('open');
  toggle.textContent = open ? t('sparql.toggle.hide') : t('sparql.toggle.show.text');
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