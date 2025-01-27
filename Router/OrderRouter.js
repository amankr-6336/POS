const router=require('express').Router();
const OrderController=require('../controller/OrderController');
const UserRequire = require('../middleware/UserRequire');

router.post('/create-order', UserRequire, OrderController.createOrder);
router.get('/get-order', UserRequire ,OrderController.getAllOrders);
router.post('/update-order', UserRequire,OrderController.OrderStatusChange);


module.exports=router;