# ══════════════════════════════════════════════════════════
# MetaBuscador Semántico — Backend Python v3
# server.py — owlready2 + RDFLib SPARQL + SPARQLWrapper + Flask
# ══════════════════════════════════════════════════════════

from flask import Flask, request, jsonify
from flask_cors import CORS
from SPARQLWrapper import SPARQLWrapper, JSON
from owlready2 import get_ontology, default_world
import os, traceback, tempfile, re
import rdflib

app = Flask(__name__)
CORS(app, origins="*")

onto              = None
ontologia_cargada = False
individuos_cache  = []
grafo_local       = rdflib.Graph()
# Guarda la ruta real del archivo cargado para poder reguardar en el mismo lugar
ruta_archivo_cargado = None

# ── Namespaces RDF/RDFS para enriquecimiento de etiquetas ──────────────────
RDFS = rdflib.namespace.RDFS
RDF  = rdflib.namespace.RDF

# ═══════════════════════════════════════════════════════════
# DICCIONARIO DE TRADUCCIÓN Español → Inglés y Portugués
# (para enriquecer el grafo en RAM con rdfs:label @en y @pt)
# ═══════════════════════════════════════════════════════════
ES_TO_EN = {
    "refrigerador": "refrigerator", "lavadora": "washing machine",
    "televisor": "television", "pantalla": "screen",
    "aire acondicionado": "air conditioner", "termostato": "thermostat",
    "computadora": "computer", "calefactor": "heater",
    "secadora de cabello": "hair dryer", "horno": "oven",
    "horno electrico": "electric oven", "cafetera": "coffee maker",
    "freezer": "freezer", "tostadora": "toaster",
    "lavavajillas": "dishwasher", "microondas": "microwave",
    "secadora": "dryer", "secadora de ropa": "clothes dryer",
    "ventilador": "fan", "plancha de cabello": "hair straightener",
    "cocina": "stove", "equipo de sonido": "sound system",
    "aspiradora": "vacuum cleaner", "bateria": "battery",
    "licuadora": "blender", "sensor": "sensor", "marca": "brand",
    "dueño": "owner", "motor electrico": "electric motor",
    "compresor": "compressor", "filtro": "filter",
    "control remoto": "remote control", "lampara": "lamp",
    "plancha": "iron", "exprimidor": "juicer",
    "extractor de jugos": "juice extractor",
}

ES_TO_PT = {
    "refrigerador": "geladeira", "lavadora": "máquina de lavar",
    "televisor": "televisão", "pantalla": "tela",
    "aire acondicionado": "ar condicionado", "termostato": "termostato",
    "computadora": "computador", "calefactor": "aquecedor",
    "secadora de cabello": "secador de cabelo", "horno": "forno",
    "horno electrico": "forno elétrico", "cafetera": "cafeteira",
    "freezer": "freezer", "tostadora": "torradeira",
    "lavavajillas": "lava-louças", "microondas": "micro-ondas",
    "secadora": "secadora", "secadora de ropa": "secadora de roupas",
    "ventilador": "ventilador", "plancha de cabello": "chapinha",
    "cocina": "fogão", "equipo de sonido": "equipamento de som",
    "aspiradora": "aspirador", "bateria": "bateria",
    "licuadora": "liquidificador", "sensor": "sensor", "marca": "marca",
    "dueño": "dono", "motor electrico": "motor elétrico",
    "compresor": "compressor", "filtro": "filtro",
    "control remoto": "controle remoto", "lampara": "lâmpada",
    "plancha": "ferro de passar", "exprimidor": "espremedor",
    "extractor de jugos": "extrator de suco",
}

