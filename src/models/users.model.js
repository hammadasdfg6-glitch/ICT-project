import mongoose from "mongoose"
import { Schema } from "mongoose"

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number
    },
    name: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin','customer'],
        default: 'customer',
        required: true
    }
})

export const User = mongoose.model('users',userSchema)