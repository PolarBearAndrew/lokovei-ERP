var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/order', function(req, res, next) {
  res.render('queue_order');
});

router.get('/factory', function(req, res, next) {
  res.render('queue_factory');
});

module.exports = router;
