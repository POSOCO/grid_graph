// display the substations connected to a substation along with line path length and the substations in the path
// https://stackoverflow.com/questions/25733757/seaching-a-repeated-pattern-in-neo4j
// https://stackoverflow.com/questions/28261198/finding-cypher-paths-that-dont-visit-the-same-node-twice?rq=1
match p=(n:Substation)<-[:LOCATED_IN]-(srcBus:Bus)<-[*6]->(trgtBus:Bus)-[:LOCATED_IN]->(trgt:Substation), (trgtBus)-[:HAS]->(volt:Voltage{name:'765 kV'}), (srcBus)-[:HAS]->(:Voltage{name:'765 kV'}) where n.name = 'Agra'

// for each end substation name collect the nodes in the path
WITH trgt.name as end_ss, nodes(p) as ns, size(relationships(p)) as links_len

with end_ss, FILTER(n IN ns WHERE 'Substation' IN LABELS(n)) as path_stns, FILTER(n IN ns WHERE 'Line' IN LABELS(n)) as path_lines, links_len

// for each end substation name collect the substation nodes and sum of line nodes length in the path from ns collection 
with end_ss, extract(path_substn in path_stns| path_substn.name) AS path_ss_array, reduce(pathLength = 0, n IN path_lines| pathLength + n.km) AS path_length, links_len, size(path_lines) as num_path_lines, size(path_stns) as num_path_stns where size(path_stns) = 3 and size(path_lines) = 2
return distinct end_ss, path_ss_array, path_length, links_len, num_path_lines, num_path_stns order by num_path_stns desc
;

// display the substations connected to a substation along with line path length and the substations in the path
// https://stackoverflow.com/questions/25733757/seaching-a-repeated-pattern-in-neo4j
// https://stackoverflow.com/questions/28261198/finding-cypher-paths-that-dont-visit-the-same-node-twice?rq=1
match p=(n:Substation)<-[:LOCATED_IN]-(srcBus:Bus)<-[:LOCATED_IN|CONNECTED_TO*2..12]->(trgtBus:Bus)-[:LOCATED_IN]->(trgt:Substation), (trgtBus)-[:HAS]->(volt:Voltage{name:'400 kV'}), (srcBus)-[:HAS]->(volt) where toLower(n.name) contains 'sasan' and toLower(trgt) contains 'bina-pg'

// for each end substation name collect the nodes in the path
WITH trgt.name as end_ss, nodes(p) as ns, size(relationships(p)) as links_len

with end_ss, FILTER(n IN ns WHERE 'Substation' IN LABELS(n)) as path_stns, FILTER(n IN ns WHERE 'Line' IN LABELS(n)) as path_lines, links_len

// for each end substation name collect the substation nodes and sum of line nodes length in the path from ns collection 
with end_ss, extract(path_substn in path_stns| path_substn.name) AS path_ss_array, reduce(pathLength = 0, n IN path_lines| pathLength + n.km) AS path_length, links_len where size(path_lines)+1 = size(path_stns)
return distinct end_ss, path_ss_array, path_length, links_len order by path_length
;