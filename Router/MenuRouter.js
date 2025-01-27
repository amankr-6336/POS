const router = require("express").Router();
const MenuController = require("../controller/MenuController");
const UserRequire = require("../middleware/UserRequire");

router.post("/add-menu", UserRequire, MenuController.AddMenuController);
router.patch(
  "/update-menu",
  UserRequire,
  MenuController.UpdateMenuInfoController
);
router.delete("/delete-menu", UserRequire, MenuController.deletMenuController);
router.get("/get-menu", UserRequire, MenuController.getMenuBasedOnCategory);

module.exports = router;
