var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

var routes   = require('./routes/routes');

var job      = require('./routes/job');
var user     = require('./routes/user');
var line     = require('./routes/line');
var order    = require('./routes/order');
var battery  = require('./routes/battery');
var product  = require('./routes/product');
var customer = require('./routes/customer');

var debug = require('debug')('API:app.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'asset')));

//這個需要更瞭解才行
app.use(session({
    secret: 'keyboard cat',
    cookie: { maxAge: 1000 * 60 * 15 * 2 }, // 30min
    resave: true,
    saveUninitialized: true
}))

//set haeder
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

/*
 * [POST] 登入 api
 * request : no
 * respone : db result
 */
app.post('/login', (req, res, next) => {

    // 直接先鎖定
    req.session.login = false;

    let User = require('./models/user.js');//model
    debug('[POST] 登入 req.body ->', req.body );

    //db operation
    User.findOne()
        .where('account').equals(req.body.account)
        .where('pwd').equals(req.body.pwd)
        .then( result => {
            debug('[POST] 登入 success ->', result);

            if( result._id ){
                req.session.login = true;
                res.json({ login: 'success', name: result.name, auth: result.auth });
            }else{
                req.session.login = false;
                res.json({ login: 'fail' });
            }
        })
        .catch( err => {
            debug('[POST] 登入 fail ->', err);
            return next(err);
        });
});

app.use( (req, res, next) => {

    if(true){
        return next();
    }

    // fail
    if(!req.session.login){
        req.session.login = false;
        return res.render('index');
    }

    // success
    if( req.session.login === true ){
        req.session.touch();
        req.session.login = true; //reset
        console.log('req.session', req.session);
        return next();
    }
})

app.use('/', routes);

app.use('/job', job);
app.use('/user', user);
app.use('/line', line);
app.use('/order', order);
app.use('/battery', battery);
app.use('/product', product);
app.use('/customer', customer);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



var port = 80;
// var port = 8080;
app.listen( port, console.log('server listening on %d', port) );

module.exports = app;
