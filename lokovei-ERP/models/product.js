//mongoose
var link = require('./linkDB.js');
var mongoose = link.mongoose;
var db = link.db;

/*
 *  Schema of Product
 */
var Product = new mongoose.Schema({
    pid: {
        type: String
    },
    spec: {
        type: String
    },
});

//exports model
module.exports = db.model('product', Product);
