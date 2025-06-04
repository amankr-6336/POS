const mongoose=require("mongoose");
mongoose.set('strictQuery',true);
const { ServerApiVersion } = require('mongodb');


module.exports=async ()=>{
    const mongoURI=process.env.MONGO_URI_KEY

    try {
        const connect=await mongoose.connect(mongoURI, {serverApi: {
            version: ServerApiVersion.v1,
            // strict: true,
            deprecationErrors: true,
          }});

        console.log(`mongodb connected : ${connect.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}