import mongoose from "mongoose";
import { Schema } from "mongoose";

const orderSchema = new Schema({
    stripeSessionId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    product:{
        type: [String],
        required: true
    },

    productId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "products",
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['confirmed','shipping','delivering','delivered'],
        default: 'confirmed'
    }
},{timestamps: true})

export const Order = mongoose.model('orders',orderSchema)