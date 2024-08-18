// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("./src/config/passportSetup");

require("dotenv").config();

const authRoute = require("./src/routes/authRoute");
const forgotPasswordRoute = require("./src/routes/forgotPasswordRoute");
const scheduleRoute = require("./src/routes/scheduleRoute");
const testRoute = require("./src/routes/testRoute")
const userRoute = require("./src/routes/userRoute");

const app = express();

app.use(express.json());


app.use(
  cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME, PORT, HOST } = process.env;

mongoose
  .connect(
    `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority&appName=${DB_NAME}`
  )
  .then(() => console.log("Connected to MongoAtlas"))
  .catch((err) => console.error("Error connecting to MongoAtlas:", err));

app.use("/api/auth", authRoute);
app.use("/api/forgot", forgotPasswordRoute);
app.use("/api/schedule", scheduleRoute);
app.use("/api/test", testRoute);
app.use("/api/user", userRoute);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
