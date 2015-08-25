//mongoose
var link = require('./linkDB.js');
var mongoose = link.mongoose;
var db = link.db;

/*
 *  Schema of User
 */
var Customer = new mongoose.Schema({
    name: {
        type: String
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    who: {
        type: String
    }
});

//exports model
module.exports = db.model('customer', Customer);
