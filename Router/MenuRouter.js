const router=require('express').Router();
const MenuController=require('../controller/MenuController');



router.post('/add-menu',MenuController.AddMenuController);
router.patch('/update-menu',MenuController.UpdateMenuInfoController);
router.delete('/delete-menu',MenuController.deletMenuController);


module.exports=router;
