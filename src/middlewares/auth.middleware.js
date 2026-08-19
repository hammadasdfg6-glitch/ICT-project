import jwt from "jsonwebtoken";
import appError from "../utils/appError.js";

export const authenticate = (req,res,next) => {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null)

    if(!token){
        return next(new appError('Please log in to access this resource','Unauthorized',401))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey')
        req.user = decoded
        next()
    } catch (err) {
        return next(new appError('Invalid or expired token','Unauthorized',401))
    }
}

export const restrictTo = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new appError('You do not have permission to perform this action','Forbidden',403))
        }
        next()
    }
}
