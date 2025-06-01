const Redis=require('ioredis');

const redis = new Redis({
    host:'127.0.0.1',
    port: 6379,

    retryStrategy(times){
         return Math.min(times*50, 2000)
    }
})

redis.on('connect',()=>{
    console.log('redis connected');
})

redis.on('error',(err)=>{
    console.log('redis error',err);
})


module.exports=redis;