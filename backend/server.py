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
        props = {}
        for prop in onto.data_properties():
            vals = list(prop[ind])
            if vals:
                props[prop.name] = str(vals[0])
        for prop in onto.object_properties():
            vals = list(prop[ind])
            if vals:
                props[prop.name] = getattr(vals[0], 'name', str(vals[0])).replace("_", " ")
        individuos_cache.append({
            "id":          ind.name,
            "nombre":      ind.name.replace("_", " "),
            "clase":       clase_nombre,
            "propiedades": props
        })
    print(f"[owlready2] Cache: {len(individuos_cache)} individuos")

# ── Auto-carga al iniciar — busca todos los formatos posibles ─────
def auto_cargar():
    global onto, ontologia_cargada, ruta_archivo_cargado
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ontologia_dir = os.path.join(base_dir, "ontologia")

    # CORREGIDO: busca todos los nombres posibles en orden de preferencia
    nombres_posibles = [
        "electrodomesticos.owl",
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
                ruta_url = "file:///" + ruta.replace("\\", "/").lstrip("/")
                onto = get_ontology(ruta_url).load()
                ontologia_cargada = True
                ruta_archivo_cargado = ruta

                grafo_local.parse(ruta, format="xml")
                construir_cache()
                print(f"  ✓ Cargado: {len(individuos_cache)} individuos, {len(grafo_local)} triples")
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
        ruta_url = "file:///" + ruta_tmp.replace("\\", "/").lstrip("/")
        onto = get_ontology(ruta_url).load()
        ontologia_cargada = True
        ruta_archivo_cargado = ruta_tmp

        grafo_local.remove((None, None, None))
        grafo_local.parse(ruta_tmp, format="xml")

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

    # Validar idioma
    if lang not in ['es', 'en', 'both']:
        lang = 'es'

    # Separar por comas para búsquedas múltiples simultáneas
    terminos = [t.strip() for t in term_raw.split(",") if t.strip()]

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
        # Sanitización básica: solo letras, números, espacios y guiones
        clase_segura = re.sub(r'[^\w\s\-]', '', clase_filtro)
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
        sparql_query += "    FILTER( " + " || ".join(filtros) + " )\n"

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

    resultados = [ind for ind in individuos_cache if ind["id"] in resultados_uris]

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
    lang     = request.args.get("lang", "both").strip().lower()

    # Validar idioma
    if lang not in ['es', 'en', 'both']:
        lang = 'both'

    terminos = [t.strip() for t in term_raw.split(",") if t.strip()]

    if not terminos:
        return jsonify({"ok": True, "resultados": []})

    # Sanitización y construcción del filtro REGEX
    filtros_regex = []
    for t in terminos:
        t_seguro = re.sub(r'["\\\n\r]', '', t.lower())
        filtros_regex.append(f'regex(LCASE(STR(?nombre)), "{t_seguro}")')
    filtro_nombres = " || ".join(filtros_regex)

    # Construir filtro de idioma dinámico
    if lang == 'es':
        filtro_lang = 'lang(?nombre) = "es"'
    elif lang == 'en':
        filtro_lang = 'lang(?nombre) = "en"'
    else:  # both
        filtro_lang = '(lang(?nombre) = "en" || lang(?nombre) = "es")'

    query = f"""
    PREFIX dbo:  <http://dbpedia.org/ontology/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?recurso ?nombre ?desc ?imagen ?wiki
    WHERE {{
      ?recurso a dbo:Device .
      ?recurso rdfs:label ?nombre .
      FILTER ({filtro_lang})

      FILTER ( {filtro_nombres} )

      OPTIONAL {{ ?recurso rdfs:comment ?desc .
                 FILTER (lang(?desc) = "es" || lang(?desc) = "en") }}
      OPTIONAL {{ ?recurso dbo:thumbnail ?imagen . }}
      OPTIONAL {{ ?recurso foaf:isPrimaryTopicOf ?wiki . }}
    }}
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
            formateados.append({
                "recurso":     recurso,
                "nombre":      b["nombre"]["value"],
                "descripcion": b.get("desc",    {}).get("value", ""),
                "imagen":      b.get("imagen",  {}).get("value", ""),
                "wikiPage":    b.get("wiki",    {}).get("value", ""),
                "dbpediaLink": recurso,
                "lang":        lang
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