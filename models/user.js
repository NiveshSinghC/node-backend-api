const mongoose = require('mongoose');
const config = require('../config/database');

// User Schema
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imageName: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String
        // required: true
    },
    fullDescription: {
        type: String
        // required: true
    },
    features: {
        type: String
        // required: true
    },
    category: {
        type: String,
        required: true
    },
    size: {
        type: String
    },
    subcategory: {
        type: String,
        required: true
    },
    shopid:{
        type: String,
        required: true
    },
    shopname:{
        type: String,
        required: true
    },
    shopadd: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    review: {
        type: Array,
        // required: true
    }

});


const items = module.exports = mongoose.model('items', UserSchema, 'items');

module.exports.product = function(callback) {

    items.find({}, callback);
}

module.exports.subcatproducts = function(subcat, page, limit, callback) {
    const cursor = items.find({'subcategory':subcat});
    cursor.skip(page*limit).limit(limit).exec(callback);
}

module.exports.item = function(id, callback) {

    items.findOne({ '_id': '' + id + '' }, callback);
}

module.exports.view = function(id, callback) {

    items.findOne({ '_id':'' + id + '' }, callback);
}

module.exports.addProduct = function(newProduct, callback) {
    newProduct.save(callback);
}

module.exports.search = function(query, proj) {
    return items.find(query, proj);
}

module.exports.countPage = function(query){
    return new Promise((resolve, reject) => {
        items.count(query).then(count => {
            resolve(count);
        })
        .catch(err => {
            reject(err);
        });
    });
}