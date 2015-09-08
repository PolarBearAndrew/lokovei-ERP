//express
let express = require('express');
let router = express.Router();

//debug
let debug = require('debug')('API:order');

//model
let Job = require('../models/job.js');
let Order = require('../models/order.js');


//feature
//let postMan = require('../feature/mail.js');
let checkPorperty = require('../feature/checkProperty.js');
let check = checkPorperty.check;

//=======================================================

/*
 * [POST] 新增訂單
 * request : no
 * respone : db result
 */
router.post('/', (req, res, next) => {

    debug('[POST] 新增訂單 req.body ->', req.body);

    Order.find({})
         .sort({ oid: 1})
         .execAsync()
         .then( result => {

            var parse = ( val ) => {
                if(val.toString().length < 2)
                    { return String("0") + String(val) }
                else
                    { return val.toString() }
            }

            let d = new Date();
            let year = d.getFullYear().toString();
            let month = parse( ( d.getUTCMonth() + 1 ).toString() );
            let day = parse( d.getDate() );

            let time = parseInt( year + '' + month + '' + day );


            let todayJob = result.filter( val => {
                // console.log('test', val.oid / 100, time, parseInt(val.oid) % 100 == time )
                return parseInt(val.oid / 100) == time
            });

            let tmp = todayJob[todayJob.length - 1] || {};
            tmp = tmp.oid || 0;
            tmp = tmp % 100 + 1;

            time *= 100;
            time = parseInt(time) + tmp;

            let order = new Order({
                oid: time,
                cName: '',
                cAddress: '',
                cPhone: '',
                cWho: '',
                usWho: '',
                count: '',
                orderDate: '',
                outputDate: '',
                status: ''
            });

            //db operation
            return order.saveAsync();
         })
         .spread(result => {
            debug('[POST] 新增訂單 success ->', result);
            res.json(result);
            return;
         })
         .catch( err => {
            debug('[POST] 新增訂單(前置查詢) fail ->', err);
            return next(err);
         });
});

/*
 * [PUT] 更新訂單資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/', (req, res, next) => {

    debug('[PUT] 更新訂單資料 req.body ->', req.body);

    let miss = check(req.body, ['oid', 'cName', 'cAddress', 'cPhone', 'cWho', 'count', 'orderDate', 'outputDate', 'status']);
    if (!miss.check) {
        debug('[POST] 更新訂單 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = {
        cName: req.body.cName,
        cAddress: req.body.cAddress,
        cPhone: req.body.cPhone,
        cWho: req.body.cWho,
        usWho: req.body.usWho,
        count: req.body.count,
        orderDate: req.body.orderDate,
        outputDate: req.body.outputDate,
        status: req.body.status,
        jobID: req.body.jobID
    };

    //db operation
    Order.findOneAndUpdate({
            oid: req.body.oid,
        }, info)
        .updateAsync()
        .then(result => {
            debug('[PUT] 更新訂單資料 success ->', result);
            res.json(result);
            return;
        })
        .catch(err => {
            debug('[PUT] 更新訂單資料 fail ->', err);
            return next(err);
        });
});


/*
 * [POST] 更新訂單狀態
 * request :
 * respone : db result
 */
router.post('/status', (req, res, next) => {

    debug('[POST] 更新訂單狀態 req.body ->', req.body);

    let miss = check(req.body, ['uid', 'status']);
    if (!miss.check) {
        debug('[POST] 更新訂單 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = { status: req.body.status };

    //db operation
    Order.findOneAndUpdate({
            _id: req.body.uid,
        }, info)
        .updateAsync()
        .then(result => {
            debug('[POST] 更新訂單狀態 success ->', result);
            res.json(result);
            return;
        })
        .catch(err => {
            debug('[POST] 更新訂單狀態 fail ->', err);
            return next(err);
        });
});


/*
 * [DELETE] 刪除訂單
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.delete('/', (req, res, next) => {

    debug('[DELETE] 刪除訂單 req.body ->', req.body);

    //check
    let miss = check(req.body, ['uid']);
    if (!miss.check) {
        debug('[DELETE] 刪除訂單 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

   Order.findOne()
        .where('_id').equals(req.body.uid)
        .execAsync()
        .then(result => {
            console.log('result', result);
            return Job.remove({ oid: result.oid })
                      .execAsync();
        })
        .then(result => {
            return Order.findOneAndRemove({
                        _id: req.body.uid
                    })
                    .removeAsync();
        })
        .then(result => {
            debug('[DELETE] 刪除訂單資料 success ->', result);
            res.json(result);
            return;
        })
        .catch(err => {
            debug('[DELETE] 刪除訂單資料 fail ->', err);
            return next(err);
        });
});


module.exports = router;
