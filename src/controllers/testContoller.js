//testController.js
const User = require("../models/user");
const Test = require("../models/test");
const Schedule = require("../models/schedule");

const getInterpretation = (category, score) => {
  const thresholds = {
    depression: [
      { max: 9, label: "Normal" },
      { max: 13, label: "Ringan" },
      { max: 20, label: "Sedang" },
      { max: 27, label: "Parah" },
      { max: Infinity, label: "Sangat Parah" },
    ],
    anxiety: [
      { max: 7, label: "Normal" },
      { max: 9, label: "Ringan" },
      { max: 14, label: "Sedang" },
      { max: 19, label: "Parah" },
      { max: Infinity, label: "Sangat Parah" },
    ],
    stress: [
      { max: 14, label: "Normal" },
      { max: 18, label: "Ringan" },
      { max: 25, label: "Sedang" },
      { max: 33, label: "Parah" },
      { max: Infinity, label: "Sangat Parah" },
    ],
  };

  const categoryThresholds = thresholds[category];
  if (!categoryThresholds) return "Tidak Diketahui";

  const threshold = categoryThresholds.find((th) => score <= th.max);
  return threshold ? threshold.label : "Tidak Diketahui";
};

exports.getQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(
      "activeSchedule screeningResult"
    );

    if (!user || !user.activeSchedule) {
      return res.status(403).json({ message: "Anda belum mereservasi jadwal" });
    }

    const hasMatchingSchedule = user.screeningResult.some(
      (result) =>
        result.scheduleId.toString() === user.activeSchedule.toString()
    );

    if (hasMatchingSchedule) {
      return res
        .status(403)
        .json({
          message: "Anda telah menyelesaikan tes",
        });
    }

    const schedule = await Schedule.findById(user.activeSchedule).select(
      "date"
    );
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const questions = await Test.findOne({ type: "DASS-42" });
    if (!questions) {
      return res.status(404).json({ message: "Test questions not found" });
    }

    res.status(200).json({ questions: questions, scheduleDate: schedule.date });
  } catch {
    res.status(500).send({ message: "Error fetching questions" });
  }
};

exports.saveScreeningDASS42 = async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;

    if (!userId || !Array.isArray(answers)) {
      return res.status(400).json({ msg: "Invalid input" });
    }

    const user = await User.findById(userId);
    const scheduleId = user.activeSchedule;

    const scores = {
      depression: 0,
      anxiety: 0,
      stress: 0,
    };

    answers.forEach((answer) => {
      if (scores.hasOwnProperty(answer.category)) {
        scores[answer.category] += answer.answer;
      }
    });

    const interpretations = {
      depression: getInterpretation("depression", scores.depression),
      anxiety: getInterpretation("anxiety", scores.anxiety),
      stress: getInterpretation("stress", scores.stress),
    };

    const screeningResult = {
      date: new Date(),
      scheduleId,
      scores,
      interpretation: interpretations,
    };

    user.screeningResult.push(screeningResult);
    await user.save();

    res.status(200).json({ message: "Screening results saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
