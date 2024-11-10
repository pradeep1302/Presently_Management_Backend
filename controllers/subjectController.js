const asyncHandler = require("express-async-handler");
const Subject = require("../models/subjectModel");
const Student = require("../models/studentModel");
const Teacher = require("../models/teacherModel");

const startSubject = asyncHandler(async (req, res) => {
	if (req.user.role != "teacher") {
    res.status(401);
    throw new Error("Not authorised");
  }


	const { name, maxSize, subjectCode } = req.body;

	if (!name || !maxSize || !subjectCode) {
		res.status(400);
		throw new Error("All fields are required");
	}

	const subject = await Subject.findOne({
		subjectCode,
	});
	if (subject && req.user._id.toString() != subject.teacher.toString()) {
    res.status(401);
    throw new Error("Not authorised");
  }
	if (!subject) {
		const newSubject = await Subject.create({
			name,
			subjectCode,
			teacher: req.user._id,
			maxSize,
			department: req.user.department,
		});

		if (!newSubject) {
			res.status(400);
			throw new Error("Cannot Create");
		}

		const data = await Teacher.findByIdAndUpdate(
			req.user._id,
			{
				$push: { subjects: newSubject._id },
			},
			{ new: true }
		);

		if (data) {
			res.status(200).json(newSubject);
		} else {
			res.status(400);
			throw new Error("Cannot Create");
		}
	} else {
		if (maxSize <= subject.currentSize) {
			res.status(401);
			throw new Error("Cannot Change");
		} else {
			const updatedapt = await Subject.findByIdAndUpdate(
				subject._id,
				{ maxSize },
				{ new: true }
			);
			res.status(200).json(updatedapt);
		}
	}
});

const enrollSubject = asyncHandler(async (req, res) => {
	if (req.user.role != "student") {
		res.status(401);
		throw new Error("Not authorised");
	}
	const { subjectCode } = req.body;

	if (!subjectCode) {
		res.status(400);
		throw new Error("Subject Id is required");
	}

	const stuId = req.user._id;

	const subject = await Subject.find({
		subjectCode,
		students: req.user._id,
	});
	if (subject.length != 0) {
		res.status(201);
		throw new Error("Student already enrolled");
	} else {
		const enrollment = await Subject.findOne({
			subjectCode,
		});
		const { _id, currentSize, maxSize } = enrollment;
		if (currentSize + 1 <= maxSize) {
			var data2;

			const exists2 = await Student.findOne({
				_id: stuId,
				subjects: _id,
			});
			if (!exists2) {
				data2 = await Student.findByIdAndUpdate(
					stuId,
					{
						$push: { subjects: _id },
					},
					{ new: true }
				);
			}
			if (data2 || exists2) {
				const data = await Subject.findByIdAndUpdate(
					_id,
					{
						currentSize: currentSize + 1,
						$push: {
							students: stuId,
						},
					},
					{ new: true }
				);
				if (data) res.status(201).json(true);
				else {
					res.status(201);
					throw new Error("An error occured");
				}
			} else {
				res.status(201);
				throw new Error("An error occured");
			}
		} else {
			res.status(201);
			throw new Error("Student limit reached");
		}
	}
});

const getSubjectDetails = asyncHandler(async (req, res) => {
	const subject = await Subject.findById(req.params.id).populate([
		{ path: "students", select: "studentId name email department phone" },
	]);
	if (!subject) {
		res.status(404);
		throw new Error("Subject not found");
	}
	if (
		req.user.role != "teacher" &&
		subject.teacher._id.toString() != req.user._id.toString()
	) {
		res.status(401);
		throw new Error("User not authorized");
	}
	res.status(200).json(subject);
});

const getAllSubjects = asyncHandler(async (req, res) => {
	const subject = await Subject.find().select("name subjectId subjectCode");
	res.status(200).json(subject);
});

const getSubject = asyncHandler(async (req, res) => {
	const subject = await Subject.findOne({
		subjectCode: req.body.subjectCode,
	}).select("name maxSize currentSize teacher");
	res.status(200).json(subject);
});

module.exports = { startSubject, enrollSubject, getSubjectDetails, getAllSubjects, getSubject };
