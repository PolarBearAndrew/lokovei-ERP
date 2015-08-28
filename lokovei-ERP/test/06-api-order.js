var route   = 'order';
var url     = 'http://localhost:8080/' + route;
var request = require('request');

//debug
var debug = require('debug')('TEST:order');

//init data
var initData = {
    oid: '',
    cName: '',
    cAddress: '',
    cPhone: '',
    cWho: '',
    count: '',
    orderDate: '',
    outputDate: '',
    status: '',
    jobID: [ 'job1' ]
};

var uid = null;
var Product = require('../models/order.js');

describe('[ (06) API unit test - order ]', () => {

    before( () => {

        return  Product.removeAsync({ oid: ''})
                      .then( result => {
                          return Product.removeAsync({name: ''});
                      })
                      .then( result => {

                      })
                      .catch( err=>{
                          debug('[ API unit test - order ] 資料初始化錯誤', err);
                      });
    });

    describe('正常操作測試', () => {

        it('[POST] 新增作業', done => {

            request({
                url: url + '/',
                method: 'POST',
                json: true,
                form: initData
            }, (err, res, data) => {

                //test api exist
                should.exist(data);
                should.not.exist(err);
                res.statusCode.should.equal(200);

                //test data
                Object.keys(initData).map(( key, index ) => {
                    if( key != 'count' && key != 'jobID' && key != 'oid')
                        data.should.have.property( key, '' );
                });

                uid = data._id.toString();
                initData.uid = data._id.toString();

                //set uid for next test
                return done();
            });
        });

        it('[PUT] 更新作業資料', done => {

            request({
                url: url + '/',
                method: 'PUT',
                json: true,
                form: initData
            }, (err, res, data) => {

                //test api exist
                should.exist(data);
                should.not.exist(err);
                res.statusCode.should.equal(200);

                //test data
                data.should.have.property( 'ok', 1 );
                data.should.have.property( 'nModified', 1 );
                data.should.have.property( 'n', 1 );

                //set uid for next test
                return done();
            });
        });

        it('[DELETE] 刪除作業', done => {

            request({
                url: url + '/',
                method: 'DELETE',
                json: true,
                form: { uid }
            }, (err, res, data) => {

                //test api exist
                should.exist(data);
                should.not.exist(err);
                res.statusCode.should.equal(200);

                //test data
                data.should.have.property( 'ok', 1 );
                data.should.have.property( 'n', 1 );

                //set uid for next test
                return done();
            });
        });
    });

    after( done => {

        return  Product.findOneAndRemove( { _id: uid } )
                        .removeAsync()
                        .then( result => {
                            done();
                        })
                        .catch( () => {
                            debug('[ API unit test - users ] 資料還原錯誤', err);
                        });
    });
});
