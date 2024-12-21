const QRCode=require('qrcode');
const Table=require('../Model/Table');
const { error, success } = require('../Utils/Utils');

const CreateTable=async(req,res)=>{
   const {restroId,tableNumber}=req.body;
   const qrCodeData= `http://localhost:3000/table/${tableNumber}`;
   const qrCode= await QRCode.toDataURL(qrCodeData);

   try {
      const table=await Table.create({restroId,tableNumber,qrCode});
   
      const savedTable = await table.save();

      return res.send(success(201,{message:"table created",savedTable}));

   } catch (error) {
      console.log(error);
      return res.send(501,"error");
   }
}

module.exports={CreateTable};