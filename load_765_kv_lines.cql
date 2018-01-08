// 765 kV Lines

// Uniqueness constraints. - use 'CALL db.constraints' to list all db constraints
CREATE CONSTRAINT ON (c:Country) ASSERT c.name IS UNIQUE;
CREATE CONSTRAINT ON (r:Region) ASSERT r.name IS UNIQUE;
CREATE CONSTRAINT ON (s:Substation) ASSERT s.name IS UNIQUE;
CREATE CONSTRAINT ON (o:Owner) ASSERT o.name IS UNIQUE;
CREATE CONSTRAINT ON (v:Voltage) ASSERT v.name IS UNIQUE;

// node property existence constraints
CREATE CONSTRAINT ON (n:Bus) ASSERT exists(n.id);
CREATE CONSTRAINT ON (n:Line) ASSERT exists(n.id);
CREATE CONSTRAINT ON (n:LineReactor) ASSERT exists(n.id);
CREATE CONSTRAINT ON (n:LineReactor) ASSERT exists(n.mvar);
CREATE CONSTRAINT ON (n:LineReactor) ASSERT exists(n.sw);

// Initialize.
MERGE (country:Country { name: 'INDIA' })
MERGE (wr:Region { name: 'WR' })
MERGE (wr)-[:BELONGS_TO]->(country)
MERGE (sr:Region { name: 'SR' })
MERGE (sr)-[:BELONGS_TO]->(country)
MERGE (nr:Region { name: 'NR' })
MERGE (nr)-[:BELONGS_TO]->(country)
MERGE (er:Region { name: 'ER' })
MERGE (er)-[:BELONGS_TO]->(country)
MERGE (ner:Region { name: 'NER' })
MERGE (ner)-[:BELONGS_TO]->(country);

	// Load 765 kV Lines.
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS 
FROM 'file:///lines_raw_765_kv.csv' AS line
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

MERGE (volt:Voltage { name: '765 kV'})

MERGE (ss1_owner:Owner{name: trim(line.`End-1 Owner`)})

MERGE (ss1:Substation { name: replace(replace(replace(trim(line.`End-1`),"*",""),"^",""),"#","")})
MERGE (ss1)-[:OWNED_BY]->(ss1_owner)
MERGE (ss1)-[:BELONGS_TO]->(wr)

MERGE (ss2_owner:Owner { name: trim(line.`End-2 Owner`) })

MERGE (ss2:Substation { name: replace(replace(replace(trim(line.`End-2`),"*",""),"^",""),"#","")})
MERGE (ss2)-[:OWNED_BY]->(ss2_owner)
MERGE (ss2)-[:BELONGS_TO]->(wr)

MERGE (volt)<-[:HAS]-(bus1:Bus {id: 1})-[:LOCATED_IN]->(ss1)

MERGE (volt)<-[:HAS]-(bus2:Bus {id: 1})-[:LOCATED_IN]->(ss2)

MERGE (bus1)<-[:CONNECTED_TO]-(lineEl:Line { id: trim(line.Id) })-[:CONNECTED_TO]->(bus2)
SET lineEl.sil = toInteger(line.SIL)
SET lineEl.km = toInteger(line.Km)
SET lineEl.conductor_type = trim(line.`Conductor Type`)
SET lineEl.no_load_mvar = trim(line.`No Load MVAR Generated`)

FOREACH (mvar_val IN (case when end1_lr_mvar IS NULL then [] else [end1_lr_mvar] end) |  MERGE (bus1)<-[:CONNECTED_TO]-(:LineReactor {id: 1, mvar: mvar_val, sw: end1_lr_sw})-[:CONNECTED_TO]->(lineEl))
FOREACH (mvar_val IN (case when end2_lr_mvar IS NULL then [] else [end2_lr_mvar] end) |  MERGE (bus2)<-[:CONNECTED_TO]-(:LineReactor {id: 1, mvar: mvar_val, sw: end2_lr_sw})-[:CONNECTED_TO]->(lineEl))

WITH SPLIT(line.`Line Owner`, '/') AS line_owners_names, lineEl
UNWIND range(0,size(line_owners_names)-1) AS i
WITH line_owners_names[i] AS line_owner_name, lineEl
MERGE (line_owner:Owner { name: trim(line_owner_name) })
MERGE (lineEl)-[:OWNED_BY]->(line_owner)
;

optional match (n:Substation) with count(n) as ss_count
optional match (b:Bus) with count(b) as bus_count, ss_count
optional match (b:Line) with count(b) as line_count, bus_count, ss_count
optional match (b:Owner) with count(b) as owner_count, line_count, bus_count, ss_count
optional match (b:LineReactor) with count(b) as lr_count, owner_count, line_count, bus_count, ss_count
optional match (b:BusReactor) with count(b) as br_count, lr_count, owner_count, line_count, bus_count, ss_count
optional match (b) where any(l in labels(b) WHERE l in ['Line','Bus', 'LineReactor', 'BusReactor']) return count(b) as el_count, owner_count, line_count, bus_count, lr_count, br_count, ss_count
;
