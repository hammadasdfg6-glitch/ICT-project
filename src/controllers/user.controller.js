import { User } from "../models/users.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import appError from "../utils/appError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const getAuthCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
};

const getClearCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
    };
};

export const registerCustomer = catchAsync(async (req,res,next) => {
    const { name, email, password, phone } = req.body

    if(!email || !password){
        return next(new appError('Email and Password are required','Bad Request',400))
    }

    const existingUser = await User.findOne({ email })
    if(null !== existingUser){
        return next(new appError('User with this email already exists','Conflict',409))
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
        name,
        email,
        password: hashedPassword,
        phone: phone ? Number(phone) : undefined,
        role: 'customer'
    })

    await user.save()

    const token = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '7d' }
    )

    res.cookie('token', token, getAuthCookieOptions())

    return res.status(201).json({
        message: 'Customer successfully registered!',
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    })
})

export const registerAdmin = catchAsync(async (req,res,next) => {
    const { name, email, password, phone, adminSecret } = req.body

    if(!email || !password || !adminSecret){
        return next(new appError('Email, Password and Admin Secret Key are required','Bad Request',400))
    }

    if(process.env.ADMIN_SECRET !== adminSecret){
        return next(new appError('Invalid Admin Secret Key','Unauthorized',401))
    }

    const existingUser = await User.findOne({ email })
    if(null !== existingUser){
        return next(new appError('Admin with this email already exists','Conflict',409))
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = new User({
        name,
        email,
        password: hashedPassword,
        phone: phone ? Number(phone) : undefined,
        role: 'admin'
    })

    await admin.save()

    const token = jwt.sign(
        { _id: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '7d' }
    )

    res.cookie('token', token, getAuthCookieOptions())

    return res.status(201).json({
        message: 'Admin successfully registered!',
        success: true,
        token,
        user: {
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            role: admin.role
        }
    })
})

export const login = catchAsync(async (req,res,next) => {
    const { email, password } = req.body

    if(!email || !password){
        return next(new appError('Email and Password are required','Bad Request',400))
    }

    const user = await User.findOne({ email })
    if(null === user){
        return next(new appError('Invalid email or password','Unauthorized',401))
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return next(new appError('Invalid email or password','Unauthorized',401))
    }

    const token = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '7d' }
    )

    res.cookie('token', token, getAuthCookieOptions())

    return res.status(200).json({
        message: 'Successfully logged in!',
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    })
})

export const logout = catchAsync(async (req,res,next) => {
    const clearOptions = getClearCookieOptions();

    res.clearCookie('token', clearOptions)
    res.clearCookie('refreshToken', clearOptions)
    res.clearCookie('accessToken', clearOptions)
    res.clearCookie('jwt', clearOptions)

    return res.status(200).json({
        message: 'Successfully logged out!',
        success: true
    })
})

export const getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
        return next(new appError('User not found', 'Not Found', 404))
    }
    return res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    })
})
