import Redis from "ioredis"

const redis = new Redis({
    host:process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3
})

redis.on('error',error => console.log(error))
redis.on('connect', ()=> console.log('Successfully Connected to Redis'))

export default redis