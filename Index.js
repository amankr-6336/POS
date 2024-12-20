const express=require("express");
const DbConnect=require('./DbConnect');


const app=express();

const PORT=4001;
DbConnect();


app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`);
})
