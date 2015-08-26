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
        status: '',
        note: '',
        todoTime: '',
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
    let miss = check( req.body, ['uid', 'oid', 'pid', 'pSpec', 'count', 'status' , 'note', 'todoTime', 'line'] );
    if(!miss.check){
        debug('[POST] 更新作業 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    //db entity
    let info = {
        oid: req.body.oid,
        pid: req.body.pid,
        pSpec: req.body.pSpec,
        count: req.body.count,
        status: req.body.status,
        note: req.body.note,
        todoTime: req.body.todoTime,
        line: req.body.line,
        jobID: req.body.jobID
    };


    //db operation
    Job.findOneAndUpdate( { _id: req.body.uid }, info)
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
 * [PUT] 更新作業資料
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

    //db operation
    Job.findOneAndRemove( { _id: req.body.uid })
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


module.exports = router;
