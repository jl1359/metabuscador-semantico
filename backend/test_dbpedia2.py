from SPARQLWrapper import SPARQLWrapper, JSON

sparql = SPARQLWrapper('http://dbpedia.org/sparql')
query = """
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?recurso ?nombre
    WHERE {
      ?recurso rdfs:label ?nombre .
      ?nombre bif:contains '"Refrigerator"' .
      FILTER (lang(?nombre) = 'en' || lang(?nombre) = 'es')
    } ORDER BY strlen(str(?nombre)) LIMIT 5
"""
try:
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    res = sparql.query().convert()
    for b in res['results']['bindings']: print(b['nombre']['value'])
except Exception as e:
    print('ERROR:', e)
