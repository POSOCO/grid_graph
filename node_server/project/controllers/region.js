var express = require('express');
var router = express.Router();
var async = require("async");
var RegionModel = require('../models/region');

router.get('/', function (req, res, next) {
    //console.log("get req params for get single are " + JSON.stringify(req.query));
	RegionModel.getRegions(function(err, regions){
		if (err) {return next(err);}
		res.json({"regions":regions});
	});
});

module.exports = router;
