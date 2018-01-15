var express = require('express');
var router = express.Router();
var async = require("async");
var LineModel = require('../models/line');

router.get('/conductor_types', function (req, res, next) {
    //console.log("get req params for get single are " + JSON.stringify(req.query));
	LineModel.getConductorTypes(function(err, conductor_types){
		if (err) {return next(err);}
		res.json({"conductor_types":conductor_types});
	});
});

module.exports = router;
