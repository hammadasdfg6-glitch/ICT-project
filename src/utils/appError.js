class appError extends Error{
    constructor(message,status,statusCode){
        super(message)
        this.message = message
        this.status = status
        this.statusCode = statusCode
        Error.captureStackTrace(this,this.constructor)
    }
}
export default appError