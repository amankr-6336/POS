
const router=require("express").Router();
const UserController=require('../controller/UserController');
const UserRequire=require("../middleware/UserRequire")

router.get('/getownerinfo',UserRequire,UserController.getOwnerInfo);
router.post('/setToken',UserController.registerFcmToken)

module.exports=router;