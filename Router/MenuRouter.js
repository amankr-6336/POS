const router=require('express').Router();
const MenuController=require('../controller/MenuController');


router.post('/add-menu',MenuController.AddMenuController);

module.exports=router;
