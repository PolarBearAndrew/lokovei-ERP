//express
let express = require('express');
let router = express.Router();

//debug
let debug = require('debug')('API:product');

//model
let Product = require('../models/product.js');

//feature
//let postMan = require('../feature/mail.js');
let checkPorperty = require('../feature/checkProperty.js');
let check = checkPorperty.check;

//=======================================================

/*
 * [POST] 新增產品資料
 * request : no
 * respone : db result
 */
router.post('/', (req, res, next) => {

    debug('[POST] 新增產品資料 req.body ->', req.body );

    let product = new Product({
        pid: '',
        spec: '',
        carType: ''
    });

    //db operation
    product.saveAsync()
        .spread( result => {
            debug('[POST] 新增產品資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[POST] 新增產品資料 fail ->', err);
            return next(err);
        });
});

/*
 * [PUT] 更新產品資料資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/', (req, res, next) => {

    debug('[PUT] 更新產品資料資料 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid', 'pid', 'spec'] );
    if(!miss.check){
        debug('[POST] 新增產品資料 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = {
        pid: req.body.pid,
        spec: req.body.spec,
        carType: req.body.carType,
        store: req.body.store
    };


    //db operation
    Product.findOneAndUpdate( { _id: req.body.uid }, info)
        .updateAsync()
        .then( result => {
            debug('[PUT] 更新產品資料資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[PUT] 更新產品資料資料 fail ->', err);
            return next(err);
        });
});


/*
 * [PUT] 更新產品資料資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.delete('/', (req, res, next) => {

    debug('[DELETE] 刪除產品資料 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid'] );
    if(!miss.check){
        debug('[POST] 新增產品資料 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db operation
    Product.findOneAndRemove( { _id: req.body.uid })
        .removeAsync()
        .then( result => {
            debug('[DELETE] 刪除產品資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[DELETE] 刪除產品資料 fail ->', err);
            return next(err);
        });
});


/*
 * [GET] 取得產品資料
 * request :
 * respone : db result
 */
router.get('/all', (req, res, next) => {

    debug('[GET] 取得產品資料');

     //db operation
    Product.find({})
        .sort({ pid: 1 })
        .execAsync()
        .then( result => {
            debug('[GET] 取得產品資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[GET] 取得產品資料 fail ->', err);
            return next(err);
        });
});

module.exports = router;
