"""
Script para agregar labels en inglés a los 329 individuos de la ontología
"""
import rdflib
from rdflib import URIRef, Literal, Namespace, RDF, RDFS, OWL
import os

ONTO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ontologia')
RDF_PATH = os.path.join(ONTO_DIR, 'web_semanticas.rdf')

g = rdflib.Graph()
g.parse(RDF_PATH, format='xml')
NS = Namespace('http://www.umss.edu.bo/ontologias/electrodomesticos.owl#')

# Diccionario de traducción básico para prefijos
translations = {
    'Aire Acondicionado': 'Air Conditioner',
    'Aspiradora': 'Vacuum Cleaner',
    'Cafetera': 'Coffee Maker',
    'Calefactor': 'Heater',
    'Cocina': 'Stove',
    'Computadora': 'Computer',
    'Equipo de Sonido': 'Sound System',
    'Freezer': 'Freezer',
    'Horno Electrico': 'Electric Oven',
    'Lavadora': 'Washing Machine',
    'Lavavajillas': 'Dishwasher',
    'Licuadora': 'Blender',
    'Microondas': 'Microwave',
    'Motor Electrico': 'Electric Motor',
    'Pantalla': 'Screen',
    'Plancha de Cabello': 'Hair Straightener',
    'Refrigerador': 'Refrigerator',
    'Secadora de Cabello': 'Hair Dryer',
    'Secadora de Ropa': 'Clothes Dryer',
    'Sensor': 'Sensor',
    'Televisor': 'Television',
    'Termostato': 'Thermostat',
    'Tipo Bateria': 'Battery Type',
    'Tostadora': 'Toaster',
    'Ventilador': 'Fan',
    'Dueño': 'Owner',
    'Marca': 'Brand'
}

count_added = 0

for s in g.subjects(RDF.type, OWL.NamedIndividual):
    # Ver si ya tiene label en inglés
    has_en = False
    es_label_val = ""
    for o in g.objects(s, RDFS.label):
        if getattr(o, 'language', None) == 'en':
            has_en = True
        elif getattr(o, 'language', None) == 'es':
            es_label_val = str(o)
    
    if not has_en and es_label_val:
        # Intentar traducir
        translated = es_label_val
        for es, en in translations.items():
            if es_label_val.startswith(es):
                # Ejemplo: Refrigerador Bosch -> Bosch Refrigerator (para que suene mejor en ingles)
                resto = es_label_val[len(es):].strip()
                if resto:
                    translated = f"{resto} {en}"
                else:
                    translated = en
                break
        
        g.add((s, RDFS.label, Literal(translated, lang='en')))
        count_added += 1

print(f"Labels en inglés agregados: {count_added}")
g.serialize(destination=RDF_PATH, format='xml')
print("Guardado OK.")