ES_TO_FR = {
    "refrigerador": "réfrigérateur", "lavadora": "machine à laver",
    "televisor": "téléviseur", "pantalla": "écran",
    "aire acondicionado": "climatiseur", "termostato": "thermostat",
    "computadora": "ordinateur", "calefactor": "radiateur",
    "secadora de cabello": "sèche-cheveux", "horno": "four",
    "horno electrico": "four électrique", "cafetera": "cafetière",
    "freezer": "congélateur", "tostadora": "grille-pain",
    "lavavajillas": "lave-vaisselle", "microondas": "micro-ondes",
    "secadora": "sèche-linge", "secadora de ropa": "sèche-linge",
    "ventilador": "ventilateur", "plancha de cabello": "lisseur",
    "cocina": "cuisinière", "equipo de sonido": "chaîne stéréo",
    "aspiradora": "aspirateur", "bateria": "batterie",
    "licuadora": "mixeur", "sensor": "capteur", "marca": "marque",
    "dueño": "propriétaire", "motor electrico": "moteur électrique",
    "compresor": "compresseur", "filtro": "filtre",
    "control remoto": "télécommande", "lampara": "lampe",
    "plancha": "fer à repasser", "exprimidor": "presse-agrumes",
    "extractor de jugos": "extracteur de jus",
}

# ── Construye el cache de individuos desde owlready2 ─────
def construir_cache():
    global individuos_cache
    individuos_cache = []
    if not onto:
        return
    for ind in onto.individuals():
        clases = list(ind.is_a)
        clase_nombre = ""
        for c in clases:
            nombre = getattr(c, 'name', '')
            if nombre and nombre not in ('Thing', 'NamedIndividual'):
                clase_nombre = nombre.replace("_", " ")
                break
        if not clase_nombre:
            continue
        # Extraer etiquetas de idioma
        s = rdflib.URIRef(ind.iri)
        labels = {}
        for o in grafo_local.objects(s, rdflib.RDFS.label):
            if hasattr(o, 'language') and o.language:
                labels[o.language] = str(o).replace("_", " ")
            elif isinstance(o, rdflib.Literal) and not getattr(o, 'language', None):
                labels['es'] = str(o).replace("_", " ")
        
        # Fallback al nombre de URI si falta el español
        if 'es' not in labels:
            labels['es'] = ind.name.replace("_", " ")

        props = {}
        # EXTRAEMOS PROPIEDADES USANDO RDFLIB PARA NO PERDER NINGUNA
        for p, o in grafo_local.predicate_objects(s):
            p_str = str(p)
            # Ignorar rdf:type y rdfs:label ya que los sacamos por separado
            if "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" in p_str or "http://www.w3.org/2000/01/rdf-schema#label" in p_str:
                continue
            
            p_name = p_str.split("#")[-1].split("/")[-1].replace("_", " ")
            o_name = str(o).split("#")[-1].split("/")[-1].replace("_", " ")
            props[p_name] = o_name

        individuos_cache.append({
            "id":          ind.name,
            "nombres":     labels,
            "clase":       clase_nombre,
            "propiedades": props
        })
    print(f"[RDFLib + owlready2] Cache: {len(individuos_cache)} individuos")


