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
// router.put('/addOne', (req, res, next) => {

//     debug('[PUT] 增加作業時間 req.body ->', req.body );

//     //check
//     let miss = check( req.body, ['uid', 'todoTime'] );
//     if(!miss.check){
//         debug('[PUT] 增加作業時間 miss data ->', miss.miss);
//         return res.status(500).send('缺少必要參數', miss.miss);
//     }

//     //db entity
//     let _id = req.body.uid.replace(/\"/g, '');
//     let newOne = req.body.todoTime;

//     //db operation
//      Job.findOne( { _id: _id } )
//         .execAsync()
//         .then( result => {
//             let tmp = result.todoTime;
//             tmp.push(newOne);
//             return Job.findOneAndUpdate( { _id: _id }, { todoTime: tmp } )
//                       .execUpdate();
//         })
//         .then( result => {
//             debug('[PUT] 增加作業時間 success ->', result);
//             res.json(result);
//         })
//         .catch( err => {
//             debug('[PUT] 增加作業時間 fail ->', err);
//             return next(err);
//         });
// });

/*
 * [PUT] 更新作業時間
 * request : body.uid, body.name, body.account, body.pwd, body.auth
 * respone : db result
 */
router.put('/todoTime', (req, res, next) => {

    debug('[PUT] 更新作業時間 req.body ->', req.body );

    //check
    let miss = check( req.body, ['oid', 'status', 'time', 'nTime', 'nStatus'] );
    if(!miss.check){
        debug('[PUT] 更新作業時間 miss data ->', miss.miss);
        return res.status(500).send('缺少必要參數', miss.miss);
    }

    var oldOne = {
        time : parseInt( req.body.time ),
        status : req.body.status
    };
    var newOne = {
        time : req.body.nTime,
        status : req.body.nStatus
    };

    //db entity
    var _id = req.body.oid; //改為使用 _id

    //db operation
     Job.findOne( { _id: _id } )
        .execAsync()
        .then( result => {

            let tmp = result.todoTime;


            for( var j = 0; j < tmp.length; j++){
                // console.log('test', tmp[j].time == oldOne.time,tmp[j].status === oldOne.status )
                if( tmp[j].time == oldOne.time && tmp[j].status === oldOne.status ){
                    tmp[j] = newOne;
                    console.log('tmp', tmp[j])
                    break;
                }
            }

            // console.log('存入資料', tmp.length, tmp);


            return Job.findOneAndUpdate( { _id: _id }, { todoTime: tmp } )
                      .updateAsync();
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