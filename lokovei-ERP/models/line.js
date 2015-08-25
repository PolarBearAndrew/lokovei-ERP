//mongoose
var link = require('./linkDB.js');
var mongoose = link.mongoose;
var db = link.db;

/*
 *  Schema of User
 */
var Line = new mongoose.Schema({
    name: {
        type: String
    },
    who: {
        type: String
    },
    phone: {
        type: String
    },
    note: {
        type: String
    }
});

//exports model
module.exports = db.model('line', Line);
