// 400 kV Lines

	// Uniqueness constraints.
CREATE CONSTRAINT ON (c:Country) ASSERT c.name IS UNIQUE;
CREATE CONSTRAINT ON (r:Region) ASSERT r.name IS UNIQUE;
CREATE CONSTRAINT ON (s:Substation) ASSERT s.name IS UNIQUE;
CREATE CONSTRAINT ON (o:Owner) ASSERT o.name IS UNIQUE;
CREATE CONSTRAINT ON (v:Voltage) ASSERT v.name IS UNIQUE;

	// Initialize.
MERGE (country:Country { name: 'INDIA' });
MERGE (wr:Region { name: 'WR' });
MERGE (wr)-[:BELONGS_TO]->(country);
MERGE (sr:Region { name: 'SR' });
MERGE (sr)-[:BELONGS_TO]->(country);
MERGE (nr:Region { name: 'NR' });
MERGE (nr)-[:BELONGS_TO]->(country);
MERGE (er:Region { name: 'ER' });
MERGE (er)-[:BELONGS_TO]->(country);
MERGE (ner:Region { name: 'NER' });
MERGE (ner)-[:BELONGS_TO]->(country);

	// Load 400 kV Lines.
LOAD CSV WITH HEADERS 
FROM 'file:///lines_raw_400_kv.csv' AS line
WITH DISTINCT line
WHERE line.`End-1` IS NOT NULL AND
	  line.`End-2` IS NOT NULL AND
	  line.Id IS NOT NULL AND
	  line.`Line Owner` IS NOT NULL AND
	  line.`End-1 Owner` IS NOT NULL AND
	  line.`End-2 Owner` IS NOT NULL AND
	  line.Km IS NOT NULL AND
	  line.`Conductor Type` IS NOT NULL AND
	  line.SIL IS NOT NULL AND
	  line.`No Load MVAR Generated` IS NOT NULL
WITH line, toInteger(trim(line.`End1 LR MVAR`)) as end1_lr_mvar, (CASE WHEN toLower(trim(line.`End1 LR S/W`)) = 'yes' THEN 1 ELSE 0 END) as end1_lr_sw, toInteger(trim(line.`End2 LR MVAR`)) as end2_lr_mvar, (CASE WHEN toLower(trim(line.`End2 LR S/W`)) = 'yes' THEN 1 ELSE 0 END) as end2_lr_sw	
MERGE (wr:Region { name: 'WR' })

// Merge line voltage variable
MERGE (volt:Voltage { name: '400 kV'})

// Merge the line ss1, its owner and region
MERGE (ss1_owner:Owner{name: line.`End-1 Owner`})

MERGE (ss1:Substation { name: line.`End-1`})
MERGE (ss1)-[:OWNED_BY]->(ss1_owner)
MERGE (ss1)-[:BELONGS_TO]->(wr)

// Merge the line ss2, its owner and region
MERGE (ss2_owner:Owner { name: line.`End-2 Owner` })

MERGE (ss2:Substation { name: line.`End-2`})
MERGE (ss2)-[:OWNED_BY]->(ss2_owner)
MERGE (ss2)-[:BELONGS_TO]->(wr)

// Merge ss1 bus and ss2 bus and assign voltages to the buses
MERGE (bus1:Bus:Element {id: 1})-[:LOCATED_IN]->(ss1)
MERGE (bus1)-[:HAS]->(volt)

MERGE (bus2:Bus:Element {id: 1})-[:LOCATED_IN]->(ss2)
MERGE (bus2)-[:HAS]->(volt)

// Merge line connecting to the ss1 bus and ss2 bus and set line properties like sil, km, conductor_type, no_load_mvar
MERGE (bus1)<-[:CONNECTED_TO]-(lineEl:Line:Element { id: line.Id })-[:CONNECTED_TO]->(bus2)
SET lineEl.sil = toInteger(line.SIL)
SET lineEl.km = toInteger(line.Km)
SET lineEl.conductor_type = line.`Conductor Type`
SET lineEl.no_load_mvar = line.`No Load MVAR Generated`

// if end1_lr_mvar value is a valid number (not null) then create a line reactor connecting to ss1 bus and line
FOREACH (mvar_val IN (case when end1_lr_mvar IS NULL then [] else [end1_lr_mvar] end) |  MERGE (bus1)<-[:CONNECTED_TO]-(:LineReactor {id: 1, mvar: mvar_val, sw: end1_lr_sw})-[:CONNECTED_TO]->(lineEl))

// if end2_lr_mvar value is a valid number (not null) then create a line reactor connecting to ss2 bus and line
FOREACH (mvar_val IN (case when end2_lr_mvar IS NULL then [] else [end2_lr_mvar] end) |  MERGE (bus2)<-[:CONNECTED_TO]-(:LineReactor {id: 1, mvar: mvar_val, sw: end2_lr_sw})-[:CONNECTED_TO]->(lineEl))

// split line owners string by / and create owners and attach them to the line
WITH SPLIT(line.`Line Owner`, '/') AS line_owners_names, lineEl
UNWIND range(0,size(line_owners_names)-1) AS i
WITH line_owners_names[i] AS line_owner_name, lineEl
MERGE (line_owner:Owner { name: line_owner_name })
MERGE (lineEl)-[:OWNED_BY]->(line_owner)
;

MATCH (owner1:Owner)<--(ss1:Substation)<--(bus1:Bus)<--(l:Line)-->(bus2:Bus)-->(ss2:Substation)-->(owner2:Owner), (l_owner:Owner)<--(l)
WHERE ss1.name<ss2.name
with l, ss1.name as ss1_name,ss2.name as ss2_name, collect(distinct owner1.name) as owner1_names, collect(distinct owner2.name) as owner2_names, collect(distinct l_owner.name) as l_owner_names
return ss1_name,owner1_names,ss2_name,owner2_names,l.id,l_owner_names order by ss1_name, ss2_name
;

match (n:Substation) with count(n) as ss_count
match (b:Bus) with count(b) as bus_count, ss_count
match (b:Line) with count(b) as line_count, bus_count, ss_count
match (b:Owner) with count(b) as owner_count, line_count, bus_count, ss_count
match (b:Element) return count(b) as el_count, owner_count, line_count, bus_count, ss_count
;