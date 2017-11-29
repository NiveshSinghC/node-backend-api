const mongoose = require('mongoose');
const config = require('../config/database');

const ProductDet = {
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    size: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    shopname: {
        type: String,
        required: true
    },
    shopid: {
        type: String,
        required: true
    }
};


const CombineSchema = mongoose.Schema({
    orderid: {
        type: String,
        required: true
    },
    buyname: {
        type: String,
        required: true
    },
    buyadd: {
        type: String,
        required: true
    },
    orderdate: {
        type: String,
        required: true
    },
    buyconno: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'proccessing',
        required: true
    },
    product: ProductDet
});

const combine = module.exports = mongoose.model('combine', CombineSchema, 'combineOrder');

module.exports.NewOrder = function(order, callback) {
    order.save(callback);
}

module.exports.GetOrders = function(callback, query = {}, params ={} ) {
    combine.find(query, params, callback);
}

module.exports.UpdateStatus = function(id, status, callback){
    let query = {
        orderid: id
    };

    let doc = {
        status: status
    };
    combine.update(query, doc, callback);
}
