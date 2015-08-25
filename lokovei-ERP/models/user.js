//mongoose
var link = require('./linkDB.js');
var mongoose = link.mongoose;
var db = link.db;

/*
 *  Schema of User
 */
var User = new mongoose.Schema({
    name: {
        type: String
    },
    account: {
        type: String
    },
    pwd: {
        type: String,
        default: '123'
    },
    auth: {
        type: String,
        default: '員工'
    }
});

//exports model
module.exports = db.model('user', User);
