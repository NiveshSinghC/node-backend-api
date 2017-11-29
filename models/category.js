const mongoose = require('mongoose');
const config = require('../config/database');

const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        requred: true
    },
    subcat: {
        type: Array
    }


});

const cat = module.exports = mongoose.model('cat', CategorySchema, 'category');

module.exports.addCategory = function(newCategory, callback) {
    newCategory.save(callback);
}
module.exports.addSubCategory = function(query, subcat, callback) {
    cat.update(query, subcat, callback);
}
module.exports.category = function(callback) {

    cat.find({}, callback);
}
module.exports.GiveCatDet = function(name,proj ={}, callback) {

    cat.findOne({ 'name': name },proj, callback);
}