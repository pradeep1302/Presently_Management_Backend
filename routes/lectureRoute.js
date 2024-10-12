const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
	getLecturesTeacher,
	getLecturesStudent,
	getLectureById,
} = require("../controllers/lectureController");

router.post("/getlectures/teacher/", protect, getLecturesTeacher);
router.get("/getlecture/:id", protect, getLectureById);
router.post("/getlectures/student/", protect, getLecturesStudent);

module.exports = router;
