const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        unique: true, 
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true
        
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true
    },
    address: {
    type: String,
    trim: true,
    default: ""
},
    totalSpent: {
        type: Number,
        default: 0
    },
    ordersCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);