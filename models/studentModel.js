const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const StudentSchema = mongoose.Schema(
	{
		name: { type: String, required: true },
		role: {
			type: String,
			required: true,
			default: "student",
		},
		studentId: {
			type: String,
			unique: true,
		},
		email: {
			type: String,
			required: [true, "Please add a email"],
			unique: true,
			trim: true,
			match: [
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				"Please enter a valid email",
			],
		},
		password: {
			type: String,
			required: [true, "Please add a password"],
			minLength: [8, "Password must be upto 8 characters"],
		},
		department: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: [true, "Please enter a phone number"],
		},
		faceData: { type: Array, required: true },
		photo: {
			type: String,
			required: [true, "Please enter a photo"],
		},
		classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
		subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
	},
	{
		timeStamps: true,
	}
);

StudentSchema.pre("save", async function (next) {
	if (!this.studentId) {
		let uniqueId;
		let isUnique = false;

		while (!isUnique) {
			uniqueId = Math.floor(10000 + Math.random() * 90000).toString();
			const existingStudent = await mongoose.models.Student.findOne({
				studentId: uniqueId,
			});
			if (!existingStudent) {
				isUnique = true;
			}
		}

		this.studentId = uniqueId;
	}

	if (!this.isModified("password")) {
		return next();
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(this.password, salt);
	this.password = hashedPassword;
	next();
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
