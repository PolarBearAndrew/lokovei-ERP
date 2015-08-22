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

router.get('/crud/:part', function(req, res, next) {

  let schema = [
    { title: '使用者姓名', ctrl: 'text' },
    { title: '帳號', ctrl: 'text' },
    { title: '密碼', ctrl: 'text' },
    { title: '權限等級', ctrl: 'auth' } //authorization
  ];

  let data = [
    [ '陳柏安', 'Andrew', '123', '員工'],
    [ '蔡政欽', 'Srt', '123', '員工'],
    [ '洪于雅', 'Doro', '123', '員工'],
    [ '雷尚樺', 'Ray', '123', '員工'],
    [ '陳思璇', 'Hsuan', '123', '員工'],
  ];

  res.render('crud', { schema: schema, data: data });
});


module.exports = router;
