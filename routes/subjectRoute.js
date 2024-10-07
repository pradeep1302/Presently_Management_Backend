const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
	startSubject,
	enrollSubject,
	getSubject,
} = require("../controllers/subjectController");

router.post("/start", protect, startSubject);
router.post("/enroll", protect, enrollSubject);
router.get("/getsubject/:id", protect, getSubject);

module.exports = router;
