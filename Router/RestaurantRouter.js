const router=require('express').Router();
const RestaurantController=require('../controller/RestaurantController');

router.post('/create-restro',RestaurantController.createRestaurant);

module.exports=router;