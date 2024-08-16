//forgotPasswordController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

require('dotenv').config();

// Function to handle forgot password request
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email belum terdaftar' });
    }
    // Generate reset token and expiry time
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: '30m' });

    // Update user's reset token and expiry in database
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email with reset link
    await sendResetEmail(email, resetToken);

    res.json({ message: 'Terkirim, silakan cek email' });
  } catch (err) {
    console.error('Error in forgot password:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Function to send reset email
async function sendResetEmail(email, resetToken) {
  try {
    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Reset Password Link',
      html: `
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href="${process.env.FRONTEND_URL}/lupapasswordreset/?resetToken=${resetToken}">Reset Password Link</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Gagal mengirim reset email');
  }
}

// Function to handle resetting password
exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Verify and decode the reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_RESET_SECRET);

    // Find user by decoded user ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // Check if reset token is valid
    if (user.resetToken !== resetToken || Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Reset password berhasil' });
  } catch (err) {
    console.error('Error dalam reset password:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
