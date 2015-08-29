//mongoose
var link = require('./linkDB.js');
var mongoose = link.mongoose;
var db = link.db;

/*
 *  Schema of Order
 */

var Battery = new mongoose.Schema({
    name:{
        type: String
    }
});

//exports model
module.exports = db.model('battery', Battery);
