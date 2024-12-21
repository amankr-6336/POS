const router=require('express').Router();
const TableController=require('../controller/TableController');


router.post('/create-table',TableController.CreateTable);

module.exports=router;

