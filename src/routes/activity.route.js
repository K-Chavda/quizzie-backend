const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activity.controller");
const verifyToken = require("../middlewares/verifyToken");

router.post("/create", verifyToken, activityController.createActivity);
router.delete("/:id", verifyToken, activityController.deleteActivity);
router.patch("/:id", verifyToken, activityController.modifyActivity);
router.post("/analytics", verifyToken, activityController.getAnalytics);
router.post(
  "/analytics/:id",
  verifyToken,
  activityController.getSingleActivityAnalytics
);
router.post("/trending", verifyToken, activityController.getTrendingQuiz);
router.post("/activities", verifyToken, activityController.getAllActivities);

module.exports = router;
