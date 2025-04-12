const router = require("express").Router();
const dashboardController=require('../controller/DashBoardController');
const UserRequire = require("../middleware/UserRequire");


router.get(
  "/get-dashboard",
  UserRequire,
  dashboardController.getDashboardData
);

module.exports = router;
