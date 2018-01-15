/* Created by Nagasudhir on 15.01.2018*/

var Request = require('request');
var sprintf = require('sprintf-js').sprintf;

module.exports.getLines = function (selOptions, callback) {
/*
MATCH (owner1:Owner)<-[:OWNED_BY]-(ss1:Substation)<-[:LOCATED_IN]-(bus1:Bus)<-[:CONNECTED_TO]-(l:Line)-[:CONNECTED_TO]->(bus2:Bus)-[:LOCATED_IN]->(ss2:Substation)-[:OWNED_BY]->(owner2:Owner), (l_owner:Owner)<-[:OWNED_BY]-(l), (bus1)-[:HAS]->(volt:Voltage{name: '765 kV'}), (bus2)-[:HAS]->(volt) 
WHERE ss1.name<ss2.name and (owner1.name in ['NRTS-1'] or owner2.name in ['NRTS-1']) and (ss1.name in ['Agra'] or ss2.name in ['Agra']) and (l.conductor_type = '')
with l, bus1, bus2, ss1.name as ss1_name,ss2.name as ss2_name, collect(distinct owner1.name) as owner1_names, collect(distinct owner2.name) as owner2_names, collect(distinct l_owner.name) as l_owner_names, collect(distinct volt.name) as voltage_levels
OPTIONAL MATCH (bus1)<-[:CONNECTED_TO]-(lr1:LineReactor)-[:CONNECTED_TO]->(l), (bus2)<-[:CONNECTED_TO]-(lr2:LineReactor)-[:CONNECTED_TO]->(l)
return ss1_name,owner1_names,ss2_name,owner2_names,l.id,l_owner_names,voltage_levels, l.sil, l.km, l.conductor_type, l.no_load_mvar, (case when lr1 IS NULL then NULL else lr1.mvar end) as end1_lr_mvar, (case when lr1 IS NULL then NULL else lr1.sw end) as end1_lr_sw, (case when lr2 IS NULL then NULL else lr2.mvar end) as end2_lr_mvar, (case when lr2 IS NULL then NULL else lr2.sw end) as end2_lr_sw order by ss1_name, ss2_name, l.id
;
*/

	var whereClauses = ['ss1.name<ss2.name'];
	if(selOptions['voltage'] != null){
		var selectionStr = sprintf('volt.name = %(voltage)s', {voltage: selOptions['voltage']});
		whereClauses.push(selectionStr);
	}
	if(selOptions['owner'] != null){
		selectionStr = sprintf("owner1.name = '%(owner)s' or owner2.name = '%(owner)s'", {owner: selOptions['owner']});
		whereClauses.push(selectionStr);
	}
	if(selOptions['substation'] != null){
		selectionStr = sprintf("ss1.name = '%(substation)s' or ss2.name = '%(substation)s'", {substation: selOptions['substation']});
		whereClauses.push(selectionStr);
	}
	if(selOptions['cond_type'] != null){
		selectionStr = sprintf("ss1.name = '%(cond_type)s' or ss2.name = '%(cond_type)s'", {cond_type: selOptions['cond_type']});
		whereClauses.push(selectionStr);
	}
	
	var queryStr = sprintf("MATCH (owner1:Owner)<-[:OWNED_BY]-(ss1:Substation)<-[:LOCATED_IN]-(bus1:Bus)<-[:CONNECTED_TO]-(l:Line)-[:CONNECTED_TO]->(bus2:Bus)-[:LOCATED_IN]->(ss2:Substation)-[:OWNED_BY]->(owner2:Owner), (l_owner:Owner)<-[:OWNED_BY]-(l), (bus1)-[:HAS]->(volt:Voltage), (bus2)-[:HAS]->(volt) WHERE %(where_clause)s with l, bus1, bus2, ss1.name as ss1_name,ss2.name as ss2_name, collect(distinct owner1.name) as owner1_names, collect(distinct owner2.name) as owner2_names, collect(distinct l_owner.name) as l_owner_names, collect(distinct volt.name) as voltage_levels OPTIONAL MATCH (bus1)<-[:CONNECTED_TO]-(lr1:LineReactor)-[:CONNECTED_TO]->(l), (bus2)<-[:CONNECTED_TO]-(lr2:LineReactor)-[:CONNECTED_TO]->(l) return ss1_name,owner1_names,ss2_name,owner2_names,l.id,l_owner_names,voltage_levels, l.sil, l.km, l.conductor_type, l.no_load_mvar, (case when lr1 IS NULL then NULL else lr1.mvar end) as end1_lr_mvar, (case when lr1 IS NULL then NULL else lr1.sw end) as end1_lr_sw, (case when lr2 IS NULL then NULL else lr2.mvar end) as end2_lr_mvar, (case when lr2 IS NULL then NULL else lr2.sw end) as end2_lr_sw order by ss1_name, ss2_name, l.id", {where_clause: '(' + whereClauses.join(') and (') + ')'});
	console.log(queryStr);
	
	// Start the request
	var options = {
		uri: 'http://127.0.0.1:7474/db/data/transaction/commit', 
		json: {
		  statements:[
			{
			  statement:queryStr,
			  parameters:null,
			  resultDataContents : [ "row" ]
			}
		  ]
		}
	};
	//stub
    Request.post(options, function (err, res) {
        if (!err && res.statusCode == 200) {
            // console.log(res.body.results[0].data[0].row);
			// find the column index of conductor_types
			resColName = 'conductor_type';
			colIndex = res.body.results[0].columns.indexOf(resColName);
			if(colIndex == -1){
				return callback({statusCode: res.statusCode, message: 'Required Column not found'});
			}
			var rows = res.body.results[0].data;
			var lines_array = [];
			for(var i=0;i<rows.length;i++){
				lines_array.push(rows[i].row[colIndex]);
			}
            return callback(null, lines_array);
        } else if (err) {
            return callback(err);
        } else {
            return callback(new Error(""+res.statusCode));
        }
    });
};

module.exports.getConductorTypes = function (callback) {
	// Start the request
	var options = {
		uri: 'http://127.0.0.1:7474/db/data/transaction/commit', 
		json: {
		  statements:[
			{
			  statement:"match (n:Line) return distinct n.conductor_type as conductor_type",
			  parameters:null,
			  resultDataContents : [ "row" ]
			}
		  ]
		}
	};
    Request.post(options, function (err, res) {
        if (!err && res.statusCode == 200) {
            // console.log(res.body.results[0].data[0].row);
			// find the column index of conductor_types
			resColName = 'conductor_type';
			colIndex = res.body.results[0].columns.indexOf(resColName);
			if(colIndex == -1){
				return callback({statusCode: res.statusCode, message: 'Required Column not found'});
			}
			var rows = res.body.results[0].data;
			var conductor_types_array = [];
			for(var i=0;i<rows.length;i++){
				conductor_types_array.push(rows[i].row[0]);
			}
            return callback(null, conductor_types_array);
        } else if (err) {
            return callback(err);
        } else {
            return callback(new Error(""+res.statusCode));
        }
    });
};