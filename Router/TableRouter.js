const router=require('express').Router();
const TableController=require('../controller/TableController');


router.post('/create-table',TableController.CreateTableController);
router.get('/get-table',TableController.getTablesController);

module.exports=router;

