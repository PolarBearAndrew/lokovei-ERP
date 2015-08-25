//let config = require('../config-ip.js');
//let path = config.path.db;

let mongoose = require('mongoose').connect( 'mongodb://127.0.0.1' + ':27017/lokovei'),
    db = mongoose.connection;

//promisify
let Promise = require("bluebird");
Promise.promisifyAll(mongoose);

//exports model
module.exports = { mongoose: mongoose, db: db };
