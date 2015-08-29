var express = require('express');
var router  = express.Router();
// var co = require('co');

let Job       = require('../models/job.js');
let User      = require('../models/user.js');
let Line      = require('../models/line.js');
let Order     = require('../models/order.js');
let Battery   = require('../models/battery.js');
let Product   = require('../models/product.js');
let Customeer = require('../models/customer.js');

let debug = require('debug')('API:route');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/order', function(req, res, next) {

  let data = {};

  Order.find()
       .execAsync()
       .then( result => {

        console.log('result', result);

        Job.find()
           .execAsync()
           .then( jobs => {
              let data = [];

              data = result.map( val => {
                let tmp = { ...val._doc };
                tmp.jobs = jobs.filter( job => job.oid.toString() == val.oid.toString() )
                return tmp;
              })
              //console.log('data',data)
              res.render('queue_order', { data });
           })

       })
       .catch( err => {
         debug('讀取 Order 頁面資料失敗');
       });
});

router.get('/order/:sort', function(req, res, next) {

  let data = {};

  Order.find()
       .execAsync()
       .then( result => {

        console.log('result', result);

        Job.find()
           .execAsync()
           .then( jobs => {
              let data = [];

              data = result.map( val => {
                let tmp = { ...val._doc };
                tmp.jobs = jobs.filter( job => job.oid.toString() == val.oid.toString() )
                return tmp;
              })

              data.sort(sortFunc(req.params.sort));
              res.render('queue_order', { data: data, sort: req.params.sort });
           })

       })
       .catch( err => {
         debug('讀取 Order 頁面資料失敗');
       });
});

router.get('/factory', function(req, res, next) {
  res.render('queue_factory');
});

