const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const biodataSchema = new mongoose.Schema({
  name: {
    familyName: { type: String, required: false },
    givenName: { type: String, required: false },
  },
  photos:{ type: String, required: false },
  placeOfBirth: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  status: { type: String, enum: ["Dosen", "Tendik", "Mahasiswa"], required: false },
  fakultas: { type: String, enum: ["FTI", "FS", "FTIK"], required: false },
  prodi: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  address: { type: String, required: false },
  // lastEducation: { type: String, required: false },
  // maritalStatus: { type: String, required: false },
});

const screeningResultSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, required: true, default: "DASS-42" },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
  scores: {
    depression: { type: Number, required: true },
    anxiety: { type: Number, required: true },
    stress: { type: Number, required: true },
  },
  interpretation: {
    depression: { type: String, required: true },
    anxiety: { type: String, required: true },
    stress: { type: String, required: true },
  },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () { return this.googleId == null; },
  },
  role: {
    type: String,
    enum: ["admin", "psikolog", "client"],
    default: "client",
  },
  googleId: {
    type: String,
    required: false,
  },
  resetToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Date,
  },
  activeSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    default: null,
  },
  biodata: {
    type: biodataSchema,
    default: () => ({})
  },
  screeningResult: [screeningResultSchema],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
