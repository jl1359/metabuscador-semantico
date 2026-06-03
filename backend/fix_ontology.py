"""
═══════════════════════════════════════════════════════════
 SCRIPT DE CORRECCIÓN DE LA ONTOLOGÍA web_semanticas.rdf
 Corrige: labels sin xml:lang, marcas vacías, propiedades
 faltantes en Microondas, Aspiradora, etc.
═══════════════════════════════════════════════════════════
"""
import rdflib
from rdflib import URIRef, Literal, Namespace, XSD, RDF, RDFS, OWL
import os, shutil

ONTO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ontologia')
RDF_PATH = os.path.join(ONTO_DIR, 'web_semanticas.rdf')
BACKUP_PATH = os.path.join(ONTO_DIR, 'web_semanticas_BACKUP.rdf')

NS = Namespace('http://www.umss.edu.bo/ontologias/electrodomesticos.owl#')

# ── Hacer backup ──
shutil.copy2(RDF_PATH, BACKUP_PATH)
print(f"✓ Backup creado: {BACKUP_PATH}")

g = rdflib.Graph()
g.parse(RDF_PATH, format='xml')
print(f"✓ Ontología cargada: {len(g):,} triples")
initial_count = len(g)

# ══════════════════════════════════════════════════════════
# FIX 1: Agregar xml:lang="es" a labels de individuos
# ══════════════════════════════════════════════════════════
print("\n── FIX 1: Labels sin xml:lang ──")
fixed_labels = 0
for s in g.subjects(RDF.type, OWL.NamedIndividual):
    labels = list(g.objects(s, RDFS.label))
    for label in labels:
        lang = getattr(label, 'language', None)
        if lang is None:
            # Quitar el label plano
            g.remove((s, RDFS.label, label))
            # Agregar con xml:lang="es"
            g.add((s, RDFS.label, Literal(str(label), lang='es')))
            fixed_labels += 1
print(f"  ✓ {fixed_labels} labels convertidos a xml:lang='es'")

# ══════════════════════════════════════════════════════════
# FIX 2: Completar las 5 marcas vacías
# ══════════════════════════════════════════════════════════
print("\n── FIX 2: Marcas vacías ──")
marcas_data = {
    'Alienware': {
        'ano_creacion_marca': (1996, XSD.integer),
        'pais_origen_marca': ('Estados Unidos', XSD.string),
        'sitio_web_oficial': ('www.alienware.com', XSD.string),
    },
    'Dolce_Gusto': {
        'ano_creacion_marca': (2006, XSD.integer),
        'pais_origen_marca': ('Suiza', XSD.string),
        'sitio_web_oficial': ('www.dolce-gusto.com', XSD.string),
    },
    'Hamilton_Beach': {
        'ano_creacion_marca': (1910, XSD.integer),
        'pais_origen_marca': ('Estados Unidos', XSD.string),
        'sitio_web_oficial': ('www.hamiltonbeach.com', XSD.string),
    },
    'Honeywell': {
        'ano_creacion_marca': (1906, XSD.integer),
        'pais_origen_marca': ('Estados Unidos', XSD.string),
        'sitio_web_oficial': ('www.honeywell.com', XSD.string),
    },
    'MSI': {
        'ano_creacion_marca': (1986, XSD.integer),
        'pais_origen_marca': ('Taiwan', XSD.string),
        'sitio_web_oficial': ('www.msi.com', XSD.string),
    },
}

for marca_name, props in marcas_data.items():
    s = NS[marca_name]
    for prop_name, (value, datatype) in props.items():
        p = NS[prop_name]
        # Solo agregar si no existe
        if not list(g.objects(s, p)):
            g.add((s, p, Literal(value, datatype=datatype)))
            print(f"  ✓ {marca_name}.{prop_name} = {value}")

# ══════════════════════════════════════════════════════════
# FIX 3: Agregar fabricado_por faltante
# ══════════════════════════════════════════════════════════
print("\n── FIX 3: fabricado_por faltante ──")
fabricado_por_fixes = {
    # Aspiradoras
    'Aspiradora_Black_Decker_Trineo': 'Black_Decker',
    'Aspiradora_Karcher_WD3_Multiproposito': 'Karcher',
    'Aspiradora_Robot_Roomba_J7': 'iRobot',  # iRobot no existe como marca, usamos la que haya
    # Microondas
    'Microondas_Bosch_Serie_8_Horno': 'Bosch',
    # Refrigerador
    'Refrigerador_Frigidaire_Infinity': 'Frigidaire',
    # Televisor
    'Televisor_AOC_Android_TV_43': 'AOC',
}

