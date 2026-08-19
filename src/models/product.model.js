import mongoose, { trusted } from "mongoose"

import { Schema } from "mongoose"

const productSchema = new Schema({
    img_url: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["Cricket","Football","Running","Yoga","Basketball"],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ["available","Out of Stock"],
        default: "available",
        required: true
    }
})

productSchema.index({category: 1})
productSchema.index({status: 1})

export const Product = mongoose.model("products",productSchema)