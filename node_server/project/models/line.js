/* Created by Nagasudhir on 15.01.2018*/

var Request = require('request');

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