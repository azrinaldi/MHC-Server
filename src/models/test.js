const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  questions: [
    {
      number: { type: Number, required: true },
      text: { type: String, required: true },
      category: {
        type: String,
        enum: ["depression", "anxiety", "stress"],
        required: true,
      },
    },
  ],  
});

const Test = mongoose.model("Test", TestSchema);

module.exports = Test;
