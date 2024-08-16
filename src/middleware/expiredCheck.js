const Schedule = require("../models/schedule");
const User = require("../models/user");

const checkScheduleExpiration = async (req, res, next) => {
  try {
    const currentDate = new Date();

    console.log("Now: ", currentDate);
    const expiredSchedules = await Schedule.find({
      date: { $lt: currentDate },
      expired: false,
    });

    for (const schedule of expiredSchedules) {
      if (schedule.client) {
        await User.updateOne(
          { _id: schedule.client, activeSchedule: schedule._id },
          { $unset: { activeSchedule: "" } }
        );
      }
    }

    // Update status expired pada jadwal
    await Schedule.updateMany(
      { date: { $lt: currentDate }, expired: false },
      { $set: { expired: true } }
    );

    // Menandai jadwal yang tidak expired lagi
    await Schedule.updateMany(
      { date: { $gte: currentDate }, expired: true },
      { $set: { expired: false } }
    );

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkScheduleExpiration;