router.get('/crud/:part', function(req, res, next) {

  let schema = [], data = [];

  switch(req.params.part){

    case 'customer':
      schema = [
        { title: '經銷商名稱', ctrl: 'text', schema: 'name' },
        { title: '經銷商地址', ctrl: 'text', schema: 'address' },
        { title: '聯絡電話', ctrl: 'text', schema: 'phone' },
        { title: '採購人員', ctrl: 'text', schema: 'who' }
      ];

      let initCustomer = [{
        _id: '0',
        name: '系統初始化機器人經銷商',
        address: '機器工廠',
        phone: '0930-013-167',
        who: '瓦力'
      }]

      Customeer.find()
               .execAsync()
               .then( result => {
                  if(result.length === 0) result = initCustomer;

                  result = result.map( val => {

                    let tmp = [];
                    tmp.push(val.name);
                    tmp.push(val.address);
                    tmp.push(val.phone);
                    tmp.push(val.who);
                    tmp.push(val._id.toString());

                    return tmp;
                  });

                  res.render('crud', { schema: schema, data: result, apiUrl: 'customer' });
                  debug('載入經銷商資料成功', result);
                })
                .catch( err => {
                  debug('載入經銷商資料失敗', err);
                  next(err);
                });
      break;


    // 產品編輯頁面
    case 'product':
      schema = [
        { title: '產品編號', ctrl: 'text', schema: 'pid' },
        { title: '品項規格', ctrl: 'text', schema: 'spec' },
      ];

      let initPorduct = [{
        _id: '0',
        pid: '系統初始化 CHT-013-BO002 零件',
        spec: '傘狀輪軸系統 - 寶藍色'
      }]

        Product.find()
               .execAsync()
               .then( result => {
                  if(result.length === 0) result = initPorduct;

                  result = result.map( val => {

                    let tmp = [];
                    tmp.push(val.pid);
                    tmp.push(val.spec);
                    tmp.push(val._id.toString());

                    return tmp;
                  });

                  res.render('crud', { schema: schema, data: result, apiUrl: 'product' });
                  debug('載入產品資料成功', result);
                })
                .catch( err => {
                  debug('載入產品資料失敗', err);
                  next(err);
                });
      break;

    case 'line':
      schema = [
        { title: '產線名稱', ctrl: 'text', schema: 'name' },
        { title: '負責人', ctrl: 'text', schema: 'who' },
        { title: '聯絡方式', ctrl: 'text', schema: 'phone' },
        { title: '備註', ctrl: 'text', schema: 'note' } //authorization
      ];

      let initLine = [{
        _id: '0',
        name: '系統初始化機器人工廠',
        who: '瓦力',
        phone: '0930-013-167',
        note: '很冷',
      }]

       Line.find()
           .execAsync()
           .then( result => {
              if(result.length === 0) result = initLine;

              result = result.map( val => {

                let tmp = [];
                tmp.push(val.name);
                tmp.push(val.who);
                tmp.push(val.phone);
                tmp.push(val.note);
                tmp.push(val._id.toString());

                return tmp;
              });

              res.render('crud', { schema: schema, data: result, apiUrl: 'line' });
              debug('載入經產線資料成功', result);
            })
            .catch( err => {
              debug('載入經產線資料失敗', err);
              next(err);
            });
      break;

    // 帳密管理頁面
    case 'account':
      schema = [
        { title: '使用者姓名', ctrl: 'text', schema: 'name' },
        { title: '帳號', ctrl: 'text', schema: 'account' },
        { title: '密碼', ctrl: 'text', schema: 'pwd' },
        { title: '權限等級', ctrl: 'auth', schema: 'auth' } //authorization
      ];

      let initUser = [{
        _id: '0',
        name: '系統初始化機器人',
        account: 'admin',
        pwd: 'admin',
        auth: '主管'
      }]

      User.find()
          .execAsync()
          .then( result => {

            if(result.length === 0) result = initUser;

            result = result.map( val => {

              let tmp = [];
              tmp.push(val.name);
              tmp.push(val.account);
              tmp.push(val.pwd);
              tmp.push(val.auth);
              tmp.push(val._id.toString());

              return tmp;
            });

            res.render('crud', { schema: schema, data: result, apiUrl: 'user' });
            debug('載入使用者資料成功', result);
          })
          .catch( err => {
            debug('載入使用者資料失敗', err);
            next(err);
          });
      break;

    // 電池資訊頁面
    case 'battery':
      schema = [
        { title: '電池型號', ctrl: 'text', schema: 'name' },
        { title: '備註', ctrl: 'text', schema: 'note' } //authorization
      ];

      let initBattery = [{
        _id: '0',
        name: '系統機器人專用電池',
        note: '勁量電池,跑超快的兔子'
      }]

      Battery.find()
            .execAsync()
            .then( result => {

              if(result.length === 0) result = initBattery;

              result = result.map( val => {

                let tmp = [];
                tmp.push(val.name);
                tmp.push(val.note);
                tmp.push(val._id.toString());

                return tmp;
              });

              res.render('crud', { schema: schema, data: result, apiUrl: 'user' });
              debug('載入電池資料成功', result);
            })
            .catch( err => {
              debug('載入電池資料失敗', err);
              next(err);
            });
      break;
  }


  // res.render('crud', { schema: schema, data: data });
});

router.get('/print/order', function(req, res, next) {

  let data = {};

  res.render('print_order', data);
});

// sort func
function sortFunc(type){

  let func = ( () => { return 1 } );

  switch(type){
    case 'none':
      func = ( () => { return 1 } );
      break;
    case 'startTime':
      func = ( ( a, b ) => {
        return parseInt( a.orderDate.replace(/\//g, '') ) - parseInt( b.orderDate.replace(/\//g, '') );
      });
      break;
    case 'endTime':
      func = ( ( a, b ) => {
        return parseInt( a.outputDate.replace(/\//g, '') ) - parseInt( b.outputDate.replace(/\//g, '') );
      });
      break;
    case 'customer':
      func = ( ( a, b ) => { return a.cName - b.cName } );
      break;
  }

  return func;
}

module.exports = router;
