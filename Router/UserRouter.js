
const router=require("express").Router();
const UserController=require('../controller/UserController');
const UserRequire=require("../middleware/UserRequire")

router.get('/getownerinfo',UserRequire,UserController.getOwnerInfo);

module.exports=router;