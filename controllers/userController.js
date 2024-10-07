const asyncHandler = require("express-async-handler");
const Teacher = require("../models/teacherModel");
const Student = require("../models/studentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { fileSizeFormatter } = require("../utils/fileUpload");

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const formatDate = (data) => {
	const date = new Date(Date.parse(data)).toLocaleDateString("en-GB");
	return date;
};

const getFaceData = async (photo) => {
	// const response = await axios.post(process.env.FLASK_API_URI, {
	// 	image_url: photo,
	// });

	// return response.data;

	return [];
};

const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password, department, phone, role, photo } = req.body;

	console.log(req.body);

	if (!name || !email || !password || !department || !phone) {
		res.status(400);
		throw new Error("Please fill in all required fields");
	}
	// if (role === "teacher" && !bio) {
	// 	res.status(400);
	// 	throw new Error("Please fill in all required fields");
	// }

	if (role == "student") {
		if (!photo) {
			res.status(400);
			throw new Error("Please fill in all required fields");
		}

		var faceData = getFaceData(photo);
	}
	if (password.length < 8) {
		res.status(400);
		throw new Error("Password must be up to 8 characters");
	}

	const teacherExists = await Teacher.findOne({ email });
	const studentExists = await Student.findOne({ email });
	if (teacherExists || studentExists) {
		res.status(400);
		throw new Error("Email has already been registered");
	}

	var ddata;
	if (role == "teacher") {
		try {
			ddata = await Teacher.create({
				name,
				email,
				password,
				department,
				phone,
				// role,
			});
		} catch (error) {
			res.status(500);
			throw new Error("An error occurred");
		}
	}
	if (role === "student") {
		try {
			ddata = await Student.create({
				name,
				email,
				password,
				department,
				phone,
				photo,
				faceData,
			});
		} catch (error) {
			res.status(500);
			throw new Error("An error occurred");
		}
	}

	const token = generateToken(ddata._id);

	res.cookie("token", token, {
		path: "/",
		httpOnly: true,
		expires: new Date(Date.now() + 1000 * 86400),
		sameSite: "none",
		secure: true,
	});

	if (ddata) {
		const {
			_id,
			teacherId,
			studentId,
			role,
			name,
			email,
			department,
			phone,
			photo,
			subjects,
			classes,
		} = ddata;
		res.status(201).json({
			_id,
			teacherId,
			studentId,
			role,
			name,
			email,
			department,
			phone,
			photo,
			subjects,
			classes,
			token,
		});
	} else {
		res.status(400);
		throw new Error("Invalid user data");
	}
});

const loginUser = asyncHandler(async (req, res) => {
	const { email, password, role } = req.body;
	// Validate Request
	if (!email || !password) {
		res.status(400);
		throw new Error("Please enter both fields");
	}
	// Check if user exists
	role == "teacher"
		? (user = await Teacher.findOne({ email }))
		: (user = await Student.findOne({ email }));
	if (!user) {
		res.status(400);
		throw new Error("User not found for selected role, please signup");
	}
	// User exists, check if password is correct
	const passwordIsCorrect = await bcrypt.compare(password, user.password);
	//   Generate Token
	const token = generateToken(user._id);
	if (passwordIsCorrect) {
		// Send HTTP-only cookie
		res.cookie("token", token, {
			path: "/",
			httpOnly: true,
			expires: new Date(Date.now() + 1000 * 86400), // 1 day
			sameSite: "none",
			secure: true,
		});
	}
	if (user && passwordIsCorrect) {
		const {
			_id,
			teacherId,
			studentId,
			role,
			name,
			email,
			department,
			phone,
			photo,
			subjects,
			classes,
		} = user;
		res.status(200).json({
			_id,
			teacherId,
			studentId,
			role,
			name,
			email,
			department,
			phone,
			photo,
			subjects,
			classes,
			token,
		});
	} else {
		res.status(400);
		throw new Error("Invalid email or password");
	}
});

const logout = asyncHandler(async (req, res) => {
	res.cookie("token", "", {
		path: "/",
		httpOnly: true,
		expires: new Date(0),
		sameSite: "none",
		secure: true,
	});
	return res.status(200).json({ message: "Successfully Logged Out" });
});

