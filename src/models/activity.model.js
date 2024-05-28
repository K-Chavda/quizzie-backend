const mongoose = require("mongoose");

const optionSchema = mongoose.Schema({
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
  selectionCount: {
    type: Number,
    default: 0,
  },
});

const questionSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  optionType: {
    type: String,
    enum: ["text", "image", "text_image"],
    required: true,
  },
  options: {
    type: [optionSchema],
    required: true,
  },
  impressions: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  wrongAnswers: {
    type: Number,
    default: 0,
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
      enum: ["QA", "Poll"],
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
