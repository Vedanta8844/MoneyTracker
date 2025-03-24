const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const TransactionSchema = new Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    datetime: { type: Date, required: true },
});


const TransactionModel = model('Transaction', TransactionSchema);

module.exports = TransactionModel;