/**
 * SISTEMA DE TRADUCCIONES — MetaBuscador Semántico
 * Multilingualidad: Español (ES) · Inglés (EN) · Portugués (PT)
 * Implementación: Internacionalización (i18n) — doc. 4.1 Multilingualidad
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
    'results.unified': '🎯 Resultados de Búsqueda',
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
    'language.pt': 'Português',

    // ══ MENSAJES HARDCODEADOS (backend / carga) ══
    'backend.notfound': 'Backend no encontrado',
    'backend.run.terminal': 'Ejecuta en tu terminal:',
    'loader.loading.rdflib': 'Cargando ontología con RDFLib...',
    'error.load.file': 'Error al cargar el archivo:',
    'error.connect.backend': 'No se pudo conectar al backend:',
    'sparql.toggle.hide': '▼ ocultar',
    'sparql.toggle.show.text': '▶ ver',
    'dbpedia.loading.desc': 'Cargando descripción...',
    'search.loading': 'Buscando...',
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
    'results.unified': '🎯 Search Results',
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
    'language.pt': 'Português',

    // ══ HARDCODED MESSAGES (backend / loading) ══
    'backend.notfound': 'Backend not found',
    'backend.run.terminal': 'Run in your terminal:',
    'loader.loading.rdflib': 'Loading ontology with RDFLib...',
    'error.load.file': 'Error loading file:',
    'error.connect.backend': 'Could not connect to backend:',
    'sparql.toggle.hide': '▼ hide',
    'sparql.toggle.show.text': '▶ view',
    'dbpedia.loading.desc': 'Loading description...',
    'search.loading': 'Searching...',
  },

  // ══════════════════════════════════════════════════════════════════
  // PORTUGUÊS (PT) — 3º idioma · Internacionalização
  // Doc. 4.1 Multilingualidade: Nivel 1 - Interfaz
  // ══════════════════════════════════════════════════════════════════
  pt: {
    // ══ CABEÇALHO & BRANDING ══
    'header.badge': 'Web Semântica · UMSS',
    'header.title': 'MetaBuscador Semântico',
    'header.subtitle': 'Ontologia de Eletrodomésticos · ',
    'header.tech': 'OWL + SPARQL',

    // ══ ESTATÍSTICAS ══
    'stats.individuals': 'Indivíduos',
    'stats.classes': 'Classes',
    'stats.properties': 'Propriedades',
    'stats.triples': 'Triplas RDF',

    // ══ CARREGADOR DE ONTOLOGIA ══
    'loader.title': 'Carregar Ontologia OWL',
    'loader.drag': 'Arraste seu arquivo .owx / .owl / .rdf',
    'loader.click': 'ou clique para selecionar',
    'loader.note': 'Arquivo processado no backend · RDFLib + owlready2',
    'loader.loading': 'Carregando ontologia com RDFLib...',
    'loader.error.notfound': 'Backend não encontrado',
    'loader.error.terminal': 'Execute no seu terminal:',

    // ══ BUSCA ══
    'search.placeholder': 'Busque ex. \'samsung, geladeira, liquidificador\'... (separado por vírgulas)',
    'search.button': 'Busca Federada',
    'search.loading.local': 'Buscando na ontologia local...',
    'search.loading.dbpedia': 'Consultando DBpedia...',

    // ══ ABAS / TABS ══
    'tabs.local': '🗂 Busca Local',
    'tabs.local.badge': 'OWL',
    'tabs.dbpedia': '🌐 DBpedia',
    'tabs.dbpedia.badge': 'SPARQL Remoto',

    // ══ PAINEL SPARQL ══
    'sparql.local': 'Consulta SPARQL · Local',
    'sparql.dbpedia': 'Consulta SPARQL · DBpedia',
    'sparql.toggle.show': '▶ ver',
    'sparql.toggle.hide': '▼ ocultar',

    // ══ RESULTADOS ══
    'results.unified': '🎯 Resultados da Busca',
    'results.local': '🏠 Resultados Locais',
    'results.dbpedia': '🌐 DBpedia',
    'results.ready': 'Pronto para buscar',
    'results.ready.hint': 'Digite algo acima ou selecione uma classe',
    'results.empty': 'Sem resultados',
    'results.empty.local': 'Nenhuma correspondência encontrada para',
    'results.empty.dbpedia': 'Sem resultados no DBpedia',
    'results.empty.dbpedia.hint': 'Tente: "geladeira", "máquina de lavar", "micro-ondas"',
    'results.count': 'resultado',
    'results.count.plural': 'resultados',
    'results.showing': 'Mostrando',
    'results.of': 'de',
    'results.refine': 'Refine sua busca.',
    'results.source.local': 'RDFLib SPARQL local',
    'results.source.dbpedia': 'DBpedia SPARQL remoto',

    // ══ DETALHE / MODAL ══
    'modal.properties': 'Propriedades',
    'modal.no.properties': 'Sem propriedades registradas',

    // ══ EXPLORADOR DE ONTOLOGIA ══
    'explorer.title': 'Explorador de Ontologia',

    // ══ ERROS ══
    'error.title': 'Erro',
    'error.connection': 'Erro de conexão local:',
    'error.network': 'Erro de rede',
    'error.sparql': 'Erro ao executar SPARQL:',
    'error.backend': 'Não foi possível conectar ao backend:',
    'error.dbpedia.title': 'Erro DBpedia',
    'error.dbpedia': 'Erro ao consultar DBpedia',
    'error.ontology.notloaded': 'Ontologia não carregada',
    'error.file': 'Nenhum arquivo recebido',

    // ══ CARDS DBPEDIA ══
    'dbpedia.link.wikipedia': '🌐 Ver na Wikipedia',
    'dbpedia.link.resource': '◈ Recurso DBpedia',
    'dbpedia.button.save': '💾 Salvar no Local',
    'dbpedia.button.saving': '⏳ Salvando...',
    'dbpedia.button.saved': '✅ Salvo!',
    'dbpedia.button.error': '❌ Erro',
    'dbpedia.button.network.error': '❌ Erro de rede',
    'dbpedia.type': 'DBpedia · Eletrodoméstico',
    'dbpedia.no.description': 'Sem descrição disponível.',
    'dbpedia.status': 'dbpedia.org/sparql · SPARQLWrapper',
    'dbpedia.knowledge.base': 'Base de Conhecimento Remota',
    'dbpedia.results.message': 'Os resultados do DBpedia aparecerão aqui',
    'dbpedia.endpoint': 'Endpoint: dbpedia.org/sparql · SPARQLWrapper',

    // ══ RODAPÉ ══
    'footer.text': 'MetaBuscador Semântico · ',
    'footer.highlight': 'Ontologia OWL de Eletrodomésticos',
    'footer.year': 'UMSS Web Semântica 2025',
    'footer.tech': 'HTML5 · OWL / RDF / SPARQL · Busca Fuzzy · RDFLib + owlready2 · SPARQLWrapper',

    // ══ ALERTAS & CONFIRMAÇÕES ══
    'alert.save.error': 'Erro ao salvar:',
    'alert.network.error': 'Erro de rede:',

    // ══ COMENTÁRIOS SPARQL ══
    'sparql.comment.local': '# MetaBuscador Semântico — RDFLib + SPARQL',
    'sparql.comment.local.executor': '# Executado por: Python RDFLib no backend',
    'sparql.comment.local.multiple': '# Busca múltipla (OR)',
    'sparql.comment.local.semantic': '# Busca semântica fuzzy',
    'sparql.comment.local.filter': '# Filtro por classe selecionada',

    'sparql.comment.dbpedia': '# BC Remota — DBpedia SPARQL',
    'sparql.comment.dbpedia.endpoint': '# Endpoint: https://dbpedia.org/sparql',

    // ══ SELETOR DE IDIOMA ══
    'language.selector': 'Idioma',
    'language.es': 'Español',
    'language.en': 'English',
    'language.pt': 'Português',

    // ══ MENSAGENS HARDCODED (backend / carregamento) ══
    'backend.notfound': 'Backend não encontrado',
    'backend.run.terminal': 'Execute no seu terminal:',
    'loader.loading.rdflib': 'Carregando ontologia com RDFLib...',
    'error.load.file': 'Erro ao carregar o arquivo:',
    'error.connect.backend': 'Não foi possível conectar ao backend:',
    'sparql.toggle.hide': '▼ ocultar',
    'sparql.toggle.show.text': '▶ ver',
    'dbpedia.loading.desc': 'Carregando descrição...',
    'search.loading': 'Buscando...',
  }
};

// ═══════════════════════════════════════════════════════════════════
// Función de traducción global
// ═══════════════════════════════════════════════════════════════════
function t(key, lang = currentLanguage || 'es') {
  return i18n[lang]?.[key] || i18n['es'][key] || key;
}

// Lista de idiomas soportados (orden del ciclo)
const SUPPORTED_LANGS = ['es', 'en', 'pt'];

// ═══════════════════════════════════════════════════════════════════
// TRADUCCIONES DE DATA PROPERTIES Y CLASES DE ONTOLOGÍA
// Doc. 4.1 Nivel 1(b): mostrar contenido en el idioma seleccionado
// ═══════════════════════════════════════════════════════════════════
const propLabels = {
  es: {
    // Propiedades numéricas / técnicas
    'consumo potencia':       'Consumo Potencia',
    'capacidad litros':       'Capacidad (litros)',
    'capacidad lavado':       'Cap. Lavado (kg)',
    'capacidad refrigeracion':'Cap. Refrigeración',
    'eficiencia energetica':  'Eficiencia Energética',
    'tamano pantalla':        'Tamaño Pantalla',
    'voltaje aparato':        'Voltaje (V)',
    'peso aparato':           'Peso (kg)',
    'numero hornillas':       'N° Hornillas',
    'capacidad tazas':        'Cap. Tazas',
    'capacidad carga':        'Cap. Carga',
    'rpm centrifugado':       'RPM Centrifugado',
    'potencia microondas':    'Potencia Microondas',
    'area cobertura':         'Área Cobertura',
    'numero velocidades':     'N° Velocidades',
    'memoria ram':            'Memoria RAM',
    'almacenamiento interno': 'Almacenamiento',
    'capacidad congelacion':  'Cap. Congelación',
    'vida util estimada':     'Vida Útil (hrs)',
    // Propiedades booleanas / categóricas
    'tecnologia inverter':    'Tecnología Inverter',
    'tv smart':               'Smart TV',
    'portable':               'Portátil',
    'conectividad red':       'Conectividad Red',
    // Propiedades objeto (info)
    'fabricado por':          'Fabricado por',
    'tiene componente':       'Componente',
    'pais origen marca':      'País de Origen',
    'ano creacion marca':     'Año de Creación',
    // Booleanos
    'bool.true':  '✓ Sí',
    'bool.false': '✗ No',
    // Clases de ontología
    'clase.Refrigerador':      'Refrigerador',
    'clase.Lavadora':          'Lavadora',
    'clase.Televisor':         'Televisor',
    'clase.Computadora':       'Computadora',
    'clase.Microondas':        'Microondas',
    'clase.Aspiradora':        'Aspiradora',
    'clase.Licuadora':         'Licuadora',
    'clase.Cafetera':          'Cafetera',
    'clase.Aire Acondicionado':'Aire Acondicionado',
    'clase.Horno':             'Horno',
    'clase.Sensor':            'Sensor',
    'clase.Marca':             'Marca',
  },
  en: {
    'consumo potencia':       'Power Consumption',
    'capacidad litros':       'Capacity (liters)',
    'capacidad lavado':       'Wash Capacity (kg)',
    'capacidad refrigeracion':'Cooling Capacity',
    'eficiencia energetica':  'Energy Efficiency',
    'tamano pantalla':        'Screen Size',
    'voltaje aparato':        'Voltage (V)',
    'peso aparato':           'Weight (kg)',
    'numero hornillas':       'No. Burners',
    'capacidad tazas':        'Cup Capacity',
    'capacidad carga':        'Load Capacity',
    'rpm centrifugado':       'Spin Speed (RPM)',
    'potencia microondas':    'Microwave Power',
    'area cobertura':         'Coverage Area',
    'numero velocidades':     'No. Speeds',
    'memoria ram':            'RAM Memory',
    'almacenamiento interno': 'Storage',
    'capacidad congelacion':  'Freezing Capacity',
    'vida util estimada':     'Lifespan (hrs)',
    'tecnologia inverter':    'Inverter Technology',
    'tv smart':               'Smart TV',
    'portable':               'Portable',
    'conectividad red':       'Network Connectivity',
    'fabricado por':          'Manufactured by',
    'tiene componente':       'Component',
    'pais origen marca':      'Country of Origin',
    'ano creacion marca':     'Brand Founded',
    'bool.true':  '✓ Yes',
    'bool.false': '✗ No',
    'clase.Refrigerador':      'Refrigerator',
    'clase.Lavadora':          'Washing Machine',
    'clase.Televisor':         'Television',
    'clase.Computadora':       'Computer',
    'clase.Microondas':        'Microwave',
    'clase.Aspiradora':        'Vacuum Cleaner',
    'clase.Licuadora':         'Blender',
    'clase.Cafetera':          'Coffee Maker',
    'clase.Aire Acondicionado':'Air Conditioner',
    'clase.Horno':             'Oven',
    'clase.Sensor':            'Sensor',
    'clase.Marca':             'Brand',
  },
  pt: {
    'consumo potencia':       'Consumo de Energia',
    'capacidad litros':       'Capacidade (litros)',
    'capacidad lavado':       'Cap. Lavagem (kg)',
    'capacidad refrigeracion':'Cap. Refrigeração',
    'eficiencia energetica':  'Eficiência Energética',
    'tamano pantalla':        'Tamanho da Tela',
    'voltaje aparato':        'Voltagem (V)',
    'peso aparato':           'Peso (kg)',
    'numero hornillas':       'Nº Queimadores',
    'capacidad tazas':        'Cap. Xícaras',
    'capacidad carga':        'Cap. de Carga',
    'rpm centrifugado':       'Centrifugação (RPM)',
    'potencia microondas':    'Potência Micro-ondas',
    'area cobertura':         'Área de Cobertura',
    'numero velocidades':     'Nº Velocidades',
    'memoria ram':            'Memória RAM',
    'almacenamiento interno': 'Armazenamento',
    'capacidad congelacion':  'Cap. Congelamento',
    'vida util estimada':     'Vida Útil (hrs)',
    'tecnologia inverter':    'Tecnologia Inverter',
    'tv smart':               'Smart TV',
    'portable':               'Portátil',
    'conectividad red':       'Conectividade de Rede',
    'fabricado por':          'Fabricado por',
    'tiene componente':       'Componente',
    'pais origen marca':      'País de Origem',
    'ano creacion marca':     'Ano de Fundação',
    'bool.true':  '✓ Sim',
    'bool.false': '✗ Não',
    'clase.Refrigerador':      'Geladeira',
    'clase.Lavadora':          'Máquina de Lavar',
    'clase.Televisor':         'Televisão',
    'clase.Computadora':       'Computador',
    'clase.Microondas':        'Micro-ondas',
    'clase.Aspiradora':        'Aspirador de Pó',
    'clase.Licuadora':         'Liquidificador',
    'clase.Cafetera':          'Cafeteira',
    'clase.Aire Acondicionado':'Ar Condicionado',
    'clase.Horno':             'Forno',
    'clase.Sensor':            'Sensor',
    'clase.Marca':             'Marca',
  }
};

/**
 * Traduce el nombre de una data property o clase de la ontología.
 * tp('consumo potencia') → 'Power Consumption' (en inglés)
 */
function tp(key, lang = currentLanguage || 'es') {
  return propLabels[lang]?.[key] || propLabels['es']?.[key] || key;
}

// ═══════════════════════════════════════════════════════════════════
// Traducir todos los elementos del DOM marcados con data-i18n
// ═══════════════════════════════════════════════════════════════════
function translateDOM(lang = currentLanguage || 'es') {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translated = t(key, lang);

    // Si el elemento es un input, actualizar placeholder
    if (el.tagName === 'INPUT') {
      el.placeholder = translated;
    } else {
      // Si no, actualizar textContent
      el.textContent = translated;
    }
  });
}
