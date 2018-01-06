MATCH (owner1:Owner)<--(ss1:Substation)<--(bus1:Bus)<--(l:Line)-->(bus2:Bus)-->(ss2:Substation)-->(owner2:Owner), (l_owner:Owner)<--(l), (bus1)-->(volt:Voltage{name: '400 kV'}), (bus2)-->(:Voltage{name: '400 kV'})
WHERE ss1.name<ss2.name
with l, ss1.name as ss1_name,ss2.name as ss2_name, collect(distinct owner1.name) as owner1_names, collect(distinct owner2.name) as owner2_names, collect(distinct l_owner.name) as l_owner_names, collect(distinct volt.name) as voltage_levels
return ss1_name,owner1_names,ss2_name,owner2_names,l.id,l_owner_names,voltage_levels order by ss1_name, ss2_name
;