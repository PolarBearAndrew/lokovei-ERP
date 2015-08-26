//express
let express = require('express');
let router = express.Router();

//debug
let debug = require('debug')('API:order');

//model
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

    debug('[POST] 新增訂單 req.body ->', req.body );

    let order = new Order({
        oid: '',
        cName: '',
        cAddress: '',
        cPhone: '',
        cWho: '',
        count: '',
        orderDate: '',
        outputDate: '',
        status: '',
        jobID: []
    });

    //db operation
   order.saveAsync()
        .spread( result => {
            debug('[POST] 新增訂單 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[POST] 新增訂單 fail ->', err);
            return next(err);
        });
});

/*
 * [PUT] 更新訂單資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/', (req, res, next) => {

    debug('[PUT] 更新訂單資料 req.body ->', req.body );

    let miss = check( req.body, ['oid', 'cName', 'cAddress', 'cPhone', 'cWho', 'count', 'orderDate', 'outputDate', 'status', 'jobID'] );
    if(!miss.check){
        debug('[POST] 更新訂單 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = {
        oid: req.body.oid,
        cName: req.body.cName,
        cAddress: req.body.cAddress,
        cPhone: req.body.cPhone,
        cWho: req.body.cWho,
        count: req.body.count,
        orderDate: req.body.orderDate,
        outputDate: req.body.outputDate,
        status: req.body.status,
        jobID: req.body.jobID
    };

    //db operation
    Order.findOneAndUpdate( { _id: req.body.uid }, info)
        .updateAsync()
        .then( result => {
            debug('[PUT] 更新訂單資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[PUT] 更新訂單資料 fail ->', err);
            return next(err);
        });
});


/*
 * [PUT] 更新訂單資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.delete('/', (req, res, next) => {

    debug('[DELETE] 刪除訂單 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid'] );
    if(!miss.check){
        debug('[POST] 新增訂單 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db operation
    Order.findOneAndRemove( { _id: req.body.uid })
        .removeAsync()
        .then( result => {
            debug('[DELETE] 刪除訂單 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[DELETE] 刪除訂單 fail ->', err);
            return next(err);
        });
});


module.exports = router;
