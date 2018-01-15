/* Created by Nagasudhir on 15.01.2018*/

var Request = require('request');

module.exports.getOwners = function (callback) {
	// Start the request
	var options = {
		uri: 'http://127.0.0.1:7474/db/data/transaction/commit', 
		json: {
		  statements:[
			{
			  statement:"match (n:Owner) return distinct n.name as owner, id(n) as id order by n.name",
			  parameters:null,
			  resultDataContents : [ "row" ]
			}
		  ]
		}
	};
    Request.post(options, function (err, res) {
        if (!err && res.statusCode == 200) {
            // console.log(res.body.results[0].data[0].row);
			// find the column index of voltage
			resColName = 'owner';
			colIndex = res.body.results[0].columns.indexOf(resColName);
			idColIndex = res.body.results[0].columns.indexOf('id');
			if(colIndex == -1 && idColIndex == -1){
				return callback({statusCode: res.statusCode, message: 'Required Columns not found'});
			}
			var rows = res.body.results[0].data;
			var volt_array = [];
			for(var i=0;i<rows.length;i++){
				volt_array.push({name: rows[i].row[colIndex], id: rows[i].row[idColIndex]});
			}
            return callback(null, volt_array);
        } else if (err) {
            return callback(err);
        } else {
            return callback(new Error(""+res.statusCode));
        }
    });
};