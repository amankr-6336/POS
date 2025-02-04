const router = require('express').Router();
const otpController=require('../controller/OtpController')

router.post("/send-otp", otpController.otpgenController); 
router.post("/verify-otp", otpController.verifyOtpController);  

module.exports = router;
