const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activity.controller");
const verifyToken = require("../middlewares/verifyToken");

router.get("/:id", activityController.getActivityData);
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
router.put(
  "/activities/:id/questions/:questionId/increase-impression",
  activityController.increaseQuestionImpression
);
router.put(
  "/activities/:id/questions/:questionId/option/:optionId/increase-selection-count",
  activityController.increaseOptionSelectionCount
);
router.put(
  "/activities/:id/questions/:questionId/increase-answer-count/:type",
  activityController.increaseAnswerCount
);

module.exports = router;
