const mongoose = require("mongoose");
const { Role } = require("../constant/role.constant");

const QuestionSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  choices: {
    type: Array,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
});

const ExamSchema = new mongoose.Schema(
  {
    name: String,
    class: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Class",
    },
    author: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    questions: [QuestionSchema],
    startAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model("Exam", ExamSchema);

module.exports = Exam;
