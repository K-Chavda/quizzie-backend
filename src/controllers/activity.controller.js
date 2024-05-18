const Activity = require("../models/activity.model");

const createActivity = async (req, res, next) => {
  const { title, activityType, questions, timer, impressions } = req.body;

  if (!title || !activityType || !questions) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the required fields",
    });
  }

  try {
    const activityQuestions = questions.map((q) => {
      const { question, options } = q;

      if (!question || !options || options.length === 0) {
        throw new Error(
          "Please provide all the required fields for each question and its options"
        );
      }

      const formattedOptions = options.map((opt) => {
        const { type: optionType, text, imageUrl, isCorrect } = opt;

        if (!optionType || !text) {
          throw new Error(
            "Please provide all the required fields for each option"
          );
        }

        return {
          optionType,
          text,
          imageUrl,
          isCorrect,
        };
      });

      return {
        question,
        options: formattedOptions,
      };
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

const getAnalytics = async (req, res, next) => {
  try {
    const agg = [
      {
        $group: {
          _id: null,
          totalImpressions: {
            $sum: "$impressions",
          },
          totalQuestions: {
            $sum: {
              $size: "$questions",
            },
          },
          totalQuizzesAndPolls: {
            $sum: 1,
          },
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
        totalImpressions: analytics.totalImpressions,
        totalQuestions: analytics.totalQuestions,
        totalQuizzesAndPolls: analytics.totalQuizzesAndPolls,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTrendingQuiz = async (req, res, next) => {
  try {
    const agg = [
      {
        $sort: {
          impressions: -1,
        },
      },
      {
        $limit: 12,
      },
    ];

    const trendingQuiz = await Activity.aggregate(agg);

    if (!trendingQuiz) {
      return res.status(404).json({
        success: false,
        message: "No activities found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activities fetched successfully",
      data: {
        trendingQuiz,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createActivity, getAnalytics, getTrendingQuiz };
