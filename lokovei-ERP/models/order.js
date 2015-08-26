//mongoose
var link = require('./linkDB.js');
var mongoose = link.mongoose;
var db = link.db;

/*
 *  Schema of Order
 */
var Order = new mongoose.Schema({
    orderId: {
        type: String
    },
    cName: {
        type: String
    },
    cAddress: {
        type: String
    },
    cPhone: {
        type: String
    },
    cWho: {
        type: String
    },
    count: {
        type: Number
    },
    orderDate:{
        type: String
    },
    outputDate:{
        type: String
    },
    status:{
        type: String
    },
    jobID:{
        type: Array
    }
});

//exports model
module.exports = db.model('order', Order);
