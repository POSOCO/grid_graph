var express = require('express');
var router = express.Router();
var async = require("async");
var OwnerModel = require('../models/owner');

router.get('/', function (req, res, next) {
    //console.log("get req params for get single are " + JSON.stringify(req.query));
	OwnerModel.getOwners(function(err, owners){
		if (err) {return next(err);}
		res.json({"owners":owners});
	});
});

module.exports = router;
