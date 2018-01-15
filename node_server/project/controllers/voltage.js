var express = require('express');
var router = express.Router();
var async = require("async");
var VoltageModel = require('../models/voltage');

router.get('/', function (req, res, next) {
    //console.log("get req params for get single are " + JSON.stringify(req.query));
	VoltageModel.getVoltages(function(err, voltages){
		if (err) {return next(err);}
		res.json({"voltages":voltages});
	});
});

module.exports = router;
