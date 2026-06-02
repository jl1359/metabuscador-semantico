/**
 * SISTEMA DE TRADUCCIONES — MetaBuscador Semántico
 * Multilingualidad: Español (ES) e Inglés (EN)
 */

const i18n = {
  es: {
    // ══ HEADER & BRANDING ══
    'header.badge': 'Web Semántica · UMSS',
    'header.title': 'MetaBuscador Semántico',
    'header.subtitle': 'Ontología de Electrodomésticos · ',
    'header.tech': 'OWL + SPARQL',

    // ══ ESTADÍSTICAS ══
    'stats.individuals': 'Individuos',
    'stats.classes': 'Clases',
    'stats.properties': 'Propiedades',
    'stats.triples': 'Triples RDF',

    // ══ CARGADOR DE ONTOLOGÍA ══
    'loader.title': 'Cargar Ontología OWL',
    'loader.drag': 'Arrastra tu archivo .owx / .owl / .rdf',
    'loader.click': 'o haz click para seleccionar',
    'loader.note': 'El archivo se procesa en el backend · RDFLib + owlready2',
    'loader.loading': 'Cargando ontología con RDFLib...',
    'loader.error.notfound': 'Backend no encontrado',
    'loader.error.terminal': 'Ejecuta en tu terminal:',

    // ══ BÚSQUEDA ══
    'search.placeholder': 'Busca ej. \'samsung, lavadora, licuadora\'... (separado por comas)',
    'search.button': 'Búsqueda Federada',
    'search.loading.local': 'Buscando en ontología local...',
    'search.loading.dbpedia': 'Consultando DBpedia...',

    // ══ PESTAÑAS / TABS ══
    'tabs.local': '🗂 Búsqueda Local',
    'tabs.local.badge': 'OWL',
    'tabs.dbpedia': '🌐 DBpedia',
    'tabs.dbpedia.badge': 'SPARQL Remoto',

    // ══ PANEL SPARQL ══
    'sparql.local': 'Consulta SPARQL · Local',
    'sparql.dbpedia': 'Consulta SPARQL · DBpedia',
    'sparql.toggle.show': '▶ ver',
    'sparql.toggle.hide': '▼ ocultar',

    // ══ RESULTADOS ══
    'results.local': '🏠 Resultados Locales',
    'results.dbpedia': '🌐 DBpedia',
    'results.ready': 'Listo para buscar',
    'results.ready.hint': 'Escribe algo arriba o selecciona una clase',
    'results.empty': 'Sin resultados',
    'results.empty.local': 'No se encontraron coincidencias para',
    'results.empty.dbpedia': 'Sin resultados en DBpedia',
    'results.empty.dbpedia.hint': 'Intenta: "washing machine", "refrigerator", "microwave"',
    'results.count': 'resultado',
    'results.count.plural': 'resultados',
    'results.showing': 'Mostrando',
    'results.of': 'de',
    'results.refine': 'Refina tu búsqueda.',
    'results.source.local': 'RDFLib SPARQL local',
    'results.source.dbpedia': 'DBpedia SPARQL remoto',

    // ══ DETALLE / MODAL ══
    'modal.properties': 'Propiedades',
    'modal.no.properties': 'Sin propiedades registradas',

    // ══ EXPLORER DE ONTOLOGÍA ══
    'explorer.title': 'Explorador de Ontología',

    // ══ ERRORES ══
    'error.title': 'Error',
    'error.connection': 'Error de conexión local:',
    'error.network': 'Error de red',
    'error.sparql': 'Error ejecutando SPARQL:',
    'error.backend': 'No se pudo conectar al backend:',
    'error.dbpedia.title': 'Error DBpedia',
    'error.dbpedia': 'Error al consultar DBpedia',
    'error.ontology.notloaded': 'Ontología no cargada',
    'error.file': 'No se recibió archivo',

    // ══ DBPEDIA CARDS ══
    'dbpedia.link.wikipedia': '🌐 Ver en Wikipedia',
    'dbpedia.link.resource': '◈ Recurso DBpedia',
    'dbpedia.button.save': '💾 Guardar en Local',
    'dbpedia.button.saving': '⏳ Guardando...',
    'dbpedia.button.saved': '✅ ¡Guardado!',
    'dbpedia.button.error': '❌ Error',
    'dbpedia.button.network.error': '❌ Error de red',
    'dbpedia.type': 'DBpedia · Electrodoméstico',
    'dbpedia.no.description': 'Sin descripción disponible.',
    'dbpedia.status': 'dbpedia.org/sparql · SPARQLWrapper',
    'dbpedia.knowledge.base': 'Base de Conocimiento Remota',
    'dbpedia.results.message': 'Los resultados de DBpedia aparecerán aquí',
    'dbpedia.endpoint': 'Endpoint: dbpedia.org/sparql · SPARQLWrapper',

    // ══ FOOTER ══
    'footer.text': 'MetaBuscador Semántico · ',
    'footer.highlight': 'Ontología OWL de Electrodomésticos',
    'footer.year': 'UMSS Web Semántica 2025',
    'footer.tech': 'HTML5 · OWL / RDF / SPARQL · Búsqueda Fuzzy · RDFLib + owlready2 · SPARQLWrapper',

    // ══ ALERTS & CONFIRMATIONS ══
    'alert.save.error': 'Error al guardar:',
    'alert.network.error': 'Error de red:',

    // ══ SPARQL COMMENTS ══
    'sparql.comment.local': '# MetaBuscador Semántico — RDFLib + SPARQL',
    'sparql.comment.local.executor': '# Ejecutado por: Python RDFLib en el backend',
    'sparql.comment.local.multiple': '# Búsqueda múltiple (OR)',
    'sparql.comment.local.semantic': '# Búsqueda semántica fuzzy',
    'sparql.comment.local.filter': '# Filtro por clase seleccionada',

    'sparql.comment.dbpedia': '# BC Remota — DBpedia SPARQL',
    'sparql.comment.dbpedia.endpoint': '# Endpoint: https://dbpedia.org/sparql',

    // ══ SELECTOR DE IDIOMA ══
    'language.selector': 'Idioma',
    'language.es': 'Español',
    'language.en': 'English',
  },

  en: {
    // ══ HEADER & BRANDING ══
    'header.badge': 'Semantic Web · UMSS',
    'header.title': 'Semantic Search Engine',
    'header.subtitle': 'Appliances Ontology · ',
    'header.tech': 'OWL + SPARQL',

    // ══ STATISTICS ══
    'stats.individuals': 'Individuals',
    'stats.classes': 'Classes',
    'stats.properties': 'Properties',
    'stats.triples': 'RDF Triples',

    // ══ ONTOLOGY LOADER ══
    'loader.title': 'Load OWL Ontology',
    'loader.drag': 'Drag your .owx / .owl / .rdf file',
    'loader.click': 'or click to select',
    'loader.note': 'File processed on backend · RDFLib + owlready2',
    'loader.loading': 'Loading ontology with RDFLib...',
    'loader.error.notfound': 'Backend not found',
    'loader.error.terminal': 'Run in your terminal:',

    // ══ SEARCH ══
    'search.placeholder': 'Search e.g. \'samsung, washing machine, blender\'... (comma separated)',
    'search.button': 'Federated Search',
    'search.loading.local': 'Searching local ontology...',
    'search.loading.dbpedia': 'Querying DBpedia...',

    // ══ TABS ══
    'tabs.local': '🗂 Local Search',
    'tabs.local.badge': 'OWL',
    'tabs.dbpedia': '🌐 DBpedia',
    'tabs.dbpedia.badge': 'Remote SPARQL',

    // ══ SPARQL PANEL ══
    'sparql.local': 'SPARQL Query · Local',
    'sparql.dbpedia': 'SPARQL Query · DBpedia',
    'sparql.toggle.show': '▶ view',
    'sparql.toggle.hide': '▼ hide',

    // ══ RESULTS ══
    'results.local': '🏠 Local Results',
    'results.dbpedia': '🌐 DBpedia',
    'results.ready': 'Ready to search',
    'results.ready.hint': 'Type something above or select a class',
    'results.empty': 'No results',
    'results.empty.local': 'No matches found for',
    'results.empty.dbpedia': 'No results in DBpedia',
    'results.empty.dbpedia.hint': 'Try: "washing machine", "refrigerator", "microwave"',
    'results.count': 'result',
    'results.count.plural': 'results',
    'results.showing': 'Showing',
    'results.of': 'of',
    'results.refine': 'Refine your search.',
    'results.source.local': 'RDFLib SPARQL local',
    'results.source.dbpedia': 'DBpedia SPARQL remote',

    // ══ DETAIL / MODAL ══
    'modal.properties': 'Properties',
    'modal.no.properties': 'No registered properties',

    // ══ ONTOLOGY EXPLORER ══
    'explorer.title': 'Ontology Explorer',

    // ══ ERRORS ══
    'error.title': 'Error',
    'error.connection': 'Local connection error:',
    'error.network': 'Network error',
    'error.sparql': 'Error executing SPARQL:',
    'error.backend': 'Could not connect to backend:',
    'error.dbpedia.title': 'DBpedia Error',
    'error.dbpedia': 'Error querying DBpedia',
    'error.ontology.notloaded': 'Ontology not loaded',
    'error.file': 'No file received',

    // ══ DBPEDIA CARDS ══
    'dbpedia.link.wikipedia': '🌐 View on Wikipedia',
    'dbpedia.link.resource': '◈ DBpedia Resource',
    'dbpedia.button.save': '💾 Save to Local',
    'dbpedia.button.saving': '⏳ Saving...',
    'dbpedia.button.saved': '✅ Saved!',
    'dbpedia.button.error': '❌ Error',
    'dbpedia.button.network.error': '❌ Network Error',
    'dbpedia.type': 'DBpedia · Appliance',
    'dbpedia.no.description': 'No description available.',
    'dbpedia.status': 'dbpedia.org/sparql · SPARQLWrapper',
    'dbpedia.knowledge.base': 'Remote Knowledge Base',
    'dbpedia.results.message': 'DBpedia results will appear here',
    'dbpedia.endpoint': 'Endpoint: dbpedia.org/sparql · SPARQLWrapper',

    // ══ FOOTER ══
    'footer.text': 'Semantic Search Engine · ',
    'footer.highlight': 'OWL Ontology of Appliances',
    'footer.year': 'UMSS Semantic Web 2025',
    'footer.tech': 'HTML5 · OWL / RDF / SPARQL · Fuzzy Search · RDFLib + owlready2 · SPARQLWrapper',

    // ══ ALERTS & CONFIRMATIONS ══
    'alert.save.error': 'Error saving:',
    'alert.network.error': 'Network error:',

    // ══ SPARQL COMMENTS ══
    'sparql.comment.local': '# Semantic Search Engine — RDFLib + SPARQL',
    'sparql.comment.local.executor': '# Executed by: Python RDFLib on backend',
    'sparql.comment.local.multiple': '# Multiple search (OR)',
    'sparql.comment.local.semantic': '# Semantic fuzzy search',
    'sparql.comment.local.filter': '# Filter by selected class',

    'sparql.comment.dbpedia': '# Remote KB — DBpedia SPARQL',
    'sparql.comment.dbpedia.endpoint': '# Endpoint: https://dbpedia.org/sparql',

    // ══ LANGUAGE SELECTOR ══
    'language.selector': 'Language',
    'language.es': 'Español',
    'language.en': 'English',
  }
};

// ═══════════════════════════════════════════════════════════════════
// Función de traducción global
// ═══════════════════════════════════════════════════════════════════
function t(key, lang = currentLanguage || 'es') {
  return i18n[lang]?.[key] || i18n['es'][key] || key;
}

// ═══════════════════════════════════════════════════════════════════
// Traducir todos los elementos del DOM marcados con data-i18n
// ═══════════════════════════════════════════════════════════════════
function translateDOM(lang = currentLanguage || 'es') {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translated = t(key, lang);

    // Si el elemento es un input, actualizar placeholder
    if (el.tagName === 'INPUT' && el.type === 'text') {
      if (el.dataset.placeholder) {
        el.placeholder = translated;
      }
    } else {
      // Si no, actualizar textContent
      el.textContent = translated;
    }
  });
}
