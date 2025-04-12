const router=require("express").Router();
const menuDescription=require('../controller/MenuDescription');

router.post('/description',menuDescription);

module.exports=router;