const getUser = asyncHandler(async (req, res) => {
	Role = req.user.role;
	Role == "teacher"
		? (user = await Teacher.findById(req.user._id))
		: (user = await Student.findById(req.user._id));

	if (user) {
		const {
			_id,
			teacherId,
			studentId,
			role,
			name,
			email,
			department,
			phone,
			photo,
			subjects,
			classes,
		} = user;
		res.status(201).json({
			_id,
			teacherId,
			studentId,
			role,
			name,
			email,
			department,
			phone,
			photo,
			subjects,
			classes,
		});
	} else {
		res.status(400);
		throw new Error("User Not Found");
	}
});

const loginStatus = asyncHandler(async (req, res) => {
	const token = req.cookies.token;
	if (!token) {
		return res.json(false);
	}
	const verified = jwt.verify(token, process.env.JWT_SECRET);
	if (verified) {
		return res.json(true);
	}
	return res.json(false);
});

const updateUser = asyncHandler(async (req, res) => {
	Role = req.user.role;
	Role == "teacher"
		? (user = await Teacher.findById(req.user._id))
		: (user = await Student.findById(req.user._id));
	if (user) {
		const { email, photo, phone } = user;
		user.phone = req.body.phone || phone;

		if (req.body.photo && Role == "student") {
			user.photo = req.body.photo;
			user.faceData = getFaceData(user.photo);
		}

		const updatedUser = await user.save();
		res.status(200).json({
			email: updatedUser.email,
			photo: updatedUser.photo,
			phone: updatedUser.phone,
		});
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

const changePassword = asyncHandler(async (req, res) => {
	Role = req.user.role;
	Role == "teacher"
		? (user = await Teacher.findById(req.user._id))
		: (user = await Student.findById(req.user._id));

	const { oldPassword, password } = req.body;

	if (!user) {
		res.status(400);
		throw new Error("User not found, please signup");
	}

	if (!oldPassword || !password) {
		res.status(400);
		throw new Error("Please enter old and new password");
	}

	const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

	if (user && passwordIsCorrect) {
		user.password = password;
		await user.save();
		res.status(200).send("Password change successful");
	} else {
		res.status(400);
		throw new Error("Old Password is Incorrect");
	}
});

const getDoctor = asyncHandler(async (req, res) => {
	const doctor = await Doctor.findById(req.params.id);
	if (doctor) {
		const { _id, name, email, photo, phone, bio, address, patient } =
			doctor;
		res.status(200).json({
			_id,
			name,
			email,
			photo,
			phone,
			bio,
			address,
			patient: patient.length,
		});
	} else {
		res.status(400);
		throw new Error("User Not Found");
	}
});

const getPatient = asyncHandler(async (req, res) => {
	var patient;
	if (req.user.role == "doctor") {
		patient = await Patient.findOne({
			_id: req.params.id,
			doctor: req.user._id,
		}).populate([{ path: "doctor", select: "_id name" }]);
	} else {
		patient = await Patient.findById(req.params.id).populate([
			{ path: "doctor", select: "_id name" },
		]);
	}
	if (patient) {
		const { _id, name, email, phone, address, dob, doctor } = patient;
		res.status(200).json({
			_id,
			name,
			email,
			phone,
			address,
			dob,
			doctor,
		});
	} else {
		res.status(401);
		throw new Error("Not Authorised");
	}
});

const getDoctors = asyncHandler(async (req, res) => {
	try {
		const doctor = await Doctor.find().select("_id name bio");
		res.status(200).json(doctor);
	} catch (error) {
		res.status(500).json({ msg: error.message });
	}
});
const getPatients = asyncHandler(async (req, res) => {
	if (req.user.role == "patient") {
		res.status(401);
		throw new Error("Not authorised");
	}
	const { patient } = await Doctor.findOne({
		_id: req.user._id,
	}).populate([
		{ path: "patient", select: "_id name phone dob address email" },
	]);
	res.status(200).json(patient);
});
module.exports = {
	registerUser,
	loginUser,
	logout,
	getUser,
	loginStatus,
	updateUser,
	changePassword,
	getDoctor,
	getPatient,
	getPatients,
	getDoctors,
};
