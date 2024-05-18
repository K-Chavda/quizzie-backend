const mongoose = require("mongoose");

const optionSchema = mongoose.Schema({
  optionType: {
    type: String,
    enum: ["text", "image", "text_image"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  isCorrect: {
    type: Boolean,
  },
});

const questionSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [optionSchema],
    required: true,
  },
});

const activitySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    activityType: {
      type: String,
      enum: ["quiz", "poll"],
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
    },
    timer: {
      type: Number,
      required: true,
      default: 0,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    attempts: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      correctAnswers: {
        type: Number,
        default: 0,
      },
      wrongAnswers: {
        type: Number,
        default: 0,
      },
      selectedOptionIndex: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
