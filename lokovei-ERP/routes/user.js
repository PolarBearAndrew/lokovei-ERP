//express
let express = require('express');
let router = express.Router();

//debug
let debug = require('debug')('API:user');

//model
let User = require('../models/user.js');

//feature
//let postMan = require('../feature/mail.js');
let checkPorperty = require('../feature/checkProperty.js');
let check = checkPorperty.check;

//=======================================================

/*
 * [POST] 新增使用者
 * request : no
 * respone : db result
 */
router.post('/', (req, res, next) => {

    debug('[POST] 新增使用者 req.body ->', req.body );

    let user = new User({
        name: '',
        account: '',
        pwd: '',
        auth: ''
    });

    //db operation
    user.saveAsync()
        .spread( result => {
            debug('[POST] 新增使用者 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[POST] 新增使用者 fail ->', err);
            return next(err);
        });
});

/*
 * [PUT] 更新使用者資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/', (req, res, next) => {

    debug('[PUT] 更新使用者資料 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid', 'name', 'account', 'pwd', 'auth'] );
    if(!miss.check){
        debug('[POST] 新增使用者 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = {
        name: req.body.name,
        account: req.body.account,
        pwd: req.body.pwd,
        auth: req.body.auth
    };


    //db operation
    User.findOneAndUpdate( { _id: req.body.uid }, info)
        .updateAsync()
        .then( result => {
            debug('[PUT] 更新使用者資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[PUT] 更新使用者資料 fail ->', err);
            return next(err);
        });
});


/*
 * [PUT] 更新使用者資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.delete('/', (req, res, next) => {

    debug('[DELETE] 刪除使用者 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid'] );
    if(!miss.check){
        debug('[POST] 新增使用者 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db operation
    User.findOneAndRemove( { _id: req.body.uid })
        .removeAsync()
        .then( result => {
            debug('[DELETE] 刪除使用者 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[DELETE] 刪除使用者 fail ->', err);
            return next(err);
        });
});


/*
 * [GET] 取得使用者資料
 * request :
 * respone : db result
 */
router.get('/all', (req, res, next) => {

    debug('[GET] 取得使用者資料 req.body ->', req.body );

    //db operation
    User.find({})
        .sort({ name: 1 })
        .execAsync()
        .then( result => {
            debug('[GET] 取得使用者資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[GET] 取得使用者資料 fail ->', err);
            return next(err);
        });
});





module.exports = router;
