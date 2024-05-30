const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: "Please provide all the required fields",
    });
    return;
  }

  const existingUser = await User.findOne({ email: email });

  if (existingUser) {
    res.status(400).json({
      success: false,
      message: "User Already Exists",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!hashedPassword) {
    res.status(500).json({
      success: false,
      message: "Password Hashing Failed",
    });
    return;
  }

  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  user
    .save()
    .then((data) => {
      res.status(201).json({
        success: true,
        message: "User Registered Successfully",
        data: [
          {
            id: data._id,
            name: data.name,
            email: data.email,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          },
        ],
      });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: "User Registration Failed",
        error: error.message,
      });
    });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const userDetails = await User.findOne({ email: email });

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Please provide all the required fields",
    });
    return;
  }

  if (!userDetails) {
    res.status(404).json({
      success: false,
      message: "User Not Found",
    });
    return;
  }

  const matchPassword = await bcrypt.compare(password, userDetails.password);

  if (!matchPassword) {
    res.status(401).json({
      success: false,
      message: "Incorrect User Credentials",
    });
    return;
  }

  const token = await jwt.sign(
    {
      userId: userDetails._id,
      email: userDetails.email,
      name: userDetails.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  if (!token) {
    res.status(500).json({
      success: false,
      message: "Token Generation Failed",
      data: [userDetails],
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "User Logged In Successfully",
    token,
    data: {
      id: userDetails._id,
      name: userDetails.name,
      email: userDetails.email,
      createdAt: userDetails.createdAt,
      updatedAt: userDetails.updatedAt,
    },
  });
};

module.exports = { registerUser, loginUser };