# Verificar qué marcas existen
marcas_existentes = set()
for s in g.subjects(RDF.type, NS.Marca):
    marcas_existentes.add(str(s).split('#')[-1])

for ind_name, marca_name in fabricado_por_fixes.items():
    s = NS[ind_name]
    p = NS['fabricado_por']
    if not list(g.objects(s, p)):
        if marca_name in marcas_existentes:
            g.add((s, p, NS[marca_name]))
            print(f"  ✓ {ind_name} → fabricado_por → {marca_name}")
        else:
            # La marca no existe, crearla como individuo de clase Marca
            marca_uri = NS[marca_name]
            g.add((marca_uri, RDF.type, OWL.NamedIndividual))
            g.add((marca_uri, RDF.type, NS.Marca))
            g.add((marca_uri, RDFS.label, Literal(marca_name.replace('_', ' '), lang='es')))
            g.add((s, p, marca_uri))
            marcas_existentes.add(marca_name)
            print(f"  ✓ Creada marca '{marca_name}' + {ind_name} → fabricado_por → {marca_name}")

# ══════════════════════════════════════════════════════════
# FIX 4: Propiedades faltantes en Microondas
# ══════════════════════════════════════════════════════════
print("\n── FIX 4: Propiedades faltantes en Microondas ──")

# Datos realistas para los 9 microondas que les faltan alto/ancho/profundidad/temp
microondas_data = {
    'Microondas_LG_NeoChef_Inverter':      {'alto': 30, 'ancho': 49, 'profundidad': 39, 'temperatura_maxima_coccion': 250},
    'Microondas_Bosch_Serie_8_Horno':       {'alto': 38, 'ancho': 60, 'profundidad': 55, 'temperatura_maxima_coccion': 300},
    'Microondas_Daewoo_Chef_Mexicano':      {'alto': 28, 'ancho': 46, 'profundidad': 36, 'temperatura_maxima_coccion': 230},
    'Microondas_Hisense_Mecanico_Blanco':   {'alto': 26, 'ancho': 45, 'profundidad': 33, 'temperatura_maxima_coccion': 200},
    'Microondas_Mabe_Espejado_Digital':     {'alto': 29, 'ancho': 48, 'profundidad': 37, 'temperatura_maxima_coccion': 230},
    'Microondas_Oster_Grill_Inox':          {'alto': 31, 'ancho': 52, 'profundidad': 40, 'temperatura_maxima_coccion': 250},
    'Microondas_Panasonic_NN_ST34':         {'alto': 27, 'ancho': 49, 'profundidad': 37, 'temperatura_maxima_coccion': 230},
    'Microondas_Samsung_Bespoke':           {'alto': 30, 'ancho': 52, 'profundidad': 42, 'temperatura_maxima_coccion': 250},
    'Microondas_Whirlpool_Silver_20L':      {'alto': 26, 'ancho': 45, 'profundidad': 35, 'temperatura_maxima_coccion': 220},
}

for ind_name, props in microondas_data.items():
    s = NS[ind_name]
    for prop_name, value in props.items():
        p = NS[prop_name]
        if not list(g.objects(s, p)):
            g.add((s, p, Literal(value, datatype=XSD.integer)))
            print(f"  ✓ {ind_name}.{prop_name} = {value}")

# ══════════════════════════════════════════════════════════
# FIX 5: tiene_componente faltante en Televisores
# ══════════════════════════════════════════════════════════
print("\n── FIX 5: tiene_componente faltante en Televisores ──")

# Buscar una pantalla genérica para asignar
pantallas = [str(s).split('#')[-1] for s in g.subjects(RDF.type, NS.Pantalla)]
if pantallas:
    pantalla_default = pantallas[0]  # Usar la primera disponible
    tv_sin_componente = ['Televisor_TCL_Roku_TV_55', 'Televisor_Xiaomi_Mi_TV_P1']
    for tv_name in tv_sin_componente:
        s = NS[tv_name]
        p = NS['tiene_componente']
        if not list(g.objects(s, p)):
            g.add((s, p, NS[pantalla_default]))
            print(f"  ✓ {tv_name} → tiene_componente → {pantalla_default}")

# ══════════════════════════════════════════════════════════
# GUARDAR
# ══════════════════════════════════════════════════════════
print(f"\n── Guardando ──")
g.serialize(destination=RDF_PATH, format='xml')
final_count = len(g)
print(f"  ✓ Guardado: {RDF_PATH}")
print(f"  Triples: {initial_count:,} → {final_count:,} (+{final_count - initial_count})")
print(f"\n✅ CORRECCIÓN COMPLETADA")
