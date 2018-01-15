var express = require('express');
var router = express.Router();
var async = require("async");
var LineModel = require('../models/line');

router.get('/', function (req, res, next) {
    //console.log("get req params for get single are " + JSON.stringify(req.query));
	selOptions = {};
	var limit_rows = req.query.limit_rows;
    var rows_page = req.query.offset_page;
	selOptions['voltage'] = req.query.voltage;
	selOptions['owner'] = req.query.owner;
	selOptions['substation'] = req.query.ss_name;
	selOptions['cond_type'] = req.query.conductor_type;
	console.log(selOptions);
	LineModel.getLines(selOptions, function(err, lines){
		if (err) {return next(err);}
		res.json({"lines":lines});
	});
});

router.get('/conductor_types', function (req, res, next) {
    //console.log("get req params for get single are " + JSON.stringify(req.query));
	LineModel.getConductorTypes(function(err, conductor_types){
		if (err) {return next(err);}
		res.json({"conductor_types":conductor_types});
	});
});

module.exports = router;
