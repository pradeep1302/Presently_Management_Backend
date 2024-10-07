const mongoose = require("mongoose");

const SubjectSchema = mongoose.Schema({
	name: { type: String, required: true },
	subjectCode: {
		type: String,
		required: true,
		unique: true,
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Teacher",
		required: true,
	},
	currentSize: { type: Number, required: true, default: 0 },
	maxSize: { type: Number, required: [true, "Enter a max size"] },
	department: {
		type: String,
		required: true,
	},
	students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // New field for enrolled students
});

const Subject = mongoose.model("Subject", SubjectSchema);
module.exports = Subject;
