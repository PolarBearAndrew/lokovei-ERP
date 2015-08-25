//express
let express = require('express');
let router = express.Router();

//debug
let debug = require('debug')('API:line');

//model
let Line = require('../models/line.js');

//feature
//let postMan = require('../feature/mail.js');
let checkPorperty = require('../feature/checkProperty.js');
let check = checkPorperty.check;

//=======================================================

/*
 * [POST] 新增產線
 * request : no
 * respone : db result
 */
router.post('/', (req, res, next) => {

    debug('[POST] 新增產線 req.body ->', req.body );

    let line = new Line({
        name: '',
        who: '',
        phone: '',
        note: ''
    });

    //db operation
    line.saveAsync()
        .spread( result => {
            debug('[POST] 新增產線 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[POST] 新增產線 fail ->', err);
            return next(err);
        });
});

/*
 * [PUT] 更新產線資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/', (req, res, next) => {

    debug('[PUT] 更新產線資料 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid', 'name', 'phone', 'who', 'note'] );
    if(!miss.check){
        debug('[POST] 新增產線 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = {
        name: req.body.name,
        who: req.body.who,
        phone: req.body.phone,
        note: req.body.note
    };


    //db operation
    Line.findOneAndUpdate( { _id: req.body.uid }, info)
        .updateAsync()
        .then( result => {
            debug('[PUT] 更新產線資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[PUT] 更新產線資料 fail ->', err);
            return next(err);
        });
});


/*
 * [PUT] 更新產線資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.delete('/', (req, res, next) => {

    debug('[DELETE] 刪除產線 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid'] );
    if(!miss.check){
        debug('[POST] 新增產線 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db operation
    Line.findOneAndRemove( { _id: req.body.uid })
        .removeAsync()
        .then( result => {
            debug('[DELETE] 刪除產線 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[DELETE] 刪除產線 fail ->', err);
            return next(err);
        });
});


module.exports = router;
