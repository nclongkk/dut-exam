const mongoose = require("mongoose");
const { Role } = require("../constant/role.constant");

const AnswerSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  choices: {
    type: Array,
    required: true,
  },
  studentChoice: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
});

const ExamResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    exam: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Exam",
    },
    answers: [AnswerSchema],
    score: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ExamResult = mongoose.model("ExamResult", ExamResultSchema);

module.exports = ExamResult;
