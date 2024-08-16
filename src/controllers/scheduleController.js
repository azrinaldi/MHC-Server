const Schedule = require("../models/schedule");
const User = require("../models/user");
const moment = require("moment-timezone");

function formatToWIB(date) {
  return moment(date).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm");
}

exports.getScheduleByDate = async (req, res) => {
  try {
    const dateString = req.params.date;
    const localDate = new Date(dateString);

    const startOfDayUTC = new Date(
      localDate.setUTCHours(0, 0, 0, 0) - 7 * 60 * 60 * 1000
    );
    const endOfDayUTC = new Date(
      localDate.setUTCHours(23, 59, 59, 999) - 7 * 60 * 60 * 1000
    );

    const schedules = await Schedule.find({
      date: {
        $gte: startOfDayUTC,
        $lte: endOfDayUTC,
      },
    }).populate({
      path: "client",
      select: "biodata.name",
    });

    if (schedules.length === 0) {
      return res.status(200).json({ message: "No Schedules", schedules: [] });
    }

    const schedulesData = schedules.map((schedule) => {
      const formattedDate = formatToWIB(schedule.date);
      const [datePart, timePart] = formattedDate.split(" ");
      const [hour, minute] = timePart.split(":");

      return {
        ...schedule.toObject(),
        date: datePart,
        time: `${hour}:${minute}`,
      };
    });

    schedulesData.sort((a, b) => {
      const timeA = new Date(`1970-01-01T${a.time}:00Z`).getTime();
      const timeB = new Date(`1970-01-01T${b.time}:00Z`).getTime();
      return timeA - timeB;
    });

    res.status(200).json(schedulesData);
  } catch (error) {
    console.error("Error in getScheduleByDate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addNewSchedule = async (req, res) => {
  try {
    const { date, time, category, client } = req.body;

    if (client) {
      const user = await User.findById(client).select("activeSchedule");

      if (user.activeSchedule) {
        return res
          .status(403)
          .json({ message: "Klien telah memiliki jadwal yang direservasi" });
      }
    }

    const localDateTime = moment.tz(`${date} ${time}`, "Asia/Jakarta");
    const utcDateTime = localDateTime.utc().toDate();

    const newSchedule = new Schedule({
      date: utcDateTime,
      category,
      client,
    });

    await newSchedule.save();

    if (client) {
      const user = await User.findById(client);
      if (user) {
        user.activeSchedule = newSchedule._id;
        await user.save();
      } else {
        console.error(`User with ID ${client} not found`);
      }
    }
    res
      .status(201)
      .json({ message: "Schedule added successfully", schedule: newSchedule });
  } catch (error) {
    console.error("Error in addNewSchedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, category, client } = req.body;

    if (!id || !date || !time || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const localDateTime = moment.tz(`${date} ${time}`, "Asia/Jakarta");
    const utcDateTime = localDateTime.utc().toDate();

    const currentSchedule = await Schedule.findById(id);
    if (!currentSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    if (currentSchedule.expired) {
      if (client) {
        return res
          .status(400)
          .json({ message: "Cannot update client for an expired schedule" });
      }
    }

    let previousClient;
    if (currentSchedule.client) {
      previousClient = await User.findById(currentSchedule.client);
    }

    if (client) {
      const newClient = await User.findById(client);
      if (!newClient) {
        return res.status(404).json({ message: "Client not found" });
      }

      if (
        newClient.activeSchedule &&
        newClient.activeSchedule.toString() !== id
      ) {
        return res
          .status(400)
          .json({ message: "Client already has an active schedule" });
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      {
        date: utcDateTime,
        category,
        client,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Failed to update schedule" });
    }

    if (previousClient && previousClient.activeSchedule.toString() === id) {
      await User.findByIdAndUpdate(previousClient._id, {
        $unset: { activeSchedule: "" },
      });
    }

    if (client) {
      await User.findByIdAndUpdate(client, {
        $set: { activeSchedule: id },
      });
    }

    res.status(200).json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Error in updateSchedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID jadwal tidak diberikan" });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ error: "Jadwal tidak ditemukan" });
    }

    if (schedule.client) {
      const user = await User.findOne({ activeSchedule: id });

      if (user) {
        user.activeSchedule = null;
        await user.save();
      }
    }

    const deletedSchedule = await Schedule.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Jadwal berhasil dihapus", deletedSchedule });
  } catch (error) {
    console.error("Error saat menghapus jadwal:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus jadwal" });
  }
};

exports.getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: "client" })
      .select("_id biodata.name")
      .sort({ "biodata.name": 1 });
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error.message);
    res.status(500).json({ message: "Internal server error dek" });
  }
};

exports.bookedSchedule = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookedSchedules = await Schedule.find({ client: userId });

    const formattedSchedules = bookedSchedules.map((schedule) => {
      const formattedDate = formatToWIB(schedule.date);
      const [datePart, timePart] = formattedDate.split(" ");
      const [hour, minute] = timePart.split(":");

      return {
        ...schedule.toObject(),
        date: datePart,
        time: `${hour}:${minute}`,
      };
    });

    res.status(200).json(formattedSchedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.scheduleAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scheduleId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({ error: "Schedule ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.activeSchedule) {
      return res
        .status(400)
        .json({ error: "Anda telah memiliki jadwal aktif" });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(400).json({ error: "Schedule not found" });
    }

    if (schedule.client) {
      return res
        .status(400)
        .json({ error: "Schedule telah dipesan pengguna lain" });
    }

    user.activeSchedule = schedule._id;
    await user.save();

    schedule.client = userId;
    await schedule.save();

    res.json(schedule);
  } catch (err) {
    console.error("Error scheduling appointment:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scheduleId } = req.body;

    const user = await User.findById(userId);
    if (user) {
      user.activeSchedule = null;
      await user.save();
    }

    const schedule = await Schedule.findById(scheduleId);
    if (schedule) {
      schedule.client = null;
      await schedule.save();
    }

    res.status(200).json({ message: "Schedule cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Error cancelling appointment", error });
  }
};

//Psikolog

exports.activeBooked = async (req, res) => {
  try {
    const activeBooked = await Schedule.find({
      client: { $ne: null },
      expired: false,
    }).populate({
      path: "client",
      select: "biodata.name",
    });

    const schedulesData = activeBooked.map((schedule) => {
      const formattedDate = formatToWIB(schedule.date);
      const [datePart, timePart] = formattedDate.split(" ");
      const [hour, minute] = timePart.split(":");

      return {
        ...schedule.toObject(),
        date: datePart,
        time: `${hour}:${minute}`,
      };
    });

    schedulesData.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.status(200).json(schedulesData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
