//passportSetup.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const { isValidObjectId } = require("mongoose");
require("dotenv").config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          let status = null;
          const email = profile.emails[0].value;
          if (email.endsWith("@staff.itera.ac.id")) {
            status = "Tendik";
          } else if (email.endsWith("@student.itera.ac.id")) {
            status = "Mahasiswa";
          } else {
            status = "Dosen";
          }

          user = new User({
            googleId: profile.id,
            email: email,
            biodata: {
              name: {
                familyName: profile.name.familyName,
                givenName: profile.name.givenName,
              },
              photos: profile.photos[0].value,
              status: status,
            },
            role: "client",
          });
          await user.save();
          return done(null, user);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
