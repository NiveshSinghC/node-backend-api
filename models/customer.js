const mongoose = require('mongoose');
const config = require('../config/database');


const CustomerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    uidentity: {
        type: String,
        required: true
    },
    contactno:{
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    gid: {
        type: String
    },
    guser: {
        type: Boolean
    },
    cart: {
        type: Array
    },
	historybuy: {
		type: Array
	},
	wishlist: {
		type: Array
	}
	

});

const custs = module.exports = mongoose.model('custs', CustomerSchema, 'userclient');

module.exports.getCustomer = function(email, callback) {

    custs.findOne({ 'email': '' + email + '' }, callback);

}

module.exports.getCustomerCart = function(id, callback) {

    custs.findOne({ '_id': '' + id + '' },{cart:1}, callback);

}

// get anything with this function 
module.exports.GET = function(id,projection = {}, callback) {
    custs.findOne({ '_id': '' + id + '' },projection, callback);
}

    
module.exports.getCustomerWishlist = function(id, callback) {
    
        custs.findOne({ '_id': '' + id + '' },{wishlist:1}, callback);
    
}
module.exports.addCustomer = function(newCustomer, callback) {
    newCustomer.save(callback);
}
