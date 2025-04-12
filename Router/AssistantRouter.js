const express = require("express");
const router = express.Router();
const { SmartMenuSearchController,recommendMenuByWeatherTime ,getTimeWeatherBasedRecommendationsController } = require("../controller/AssistantController");

router.post("/search", SmartMenuSearchController);
router.get("/recommend",getTimeWeatherBasedRecommendationsController)

module.exports = router;
