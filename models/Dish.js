const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
    names: [{
        language: String,
        name: String
    }],
    descriptions: [{
        language: String,
        description: String
    }],
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    ingredients: {
        type: String,
        required: true
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
        updatedAt: {
        type: Date,
        default: Date.now
    },  
        deletedAt: {
        type: Date
    }
});
const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
