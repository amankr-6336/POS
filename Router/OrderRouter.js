const router=require('express').Router();
const OrderController=require('../controller/OrderController');

router.post('/create-order',OrderController.createOrder);


module.exports=router;