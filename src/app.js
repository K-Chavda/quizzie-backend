const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Quizzie",
    data: {},
  });
});

const endpointURL = "/api/v1";

// User Router
const userRouter = require("./routes/user.route");
app.use(`${endpointURL}/user`, userRouter);

// Activity Router
const activityRouter = require("./routes/activity.route");
app.use(`${endpointURL}/activity`, activityRouter);

module.exports = app;
