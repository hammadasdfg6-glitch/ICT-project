import { Order } from "../models/orders.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import appError from "../utils/appError.js";
import redis from "../config/redis.config.js";

export const searchOrder = catchAsync(async (req,res,next) => {
    const email = req.user?.email

    if(!email){
        return next(new appError('Unauthorized: User email not found','Unauthorized',401))
    }

    const cacheKey = `orders:${email}`
    const cached = await redis.get(cacheKey)
    if(cached){
        return res.status(200).json(JSON.parse(cached))
    }

    const order = await Order.find({ email }).sort({ createdAt: -1 }).lean()

    await redis.set(cacheKey,JSON.stringify({message: 'Successfully got the orders!',success: true,order}),'EX',60)

    return res.status(200).json({
        message: 'Successfully got the orders!',
        success: true,
        order
    })
})

export const markOrder = catchAsync(async (req,res,next) => {
    const { status, orderId } = req.body

    if(!status || !orderId){
        return next(new appError('Data is missing','Bad Request',400))
    }
    
    const order = await Order.findById(orderId)
    if(null === order){
        return next(new appError('Order not found!','Not Found',404))
    }
    order.status = status
    await order.save()
    await redis.del(`orders:${order.email}`)
    return res.status(200).json({
        message: 'Order Updated',
        success: true
    })
})

export const getAllOrders = catchAsync(async (req,res,next) => {
    const {status, createdAt} = req.query || {}
    const dbquery = {}
    if(status) dbquery.status = status
    if(createdAt) dbquery.createdAt = createdAt

    const orders = await Order.find(dbquery).sort({ createdAt: -1 }).lean()

    return res.status(200).json({
        message: "Orders Found",
        success: true,
        orders
    })
})