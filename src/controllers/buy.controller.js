import { Product } from "../models/product.model.js";
import { Order } from "../models/orders.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import appError from "../utils/appError.js";
import redis from "../config/redis.config.js";
import { createCheckoutSession } from "./checkout.js";
import Stripe from "stripe";

export const addToCart = catchAsync(async(req,res,next) => {
    
    const {_id, name, quantity = 1} = req.body
    let query = {}
    if(_id) query._id = _id
    else if(name) query.name = name
    else return next(new appError('Product ID or Name is required', 'Bad Request', 400))

    const product = await Product.findOne(query)
    if(null === product){
        return next(new appError('Product not Found!','Not Found',404))
    }
    if(product.status === 'Out of Stock'){
        return next(new appError('Product is Out of stock at the moment','Bad request',400))
    }
    if(Number(quantity) > product.quantity){
        return next(new appError('Not Enough Quantity Available','Bad Request',400))
    }

    const cacheKey = `cart:${req.user.email}`
    const cached = await redis.lrange(cacheKey, 0, -1)
    let cart = cached && 0 < cached.length ? cached.map(item => JSON.parse(item)) : []

    const existingIndex = cart.findIndex(item => item._id === product._id.toString())
    if(-1 < existingIndex){
        const newQty = cart[existingIndex].quantity + Number(quantity)
        if(newQty > product.quantity){
            return next(new appError(`Cannot add more. Only ${product.quantity} items available in stock.`, 'Bad Request', 400))
        }
        cart[existingIndex].quantity = newQty
        cart[existingIndex].price = product.price
        cart[existingIndex].name = product.name
        cart[existingIndex].img_url = product.img_url
    } else {
        cart.push({
            _id: product._id.toString(),
            name: product.name,
            price: product.price,
            img_url: product.img_url,
            quantity: Number(quantity)
        })
    }

    await redis.del(cacheKey)
    await redis.rpush(cacheKey, ...cart.map(item => JSON.stringify(item)))
    await redis.expire(cacheKey, 86400)
    return res.status(201).json({
        message: 'Product Successfully Added to Cart',
        success: true,
        cart
    })
})

export const getCart = catchAsync(async (req,res,next) => {
    if(!req.user.email){
        return next(new appError('Email is Required','Bad Request',400))
    }
    const cacheKey = `cart:${req.user.email}`
    const cached = await redis.lrange(cacheKey,0,-1)
    if(!cached || 0 === cached.length){
        return res.status(200).json({
            message: 'Cart is Empty',
            success: true,
            cart: []
        })
    }
    const cart = cached.map(item => JSON.parse(item))
    return res.status(200).json({
        message: 'Successfully get the cart',
        success: true,
        cart
    })
})

export const checkout = catchAsync(async (req,res,next) => {
    const cacheKey = `cart:${req.user.email}`
    const cached = await redis.lrange(cacheKey, 0, -1)
    if (!cached || cached.length === 0) {
        return res.status(400).json({
            message: 'Cart is Empty',
            success: false
        })
    }
    const prod = cached.map(item => JSON.parse(item))
    const newCart = await Promise.all(prod.map(async (item) => {
        const product = await Product.findOne({_id:item._id}).lean()
        if(null === product){
            return null
        }
        else{
            product.buyQty = item.quantity
            return product
        }
    }))

    const validProducts = newCart.filter(item => null !== item)
    if(0 === validProducts.length) {
        return next(new appError('Products are not Available','Not Found', 404))
    }

    const { address, city, postalCode, phone, name } = req.body || {}
    let originUrl = req.headers.origin || ''
    if (!originUrl && req.headers.referer) {
        try {
            originUrl = new URL(req.headers.referer).origin
        } catch {
            originUrl = ''
        }
    }
    const session = await createCheckoutSession(
        validProducts,
        cacheKey,
        req.user.email,
        { address, city, postalCode, phone: phone || req.user.phone, name: name || req.user.name },
        originUrl
    )

    
    return res.status(200).json({
        message: 'Sucessfully purchased',
        success: 'true',
        url: session.url
    })
})

export const delCart = catchAsync(async (req,res,next) => {
    const cacheKey = `cart:${req.user.email}`
    const cached = await redis.lrange(cacheKey,0,-1)
    if(!cached || 0 === cached.length){
        return res.status(400).json({
            message: 'Cart is Empty',
            success: false
        })
    }
    const cart = cached.map(item => JSON.parse(item))
    const {id} = req.params
    if(!id){
        return next(new appError('Data is missing', 'Bad request', 400))
    }
    const isProductExists = cart.some(item => item._id === id)

    if(!isProductExists){
        return next(new appError('Product is not in cart', 'Not Found', 404))
    }

    const updatedCart = cart.filter(item => item._id !== id)
    await redis.del(cacheKey)
    if(0 < updatedCart.length){
        await redis.rpush(cacheKey,...updatedCart.map(item => JSON.stringify(item)))
        await redis.expire(cacheKey,86400)
    }

    return res.status(200).json({
        message: 'Product deleted Successfully',
        success: true
    })

})

export const confirmSession = catchAsync(async (req, res, next) => {
    const { session_id } = req.query;
    if (!session_id) {
        return res.status(400).json({ message: 'Session ID is required', success: false });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Payment not completed', success: false });
    }

    const metadata = session.metadata || {};
    const email = metadata.email || req.user?.email || session.customer_details?.email || session.customer_email || "customer@example.com";
    
    let existingOrder = await Order.findOne({ stripeSessionId: session.id });
    if (!existingOrder) {
        const purchasedItems = metadata.items ? JSON.parse(metadata.items) : [];
        const totalQty = purchasedItems.reduce((acc, item) => acc + item.buyQty, 0);

        let fullAddress = metadata.address || session.customer_details?.address?.line1 || "Online Delivery";
        if (metadata.city && !fullAddress.includes(metadata.city)) fullAddress += `, ${metadata.city}`;
        if (metadata.postalCode && !fullAddress.includes(metadata.postalCode)) fullAddress += ` ${metadata.postalCode}`;

        for (const item of purchasedItems) {
            if (item._id) {
                await Product.findByIdAndUpdate(item._id, {
                    $inc: { quantity: -item.buyQty }
                });
            }
        }

        existingOrder = await Order.create({
            stripeSessionId: session.id,
            product: purchasedItems.map(item => item.name),
            productId: purchasedItems.map(item => item._id),
            quantity: totalQty === 0 ? 1 : totalQty,
            price: session.amount_total / 100,
            Address: fullAddress,
            phone: metadata.phone ? parseInt(metadata.phone) : (session.customer_details?.phone ? parseInt(session.customer_details.phone) : 0),
            email,
            status: "confirmed"
        });
        if (metadata.cacheKey) await redis.del(metadata.cacheKey);
        await redis.del(`orders:${email}`);
    }

    return res.status(200).json({
        message: 'Order confirmed successfully',
        success: true,
        order: existingOrder
    });
});
