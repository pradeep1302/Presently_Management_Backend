const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teacherSchema = mongoose.Schema(
	{
		teacherId: {
			type: String,
			// required: true,
			unique: true,
		},
		role: {
			type: String,
			required: true,
			default: "teacher",
		},
		name: {
			type: String,
			required: true,
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
		faceData: { type: Array, required: false },
		photo: {
			type: String,
			required: [true, "Please enter a photo"],
			default: "https://i.ibb.co/4pDNDk1/avatar.png",
		},
		subjects: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Subject",
			},
		],
	},
	{ timestamps: true }
);

teacherSchema.pre("save", async function (next) {
	if (!this.teacherId) {
		let uniqueId;
		let isUnique = false;

		while (!isUnique) {
			uniqueId = Math.floor(10000 + Math.random() * 90000).toString();
			const existingTeacher = await mongoose.models.Teacher.findOne({
				teacherId: uniqueId,
			});
			if (!existingTeacher) {
				isUnique = true;
			}
		}

		this.teacherId = uniqueId;
	}

	if (!this.isModified("password")) {
		return next();
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(this.password, salt);
	this.password = hashedPassword;

	next();
});

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
