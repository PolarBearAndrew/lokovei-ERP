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

router.get('/logout', function(req, res, next) {
  res.render('logout');
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

    let data= [];

    // 把所有 job, 還沒完成的拉出來
   Job.find({})
      .execAsync()

       // 把 job 中的 item 拉出來
      .then( result => {
        data = result;
        return Order.find({}).execAsync();//取得oerder資料
      })
      .then( result => {

        let info = {}

        // 需要過濾資料訂單已經取消的資料
        result.filter( val => {
          return val.status !== '訂單取消' || val.status !== '無狀態';
        })

        // 製作 order 出貨日期的資料
        .forEach( val => {
          info[val.oid] = val.outputDate;
        });

        // 將資料初始化成一比一比 item job // 補上出貨日期的資料
        data.forEach( val => {

          var job = val;

          // 抓取出 todoTime 內部的資料
          val.todoTime.forEach( item =>{
            let obj = { ...item._doc, ...job._doc };
            obj.outputDate = info[job.oid]; // 補上出貨日期的資料
            data.push(obj);
          });

          // 補上還沒初始化 todoTime 的數量
          let need = job.count - job.todoTime.length
          for( var c = 0; c < need; c++ ){
            let obj = { ...job._doc };
            obj.status = '尚未完成';
            obj.line = '';
            obj.time = 0;
            obj.outputDate = info[job.oid]; // 補上出貨日期的資料
            data.push(obj);
          }
        })

        // 取得這三攤的參數
        let line = getLines();
        let numList = line.map( val => val.num );
        console.log('line', line);

        // 小於第一天的去掉
        data = data.filter( val => {
          return (val.time >= line[0].num || val.time == 0);
        })

        // 把已經排成的單子找出來計算 3 天內的產線剩餘的產值
        data.forEach( val => {
          if( numList.indexOf( val.time ) !== -1 ){
            line[ numList.indexOf( val.time ) ].todo -= 1;
          }
        });

        let ctrl = false,
            need = 0;  // 總需求數

        // 計算剩餘的產量
        for( var i = 0; i < line.length; i++ ){
          if( line[i].todo > 0 ){
            ctrl = true;
            need += line[i].todo;
          }
        }

        // 產值為 0 的話, 把資料整理整理回傳頁面直接回傳頁面
        if( ctrl === false ){

          console.log('無需排程');

        }else{

          console.log('啟動排程運算...');

          // 取出還沒排序的名單
          let cal = data.filter( val => {
            return val.time == 0;
          });

          let already = data.filter( val => {
            return val.time !== 0;
          });

          // 把還沒排成的 item 依照 出貨 日期排序
          cal.sort( sortByDay );

          // 分離超過 3 天內產值的 item
          let todo = cal.filter( ( val, index) => { return index < need; });
          let overFlow = cal.filter( ( val, index) => { return index >= need; });

          // 把 todo 排上去,  記得處理工作量不足的情況 <-- !!!
          todo.forEach( val => {
            for( var i  = 0; i < line.length; i++ ){ // 找出能放的空間
              if( line[i].todo > 0){ //有剩餘空間就放下去
                line[i].todo--;
                val.time = line[i].num;

                // 將資料寫進 DB去 <--!!!!!

                break;
              }
            }
          }); //todo 排上去 end

          // 將尚未排成的工作從 todo 移動到 overFlow (應該不會有需要移動的資訊, 單純避免意外)
          overFlow.concat( todo.filter( val => val.time == 0 ) );
          todo = todo.filter( val => val.time !== 0 );

          // 將已經排序的資料陣列和命
          let all = already.concat(todo);
          all.sort(sortByTime)

          // 還需要 line data <--- !!!

          // 把資料整理整理回傳頁面 new 新增的工作 all 全部的工作 overflow 無法顯示在佇列的代辦工作
          let renderData = { new: todo, all: all, overFlow: overFlow };
          res.render('queue_factory', renderData);

          console.log('all', all.length, all);

        }
      })
      .catch( err => {
        debug('讀取 factory 頁面資料失敗', err);
      });

      // 依照 出貨日期排序
      function sortByDay( a, b ){
        let day1 = parseInt( a.outputDate.replace(/\//g, '') );
        let day2 = parseInt( b.outputDate.replace(/\//g, '') );
        return day1 - day2; // 小 -> 大
      }

      // 依照排去上去的時間和日期排序
      function sortByTime( a, b ){
        let day1 = parseInt( a.time );
        let day2 = parseInt( b.time );
        return day1 - day2; // 小 -> 大
      }
});

function getLines(){

  // 抓取 line 的總數與資源 <-- !!!!

  let count = 3;

  // 建立 line 的參數
  let data = [];
  let days = get3dayNum();

  days = days.forEach( val => {
    for( var c = 0; c < count; c++ ){
      let tmp = {};
      tmp.num = val.num * 100 + c;
      tmp.todo = 3; // 假設的 line 的資源 <--- !!!
      data.push(tmp);
    }
  });
  return data;
}

function get3dayNum(){
  let today =  getTodayNum(); // 要跳過週末
  return [
    { num: today,     todo: 0 },
    { num: today + 1, todo: 0 },
    { num: today + 2, todo: 0 }
  ];
}

function getTodayNum(){
  let minutes = 1000 * 60;
  let hours = minutes * 60;
  let days = hours * 24;
  //let years = days * 365;

  let d = new Date();
  let t= d.getTime();

  return Math.round(t / days); //與 差幾天  January 1, 1970.
}


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

              res.render('crud', { schema: schema, data: result, apiUrl: 'battery' });
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