# ── Enriquece el grafo en RAM con rdfs:label @en y @pt ───────────────
def enriquecer_grafo_multilingue():
    """Añade rdfs:label en @en y @pt a cada individuo basado en su nombre en ES."""
    sujetos = list(grafo_local.subjects(RDF.type, None))
    nuevas_tripletas = []

    for sujeto in sujetos:
        uri_str = str(sujeto)
        if '#' not in uri_str and '/' not in uri_str:
            continue
        # Obtener el nombre del individuo desde la URI
        nombre_uri = uri_str.split('#')[-1].split('/')[-1].replace('_', ' ').lower()

        # Ya tiene label @es?
        labels_existentes = {str(lang): str(label)
                             for label, lang in [
                                 (o, o.language) for o in grafo_local.objects(sujeto, RDFS.label)
                                 if hasattr(o, 'language')
                             ]}

        # Agregar @es si no existe
        if 'es' not in labels_existentes:
            nuevas_tripletas.append((sujeto, RDFS.label, rdflib.Literal(nombre_uri, lang='es')))

        # Agregar @en
        if 'en' not in labels_existentes:
            label_en = nombre_uri
            for k, v in ES_TO_EN.items():
                if k in label_en:
                    label_en = label_en.replace(k, v)
            nuevas_tripletas.append((sujeto, RDFS.label, rdflib.Literal(label_en, lang='en')))

        # Agregar @pt
        if 'pt' not in labels_existentes:
            label_pt = nombre_uri
            for k, v in ES_TO_PT.items():
                if k in label_pt:
                    label_pt = label_pt.replace(k, v)
            nuevas_tripletas.append((sujeto, RDFS.label, rdflib.Literal(label_pt, lang='pt')))

        # Agregar @fr
        if 'fr' not in labels_existentes:
            label_fr = nombre_uri
            for k, v in ES_TO_FR.items():
                if k in label_fr:
                    label_fr = label_fr.replace(k, v)
            nuevas_tripletas.append((sujeto, RDFS.label, rdflib.Literal(label_fr, lang='fr')))

    for triple in nuevas_tripletas:
        grafo_local.add(triple)

    print(f"  ✓ Multilingualidad: {len(nuevas_tripletas)} etiquetas rdfs:label agregadas (@en/@pt/@fr)")


# ── Auto-carga al iniciar — busca todos los formatos posibles ─────
def auto_cargar():
    global onto, ontologia_cargada, ruta_archivo_cargado
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ontologia_dir = os.path.join(base_dir, "ontologia")

    # CORREGIDO: busca todos los nombres posibles en orden de preferencia
    nombres_posibles = [
        "web_semanticas.rdf",
        "web-semanticas.owx",
        "web_semanticas.owl",
        "ontologia.owl",
        "ontologia.rdf",
    ]

    for nombre in nombres_posibles:
        ruta = os.path.join(ontologia_dir, nombre)
        if os.path.exists(ruta):
            print(f"  Auto-cargando: {ruta}")
            try:
                # Arreglo para Windows y owlready2
                ruta_url = "file:///" + ruta.replace("\\", "/") if os.name == 'nt' else "file://" + ruta
                onto = get_ontology(ruta_url).load()
                ontologia_cargada = True
                ruta_archivo_cargado = ruta

                grafo_local.parse(ruta, format="xml")
                enriquecer_grafo_multilingue()  # Primero enriquecer, luego cachear con labels
                construir_cache()
                print(f"  ✓ Cargado: {len(individuos_cache)} individuos, {len(grafo_local)} triples")
            except OSError as e:
                if getattr(e, 'errno', 0) == 22 and os.name == 'nt':
                    # Fallback para Windows [Errno 22] Invalid argument: '/C:/...'
                    print(f"  Advertencia: Error de URI en Windows. Cargando directamente por ruta.")
                    try:
                        onto = get_ontology(ruta).load()
                        ontologia_cargada = True
                        ruta_archivo_cargado = ruta
                        grafo_local.parse(ruta, format="xml")
                        enriquecer_grafo_multilingue()
                        construir_cache()
                        print(f"  ✓ Cargado (fallback): {len(individuos_cache)} individuos, {len(grafo_local)} triples")
                    except Exception as e2:
                        print(f"  ✗ Error con {nombre} (fallback): {e2}")
                        traceback.print_exc()
                else:
                    print(f"  ✗ Error con {nombre}: {e}")
                    traceback.print_exc()
            except Exception as e:
                print(f"  ✗ Error con {nombre}: {e}")
                traceback.print_exc()
            return  # Para en el primero que funcione

    print("  ✗ No se encontró ningún archivo de ontología en:", ontologia_dir)

# ══════════════════════════════════════════════════════════
# RUTAS
# ══════════════════════════════════════════════════════════

