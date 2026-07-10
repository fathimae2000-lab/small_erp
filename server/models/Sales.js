const mongoose = require('mongoose');


const saleSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer name is required'],
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity cannot be less than 1']
            },
            price: {
                type: Number, 
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    paymentMode: {
        type: String,
        enum: ['Cash', 'UPI', 'Card'],
        default: 'Cash'
    },
    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sale', saleSchema);