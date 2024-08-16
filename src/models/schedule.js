//models/schedule.js
const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  category: [{ type: String, required: true }],
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User",default: null,},
  psikolog: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, },
  expired: {
    type: Boolean,
    default: false,
  },
  attendance: {
    type: Boolean,
    default: null,
  },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;