@app.route("/cargar_archivo", methods=["POST"])
def cargar_archivo():
    global onto, ontologia_cargada, ruta_archivo_cargado
    if 'owl_file' not in request.files:
        return jsonify({"ok": False, "error": "No se recibió archivo"}), 400
    archivo = request.files['owl_file']
    with tempfile.NamedTemporaryFile(delete=False, suffix='.owx') as tmp:
        archivo.save(tmp.name)
        ruta_tmp = tmp.name
    try:
        ruta_url = "file:///" + ruta_tmp.replace("\\", "/") if os.name == 'nt' else "file://" + ruta_tmp
        try:
            onto = get_ontology(ruta_url).load()
        except OSError as e:
            if getattr(e, 'errno', 0) == 22 and os.name == 'nt':
                onto = get_ontology(ruta_tmp).load()
            else:
                raise e

        ontologia_cargada = True
        ruta_archivo_cargado = ruta_tmp

        grafo_local.remove((None, None, None))
        grafo_local.parse(ruta_tmp, format="xml")

        enriquecer_grafo_multilingue()  # Nivel 2 y 3 del doc. 4.1 — primero labels, luego cache
        construir_cache()
        return jsonify({
            "ok":         True,
            "archivo":    archivo.filename,
            "individuos": len(individuos_cache),
            "triples":    len(grafo_local)
        })
    except Exception as e:
        if os.path.exists(ruta_tmp): os.unlink(ruta_tmp)
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/buscar", methods=["GET"])
def buscar_local():
    if not ontologia_cargada:
        return jsonify({"ok": False, "error": "Ontología no cargada"}), 400

    term_raw     = request.args.get("term",  "").strip().lower()
    clase_filtro = request.args.get("clase", "").strip().lower()
    lang         = request.args.get("lang",  "es").strip().lower()

    # Validar idioma (ahora soporta 3 idiomas)
    if lang not in ['es', 'en', 'pt', 'fr', 'both']:
        lang = 'es'

    # Diccionario de traducción EN → ES (para búsqueda en ontología local en español)
    EN_TO_ES = {
        "refrigerator": "refrigerador", "fridge": "refrigerador",
        "washing machine": "lavadora", "washer": "lavadora",
        "television": "televisor", "tv": "televisor",
        "screen": "pantalla", "display": "pantalla",
        "air conditioner": "aire acondicionado", "ac": "aire acondicionado",
        "thermostat": "termostato",
        "computer": "computadora", "pc": "computadora",
        "heater": "calefactor",
        "hair dryer": "secadora de cabello",
        "oven": "horno", "electric oven": "horno electrico",
        "coffee maker": "cafetera", "coffee machine": "cafetera",
        "freezer": "freezer",
        "toaster": "tostadora",
        "dishwasher": "lavavajillas",
        "microwave": "microondas",
        "owner": "dueño",
        "dryer": "secadora", "clothes dryer": "secadora de ropa",
        "fan": "ventilador",
        "hair straightener": "plancha de cabello",
        "stove": "cocina", "cooker": "cocina",
        "sound system": "equipo de sonido", "stereo": "equipo de sonido",
        "vacuum cleaner": "aspiradora", "vacuum": "aspiradora",
        "battery": "bateria",
        "blender": "licuadora",
        "sensor": "sensor",
        "brand": "marca"
    }

    # Diccionario de traducción PT → ES (3er idioma: Portugués)
    PT_TO_ES = {
        "geladeira": "refrigerador", "frigorífico": "refrigerador",
        "máquina de lavar": "lavadora", "lavadora": "lavadora",
        "televisão": "televisor", "tv": "televisor",
        "tela": "pantalla", "monitor": "pantalla",
        "ar condicionado": "aire acondicionado",
        "termostato": "termostato",
        "computador": "computadora", "notebook": "computadora",
        "aquecedor": "calefactor",
        "secador de cabelo": "secadora de cabello",
        "forno": "horno", "forno elétrico": "horno electrico",
        "cafeteira": "cafetera",
        "freezer": "freezer",
        "torradeira": "tostadora",
        "lava-louças": "lavavajillas", "lava louças": "lavavajillas",
        "micro-ondas": "microondas", "microondas": "microondas",
        "secadora": "secadora", "secadora de roupas": "secadora de ropa",
        "ventilador": "ventilador",
        "chapinha": "plancha de cabello", "prancha de cabelo": "plancha de cabello",
        "fogão": "cocina", "cooktop": "cocina",
        "equipamento de som": "equipo de sonido",
        "aspirador": "aspiradora", "aspirador de pó": "aspiradora",
        "bateria": "bateria",
        "liquidificador": "licuadora",
        "sensor": "sensor",
        "marca": "marca",
        "dono": "dueño",
        "ferro de passar": "plancha",
        "espremedor": "exprimidor",
        "extrator de suco": "extractor de jugos",
    }

    # Separar por comas o espacios para búsquedas múltiples simultáneas (AND logic)
    terminos_crudos = [t.strip() for t in re.split(r'[,\s]+', term_raw) if t.strip()]
    
    # Diccionario de traducción FR → ES (4º idioma: Francés)
    FR_TO_ES = {
        "réfrigérateur": "refrigerador", "frigo": "refrigerador",
        "machine à laver": "lavadora", "lave-linge": "lavadora",
        "téléviseur": "televisor", "télévision": "televisor",
        "écran": "pantalla", "climatiseur": "aire acondicionado",
        "thermostat": "termostato", "ordinateur": "computadora",
        "radiateur": "calefactor", "sèche-cheveux": "secadora de cabello",
        "four": "horno", "four électrique": "horno electrico",
        "cafetière": "cafetera", "congélateur": "freezer",
        "grille-pain": "tostadora", "lave-vaisselle": "lavavajillas",
        "micro-ondes": "microondas", "sèche-linge": "secadora",
        "ventilateur": "ventilador", "lisseur": "plancha de cabello",
        "cuisinière": "cocina", "chaîne stéréo": "equipo de sonido",
        "aspirateur": "aspiradora", "batterie": "bateria",
        "mixeur": "licuadora", "blender": "licuadora",
        "capteur": "sensor", "marque": "marca",
        "propriétaire": "dueño", "moteur électrique": "motor electrico",
        "compresseur": "compresor", "filtre": "filtro",
        "télécommande": "control remoto", "lampe": "lampara",
        "fer à repasser": "plancha", "presse-agrumes": "exprimidor",
        "extracteur de jus": "extractor de jugos",
    }

    terminos = []
    for t in terminos_crudos:
        t_lower = t.lower()
        if lang == 'en' and t_lower in EN_TO_ES:
            terminos.append(EN_TO_ES[t_lower])
        elif lang == 'pt' and t_lower in PT_TO_ES:
            terminos.append(PT_TO_ES[t_lower])
        elif lang == 'fr' and t_lower in FR_TO_ES:
            terminos.append(FR_TO_ES[t_lower])
        else:
            terminos.append(t)

    sparql_query = """
    PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl:  <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT ?ind
    WHERE {
        ?ind rdf:type ?clase .
    """

    if terminos:
        sparql_query += "    OPTIONAL { ?ind rdfs:label ?lbl . }\n"

    if clase_filtro:
        # Sanitización y reemplazo de espacios por guiones bajos para matching con la URI (ej. Motor_Electrico)
        clase_segura = re.sub(r'[^\w\s\-]', '', clase_filtro).replace(" ", "_")
        sparql_query += f'    FILTER(CONTAINS(LCASE(STR(?clase)), "{clase_segura}"))\n'

    if terminos:
        filtros = []
        for t in terminos:
            # Sanitización del término de búsqueda
            t_seguro = re.sub(r'["\\\n\r]', '', t)
            filtros.append(
                f'(CONTAINS(LCASE(STR(?ind)), "{t_seguro}") || '
                f'CONTAINS(LCASE(COALESCE(STR(?lbl), "")), "{t_seguro}"))'
            )
        sparql_query += "    FILTER( " + " && ".join(filtros) + " )\n"

    sparql_query += "}"

    resultados_uris = set()
    try:
        qres = grafo_local.query(sparql_query)
        for row in qres:
            uri = str(row.ind)
            id_ind = uri.split("#")[-1] if "#" in uri else uri.split("/")[-1]
            resultados_uris.add(id_ind)
    except Exception as e:
        return jsonify({"ok": False, "error": f"Error ejecutando SPARQL: {str(e)}"}), 500

    resultados = []
    for ind in individuos_cache:
        if ind["id"] in resultados_uris:
            # Construir objeto para respuesta con el nombre en el idioma correcto
            nombre_traducido = ind["nombres"].get(lang) or ind["nombres"].get("es") or ind["id"]
            
            resultados.append({
                "id": ind["id"],
                "nombre": nombre_traducido,
                "clase": ind["clase"],
                "propiedades": ind["propiedades"]
            })

    return jsonify({
        "ok":        True,
        "term":      term_raw,
        "lang":      lang,
        "total":     len(resultados),
        "resultados": resultados[:200]
    })


