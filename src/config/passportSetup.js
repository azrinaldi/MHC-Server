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
        // Cari user berdasarkan googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Jika user dengan googleId tidak ditemukan, cek emailnya
          const email = profile.emails[0].value;
          user = await User.findOne({ email: email });

          if (user) {
            // Jika user dengan email yang sama sudah ada, hubungkan akun Google
            user.googleId = profile.id;
            user.biodata.name.familyName = profile.name.familyName;
            user.biodata.name.givenName = profile.name.givenName;
            user.biodata.photos = profile.photos[0].value;
          } else {
            // Jika email tidak ada di database, buat akun baru
            let status = null;
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
          }
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
