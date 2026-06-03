from SPARQLWrapper import SPARQLWrapper, JSON
import json
sparql = SPARQLWrapper('http://dbpedia.org/sparql')
query = """
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?recurso ?nombre
    WHERE {
      ?recurso rdfs:label ?nombre .
      ?nombre bif:contains "'refrigerator'" .
      FILTER (lang(?nombre) = 'en' || lang(?nombre) = 'es')
    } LIMIT 5
"""
sparql.setQuery(query)
sparql.setReturnFormat(JSON)
results = sparql.query().convert()
print(json.dumps(results['results']['bindings'], indent=2))
