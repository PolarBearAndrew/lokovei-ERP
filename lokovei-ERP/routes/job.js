//express
let express = require('express');
let router = express.Router();

//debug
let debug = require('debug')('API:job');

//model
let Job = require('../models/job.js');

//feature
//let postMan = require('../feature/mail.js');
let checkPorperty = require('../feature/checkProperty.js');
let check = checkPorperty.check;

//=======================================================

/*
 * [POST] 新增作業
 * request : no
 * respone : db result
 */
router.post('/', (req, res, next) => {

    debug('[POST] 新增作業 req.body ->', req.body );

    let job = new Job({
        oid: '',
        pid: '',
        pSpec: '',
        count: '',
        battery: '',
        status: '',
        note: '',
        todoTime: [],
        line: ''
    });

    //db operation
     job.saveAsync()
        .spread( result => {
            debug('[POST] 新增作業 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[POST] 新增作業 fail ->', err);
            return next(err);
        });
});

/*
 * [PUT] 更新作業資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/', (req, res, next) => {

    debug('[PUT] 更新作業資料 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid', 'oid', 'pid', 'pSpec', 'count', 'battery', 'note', 'line'] );
    if(!miss.check){
        debug('[POST] 更新作業 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = {
        oid: req.body.oid,
        pid: req.body.pid,
        pSpec: req.body.pSpec,
        count: req.body.count.toString(),
        battery: req.body.battery,
        note: req.body.note,
        line: req.body.line
    };

    let _id = req.body.uid.replace(/\"/g, '');

    //db operation
     Job.findOneAndUpdate( { _id: _id }, info )
        .updateAsync()
        .then( result => {
            debug('[PUT] 更新作業資料 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[PUT] 更新作業資料 fail ->', err);
            return next(err);
        });
});


/*
 * [DELETE] 刪除作業資料
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.delete('/', (req, res, next) => {

    debug('[DELETE] 刪除作業 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid'] );
    if(!miss.check){
        debug('[POST] 新增作業 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    let _id = req.body.uid.replace(/\"/g, '');

    //db operation
     Job.findOneAndRemove( { _id: _id })
        .removeAsync()
        .then( result => {
            debug('[DELETE] 刪除作業 success ->', result);
            res.json(result);
            return;
        })
        .catch( err => {
            debug('[DELETE] 刪除作業 fail ->', err);
            return next(err);
        });
});


/*
 * [PUT] 增加作業時間
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/addOne', (req, res, next) => {

    debug('[PUT] 增加作業時間 req.body ->', req.body );

    //check
    let miss = check( req.body, ['uid', 'todoTime'] );
    if(!miss.check){
        debug('[PUT] 增加作業時間 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let _id = req.body.uid.replace(/\"/g, '');
    let newOne = req.body.todoTime;

    //db operation
     Job.findOne( { _id: _id } )
        .execAsync()
        .then( result => {
            let tmp = result.todoTime;
            tmp.push(newOne);
            return Job.findOneAndUpdate( { _id: _id }, { todoTime: tmp } )
                      .execUpdate();
        })
        .then( result => {
            debug('[PUT] 增加作業時間 success ->', result);
            res.json(result);
        })
        .catch( err => {
            debug('[PUT] 增加作業時間 fail ->', err);
            return next(err);
        });
});

/*
 * [PUT] 更新作業時間
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/addOne', (req, res, next) => {

    debug('[PUT] 更新作業時間 req.body ->', req.body );

    //check
    // let miss = check( req.body, ['uid', 'line', 'todoTime', 'status', 'nLine', 'nTodoTime', 'nStatus'] );
    let miss = check( req.body, ['uid', 'oldOne', 'newOne'] );
    if(!miss.check){
        debug('[PUT] 更新作業時間 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    // let oldOne = {
    //     line: req.body.line,
    //     todoTime: req.body.todoTime,
    //     status: req.body.status
    // };

    // let newOne = {
    //     line: req.body.nline,
    //     todoTime: req.body.ntodoTime,
    //     status: req.body.nstatus
    // }

    var oldOne = req.body.oldOne,
        newOne = req.body.newOne;

    //db entity
    var _id = req.body.uid;


    //db operation
     Job.findOne( { _id: _id } )
        .execAsync()
        .then( result => {

            let tmp = result.todoTime;

            tmp = tmp.filter( val => {
                return val != oldOne;
            });

            tmp.push(newOne);

            return Job.findOneAndUpdate( { _id: _id }, { todoTime: tmp } )
                      .execUpdate();
        })
        .then( result => {
            debug('[PUT] 更新作業時間 success ->', result);
            res.json(result);
        })
        .catch( err => {
            debug('[PUT] 更新作業時間 fail ->', err);
            return next(err);
        });
});


module.exports = router;