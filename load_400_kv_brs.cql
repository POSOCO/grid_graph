// 765 kV BRs

// Uniqueness constraints. - use 'CALL db.constraints' to list all db constraints
CREATE CONSTRAINT ON (c:Country) ASSERT c.name IS UNIQUE;
CREATE CONSTRAINT ON (r:Region) ASSERT r.name IS UNIQUE;
CREATE CONSTRAINT ON (s:Substation) ASSERT s.name IS UNIQUE;
CREATE CONSTRAINT ON (o:Owner) ASSERT o.name IS UNIQUE;
CREATE CONSTRAINT ON (v:Voltage) ASSERT v.name IS UNIQUE;

// node property existence constraints
CREATE CONSTRAINT ON (n:Bus) ASSERT exists(n.id);
CREATE CONSTRAINT ON (n:BusReactor) ASSERT exists(n.id);
CREATE CONSTRAINT ON (n:BusReactor) ASSERT exists(n.mvar);

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

	// Load 765 kV brs.
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS 
FROM 'file:///400_kv_brs.csv' AS line
WITH DISTINCT line
WHERE line.`Substation` IS NOT NULL AND
	  line.`Owner` IS NOT NULL AND
	  line.`S.No` IS NOT NULL
WITH line, toInteger(trim(line.`Rated Voltage`)) as br_rated_volatage, toInteger(trim(line.`50 MVAR`)) as num_50_mvar_br, toInteger(trim(line.`63 MVAR`)) as num_63_mvar_br, toInteger(trim(line.`80 MVAR`)) as num_80_mvar_br, toInteger(trim(line.`125 MVAR`)) as num_125_mvar_br

MERGE (wr:Region { name: 'WR' })

MERGE (volt:Voltage { name: '400 kV'})

MERGE (temp_var:TempVar{val:false})

MERGE (ss:Substation { name: replace(replace(replace(trim(line.`Substation`),"*",""),"^",""),"#","")})
ON CREATE SET temp_var.val = true

FOREACH (iter IN (case when not temp_var.val then [] else [1] end) | MERGE(owner:Owner{name: trim(line.`Owner`)}) MERGE (wr)<-[:BELONGS_TO]-(ss)-[:OWNED_BY]->(owner))

MERGE (volt)<-[:HAS]-(bus:Bus {id: 1})-[:LOCATED_IN]->(ss)

FOREACH (iter IN (case when num_50_mvar_br IS NULL then [] else range(1, num_50_mvar_br, 1) end) |  MERGE (bus)<-[:CONNECTED_TO]-(:BusReactor {id: iter, mvar: 50, rated_volt: br_rated_volatage}))

FOREACH (iter IN (case when num_63_mvar_br IS NULL then [] else range(1, num_63_mvar_br, 1) end) |  MERGE (bus)<-[:CONNECTED_TO]-(:BusReactor {id: iter, mvar: 63, rated_volt: br_rated_volatage}))

FOREACH (iter IN (case when num_80_mvar_br IS NULL then [] else range(1, num_80_mvar_br, 1) end) |  MERGE (bus)<-[:CONNECTED_TO]-(:BusReactor {id: iter, mvar: 80, rated_volt: br_rated_volatage}))

FOREACH (iter IN (case when num_125_mvar_br IS NULL then [] else range(1, num_125_mvar_br, 1) end) |  MERGE (bus)<-[:CONNECTED_TO]-(:BusReactor {id: iter, mvar: 125, rated_volt: br_rated_volatage}))

;

optional match (n:Substation) with count(n) as ss_count
optional match (b:Bus) with count(b) as bus_count, ss_count
optional match (b:Line) with count(b) as line_count, bus_count, ss_count
optional match (b:Owner) with count(b) as owner_count, line_count, bus_count, ss_count
optional match (b:LineReactor) with count(b) as lr_count, owner_count, line_count, bus_count, ss_count
optional match (b:BusReactor) with count(b) as br_count, lr_count, owner_count, line_count, bus_count, ss_count
optional match (b) where any(l in labels(b) WHERE l in ['Line','Bus', 'LineReactor', 'BusReactor']) return count(b) as el_count, owner_count, line_count, bus_count, lr_count, br_count, ss_count
;
