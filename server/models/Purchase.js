const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    supplierName: {
        type: String,
        required: [true, 'Supplier name is required'],
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
            purchasePrice: {
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
        enum: ['Cash', 'UPI', 'Card', 'Credit'],
        default: 'Cash'
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Purchase', purchaseSchema);