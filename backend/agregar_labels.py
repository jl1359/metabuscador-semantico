#!/usr/bin/env python3
"""
Script: Agregar labels multiidioma (ES/EN) a individuos en la ontología
Uso: python agregar_labels.py
"""

from owlready2 import get_ontology, default_world
import os

# Diccionario de traducciones comunes para electrodomésticos
TRADUCTOR = {
    # Marcas (no se traducen, se mantienen igual)
    'samsung': 'samsung',
    'lg': 'lg',
    'electrolux': 'electrolux',
    'phillips': 'phillips',
    'sony': 'sony',
    'panasonic': 'panasonic',
    'toshiba': 'toshiba',
    'whirlpool': 'whirlpool',
    'arcelik': 'arcelik',
    'beko': 'beko',
    'acer': 'acer',
    'dell': 'dell',
    'hp': 'hp',
    'bgh': 'bgh',
    'drean': 'drean',
    'blindex': 'blindex',
    'consul': 'consul',
    'brastemp': 'brastemp',

    # Electrodomésticos
    'refrigerador': 'refrigerator',
    'lavadora': 'washing machine',
    'secadora': 'dryer',
    'horno': 'oven',
    'licuadora': 'blender',
    'microondas': 'microwave',
    'aire_acondicionado': 'air conditioner',
    'ventilador': 'fan',
    'bombilla': 'light bulb',
    'tostadora': 'toaster',
    'cafetera': 'coffee maker',
    'television': 'television',
    'computadora': 'computer',
    'laptop': 'laptop',
    'monitor': 'monitor',
    'impresora': 'printer',
    'scanner': 'scanner',
    'router': 'router',
    'router_wifi': 'wifi router',

    # Tipos/Categorías
    'electrodomestico': 'appliance',
    'dispositivo_electronico': 'electronic device',
    'dispositivo_computacional': 'computing device',
    'dispositivo_cocina': 'kitchen appliance',
    'dispositivo_limpieza': 'cleaning device',
    'dispositivo_clima': 'climate device',

    # Propiedades y atributos
    'potencia': 'power',
    'capacidad': 'capacity',
    'voltaje': 'voltage',
    'peso': 'weight',
    'tamano': 'size',
    'color': 'color',
    'material': 'material',
    'energia': 'energy',
    'temperatura': 'temperature',
    'velocidad': 'speed',
    'marca': 'brand',
    'modelo': 'model',
    'codigo': 'code',
}

def traducir_nombre(nombre_es):
    """Traduce un nombre español al inglés usando el diccionario."""
    # Convertir a minúsculas y normalizar underscores
    key = nombre_es.lower().strip().replace(' ', '_')

    # Buscar en el diccionario
    if key in TRADUCTOR:
        return TRADUCTOR[key]

    # Si no se encuentra, intenta sin sufijos numéricos
    base = key.rsplit('_', 1)[0] if '_' in key else key
    if base in TRADUCTOR:
        return TRADUCTOR[base]

    # Si no encuentra traducción, mantiene el original
    print(f"  [ADVERTENCIA] No hay traducción para: {nombre_es}")
    return nombre_es

def agregar_labels_multiidioma():
    """Agrega labels en ES e EN a todos los individuos sin ellos."""

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ontologia_path = os.path.join(base_dir, "ontologia", "web_semanticas.rdf")

    print(f"📂 Cargando ontología: {ontologia_path}")

    # Cargar ontología
    onto = get_ontology(ontologia_path).load()

    print(f"✓ Ontología cargada")
    print(f"\n📊 Estadísticas iniciales:")

    # Contar individuos y labels
    total_individuos = len(list(onto.individuals()))
    individuos_con_labels = 0
    individuos_sin_labels = 0

    for ind in onto.individuals():
        if ind.label:
            individuos_con_labels += 1
        else:
            individuos_sin_labels += 1

    print(f"  • Total de individuos: {total_individuos}")
    print(f"  • Con labels: {individuos_con_labels}")
    print(f"  • Sin labels: {individuos_sin_labels}")

    # Agregar labels
    print(f"\n🔄 Agregando labels multiidioma...\n")

    labels_agregados = 0

    for ind in onto.individuals():
        # Obtener nombre del individuo
        nombre_base = ind.name.replace('_', ' ')

        # Si ya tiene labels, saltar
        if ind.label and len(ind.label) > 0:
            continue

        # Traducir nombre
        nombre_en = traducir_nombre(ind.name)

        # Agregar labels en ambos idiomas
        ind.label.append(nombre_base)  # ES
        ind.label.append(nombre_en)    # EN

        labels_agregados += 1
        print(f"  ✓ {ind.name}: ES='{nombre_base}' / EN='{nombre_en}'")

    print(f"\n✅ Labels agregados: {labels_agregados}")

    # Guardar ontología
    print(f"\n💾 Guardando ontología...")
    onto.save(file=ontologia_path)
    print(f"✓ Ontología guardada en: {ontologia_path}")

    print(f"\n🎉 Proceso completado exitosamente!")

if __name__ == "__main__":
    agregar_labels_multiidioma()
