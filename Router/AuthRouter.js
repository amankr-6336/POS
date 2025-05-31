const router=require("express").Router();
const autControllerLogin=require('../controller/AuthController')
const autControllerSignup=require('../controller/AuthController');
const refreshController=require('../controller/AuthController');
const UserRequire = require("../middleware/UserRequire");

router.post('/signup',autControllerSignup.SignUpController);
router.post('/google/signup/',autControllerSignup.signInGoogleController);
router.post('/login', autControllerLogin.LoginController);
router.get('/refresh',refreshController.refreshAccessTokenController);
router.post('/logout',autControllerLogin.logoutController);


module.exports=router;