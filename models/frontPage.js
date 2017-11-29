const mongoose = require('mongoose');
const config = require('../config/database');

const products = {
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    imageName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        required: true
    }
};

const FrontPageSchema = mongoose.Schema({
    field: {
        type: String,
        required: true
    },
    items: [products]
});

const frontpage = module.exports = mongoose.model('frontpage', FrontPageSchema, 'frontPage');