const router=require('express').Router();
const RestaurantController=require('../controller/RestaurantController');

router.post('/create-restro',RestaurantController.createRestaurantController);
router.get('/get-restro',RestaurantController.getRestaurantInfoController);

module.exports=router;