const Activity = require("../models/activity.model");
const convertNumber = require("../utils/convertNumber");
const mongoose = require("mongoose");

const createActivity = async (req, res, next) => {
  const { title, activityType, questions, timer, impressions } = req.body;

  if (!title || !activityType || !questions) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the required fields",
    });
  }

  try {
    const activityQuestions = questions.map(({ question, options }) => {
      if (!question || !options || options.length === 0) {
        throw new Error("Each question must have text and at least one option");
      }

      const formattedOptions = options.map(
        ({ type: optionType, text, imageUrl, isCorrect }) => {
          if (!optionType || !text) {
            throw new Error("Each option must have type and text");
          }
          return { optionType, text, imageUrl, isCorrect };
        }
      );

      return { question, options: formattedOptions };
    });

    const activity = new Activity({
      title,
      activityType,
      creator: req.userId,
      questions: activityQuestions,
      timer,
      impressions,
    });

    await activity.save();
    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: activity,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const modifyActivity = async (req, res, next) => {
  const { activityId } = req.params;
  const { title, activityType, questions, timer, impressions } = req.body;

  if (!activityId) {
    return res.status(400).json({
      success: false,
      message: "Activity ID is required",
    });
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (activityType) updateFields.activityType = activityType;
  if (questions) {
    try {
      updateFields.questions = questions.map(({ question, options }) => {
        if (!question || !options || options.length === 0) {
          throw new Error(
            "Each question must have text and at least one option"
          );
        }

        const formattedOptions = options.map(
          ({ type: optionType, text, imageUrl, isCorrect }) => {
            if (!optionType || !text) {
              throw new Error("Each option must have type and text");
            }
            return { optionType, text, imageUrl, isCorrect };
          }
        );

        return { question, options: formattedOptions };
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  if (timer !== undefined) updateFields.timer = timer;
  if (impressions !== undefined) updateFields.impressions = impressions;

  try {
    const updatedActivity = await Activity.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(activityId) },
      updateFields,
      { new: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data: updatedActivity,
    });
  } catch (error) {
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  const { activityId } = req.body;

  if (!activityId) {
    return res.status(400).json({
      success: false,
      message: "Activity ID is required",
    });
  }

  try {
    const deletedActivity = await Activity.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(activityId),
    });

    if (!deletedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  try {
    const agg = [
      { $match: { creator: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: "$impressions" },
          totalQuestions: { $sum: { $size: "$questions" } },
          totalQuizzesAndPolls: { $sum: 1 },
        },
      },
    ];

    const [analytics] = await Activity.aggregate(agg);

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "No activities found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activities fetched successfully",
      data: {
        totalImpressions: convertNumber(analytics.totalImpressions),
        totalQuestions: analytics.totalQuestions,
        totalQuizzesAndPolls: analytics.totalQuizzesAndPolls,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSingleActivityAnalytics = async (req, res, next) => {
  try {
    const { id: activityId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const validActivity = await Activity.findOne({
      _id: activityId,
      creator: userId,
    });

    if (!validActivity) {
      return res.status(404).json({
        success: false,
        message: "No activities found",
      });
    }

    const projection =
      validActivity.activityType === "quiz"
        ? {
            title: 1,
            "attempts.correctAnswers": 1,
            "attempts.wrongAnswers": 1,
            createdAt: 1,
            impressions: 1,
            totalAnswers: {
              $sum: ["$attempts.correctAnswers", "$attempts.wrongAnswers"],
            },
          }
        : {
            title: 1,
            "questions.options.text": 1,
            "questions.options.selectionCount": 1,
            createdAt: 1,
            impressions: 1,
          };

    const activityAnalytics = await Activity.findOne(
      { _id: activityId, creator: userId },
      projection
    );

    if (!activityAnalytics) {
      return res.status(404).json({
        success: false,
        message: "No activity analytics found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity fetched successfully",
      data: { activityAnalytics },
    });
  } catch (error) {
    next(error);
  }
};

const getTrendingQuiz = async (req, res, next) => {
  try {
    const trendingQuiz = await Activity.aggregate([
      { $sort: { impressions: -1 } },
      { $limit: 12 },
    ]);

    if (trendingQuiz.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No activities found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activities fetched successfully",
      data: { trendingQuiz },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  deleteActivity,
  modifyActivity,
  getAnalytics,
  getSingleActivityAnalytics,
  getTrendingQuiz,
};
