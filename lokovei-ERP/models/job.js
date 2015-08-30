//mongoose
var link = require('./linkDB.js');
var mongoose = link.mongoose;
var db = link.db;

/*
 *  Schema of Order
 */

var Job = new mongoose.Schema({
    oid: {
        type: String
    },
    pid:{
        type: String
    },
    pSpec:{
        type: String
    },
    count:{
        type: String
    },
    battery:{
        type: String
    },
    note:{
        type: String
    },
    todoTime:{
        type: Array
    },
    status:{
        type: String
    },
    line:{
        type: String
    }
});

//exports model
module.exports = db.model('job', Job);
