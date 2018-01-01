var express = require('express');
var router = express.Router();
var fs = require('file-system');

/* GET image listing. */
router.get('/', function(req, res, next) {
		fs.readdir('./public/images', function(err, items) {
	    res.json(items);
	});
});

module.exports = router;
