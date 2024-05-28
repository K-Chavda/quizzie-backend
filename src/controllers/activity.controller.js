const Activity = require("../models/activity.model");
const convertNumber = require("../utils/convertNumber");
const mongoose = require("mongoose");

const getActivityData = async (req, res, next) => {
  const activityId = req.params.id;
  const activity = await Activity.findById(activityId);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: activity,
  });
};

const createActivity = async (req, res, next) => {
  const { title, activityType, questions } = req.body;

  if (!title || !activityType || !questions) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the required fields",
    });
  }

  try {
    const activity = new Activity({
      title,
      activityType,
      creator: req.userId,
      questions,
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
  const activityId = req.params.id;
  const { title, activityType, questions } = req.body;

  if (!activityId) {
    return res.status(400).json({
      success: false,
      message: "Activity ID is required",
      data: activityId,
    });
  }

  try {
    const updatedActivity = await Activity.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(activityId) },
      { title, activityType, questions },
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
  const activityId = req.params.id;

  if (!activityId) {
    return res.status(400).json({
      success: false,
      message: "Activity ID is required",
      activityId: req.params.id,
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
      { $unwind: "$questions" },
      {
        $group: {
          _id: "$_id",
          totalQuestions: { $sum: 1 },
          totalImpressions: { $sum: "$questions.impressions" },
        },
      },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: "$totalQuestions" },
          totalImpressions: { $sum: "$totalImpressions" },
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

    const projection = {
      title: 1,
      activityType: 1,
      "questions.question": 1,
      "questions.optionType": 1,
      "questions.options.text": 1,
      "questions.options.selectionCount": 1,
      "questions.options.imageUrl": 1,
      "questions.options._id": 1,
      "questions.correctAnswers": 1,
      "questions.wrongAnswers": 1,
      createdAt: 1,
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

    // Calculate the total of correct and wrong answers for each question
    const totalAnswers = activityAnalytics.questions.map((question) => {
      return {
        ...question._doc,
        totalAttempts: question.correctAnswers + question.wrongAnswers,
      };
    });

    res.status(200).json({
      success: true,
      message: "Activity fetched successfully",
      data: {
        activityAnalytics: {
          ...activityAnalytics._doc,
          questions: totalAnswers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTrendingQuiz = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
  try {
    const trendingQuiz = await Activity.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(userId) } },
      {
        $addFields: {
          totalImpressions: {
            $sum: "$questions.impressions",
          },
        },
      },
      { $sort: { totalImpressions: -1 } },
      { $limit: 12 },
      {
        $project: {
          title: 1,
          totalImpressions: 1,
          createdAt: 1,
          questions: 1,
        },
      },
    ]);

    if (trendingQuiz.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No activities found",
      });
    }

    // Format the totalImpressions using convertNumber()
    const formattedTrendingQuiz = trendingQuiz.map((activity) => ({
      ...activity,
      totalImpressions: convertNumber(activity.totalImpressions),
    }));

    res.status(200).json({
      success: true,
      message: "Activities fetched successfully",
      data: { trendingQuiz: formattedTrendingQuiz },
    });
  } catch (error) {
    next(error);
  }
};

const getAllActivities = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  try {
    const activities = await Activity.find(
      { creator: userId },
      { title: 1, createdAt: 1, questions: 1 }
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No activities found",
      });
    }

    const activity = activities.map((activity) => {
      let impressions = 0;
      activity.questions.forEach((question) => {
        impressions += question.impressions;
      });

      return {
        _id: activity._id,
        title: activity.title,
        impressions: convertNumber(impressions),
        createdAt: activity.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: "Activities fetched successfully",
      data: { activity },
    });
  } catch (error) {
    next(error);
  }
};

const increaseQuestionImpression = async (req, res, next) => {
  try {
    const { id: activityId, questionId } = req.params;
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Invalid activity",
      });
    }

    const question = activity.questions.find((question) =>
      question._id.equals(questionId)
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    question.impressions++; // Increment impression count for the question
    await activity.save();

    res.status(200).json({
      success: true,
      message: "Question impression count increased successfully",
      data: {
        impressions: question.impressions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const increaseAnswerCount = async (req, res, next) => {
  try {
    const { id: activityId, questionId, type } = req.params;
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Invalid activity",
      });
    }

    const question = activity.questions.find((q) => q._id.equals(questionId));

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (type === "correct") {
      question.correctAnswers++;
    } else if (type === "wrong") {
      question.wrongAnswers++;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid answer type",
      });
    }

    await activity.save();

    res.status(200).json({
      success: true,
      message: `Question ${
        type === "correct" ? "Correct" : "Wrong"
      } Answer count increased successfully`,
      data: {
        [`${type}Answers`]: question[`${type}Answers`],
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityData,
  createActivity,
  deleteActivity,
  modifyActivity,
  getAnalytics,
  getSingleActivityAnalytics,
  getTrendingQuiz,
  getAllActivities,
  increaseQuestionImpression,
  increaseAnswerCount,
};
