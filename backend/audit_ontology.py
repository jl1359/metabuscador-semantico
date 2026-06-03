"""
═══════════════════════════════════════════════════════════
 AUDITORÍA COMPLETA DE LA ONTOLOGÍA
 Analiza: web_semanticas.rdf y web-semanticas.owx
═══════════════════════════════════════════════════════════
"""
import rdflib
from collections import Counter, defaultdict
import json, os

ONTO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ontologia')

def audit_file(filepath, label):
    print(f"\n{'═'*70}")
    print(f"  AUDITANDO: {label}")
    print(f"  Archivo: {os.path.basename(filepath)}")
    print(f"  Tamaño: {os.path.getsize(filepath):,} bytes")
    print(f"{'═'*70}")

    g = rdflib.Graph()
    try:
        g.parse(filepath, format='xml')
    except Exception as e:
        print(f"  ✗ ERROR AL PARSEAR: {e}")
        return
    
    NS = 'http://www.umss.edu.bo/ontologias/electrodomesticos.owl#'
    RDF_TYPE = rdflib.RDF.type
    
    print(f"\n  Total triples: {len(g):,}")
    
    # ══════════════════════════════════════
    # 1. CLASES OWL
    # ══════════════════════════════════════
    clases = {}
    for s in g.subjects(RDF_TYPE, rdflib.OWL.Class):
        name = str(s).split('#')[-1] if '#' in str(s) else ''
        if name and not name.startswith('http'):
            # Buscar labels
            labels_es = [str(o) for o in g.objects(s, rdflib.RDFS.label) if getattr(o, 'language', None) == 'es']
            labels_en = [str(o) for o in g.objects(s, rdflib.RDFS.label) if getattr(o, 'language', None) == 'en']
            labels_sin = [str(o) for o in g.objects(s, rdflib.RDFS.label) if getattr(o, 'language', None) is None]
            # Buscar superclase
            superclases = []
            for o in g.objects(s, rdflib.RDFS.subClassOf):
                if isinstance(o, rdflib.URIRef):
                    sc_name = str(o).split('#')[-1]
                    if sc_name and not sc_name.startswith('http'):
                        superclases.append(sc_name)
            clases[name] = {
                'labels_es': labels_es,
                'labels_en': labels_en, 
                'labels_sin': labels_sin,
                'superclases': superclases
            }
    
    print(f"\n{'─'*50}")
    print(f"  1. CLASES OWL: {len(clases)}")
    print(f"{'─'*50}")
    
    clases_sin_label_es = []
    clases_sin_label_en = []
    for name, info in sorted(clases.items()):
        status_es = '✓' if info['labels_es'] else '✗'
        status_en = '✓' if info['labels_en'] else '✗'
        parent = f" → {', '.join(info['superclases'])}" if info['superclases'] else " (raíz)"
        print(f"    {name}{parent}  [ES:{status_es}] [EN:{status_en}]")
        if not info['labels_es']: clases_sin_label_es.append(name)
        if not info['labels_en']: clases_sin_label_en.append(name)
    
    if clases_sin_label_es:
        print(f"\n  ⚠ Clases SIN label en español ({len(clases_sin_label_es)}):")
        for c in clases_sin_label_es: print(f"    - {c}")
    if clases_sin_label_en:
        print(f"\n  ⚠ Clases SIN label en inglés ({len(clases_sin_label_en)}):")
        for c in clases_sin_label_en: print(f"    - {c}")
    
    # ══════════════════════════════════════
    # 2. OBJECT PROPERTIES
    # ══════════════════════════════════════
    obj_props = {}
    for s in g.subjects(RDF_TYPE, rdflib.OWL.ObjectProperty):
        name = str(s).split('#')[-1] if '#' in str(s) else ''
        if name:
            domain = [str(o).split('#')[-1] for o in g.objects(s, rdflib.RDFS.domain)]
            range_ = [str(o).split('#')[-1] for o in g.objects(s, rdflib.RDFS.range)]
            inverse = [str(o).split('#')[-1] for o in g.objects(s, rdflib.OWL.inverseOf)]
            labels_es = [str(o) for o in g.objects(s, rdflib.RDFS.label) if getattr(o, 'language', None) == 'es']
            labels_en = [str(o) for o in g.objects(s, rdflib.RDFS.label) if getattr(o, 'language', None) == 'en']
            obj_props[name] = {'domain': domain, 'range': range_, 'inverse': inverse, 'labels_es': labels_es, 'labels_en': labels_en}
    
    print(f"\n{'─'*50}")
    print(f"  2. OBJECT PROPERTIES: {len(obj_props)}")
    print(f"{'─'*50}")
    
    op_sin_label = []
    for name, info in sorted(obj_props.items()):
        dom = info['domain'][0] if info['domain'] else '?'
        rng = info['range'][0] if info['range'] else '?'
        inv = f" ↔ {info['inverse'][0]}" if info['inverse'] else ""
        es_ok = '✓' if info['labels_es'] else '✗'
        en_ok = '✓' if info['labels_en'] else '✗'
        print(f"    {name}: {dom} → {rng}{inv}  [ES:{es_ok}] [EN:{en_ok}]")
        if not info['labels_es'] or not info['labels_en']:
            op_sin_label.append(name)
    
    # ══════════════════════════════════════
    # 3. DATATYPE PROPERTIES
    # ══════════════════════════════════════
    data_props = {}
    for s in g.subjects(RDF_TYPE, rdflib.OWL.DatatypeProperty):
        name = str(s).split('#')[-1] if '#' in str(s) else ''
        if name:
            domain = [str(o).split('#')[-1] for o in g.objects(s, rdflib.RDFS.domain)]
            range_ = [str(o).split('#')[-1] for o in g.objects(s, rdflib.RDFS.range)]
            labels_es = [str(o) for o in g.objects(s, rdflib.RDFS.label) if getattr(o, 'language', None) == 'es']
            labels_en = [str(o) for o in g.objects(s, rdflib.RDFS.label) if getattr(o, 'language', None) == 'en']
            data_props[name] = {'domain': domain, 'range': range_, 'labels_es': labels_es, 'labels_en': labels_en}
    
    print(f"\n{'─'*50}")
    print(f"  3. DATATYPE PROPERTIES: {len(data_props)}")
    print(f"{'─'*50}")
    
    dp_sin_label_es = []
    dp_sin_label_en = []
    dp_sin_domain = []
    dp_sin_range = []
    for name, info in sorted(data_props.items()):
        issues = []
        if not info['labels_es']: 
            dp_sin_label_es.append(name)
            issues.append('sin-ES')
        if not info['labels_en']: 
            dp_sin_label_en.append(name)
            issues.append('sin-EN')
        if not info['domain']:
            dp_sin_domain.append(name)
            issues.append('sin-domain')
        if not info['range']:
            dp_sin_range.append(name)
            issues.append('sin-range')
        if issues:
            print(f"    ⚠ {name}: {', '.join(issues)}")
    
    total_dp_ok = len(data_props) - len(set(dp_sin_label_es + dp_sin_label_en + dp_sin_domain + dp_sin_range))
    print(f"    ✓ {total_dp_ok}/{len(data_props)} datatype properties completamente correctas")
    if dp_sin_label_es: print(f"    ⚠ {len(dp_sin_label_es)} sin label ES")
    if dp_sin_label_en: print(f"    ⚠ {len(dp_sin_label_en)} sin label EN")
    if dp_sin_domain: print(f"    ⚠ {len(dp_sin_domain)} sin domain")
    if dp_sin_range: print(f"    ⚠ {len(dp_sin_range)} sin range")
    
    # ══════════════════════════════════════
    # 4. INDIVIDUOS
    # ══════════════════════════════════════
    individuos = {}
    for s in g.subjects(RDF_TYPE, rdflib.OWL.NamedIndividual):
        name = str(s).split('#')[-1] if '#' in str(s) else ''
        if not name: continue
        
        # Clase del individuo
        clase = ''
        for o in g.objects(s, RDF_TYPE):
            o_name = str(o).split('#')[-1]
            if o_name not in ('NamedIndividual', 'Thing', '') and NS in str(o):
                clase = o_name
                break
        
        # Labels
        all_labels = list(g.objects(s, rdflib.RDFS.label))
        labels_es = [str(o) for o in all_labels if getattr(o, 'language', None) == 'es']
        labels_en = [str(o) for o in all_labels if getattr(o, 'language', None) == 'en']
        labels_sin = [str(o) for o in all_labels if getattr(o, 'language', None) is None]
        
        # Propiedades (excluyendo rdf:type y rdfs:label)
        props = {}
        obj_prop_count = 0
        data_prop_count = 0
        for p, o in g.predicate_objects(s):
            p_str = str(p)
            if 'rdf-syntax-ns#type' in p_str or 'rdf-schema#label' in p_str:
                continue
            p_name = p_str.split('#')[-1]
            if isinstance(o, rdflib.URIRef):
                obj_prop_count += 1
                props[p_name] = {'value': str(o).split('#')[-1], 'type': 'object'}
            else:
                data_prop_count += 1
                props[p_name] = {'value': str(o), 'type': 'data', 'datatype': str(getattr(o, 'datatype', 'none')).split('#')[-1]}
        
        individuos[name] = {
            'clase': clase,
            'labels_es': labels_es,
            'labels_en': labels_en,
            'labels_sin': labels_sin,
            'props': props,
            'obj_prop_count': obj_prop_count,
            'data_prop_count': data_prop_count
        }
    
    print(f"\n{'─'*50}")
    print(f"  4. INDIVIDUOS: {len(individuos)}")
    print(f"{'─'*50}")
    
    # 4a. Individuos por clase
    por_clase = Counter()
    for name, info in individuos.items():
        por_clase[info['clase']] += 1
    
    print(f"\n  Distribución por clase:")
    for c, count in sorted(por_clase.items(), key=lambda x: -x[1]):
        print(f"    {c}: {count}")
    
    # 4b. Individuos sin propiedades
    sin_props = []
    for name, info in individuos.items():
        if not info['props']:
            sin_props.append((name, info['clase']))
    
    if sin_props:
        print(f"\n  ⚠ INDIVIDUOS SIN PROPIEDADES ({len(sin_props)}):")
        for name, clase in sorted(sin_props):
            print(f"    ✗ {name} (clase: {clase})")
    
    # 4c. Análisis de labels
    con_es = sum(1 for i in individuos.values() if i['labels_es'])
    con_en = sum(1 for i in individuos.values() if i['labels_en'])
    con_sin = sum(1 for i in individuos.values() if i['labels_sin'])
    sin_label = sum(1 for i in individuos.values() if not i['labels_es'] and not i['labels_en'] and not i['labels_sin'])
    
    print(f"\n  Labels de individuos:")
    print(f"    Con xml:lang='es':    {con_es}")
    print(f"    Con xml:lang='en':    {con_en}")
    print(f"    Sin xml:lang (plano): {con_sin}")
    print(f"    Sin ningún label:     {sin_label}")
    
    # 4d. Verificar que object properties apuntan a individuos existentes
    print(f"\n  Verificación de Object Properties (referencias):")
    refs_rotas = []
    for name, info in individuos.items():
        for p_name, p_info in info['props'].items():
            if p_info['type'] == 'object':
                target = p_info['value']
                if target not in individuos:
                    refs_rotas.append((name, p_name, target))
    
    if refs_rotas:
        print(f"    ⚠ {len(refs_rotas)} referencias a individuos que NO existen:")
        for src, prop, target in refs_rotas[:10]:
            print(f"      {src} --{prop}--> {target} (NO EXISTE)")
    else:
        print(f"    ✓ Todas las object properties apuntan a individuos válidos")
    
    # 4e. Estadísticas de propiedades por individuo
    prop_counts = [len(info['props']) for info in individuos.values() if info['props']]
    if prop_counts:
        print(f"\n  Estadísticas de propiedades:")
        print(f"    Mínimo:   {min(prop_counts)}")
        print(f"    Máximo:   {max(prop_counts)}")
        print(f"    Promedio: {sum(prop_counts)/len(prop_counts):.1f}")
    
    # 4f. Detalle por clase - verificar consistencia
    print(f"\n  Consistencia de propiedades por clase:")
    for clase in sorted(por_clase.keys()):
        if not clase: continue
        inds_de_clase = [(n, i) for n, i in individuos.items() if i['clase'] == clase]
        if not inds_de_clase: continue
        
        # Recopilar todas las props usadas
        all_props_in_class = set()
        for _, info in inds_de_clase:
            all_props_in_class.update(info['props'].keys())
        
        # Ver cuántos individuos tienen cada prop
        prop_coverage = {}
        for p in all_props_in_class:
            count = sum(1 for _, info in inds_de_clase if p in info['props'])
            prop_coverage[p] = count
        
        # Mostrar solo las que no son uniformes
        inconsistent = {p: c for p, c in prop_coverage.items() if c != len(inds_de_clase)}
        if inconsistent:
            print(f"\n    ⚠ {clase} ({len(inds_de_clase)} individuos):")
            for p, c in sorted(inconsistent.items()):
                missing = [n for n, i in inds_de_clase if p not in i['props']]
                print(f"      {p}: {c}/{len(inds_de_clase)} individuos la tienen")
                for m in missing:
                    print(f"        ✗ Falta en: {m}")
    
    # ══════════════════════════════════════
    # 5. OWL:RESTRICTION verificación
    # ══════════════════════════════════════
    restrictions = 0
    for s in g.subjects(RDF_TYPE, rdflib.OWL.Restriction):
        restrictions += 1
    print(f"\n{'─'*50}")
    print(f"  5. OWL:RESTRICTIONS: {restrictions}")
    print(f"{'─'*50}")
    
    # ══════════════════════════════════════
    # RESUMEN FINAL
    # ══════════════════════════════════════
    total_issues = len(sin_props) + len(clases_sin_label_en) + len(dp_sin_label_es) + len(dp_sin_label_en) + len(refs_rotas)
    print(f"\n{'═'*70}")
    print(f"  RESUMEN: {label}")
    print(f"{'═'*70}")
    print(f"  Clases: {len(clases)} | Object Props: {len(obj_props)} | Data Props: {len(data_props)} | Individuos: {len(individuos)}")
    print(f"  Triples: {len(g):,} | Restrictions: {restrictions}")
    print(f"  Labels bilingües (clases+props): ES={146-len(clases_sin_label_es)-len(dp_sin_label_es)}, EN={146-len(clases_sin_label_en)-len(dp_sin_label_en)}")
    print(f"  Labels individuos: {con_sin} planos sin xml:lang, {con_es} ES, {con_en} EN")
    print(f"  Individuos sin propiedades: {len(sin_props)}")
    print(f"  Referencias rotas: {len(refs_rotas)}")
    print(f"  Total issues detectados: {total_issues}")
    print(f"{'═'*70}\n")


# ═══ EJECUTAR SOBRE AMBOS ARCHIVOS ═══
rdf_path = os.path.join(ONTO_DIR, 'web_semanticas.rdf')
owx_path = os.path.join(ONTO_DIR, 'web-semanticas.owx')

if os.path.exists(rdf_path):
    audit_file(rdf_path, "web_semanticas.rdf")
else:
    print(f"⚠ No encontrado: {rdf_path}")

if os.path.exists(owx_path):
    audit_file(owx_path, "web-semanticas.owx")
else:
    print(f"⚠ No encontrado: {owx_path}")
