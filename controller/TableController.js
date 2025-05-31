const QRCode=require('qrcode');
const Table=require('../Model/Table');
const Restaurant=require('../Model/Restaurant');
const { error, success } = require('../Utils/Utils');

const CreateTableController=async(req,res)=>{
   const {restroId,tableNumber,tableCapacity}=req.body;
   const qrCodeData= `http://localhost:3000/${restroId}/${tableNumber}`;
   const qrCode= await QRCode.toDataURL(qrCodeData);
   
   try {
      const restaurant=await Restaurant.findById(restroId);

      const table=await Table.create({restroId,tableNumber,tableCapacity,qrCode});
   
      const savedTable = await table.save();
      restaurant.tables.push(savedTable._id);
      await restaurant.save();

      return res.send(success(201,{message:"table created",savedTable}));

   } catch (error) {
      return res.send(501,"error");
   }
}

const getTablesController=async (req,res)=>{
   const { restaurantId } = req.query; // Assuming the restaurant ID is passed as a URL parameter
    console.log(restaurantId);
    try {
        // Validate the input
        if (!restaurantId) {
            return res.status(400).send(error(400, "Restaurant ID is required"));
        }

        // Find tables for the specified restaurant
        const tables = await Table.find({ restroId: restaurantId }).populate('currentOrderId').lean();
       
        // Check if tables are found
      //   if (!tables || tables.length === 0) {
      //       return res.status(404).send(error(404, "No tables found for the specified restaurant"));
      //   }

        // Send the response
        return res.status(200).send(success(200, { message: "Tables fetched successfully", tables }));
      }
      catch (err) {
         return res.status(500).send(error(500, "An error occurred while fetching tables"));
     }
}

const getTableInformation=async (req,res)=>{
   const {restaurantId,tableNumber}=req.query;

   try {
      const table=await Table.findOne({restaurantId,tableNumber}).populate('currentOrderId');
      const restro =await Restaurant.findById(restaurantId);

      return res.send(success(200,{message:"okay",table,restro}))

   } catch (error) {
      return res.send(500,error);
   }
}

module.exports={CreateTableController,getTablesController,getTableInformation};