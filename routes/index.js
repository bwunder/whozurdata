var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

console.dir(this);

  res.render('index', function() {
    return module.parent.exports.settings.stores;
  });    
});

module.exports = router;
