const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoute = require("./routes/userRoute");
const subjectRoute = require("./routes/subjectRoute");
const lectureRoute = require("./routes/lectureRoute");
// const reportRoute = require("./routes/reportRoute");
// const appointmentRoute = require("./routes/appointmentRoute");
const errorHandler = require("./middleware/errorMiddleware");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:3000", "https://medibook-app.vercel.app"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoute);
app.use("/api/subjects", subjectRoute);
app.use("/api/lectures", lectureRoute);
// app.use("/api/reports", reportRoute);
// app.use("/api/appointments", appointmentRoute);

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.use(errorHandler);
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
