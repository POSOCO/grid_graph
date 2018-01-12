// 400 kV ICTs

// Uniqueness constraints. - use 'CALL db.constraints' to list all db constraints
CREATE CONSTRAINT ON (c:Country) ASSERT c.name IS UNIQUE;
CREATE CONSTRAINT ON (r:Region) ASSERT r.name IS UNIQUE;
CREATE CONSTRAINT ON (s:Substation) ASSERT s.name IS UNIQUE;
CREATE CONSTRAINT ON (o:Owner) ASSERT o.name IS UNIQUE;
CREATE CONSTRAINT ON (v:Voltage) ASSERT v.name IS UNIQUE;

// node property existence constraints
CREATE CONSTRAINT ON (n:Bus) ASSERT exists(n.id);
CREATE CONSTRAINT ON (n:ICT) ASSERT exists(n.mva);

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

	// Load 400 kV ICTs.
	// 765/400 400/132 400/132 are the possible ict ratios
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS 
FROM 'file:///400_kv_icts.csv' AS line
WITH DISTINCT line
WHERE line.`Sub-Station` IS NOT NULL AND
	  line.`ID` IS NOT NULL AND
	  line.`MVA` IS NOT NULL AND
	  line.`Voltage Ratio` IS NOT NULL AND
	  line.`Owner ` IS NOT NULL
WITH line, trim(line.`Sub-Station`) as ict_ss_name, toInteger(trim(line.`ID`)) as ict_id, toInteger(trim(line.`MVA`)) as ict_mva, trim(line.`Voltage Ratio`) as ict_volt, trim(line.`Owner `) as ict_owner_name, trim(line.`Normal Tap Position`) as ict_nor_tap_pos, trim(line.`Present Tap Position`) as ict_pres_tap_pos

MERGE (wr:Region { name: 'WR' })

// merge voltage variables ict_volt volt_up, volt_down
MERGE (volt_ratio:Voltage { name: (case when ict_volt='400/132' then '400/132 kV' when ict_volt='400/220' then '400/220 kV' when ict_volt='765/400' then '765/400 kV' else '400/220 kV' end)})

MERGE (volt_up:Voltage { name: (case when ict_volt='400/132' then '400 kV' when ict_volt='400/220' then '400 kV' when ict_volt='765/400' then '765 kV' else '400 kV' end)})
MERGE (volt_down:Voltage { name: (case when ict_volt='400/132' then '132 kV' when ict_volt='400/220' then '220 kV' when ict_volt='765/400' then '400 kV' else '220 kV' end)})

// merge a temp variable for deciding to create a new substation
MERGE (temp_var:TempVar{val:false})

// merge ict ss, if created set temp_var to true
MERGE (ict_ss:Substation { name: replace(replace(replace(ict_ss_name,"*",""),"^",""),"#","")})
ON CREATE SET temp_var.val = true

// if ict_ss was not present before, then set other stuff like owner and region
FOREACH (iter IN (case when not temp_var.val then [] else [1] end) | MERGE(ict_owner:Owner{name: ict_owner_name}) MERGE (wr)<-[:BELONGS_TO]-(ict_ss)-[:OWNED_BY]->(ict_owner))

// merge volt_up, volt_down buses
MERGE (volt_up)<-[:HAS]-(ict_bus1:Bus {id: 1})-[:LOCATED_IN]->(ict_ss)
MERGE (volt_down)<-[:HAS]-(ict_bus2:Bus {id: 1})-[:LOCATED_IN]->(ict_ss)

// merge ict and connect to volt_up and volt_down buses
MERGE (ict_bus1)<-[:CONNECTED_TO]-(:ICT {id: ict_id, mva: ict_mva, nor_tap_pos: ict_nor_tap_pos, pres_tap_pos: ict_pres_tap_pos})-[:CONNECTED_TO]->(ict_bus2)

;

optional match (n:Substation) with count(n) as ss_count
optional match (b:Bus) with count(b) as bus_count, ss_count
optional match (b:Line) with count(b) as line_count, bus_count, ss_count
optional match (b:Owner) with count(b) as owner_count, line_count, bus_count, ss_count
optional match (b:LineReactor) with count(b) as lr_count, owner_count, line_count, bus_count, ss_count
optional match (b:BusReactor) with count(b) as br_count, lr_count, owner_count, line_count, bus_count, ss_count
optional match (b:ICT) with count(b) as ict_count, br_count, lr_count, owner_count, line_count, bus_count, ss_count
optional match (b) where any(l in labels(b) WHERE l in ['Line','Bus', 'LineReactor', 'BusReactor', 'ICT']) return count(b) as el_count, owner_count, line_count, bus_count, lr_count, br_count, ict_count, ss_count
;
