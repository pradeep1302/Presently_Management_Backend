const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
	getLecturesTeacher,
	getLecturesStudent,
} = require("../controllers/lectureController");

router.post("/getlectures/teacher/", protect, getLecturesTeacher);
router.post("/getlectures/student/", protect, getLecturesStudent);

module.exports = router;