@app.route("/clases", methods=["GET"])
def listar_clases():
    if not ontologia_cargada:
        return jsonify({"ok": False, "error": "Ontología no cargada"}), 400
    conteo = {}
    for ind in individuos_cache:
        c = ind["clase"]
        conteo[c] = conteo.get(c, 0) + 1
    clases = [{"clase": k, "total": v}
              for k, v in sorted(conteo.items(), key=lambda x: -x[1])]
    return jsonify({"ok": True, "clases": clases})


@app.route("/stats", methods=["GET"])
def stats():
    if not ontologia_cargada:
        return jsonify({"ok": False, "error": "Ontología no cargada"}), 400
    return jsonify({
        "ok":          True,
        # CORREGIDO: usa el conteo real del grafo RDFLib
        "triples":     len(grafo_local),
        "clases":      len(set(i["clase"] for i in individuos_cache)),
        "propiedades": len(set(p for i in individuos_cache for p in i["propiedades"]))
    })


@app.route("/dbpedia", methods=["GET"])
def buscar_dbpedia():
    term_raw = request.args.get("term", "").strip()
    lang_user = request.args.get("lang", "es").strip().lower()

    # Validar idioma del usuario (3 idiomas soportados)
    if lang_user not in ['es', 'en', 'pt', 'fr']:
        lang_user = 'es'

    # Mapeo de códigos de idioma → DBpedia
    LANG_TO_DBPEDIA = {'es': 'es', 'en': 'en', 'pt': 'pt', 'fr': 'fr'}
    dbp_lang = LANG_TO_DBPEDIA.get(lang_user, 'es')

    terminos = [t.strip() for t in re.split(r'[,\s]+', term_raw) if t.strip()]

    if not terminos:
        return jsonify({"ok": True, "resultados": []})

    # Usar bif:contains para búsqueda de texto completo rápida en DBpedia (Virtuoso)
    terminos_limpios = [re.sub(r'["\\\n\r\']', '', t) for t in terminos]
    bif_query = " AND ".join([f"'{t}'" for t in terminos_limpios])

    # Filtro de idioma para el nombre: idioma del usuario con fallback a inglés
    if dbp_lang == 'en':
        filtro_lang = 'lang(?nombre) = "en"'
    else:
        filtro_lang = f'lang(?nombre) = "{dbp_lang}" || lang(?nombre) = "en"'

    query = f"""
    PREFIX dbo:  <http://dbpedia.org/ontology/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?recurso ?nombre ?abs_pref ?abs_en ?imagen ?wiki
    WHERE {{
      ?recurso rdfs:label ?nombre .
      ?nombre bif:contains "{bif_query}" .
      FILTER ({filtro_lang})

      OPTIONAL {{ ?recurso dbo:abstract ?abs_pref . FILTER (langMatches(lang(?abs_pref), "{dbp_lang}")) }}
      OPTIONAL {{ ?recurso dbo:abstract ?abs_en   . FILTER (langMatches(lang(?abs_en),   "en")) }}
      OPTIONAL {{ ?recurso dbo:thumbnail ?imagen . }}
      OPTIONAL {{ ?recurso foaf:isPrimaryTopicOf ?wiki . }}
    }}
    ORDER BY strlen(str(?nombre))
    LIMIT 15
    """

    try:
        sparql = SPARQLWrapper("http://dbpedia.org/sparql")
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        resultados_sparql = sparql.query().convert()

        formateados = []
        vistos = set()
        for b in resultados_sparql["results"]["bindings"]:
            recurso = b["recurso"]["value"]
            if recurso in vistos:
                continue
            vistos.add(recurso)
            
            # Preferir abstract en idioma del usuario, fallback a inglés
            descripcion = (b.get("abs_pref", {}).get("value", "")
                           or b.get("abs_en", {}).get("value", ""))

            formateados.append({
                "recurso":     recurso,
                "nombre":      b["nombre"]["value"],
                "descripcion": descripcion,
                "imagen":      b.get("imagen",  {}).get("value", ""),
                "wikiPage":    b.get("wiki",    {}).get("value", ""),
                "dbpediaLink": recurso,
                "lang":        lang_user
            })

        return jsonify({"ok": True, "resultados": formateados})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/poblar", methods=["POST"])
