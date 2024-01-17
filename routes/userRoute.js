const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  getDoctor,
  getPatient,
  getDoctors,
  getPatients,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const { upload } = require("../utils/fileUpload");

router.post("/register", upload.single("image"), registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);
router.get("/loginstatus", loginStatus);
router.patch("/updateuser", protect, upload.single("image"), updateUser);
router.patch("/changepassword", protect, changePassword);
router.get("/getdoctor/:id", getDoctor);
router.get("/getdoctors", getDoctors);
router.get("/getpatient/:id", protect, getPatient);
router.get("/getpatients", protect, getPatients);

module.exports = router;
