const router=require('express').Router();
const RestaurantController=require('../controller/RestaurantController');
const UserRequire = require('../middleware/UserRequire');

router.post('/create-restro', UserRequire,RestaurantController.createRestaurantController);
router.get('/get-restro',UserRequire ,RestaurantController.getRestaurantInfoController);

module.exports=router;