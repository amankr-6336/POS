const router = require("express").Router();
const TableController = require("../controller/TableController");
const UserRequire = require("../middleware/UserRequire");

router.post(
  "/create-table",
  UserRequire,
  TableController.CreateTableController
);
router.get("/get-table", UserRequire, TableController.getTablesController);
router.get(
  "/get-single-table",
  UserRequire,
  TableController.getTableInformation
);

module.exports = router;
