const router = require("express").Router();
const CategoryController = require("../controller/CategoryController");
const UserRequire = require("../middleware/UserRequire");

router.post(
  "/create-category",
  UserRequire,
  CategoryController.createCategoryController
);
router.get(
  "/get-categories",
  UserRequire,
  CategoryController.getListOfCategoryController
);

module.exports = router;
