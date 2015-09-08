//express
let express = require('express');
let router = express.Router();

//debug
let debug = require('debug')('API:Battery');

//model
let Battery = require('../models/battery.js');

//feature
//let postMan = require('../feature/mail.js');
let checkPorperty = require('../feature/checkProperty.js');
let check = checkPorperty.check;

//=======================================================

/*
 * [POST] 新增電池
 * request : no
 * respone : db result
 */
router.post('/', (req, res, next) => {

    debug('[POST] 新增電池 req.body ->', req.body );

    let battery = new Battery({
        name: '',
        note: ''
    });

    //db operation
    battery.saveAsync()
            .spread( result => {
                debug('[POST] 新增電池 success ->', result);
                res.json(result);
                return;
            })
            .catch( err => {
                debug('[POST] 新增電池 fail ->', err);
                return next(err);
            });
});

/*
 * [PUT] 更新電池資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/', (req, res, next) => {

    debug('[PUT] 更新電池資料 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid', 'name', 'note'] );
    if(!miss.check){
        debug('[POST] 新增電池 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = {
        name: req.body.name,
        note: req.body.note
    };


    //db operation
    Battery.findOneAndUpdate( { _id: req.body.uid }, info)
        .updateAsync()
        .then( result => {
            debug('[PUT] 更新電池資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[PUT] 更新電池資料 fail ->', err);
            return next(err);
        });
});


/*
 * [DELETE] 刪除電池
 * request :
 * respone : db result
 */
router.delete('/', (req, res, next) => {

    debug('[DELETE] 刪除電池 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid'] );
    if(!miss.check){
        debug('[POST] 新增電池 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db operation
    Battery.findOneAndRemove( { _id: req.body.uid })
        .removeAsync()
        .then( result => {
            debug('[DELETE] 刪除電池 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[DELETE] 刪除電池 fail ->', err);
            return next(err);
        });
});


/*
 * [GET] 取得電池資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.get('/all', (req, res, next) => {

    debug('[GET] 取得電池資料 req.body ->', req.body );


    //db operation
    Battery.find({})
        .sort({ name: 1 })
        .execAsync()
        .then( result => {
            debug('[GET] 取得電池資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[GET] 取得電池資料 fail ->', err);
            return next(err);
        });
});


module.exports = router;
