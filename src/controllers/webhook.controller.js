import Stripe from "stripe";
import { Order } from "../models/orders.model.js";
import { Product } from "../models/product.model.js";
import redis from "../config/redis.config.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

export const stripeWebhook = async (req,res,next) => {
    const sig = req.headers["stripe-signature"]
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event;

    try {
        if(endpointSecret && sig){
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
        } else {
            event = typeof req.body === "string" ? JSON.parse(req.body) : req.body
        }
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if("checkout.session.completed" === event.type){
        const session = event.data.object
        const metadata = session.metadata || {}
        
        const existingOrder = await Order.findOne({ stripeSessionId: session.id })
        if(!existingOrder){
            const purchasedItems = metadata.items ? JSON.parse(metadata.items) : []

            if(0 < purchasedItems.length){
                for (const item of purchasedItems){
                    if(item._id){
                        await Product.findByIdAndUpdate(item._id, {
                            $inc: { quantity: -item.buyQty }
                        })
                    }
                }
            }

            const totalQty = purchasedItems.reduce((acc,item) => acc + item.buyQty, 0)
            const email = metadata.email || session.customer_details?.email || session.customer_email || "customer@example.com"

            let fullAddress = metadata.address || session.customer_details?.address?.line1 || "Online Order"
            if (metadata.city && !fullAddress.includes(metadata.city)) fullAddress += `, ${metadata.city}`
            if (metadata.postalCode && !fullAddress.includes(metadata.postalCode)) fullAddress += ` ${metadata.postalCode}`

            await Order.create({
                stripeSessionId: session.id,
                product: purchasedItems.map(item => item.name),
                productId: purchasedItems.map(item => item._id),
                quantity: 0 === totalQty ? 1 : totalQty,
                price: session.amount_total / 100,
                Address: fullAddress,
                phone: metadata.phone ? parseInt(metadata.phone) : (session.customer_details?.phone ? parseInt(session.customer_details.phone) : 0),
                email,
                status: "confirmed"
            })

            await redis.del(`orders:${email}`)

            if(metadata.cacheKey){
                await redis.del(metadata.cacheKey)
            }
        }
    }

    return res.status(200).json({
        message: "Webhook processed successfully",
        success: true
    })
}
