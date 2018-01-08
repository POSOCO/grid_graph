MATCH (owner1:Owner)<-[:OWNED_BY]-(ss1:Substation)<-[:LOCATED_IN]-(bus1:Bus)<-[:CONNECTED_TO]-(l:Line)-[:CONNECTED_TO]->(bus2:Bus)-[:LOCATED_IN]->(ss2:Substation)-[:OWNED_BY]->(owner2:Owner), (l_owner:Owner)<-[:OWNED_BY]-(l), (bus1)-[:HAS]->(volt:Voltage{name: '765 kV'}), (bus2)-[:HAS]->(volt)
WHERE ss1.name<ss2.name
with l, ss1.name as ss1_name,ss2.name as ss2_name, collect(distinct owner1.name) as owner1_names, collect(distinct owner2.name) as owner2_names, collect(distinct l_owner.name) as l_owner_names, collect(distinct volt.name) as voltage_levels
return ss1_name,owner1_names,ss2_name,owner2_names,l.id,l_owner_names,voltage_levels, l.sil, l.km, l.conductor_type, l.no_load_mvar order by ss1_name, ss2_name, l.id
;