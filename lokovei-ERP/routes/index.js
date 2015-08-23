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

  let schema = [], data = [];

  switch(req.params.part){

    case 'customer':
      schema = [
        { title: '經銷商名稱', ctrl: 'text' },
        { title: '經銷商地址', ctrl: 'text' },
        { title: '聯絡電話', ctrl: 'text' },
        { title: '採購人員', ctrl: 'text' }
      ];

      data = [
        [ '永輝', '台北市新生南路1段199巷10-1號4樓', '0930-014-167', '陳老闆'],
        [ '全馬', '台北市新生南路1段199巷10-1號4樓', '0930-014-167', '雷老闆'],
        [ '竹輪', '台北市新生南路1段199巷10-1號4樓', '0930-014-167', '洪老闆'],
        [ '立翔', '台北市新生南路1段199巷10-1號4樓', '0930-014-167', '王老闆'],
        [ '總太', '台北市新生南路1段199巷10-1號4樓', '0930-014-167', '謝老闆'],
      ]
      break;

    case 'product':
      schema = [
        { title: '產品編號', ctrl: 'text' },
        { title: '品項規格', ctrl: 'text' },
      ];

      data = [
        [ 'CHT-013-BO002', 'Lokovei SR-800-寶馬棕'],
        [ 'CHT-013-BO002', 'Lokovei SR-800-寶馬藍'],
        [ 'CHT-013-BO002', 'Lokovei SR-800-寶馬綠'],
        [ 'CHT-013-BO002', 'Lokovei SR-800-寶馬黑'],
        [ 'CHT-013-BO002', 'Lokovei SR-800-寶馬金'],
      ];
      break;

    case 'line':
      schema = [
        { title: '產線編號', ctrl: 'text' },
        { title: '負責人', ctrl: 'text' },
        { title: '聯絡方式', ctrl: 'text' },
        { title: '備註', ctrl: 'text' } //authorization
      ];

      data = [
        [ '產線-林口', 'Andrew', '0930-014-167', '無'],
        [ '產線-大安', 'Srt', '0930-014-167', '無'],
        [ '產線-五股', 'Doro', '0930-014-167', '無'],
        [ '產線-逢甲', 'Ray', '0930-014-167', '無'],
        [ '產線-鳳山', 'Hsuan', '0930-014-167', '無'],
      ];
      break;

    case 'account':
      schema = [
        { title: '使用者姓名', ctrl: 'text' },
        { title: '帳號', ctrl: 'text' },
        { title: '密碼', ctrl: 'text' },
        { title: '權限等級', ctrl: 'auth' } //authorization
      ];

      data = [
        [ '陳柏安', 'Andrew', '123', '員工'],
        [ '蔡政欽', 'Srt', '123', '員工'],
        [ '洪于雅', 'Doro', '123', '員工'],
        [ '雷尚樺', 'Ray', '123', '員工'],
        [ '陳思璇', 'Hsuan', '123', '員工'],
      ];
      break;
  }


  res.render('crud', { schema: schema, data: data });
});


module.exports = router;
