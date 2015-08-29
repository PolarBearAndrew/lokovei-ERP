//express
let express = require('express');
let router = express.Router();

//debug
let debug = require('debug')('API:user');

//model
let Customer = require('../models/customer.js');

//feature
//let postMan = require('../feature/mail.js');
let checkPorperty = require('../feature/checkProperty.js');
let check = checkPorperty.check;

//=======================================================

/*
 * [POST] 新增經銷商
 * request : no
 * respone : db result
 */
router.post('/', (req, res, next) => {

    debug('[POST] 新增經銷商 req.body ->', req.body );

    let customer = new Customer({
        name: '',
        address: '',
        phone: '',
        who: ''
    });

    //db operation
    customer.saveAsync()
        .spread( result => {
            debug('[POST] 新增經銷商 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[POST] 新增經銷商 fail ->', err);
            return next(err);
        });
});

/*
 * [PUT] 更新經銷商資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/', (req, res, next) => {

    debug('[PUT] 更新經銷商資料 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid', 'name', 'address', 'phone', 'who'] );
    if(!miss.check){
        debug('[POST] 新增經銷商 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = {
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        who: req.body.who
    };


    //db operation
    Customer.findOneAndUpdate( { _id: req.body.uid }, info)
            .updateAsync()
            .then( result => {
                debug('[PUT] 更新經銷商資料 success ->', result);
                res.json(result);
                return;
            })
            .catch( err => {
                debug('[PUT] 更新經銷商資料 fail ->', err);
                return next(err);
            });
});


/*
 * [PUT] 更新經銷商資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.delete('/', (req, res, next) => {

    debug('[DELETE] 刪除經銷商 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid'] );
    if(!miss.check){
        debug('[POST] 新增經銷商 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db operation
    Customer.findOneAndRemove( { _id: req.body.uid })
            .removeAsync()
            .then( result => {
                debug('[DELETE] 刪除經銷商 success ->', result);
                res.json(result);
                return;
            })
            .catch( err => {
                debug('[DELETE] 刪除經銷商 fail ->', err);
                return next(err);
            });
});


/*
 * [PUT] 更新經銷商資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.get('/', (req, res, next) => {

    debug('[DELETE] 查詢指定經銷商 req.body ->', req.body );

    //check
    let miss = check( req.query, ['name'] );
    if(!miss.check){
        debug('[POST] 查詢指定經銷商 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db operation
    Customer.find()
            .where('name').equals(req.query.name)
            .then( result => {

                res.json( result );
            })
            .catch( err => {
                debug('[DELETE] 查詢指定經銷商 fail ->', err);
                return next(err);
            });
});

/*
 * [PUT] 取得經銷商資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.get('/all', (req, res, next) => {

    debug('[DELETE] 查詢經銷商 req.body ->', req.body );

    //db operation
    Customer.find({})
            .execAsync()
            .then( result => {
                debug('[DELETE] 查詢指定經銷商 success ->', result);
                res.json( result );
            })
            .catch( err => {
                debug('[DELETE] 查詢經銷商 fail ->', err);
                return next(err);
            });
});


module.exports = router;
