//authContoller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

//google oauth
exports.handleGoogleCallback = (req, res) => {
  if (!req.user.password) {
    res.redirect(
      `${process.env.FRONTEND_URL}/register?googleId=${req.user.googleId}&status=${req.user.biodata.status}&givenName=${req.user.biodata.name.givenName}`
    );
  } else {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    const role = req.user.role;
    res.redirect(
      `${process.env.FRONTEND_URL}/login/?token=${token}&role=${role}`
    );
  }
};

//biodata user
exports.completeRegistration = async (req, res) => {
  const { googleId, ...formData } = req.body;
  try {
    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = formData.password;
    
    user.biodata.placeOfBirth = formData.tempatLahir;
    user.biodata.dateOfBirth = formData.tanggalLahir;
    user.biodata.phoneNumber = formData.noHp;
    user.biodata.address = formData.alamat;
    user.biodata.fakultas = formData.fakultas;
    user.biodata.prodi = formData.prodi;

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    res.json({ token, role: user.role,});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Password salah" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.json({ token, role: user.role});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
