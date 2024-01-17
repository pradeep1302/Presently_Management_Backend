const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorised, please login");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    user = await Doctor.findById(verified.id).select("-password");
    !user
      ? (user = await Patient.findById(verified.id).select("-password"))
      : (user = user);

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorised, please login");
  }
});

module.exports = protect;
