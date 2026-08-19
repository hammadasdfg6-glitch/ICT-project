import appError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/orders.model.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

export const createCheckoutSession = async (products, cacheKey, userEmail, shippingDetails = {}) => {
    const total = products.reduce((acc,item) => {return acc + (Math.round(item.price * 100) * item.buyQty)}, 0 )

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: userEmail,
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:9000'}/booking-success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:9000'}/booking-cancelled.html`,
        line_items: products.map((item) => ({
            price_data: {
                currency: 'pkr',
                product_data: {
                    name: item.name,
                    description: item.description,
                    images: item.img_url ? [item.img_url] : [],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.buyQty
        })),
        metadata: {
            cacheKey: cacheKey,
            email: userEmail,
            name: shippingDetails.name || '',
            phone: shippingDetails.phone ? String(shippingDetails.phone) : '',
            address: shippingDetails.address || 'Online Order',
            city: shippingDetails.city || '',
            postalCode: shippingDetails.postalCode || '',
            items: JSON.stringify(products.map(p => ({
                _id: p._id ? p._id.toString() : '',
                name: p.name,
                buyQty: p.buyQty,
                price: p.price
            })))
        }
    })
    return session
}