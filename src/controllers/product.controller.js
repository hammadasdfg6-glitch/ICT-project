import { Product } from "../models/product.model.js";
import redis from "../config/redis.config.js";
import { catchAsync } from "../utils/catchAsync.js";
import appError from "../utils/appError.js";

export const addProduct = catchAsync(async (req,res,next) => {
    if(!req.file && !req.body.img_url){
        return next(new appError('Product image is required','Bad Request',400))
    }

    const img_url = req.file ? req.file.path : req.body.img_url

    const productData = {
        ...req.body,
        img_url,
        price: Number(req.body.price),
        quantity: req.body.quantity ? Number(req.body.quantity) : 1
    }

    const product = new Product(productData)
    await product.save()
    const keys = await redis.keys('products:*')
    if(0 < keys.length) await redis.del(keys)
    return res.status(201).json({
        message: 'Successfully Added Product!',
        success: true,
        product
    })
})

export const getProducts = catchAsync( async (req,res,next) => {
    if(!req.query){
        return next(new appError('Data is missing','Parameters are missing',400))
    }
    
    const {name, category, price, quantity} = req.query

    const dbquery = {};
    
    if(name) dbquery.name = { $regex: name, $options: 'i' }
    if(category) dbquery.category = category
    if(price) dbquery.price = Number(price)
    if(quantity) dbquery.quantity = Number(quantity)

    if(0 === Object.keys(dbquery).length){
        const cacheKey = `products:all`
        const cached = await redis.get(cacheKey)
        if(cached){
            console.log('cache hit')
            return res.status(200).json(JSON.parse(cached))
        }
        const products = await Product.find()
        if(0 === products.length){
            return next(new appError('Products not Found!','Not Found',404))
        }
        await redis.set(cacheKey,JSON.stringify({message: 'Successfully got products',success: true, products}),'EX', 70)
        return res.status(200).json({
            message: "Successfully got products",
            success: true,
            products
        })
    }

    const cacheKey = `products:${JSON.stringify(dbquery)}`
        const cached = await redis.get(cacheKey)
        if(cached){
            console.log('cache hit')
            return res.status(200).json(JSON.parse(cached))
        }

    const products = await Product.find(dbquery)
    
    if(0 === products.length){
        return next(new appError('Products not Found!','Not Found',404))
    }

    await redis.set(cacheKey,JSON.stringify({message: 'Successfully got products',success: true, products}),'EX', 70)

    return res.status(200).json({
            message: "Successfully got products",
            success: true,
            products
        })
})

export const delProducts = catchAsync( async (req,res,next) => {
    if(!req.body){
        return next(new appError('Data is missing','Bad request',400))
    }

    const deletedproduct = await Product.findByIdAndDelete(req.body._id)
    if(!deletedproduct){
        return next(new appError('Product not Found','Not Found',404))
    }
    const keys = await redis.keys('products:*')
    if(0 < keys.length) await redis.del(keys)
    return res.status(200).json({
    message: 'Successfully Deleted Product',
    success: true
    })
})


export const updProducts = catchAsync( async (req,res,next) => {
    if(!req.body || !req.body._id){
        return next(new appError('Product ID is missing','Parameters are missing',400))
    }
    
    const { _id, name, category, price, quantity, img_url, status, description } = req.body

    const dbquery = {};
    
    if(name) dbquery.name = name.trim()
    if(category) dbquery.category = category
    if(price !== undefined && price !== '') dbquery.price = Number(price)
    if(quantity !== undefined && quantity !== '') dbquery.quantity = Number(quantity)
    if(req.file) dbquery.img_url = req.file.path
    else if(img_url) dbquery.img_url = img_url
    if(status) dbquery.status = status
    if(description !== undefined) dbquery.description = description

    const updatedproduct = await Product.findByIdAndUpdate(_id, dbquery, { new: true, runValidators: true })
    if(!updatedproduct){
        return next(new appError('Product not found','Not Found',404))
    }
    const keys = await redis.keys('products:*')
    if(0 < keys.length) await redis.del(keys)

    return res.status(200).json({
        message: 'Successfully Updated Product',
        success: true,
        product: updatedproduct
    })
})

    export const getProductById = catchAsync(async (req,res,next) => {
        if(!req.params.id){
            return next(new appError('Data is missing','Bad Request',400))
        }
        const product = await Product.findById(req.params.id)
        if(null === product){
            return next(new appError('Product not Found!','Not Found',404))
        }
        return res.status(200).json({
            message: 'Product found',
            success: true,
            product
        })
    })