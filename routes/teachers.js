const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/User");
const Exam = require("../models/Exam");
const ExamResult = require("../models/ExamResult");
const Class = require("../models/Class");
const { optionId } = require("../utils/id-convention");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

router.get("/", ensureAuthenticated, (req, res) =>
  res.render("teachers", {
    user: {
      user: req.user,
    },
  })
);

router.get("/classes", ensureAuthenticated, async (req, res) => {
  const classes = await Class.find({ teacher: req.user._id });
  res.render("list-classes", {
    user: {
      user: req.user,
    },
    classes,
  });
});

router.get("/classes/create", ensureAuthenticated, async (req, res) => {
  res.render("create-class", { user: req.user });
});

router.post("/classes/create", ensureAuthenticated, async (req, res) => {
  console.log(req.body);
  const students = await User.find({
    email: { $in: req.body.emails },
  });

  const studentIds = students.map((student) => student._id);

  try {
    const newClass = await Class.create({
      name: req.body.className,
      teacher: req.user._id,
      students: studentIds,
    });
    res.redirect("/teachers?message=Create class successfully");
  } catch (error) {
    console.log(error);
    res.redirect("/teachers?error=Something went wrong");
  }
});

router.get("/classes/:id", ensureAuthenticated, async (req, res) => {
  const classroom = await Class.findById(req.params.id).populate({
    path: "students",
    select: "name email",
  });

  const exams = await Exam.find({ class: req.params.id });
  console.log(exams);
  console.log(classroom);
  res.render("classroom", {
    user: req.user,
    classroom,
    exams,
  });
});

router.get("/exams/create", ensureAuthenticated, async (req, res) => {
  const classes = await Class.find({ teacher: req.user._id });
  res.render("create-exam", { user: req.user, classes });
});

router.post("/exams/create", ensureAuthenticated, async (req, res) => {
  console.log(req.body);

  try {
    const questions = req.body.questions.map((question, index) => ({
      question: question,
      choices: [
        {
          _id: optionId(index, 1),
          content: req.body.option1[index],
        },
        {
          _id: optionId(index, 2),
          content: req.body.option2[index],
        },
        {
          _id: optionId(index, 3),
          content: req.body.option3[index],
        },
        {
          _id: optionId(index, 4),
          content: req.body.option4[index],
        },
      ],
      correctAnswer: optionId(index, req.body.correctAnswer[index]),
    }));

    const startTime = req.body.startAt.split(":").map((time) => parseInt(time));
    const startAt = new Date(req.body.examAt).setHours(
      startTime[0],
      startTime[1]
    );
    const endedTime = req.body.endedAt.split(":").map((time) => parseInt(time));

    const endedAt = new Date(req.body.examAt).setHours(
      endedTime[0],
      endedTime[1]
    );
    const exam = await Exam.create({
      class: req.body.classroomId,
      name: req.body.name,
      author: req.user._id,
      questions: questions,
      startAt,
      endedAt,
    });
    res.redirect("/teachers?message=Exam created successfully");
  } catch (error) {
    console.log(error);
    res.redirect("/teachers?error=Something went wrong");
  }
});

router.get("/exams/:id", ensureAuthenticated, async (req, res) => {
  const exam = await Exam.findById(req.params.id).populate("class");
  const examResults = await ExamResult.find({ exam: req.params.id })
    .populate("student")
    .populate("exam");
  console.log("afsas ", examResults);

  res.render("teacher-list-student-done-exam", {
    user: req.user,
    examResults,
    exam,
  });
});

router.get(
  "/exams/:examId/details/:examResultId",
  ensureAuthenticated,
  async (req, res) => {
    const examResult = await ExamResult.findOne({
      _id: req.params.examResultId,
    })
      .populate({
        path: "student",
      })
      .populate({
        path: "exam",
        populate: {
          path: "class",
        },
      })
      .lean();
    res.render("exam-result", {
      user: { user: req.user },
      examResult,
    });
  }
);

module.exports = router;
