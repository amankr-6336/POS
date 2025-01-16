const router=require('express').Router();
const TableController=require('../controller/TableController');


router.post('/create-table',TableController.CreateTableController);
router.get('/get-table',TableController.getTablesController);
router.get('/get-single-table',TableController.getTableInformation)

module.exports=router;