def poblar_ontologia():
    global onto, ontologia_cargada, ruta_archivo_cargado
    if not ontologia_cargada:
        return jsonify({"ok": False, "error": "Ontología no cargada"}), 400

    data = request.json
    nombre      = data.get("nombre", "")
    uri_dbpedia = data.get("uri", "")

    if not nombre:
        return jsonify({"ok": False, "error": "Falta el campo 'nombre'"}), 400

    try:
        id_limpio = "DBP_" + re.sub(r'\W+', '_', nombre)

        if hasattr(onto, "Electrodomestico"):
            nuevo_ind = onto.Electrodomestico(id_limpio)
        else:
            nuevo_ind = onto.Thing(id_limpio)

        nuevo_ind.label = [nombre]

        if hasattr(onto, "sitio_web_oficial") and uri_dbpedia:
            nuevo_ind.sitio_web_oficial = [uri_dbpedia]

        # CORREGIDO: guarda en la ruta real del archivo cargado
        if ruta_archivo_cargado and os.path.exists(os.path.dirname(ruta_archivo_cargado)):
            ruta_guardado = ruta_archivo_cargado
        else:
            # Fallback: crea el archivo en la carpeta ontologia del proyecto
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            ruta_guardado = os.path.join(base_dir, "ontologia", "electrodomesticos.owl")

        onto.save(file=ruta_guardado)

        # Re-parsea el grafo para mantener consistencia
        grafo_local.remove((None, None, None))
        grafo_local.parse(ruta_guardado, format="xml")

        construir_cache()

        return jsonify({
            "ok":      True,
            "mensaje": f"'{nombre}' agregado exitosamente.",
            "total":   len(individuos_cache)
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":            "ok",
        "ontologia_cargada": ontologia_cargada,
        "individuos":        len(individuos_cache),
        "triples":           len(grafo_local),   # conteo real
        "librerias":         ["owlready2", "rdflib", "SPARQLWrapper", "flask", "flask-cors"]
    })


if __name__ == "__main__":
    print("=" * 55)
    print("  MetaBuscador Semántico — Backend Python v3")
    print("  owlready2 + RDFLib SPARQL + SPARQLWrapper + Flask")
    print("  Puerto: http://localhost:5000")
    print("=" * 55)
    auto_cargar()
    app.run(debug=True, port=5000)