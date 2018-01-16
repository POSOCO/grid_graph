/* Created by Nagasudhir on 15.01.2018*/

var Request = require('request');
var sprintf = require('sprintf-js').sprintf;

module.exports.getLines = function (selOptions, callback) {
/*
MATCH (owner1:Owner)<-[:OWNED_BY]-(ss1:Substation)<-[:LOCATED_IN]-(bus1:Bus)<-[:CONNECTED_TO]-(l:Line)-[:CONNECTED_TO]->(bus2:Bus)-[:LOCATED_IN]->(ss2:Substation)-[:OWNED_BY]->(owner2:Owner), (l_owner:Owner)<-[:OWNED_BY]-(l), (bus1)-[:HAS]->(volt:Voltage), (bus2)-[:HAS]->(volt) WHERE (ss1.name<ss2.name) with l, bus1, bus2, ss1.name as ss1_name,ss2.name as ss2_name, collect(distinct owner1.name) as owner1_names, collect(distinct owner2.name) as owner2_names, collect(distinct l_owner.name) as l_owner_names, collect(distinct volt.name) as voltage_levels where (any(x IN owner1_names WHERE x = 'PGCIL')) OPTIONAL MATCH (bus1)<-[:CONNECTED_TO]-(lr1:LineReactor)-[:CONNECTED_TO]->(l), (bus2)<-[:CONNECTED_TO]-(lr2:LineReactor)-[:CONNECTED_TO]->(l) return ss1_name as ss1,owner1_names as ss1_owners,ss2_name as ss2,owner2_names as ss2_owners,l.id as line_id,l_owner_names as line_owners,voltage_levels as voltage, l.sil as sil, l.km as km, l.conductor_type as conductor_type, l.no_load_mvar as no_load_mvar, (case when lr1 IS NULL then NULL else lr1.mvar end) as end1_lr_mvar, (case when lr1 IS NULL then NULL else lr1.sw end) as end1_lr_sw, (case when lr2 IS NULL then NULL else lr2.mvar end) as end2_lr_mvar, (case when lr2 IS NULL then NULL else lr2.sw end) as end2_lr_sw order by ss1, ss2, line_id skip 0 limit 100
;
*/

	var whereClauses = ['ss1.name<ss2.name'];
	var whereClausesLevel2 = [];
	if(selOptions['voltage'] != null){
		var selectionStr = sprintf("volt.name = '%(voltage)s'", {voltage: selOptions['voltage']});
		whereClauses.push(selectionStr);
	}
	/*if(selOptions['owner'] != null){
		selectionStr = sprintf("any(x IN owner1_names WHERE x = '%(owner)s') or any(x IN owner2_names WHERE x = '%(owner)s') or any(x IN l_owner_names WHERE x = '%(owner)s')", {owner: selOptions['owner']});
		whereClausesLevel2.push(selectionStr);
	}*/
	if(selOptions['owner'] != null){
		selectionStr = sprintf("any(x IN owner1_names+owner2_names+l_owner_names WHERE x = '%(owner)s')", {owner: selOptions['owner']});
		whereClausesLevel2.push(selectionStr);
	}
	if(selOptions['substation'] != null){
		selectionStr = sprintf("toLower(ss1.name) contains toLower('%(substation)s') or toLower(ss2.name) contains toLower('%(substation)s')", {substation: selOptions['substation']});
		whereClauses.push(selectionStr);
	}
	if(selOptions['cond_type'] != null){
		selectionStr = sprintf("l.conductor_type = '%(cond_type)s'", {cond_type: selOptions['cond_type']});
		whereClauses.push(selectionStr);
	}
	if(selOptions['limit_rows'] == null || selOptions['limit_rows'] == "" || isNaN(selOptions['limit_rows'])){
		var limitRows = 100;
	}
	else
	{ 
		limitRows = selOptions['limit_rows']; 
	}
	if(selOptions['offset_page'] == null || selOptions['offset_page'] == "" || isNaN(selOptions['offset_page'])){
		var offsetPage = 0;
	}
	else
	{ 
		offsetPage = selOptions['offset_page']; 
	}
	
	if(whereClausesLevel2.length == 0){
		whereClausesLevel2 = ["TRUE"];
	}
	if(whereClauses.length == 0){
		whereClauses = ["TRUE"];
	}
	var queryStr = sprintf("MATCH (owner1:Owner)<-[:OWNED_BY]-(ss1:Substation)<-[:LOCATED_IN]-(bus1:Bus)<-[:CONNECTED_TO]-(l:Line)-[:CONNECTED_TO]->(bus2:Bus)-[:LOCATED_IN]->(ss2:Substation)-[:OWNED_BY]->(owner2:Owner), (l_owner:Owner)<-[:OWNED_BY]-(l), (bus1)-[:HAS]->(volt:Voltage), (bus2)-[:HAS]->(volt) WHERE %(where_clause)s with l, bus1, bus2, ss1.name as ss1_name,ss2.name as ss2_name, collect(distinct owner1.name) as owner1_names, collect(distinct owner2.name) as owner2_names, collect(distinct l_owner.name) as l_owner_names, collect(distinct volt.name) as voltage_levels WHERE %(where_clause_2)s OPTIONAL MATCH (bus1)<-[:CONNECTED_TO]-(lr1:LineReactor)-[:CONNECTED_TO]->(l), (bus2)<-[:CONNECTED_TO]-(lr2:LineReactor)-[:CONNECTED_TO]->(l) return ss1_name as ss1,owner1_names as ss1_owners,ss2_name as ss2,owner2_names as ss2_owners,l.id as line_id,l_owner_names as line_owners,voltage_levels as voltage, l.sil as sil, l.km as km, l.conductor_type as conductor_type, l.no_load_mvar as no_load_mvar, (case when lr1 IS NULL then NULL else lr1.mvar end) as end1_lr_mvar, (case when lr1 IS NULL then NULL else lr1.sw end) as end1_lr_sw, (case when lr2 IS NULL then NULL else lr2.mvar end) as end2_lr_mvar, (case when lr2 IS NULL then NULL else lr2.sw end) as end2_lr_sw order by ss1, ss2, line_id skip %(offset)s limit %(limit)s", {where_clause: '(' + whereClauses.join(') and (') + ')', where_clause_2: '(' + whereClausesLevel2.join(') and (') + ')', offset: offsetPage*limitRows, limit: limitRows});
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
			resColNames = ["ss1", "ss1_owners", "ss2", "ss2_owners", "line_id", "line_owners", "voltage", "sil", "km", "conductor_type", "no_load_mvar", "end1_lr_mvar", "end1_lr_sw", "end2_lr_mvar", "end2_lr_sw"];
			resColIndices = [];
			for(var i=0;i<resColNames.length;i++){
				colIndex = res.body.results[0].columns.indexOf(resColNames[i]);
				if(colIndex == -1){
					return callback({statusCode: res.statusCode, message: 'Required Columns not found. ' + resColNames.join(', ')});
				}
				resColIndices.push(colIndex);
			}			
			// Now we are sure that we have all the columns required and their column indices
			var rows = res.body.results[0].data;
			var lines_array = [];
			for(var i=0;i<rows.length;i++){
				var lineObj = {};
				for(var k=0;k<resColNames.length;k++){
					lineObj[resColNames[k]] = rows[i].row[resColIndices[k]];
				}
				lines_array.push(lineObj);
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