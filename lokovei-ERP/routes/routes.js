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

        result = result.filter( val => val.status != '已結案')

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

        result = result.filter( val => val.status != '已結案')

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

    //讀取資料
    var data = [];
    let source = [];
    let lineData = [ { name: '可愛馬五股工廠'} ];

    // 把所有 job, 還沒完成的拉出來
   Job.find({})
      .execAsync()

       // 把 job 中的 item 拉出來
      .then( result => {
        source = result;
        return Order.find({}).sort({_id: 1}).execAsync();//取得oerder資料
      })
      .then( result => {

        let info = {};
        let order = {};

        // 需要過濾資料訂單已經取消的資料
        result.filter( val => {
          return val.status !== '訂單取消' || val.status !== '無狀態';
        })

        // 製作 order 出貨日期的資料
        .forEach( val => {
          info[val.oid] = val.outputDate;
          order[val.oid] = val;
        });

        // 將資料初始化成一比一比 item job // 補上出貨日期的資料
        source.forEach( val => {

          var job = val;

          // 抓取出 todoTime 內部的資料
          val.todoTime.forEach( item =>{

            //console.log('item', item);
            let obj = { ...job._doc };
            let tmp = order[job.oid] || {};
            obj.order = { ...tmp._doc };
            obj.outputDate = info[job.oid]; // 補上出貨日期的資料
            obj.time = item.time;
            obj.line = item.line;
            obj.status = item.status;
            obj.todoTime = null;
            data.push(obj);
          });

          // 補上還沒初始化 todoTime 的數量
          // 因為有可能他新增完成單子, 沒有要排程
          let need = job.count - job.todoTime.length;
          if(need > 0){
            //need = 0
            for( var c = 0; c < need; c++ ){
              //console.log('add');
              let obj = { ...job._doc };
              let tmp = order[job.oid] || {};
              obj.order = { ...tmp._doc };
              obj.outputDate = info[job.oid]; // 補上出貨日期的資料
              obj.status = '尚未完成';
              obj.line = '';
              obj.time = 0;
              obj.todoTime = null;
              data.push(obj);
            }
          }
        })

        let tmp = data.filter( val => val.time == 0 )
        data = data.filter( val => val.time != 0 )

        // 依照 出貨 日期排序
        data.sort( sortByTime );
        data = data.concat(tmp);

        // console.log('data', data.map(val=>val._id));

        let renderData = { lineData: lineData, all: data };
        res.render('queue_factory', renderData);

        // save ---------
        // 使用 oid 分組, 批次寫回去
        let saveDate = data; // 需要被更新的人
        let id = [];

        // 取得 id 名單
        for(var n = 0; n < saveDate.length; n++ ){
          if( id.indexOf( saveDate[n]._id ) == -1 ){
            id.push(saveDate[n]._id);
          }
        }

        // console.log('oid', oid);

        id.forEach( val => {

          let tmp = saveDate.filter( job => job._id === val)
                          .map( job => {
                            return {
                              time: job.time.toString(),
                              line: job.line,
                              status: job.status
                            }
                          });

                          // console.log('存入資料', tmp.length, tmp);

          let _id = val;

          // console.log('更新:', _id, val)

           //db operation
           Job.findOneAndUpdate( { _id: _id }, { todoTime: tmp } )
              .updateAsync()
              .then( result => {
                  debug('[PUT] 後續更新todoTime時間 success ->', _id, result);
              })
              .catch( err => {
                  debug('[PUT] 更新作業時間 fail ->', err);
                  return next(err);
              });
        })



      })
      .catch( err => {
        debug('讀取 factory 頁面資料失敗', err);
        return next(err);
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
               .sort({ name: 1 })
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
        { title: '車款型號', ctrl: 'text', schema: 'carType' },
        { title: '庫存數量', ctrl: 'num', schema: 'store' }
      ];

      let initPorduct = [{
        _id: '0',
        pid: '系統初始化 CHT-013-BO002 零件',
        spec: '傘狀輪軸系統 - 寶藍色'
      }]

        Product.find()
               .sort({ pid: 1 })
               .execAsync()
               .then( result => {
                  if(result.length === 0) result = initPorduct;

                  result = result.map( val => {

                    let tmp = [];
                    tmp.push(val.pid);
                    tmp.push(val.spec);
                    tmp.push(val.carType);
                    tmp.push(val.store);
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
          .sort({ name: 1 })
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
            .sort({ name: 1 })
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

//sortTodo
router.post('/sort', (req, res, next) => {

    let count = req.body.count;
    let time = req.body.time;

    //讀取資料
    var data = [];
    let source = [];
    let store = []
    let lineData = [ { name: '可愛馬五股工廠'} ];

    // 把所有 job, 還沒完成的拉出來
    Job.find({})
      .execAsync()
      .then( result => { // 把 job 中的 item 拉出來
        source = result;
        return Product.find({}).execAsync();
      })
      .then( result => {
        store = result;
        return Order.find({}).execAsync();//取得oerder資料
      })
      .then( result => {

        let info = {}
        let order = {};

        // 需要過濾資料訂單已經取消的資料
        result.filter( val => {
          return val.status !== '訂單取消' || val.status !== '無狀態';
        })
        // 製作 order 出貨日期的資料
        .forEach( val => {
          info[val.oid] = val.outputDate;
          order[val.oid] = val;
        });

        // 將資料初始化成一比一比 item job // 補上出貨日期的資料
        source.forEach( val => {

          var job = val;

          // 抓取出 todoTime 內部的資料
          val.todoTime.forEach( item =>{

            //console.log('item', item);
            let obj = { ...job._doc };
            obj.order = order[job.oid];
            obj.outputDate = info[job.oid]; // 補上出貨日期的資料
            obj.time = item.time;
            obj.line = item.line;
            obj.status = item.status;
            obj.todoTime = null;
            data.push(obj);
          });

          // 補上還沒初始化 todoTime 的數量
          // 因為有可能他新增完成單子, 沒有要排程
          let need = job.count - job.todoTime.length;
          if(need > 0){
            //need = 0
            for( var c = 0; c < need; c++ ){
              //console.log('add');
              let obj = { ...job._doc };
              obj.order = order[job.oid];
              obj.outputDate = info[job.oid]; // 補上出貨日期的資料
              obj.status = '尚未完成';
              obj.line = '';
              obj.time = 0;
              obj.todoTime = null;
              data.push(obj);
            }
          }
        });

        // 從庫存中扣除
        for( var d = 0; d < data.length; d++){
          for( var s = 0; s < store.length; s++){
            //console.log('!! test', store[s].pid, data[d].pid, '//', store[s].spec, data[d].pSpec, 'ans:', store[s].pid === data[d].pid && store[s].pSpec === data[d].pSpec && store[s].store > 0);
            if(store[s].pid === data[d].pid &&
                store[s].spec === data[d].pSpec &&
                data[d].time == 0 &&
                store[s].store > 0 ){
              //console.log('success!!', data[d].pSpec );
              store[s].store--;
              data[d].time = -1;
            }
          }
        }

        console.log('store', store);

        // 將庫存消耗寫回去
        store.forEach( val => {

          Product.findOneAndUpdate({ _id: val._id }, { store: val.store })
                 .updateAsync()
                 .then( result => {
                   debug('更新 store 數量 success', result);
                 })
                 .catch( err => {
                   debug('更新 store 數量 fail', err);
                 })

        });


        // 將還沒排程的工作, 排上去
        for( var i = 0; i < data.length; i++){
          if( data[i].time == 0 ){
            data[i].time = time;
            count--;

            console.log('sort add', data[i])

            if( count == 0 ){
              break;
            }
          }
        }

        res.json({ 'sort': true });

        // 使用 oid 分組, 批次寫回去
        let saveDate = data; // 需要被更新的人
        let id = [];

        // 取得 id 名單
        for(var n = 0; n < saveDate.length; n++ ){
          if( id.indexOf( saveDate[n]._id ) == -1 ){
            id.push(saveDate[n]._id);
          }
        }

        // console.log('oid', oid);

        id.forEach( val => {

          let tmp = saveDate.filter( job => job._id === val)
                          .map( job => {
                            return {
                              time: job.time.toString(),
                              line: job.line,
                              status: job.status
                            }
                          });

                          // console.log('存入資料', tmp.length, tmp);

          let _id = val;

          // console.log('更新:', _id, val)

           //db operation
           Job.findOneAndUpdate( { _id: _id }, { todoTime: tmp } )
              .updateAsync()
              .then( result => {
                  debug('[PUT] 後續更新todoTime時間 success ->', _id, result);
              })
              .catch( err => {
                  debug('[PUT] 更新作業時間 fail ->', err);
                  return next(err);
              });
        })
      })
      .catch( err => {
        debug('排程失敗', err);
        return next(err);
      });

      // 依照 出貨日期排序
      function sortByDay( a, b ){
        let day1 = parseInt( a.outputDate.replace(/\//g, '') ) || 9999999999999;
        let day2 = parseInt( b.outputDate.replace(/\//g, '') ) || 9999999999999;
        return day1 - day2; // 小 -> 大
      }

      // 依照排去上去的時間和日期排序
      function sortByTime( a, b ){
        let day1 = parseInt( a.time );
        let day2 = parseInt( b.time );
        return day1 - day2; // 小 -> 大
      }
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

router.get('/output', function(req, res, next) {

    //讀取資料
    var data = [];
    let source = [];
    let lineData = [ { name: '可愛馬五股工廠'} ];

    // 把所有 job, 還沒完成的拉出來
   Job.find({})
      .execAsync()

       // 把 job 中的 item 拉出來
      .then( result => {
        source = result;
        return Order.find({}).sort({_id: 1}).execAsync();//取得oerder資料
      })
      .then( result => {

        let info = {};
        let order = {};

        // 需要過濾資料訂單已經取消的資料
        result.filter( val => {
          return val.status !== '訂單取消' || val.status !== '無狀態';
        })

        // 製作 order 出貨日期的資料
        .forEach( val => {
          info[val.oid] = val.outputDate;
          order[val.oid] = val;
        });

        // 將資料初始化成一比一比 item job // 補上出貨日期的資料
        source.forEach( val => {

          var job = val;

          // 抓取出 todoTime 內部的資料
          val.todoTime.forEach( item =>{

            //console.log('item', item);
            let obj = { ...job._doc };
            let tmp = order[job.oid] || {};
            obj.order = { ...tmp._doc };
            obj.outputDate = info[job.oid]; // 補上出貨日期的資料
            obj.time = item.time;
            obj.line = item.line;
            obj.status = item.status;
            obj.todoTime = null;
            data.push(obj);
          });

          // 補上還沒初始化 todoTime 的數量
          // 因為有可能他新增完成單子, 沒有要排程
          let need = job.count - job.todoTime.length;
          if(need > 0){
            //need = 0
            for( var c = 0; c < need; c++ ){
              //console.log('add');
              let obj = { ...job._doc };
              let tmp = order[job.oid] || {};
              obj.order = { ...tmp._doc };
              obj.outputDate = info[job.oid]; // 補上出貨日期的資料
              obj.status = '尚未完成';
              obj.line = '';
              obj.time = 0;
              obj.todoTime = null;
              data.push(obj);
            }
          }
        })

        let tmp = data.filter( val => val.time == 0 )
        data = data.filter( val => val.time != 0 )

        // 依照 出貨 日期排序
        data.sort( sortByTime );
        data = data.concat(tmp);

        // console.log('data', data.map(val=>val._id));
        console.log('!!! data', data);

        let renderData = { lineData: lineData, all: data };
        res.render('output', renderData);


        // save ---------
        // 使用 oid 分組, 批次寫回去
        let saveDate = data; // 需要被更新的人
        let id = [];

        // 取得 id 名單
        for(var n = 0; n < saveDate.length; n++ ){
          if( id.indexOf( saveDate[n]._id ) == -1 ){
            id.push(saveDate[n]._id);
          }
        }

        // console.log('oid', oid);

        id.forEach( val => {

          let tmp = saveDate.filter( job => job._id === val)
                          .map( job => {
                            return {
                              time: job.time.toString(),
                              line: job.line,
                              status: job.status
                            }
                          });

                          // console.log('存入資料', tmp.length, tmp);

          let _id = val;

          // console.log('更新:', _id, val)

           //db operation
           Job.findOneAndUpdate( { _id: _id }, { todoTime: tmp } )
              .updateAsync()
              .then( result => {
                  debug('[PUT] 後續更新todoTime時間 success ->', _id, result);
              })
              .catch( err => {
                  debug('[PUT] 更新作業時間 fail ->', err);
                  return next(err);
              });
        })



      })
      .catch( err => {
        debug('讀取 factory 頁面資料失敗', err);
        return next(err);
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

router.get('/job', function(req, res, next) {


    //讀取資料
    var data = [];
    let source = [];
    let lineData = [ { name: '可愛馬五股工廠'} ];

    // 把所有 job, 還沒完成的拉出來
   Job.find({})
      .execAsync()

       // 把 job 中的 item 拉出來
      .then( result => {
        source = result;
        return Order.find({}).sort({_id: 1}).execAsync();//取得oerder資料
      })
      .then( result => {

        let info = {};
        let order = {};

        // 需要過濾資料訂單已經取消的資料
        result.filter( val => {
          return val.status !== '訂單取消' || val.status !== '無狀態';
        })

        // 製作 order 出貨日期的資料
        .forEach( val => {
          info[val.oid] = val.outputDate;
          order[val.oid] = val;
        });

        // 將資料初始化成一比一比 item job // 補上出貨日期的資料
        source.forEach( val => {

          var job = val;

          // 抓取出 todoTime 內部的資料
          val.todoTime.forEach( item =>{

            //console.log('item', item);
            let obj = { ...job._doc };
            let tmp = order[job.oid] || {};
            obj.order = { ...tmp._doc };
            obj.outputDate = info[job.oid]; // 補上出貨日期的資料
            obj.time = item.time;
            obj.line = item.line;
            obj.status = item.status;
            obj.todoTime = null;
            data.push(obj);
          });

          // 補上還沒初始化 todoTime 的數量
          // 因為有可能他新增完成單子, 沒有要排程
          let need = job.count - job.todoTime.length;
          if(need > 0){
            //need = 0
            for( var c = 0; c < need; c++ ){
              //console.log('add');
              let obj = { ...job._doc };
              let tmp = order[job.oid] || {};
              obj.order = { ...tmp._doc };
              obj.outputDate = info[job.oid]; // 補上出貨日期的資料
              obj.status = '尚未完成';
              obj.line = '';
              obj.time = 0;
              obj.todoTime = null;
              data.push(obj);
            }
          }
        })

        let tmp = data.filter( val => val.time == 0 )
        data = data.filter( val => val.time != 0 )

        // 依照 出貨 日期排序
        data.sort( sortByTime );
        data = data.concat(tmp);

        // console.log('data', data.map(val=>val._id));
        console.log('!!! data', data);

        let renderData = { lineData: lineData, all: data };
        res.render('job', renderData);


        // save ---------
        // 使用 oid 分組, 批次寫回去
        let saveDate = data; // 需要被更新的人
        let id = [];

        // 取得 id 名單
        for(var n = 0; n < saveDate.length; n++ ){
          if( id.indexOf( saveDate[n]._id ) == -1 ){
            id.push(saveDate[n]._id);
          }
        }

        // console.log('oid', oid);

        id.forEach( val => {

          let tmp = saveDate.filter( job => job._id === val)
                          .map( job => {
                            return {
                              time: job.time.toString(),
                              line: job.line,
                              status: job.status
                            }
                          });

                          // console.log('存入資料', tmp.length, tmp);

          let _id = val;

          // console.log('更新:', _id, val)

           //db operation
           Job.findOneAndUpdate( { _id: _id }, { todoTime: tmp } )
              .updateAsync()
              .then( result => {
                  debug('[PUT] 後續更新todoTime時間 success ->', _id, result);
              })
              .catch( err => {
                  debug('[PUT] 更新作業時間 fail ->', err);
                  return next(err);
              });
        })



      })
      .catch( err => {
        debug('讀取 factory 頁面資料失敗', err);
        return next(err);
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


module.exports = router;
