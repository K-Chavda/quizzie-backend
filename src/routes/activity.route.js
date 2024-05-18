const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activity.controller");
const verifyToken = require("../middlewares/verifyToken");

router.post("/create", verifyToken, activityController.createActivity);
router.post("/analytics", activityController.getAnalytics);
router.post("/trending", activityController.getTrendingQuiz);

module.exports = router;
