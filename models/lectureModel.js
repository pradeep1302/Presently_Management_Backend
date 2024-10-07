const mongoose = require("mongoose");

const LectureSchema = mongoose.Schema({
	subject: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject",
		required: true,
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Teacher",
		required: true,
	},
	date: { type: String, required: true },
	presentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});

const Lecture = mongoose.model("Lecture", LectureSchema);

module.exports = Lecture;
