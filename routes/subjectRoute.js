const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
	startSubject,
	enrollSubject,
	getSubjectDetails,
	getAllSubjects,
	getSubject,
} = require("../controllers/subjectController");

router.post("/start", protect, startSubject);
router.post("/enroll", protect, enrollSubject);
router.get("/getsubject/:id", protect, getSubjectDetails);
router.get("/getallsubjects", protect, getAllSubjects);
router.post("/getSubject", protect, getSubject);

module.exports = router;
