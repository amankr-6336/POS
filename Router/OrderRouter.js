const router=require('express').Router();
const OrderController=require('../controller/OrderController');

router.post('/create-order',OrderController.createOrder);
router.get('/get-order',OrderController.getAllOrders);
router.post('/update-order',OrderController.OrderStatusChange);


module.exports=router;