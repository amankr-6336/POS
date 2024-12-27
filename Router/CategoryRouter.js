const router=require('express').Router();
const CategoryController=require('../controller/CategoryController');


router.post('/create-category',CategoryController.createCategoryController);
router.get('/get-categories',CategoryController.getListOfCategoryController);

module.exports=router;
