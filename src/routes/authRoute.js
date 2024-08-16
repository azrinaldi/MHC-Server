//authRouter.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const checkExpired = require("../middleware/expiredCheck");

const jwt = require("jsonwebtoken");
require("dotenv").config();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.handleGoogleCallback
);

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     if (!req.user.password) {
//       res.redirect(
//         `${process.env.FRONTEND_URL}/register?googleId=${req.user.googleId}&email=${req.user.email}&givenName=${req.user.biodata.name.givenName}`
//       );
//     } else {
//       const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
//         expiresIn: '12h',
//       });
//       const role = req.user.role;
//       res.redirect(`${process.env.FRONTEND_URL}/login/?token=${token}&role=${role}`);
//     }
//   }
// );

router.post("/completeRegistration", authController.completeRegistration);

router.post("/login", checkExpired, authController.loginUser);

module.exports = router;
