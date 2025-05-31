const mongoose=require("mongoose");
mongoose.set('strictQuery',true);
const { ServerApiVersion } = require('mongodb');


module.exports=async ()=>{
    const mongoURI="mongodb+srv://amankr63366:Callofduty@clusterpos.qhucb.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPOS"

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