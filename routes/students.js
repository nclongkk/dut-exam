const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const axios = require("axios");

const User = require("../models/User");
const Exam = require("../models/Exam");
const ExamResult = require("../models/ExamResult");
const Class = require("../models/Class");
const CidResult = require("../models/CidResult");
const { optionId } = require("../utils/id-convention");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const { formartDataToSave, storeFiles } = require("../utils/uploadWeb3Storage");

router.get("/", ensureAuthenticated, (req, res) =>
  res.render("students", {
    user: {
      user: req.user,
    },
  })
);

router.get("/classes", ensureAuthenticated, async (req, res) => {
  const classes = await Class.find({ students: req.user._id });
  res.render("student-list-class", {
    user: {
      user: req.user,
    },
    classes,
  });
});

router.get("/classes/:id", ensureAuthenticated, async (req, res) => {
  const classroom = await Class.findById(req.params.id).populate({
    path: "students",
    select: "name email",
  });

  const exams = await Exam.find({ class: req.params.id });
  res.render("student-classroom", {
    user: { user: req.user },
    classroom,
    exams,
  });
});

router.get(
  "/exams/results/:examResultId",
  ensureAuthenticated,
  async (req, res) => {
    const examResult = await ExamResult.findById(req.params.examResultId)
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

router.get("/exams/doing/:examId", ensureAuthenticated, async (req, res) => {
  let examResultBefore = await ExamResult.findOne({
    exam: req.params.examId,
    student: req.user._id,
  })
    .populate({
      path: "student",
      select: "name email",
    })
    .populate({
      path: "exam",
      populate: {
        path: "class",
      },
    })
    .lean();
  if (examResultBefore) {
    console.log(examResultBefore);
    return res.render("exam-result", {
      user: { user: req.user },
      examResult: examResultBefore,
    });
  }

  const exam = await Exam.findById({ _id: req.params.examId }).populate({
    path: "class",
  });
  res.render("student-doing-exam", {
    user: { user: req.user },
    exam,
  });
});

router.post("/exams/doing/:examId", ensureAuthenticated, async (req, res) => {
  const examId = req.params.examId;
  const exam = await Exam.findById({ _id: examId }).lean();
  let answers = { ...exam };
  let answerCorrected = 0;

  for (let i = 0; i < answers.questions.length; i++) {
    if (answers.questions[i].correctAnswer === req.body.answer[i]) {
      answerCorrected++;
    }
    answers.questions[i].studentChoice = req.body.answer[i];
  }
  const score = (answerCorrected / answers.questions.length) * 10;
  await ExamResult.create({
    score,
    exam: examId,
    student: req.user._id,
    answers: answers.questions,
  });

  const examResult = await ExamResult.findOne({
    exam: examId,
    student: req.user._id,
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
  console.log("examResult", examResult);
  const formartData = formartDataToSave(examResult);
  const cid = await storeFiles(formartData);
  console.log("cid", cid);
  await CidResult.create({
    cid,
    user: req.user._id,
  });
  res.render("exam-result", {
    user: { user: req.user },
    examResult,
  });
});

router.get("/result-storage", ensureAuthenticated, async (req, res) => {
  const cidResults = await CidResult.find({ user: req.user._id }).lean();
  //fetch data from web3.storage
  const cidResultsFetched = await Promise.all(
    cidResults.map(async (cidResult) => {
      const data = await axios.get(
        `https://${cidResult.cid}.ipfs.dweb.link/hello.json`
      );
      return { ...cidResult, data: data.data };
    })
  );
  console.log("cidResultsFetched", cidResultsFetched);

  res.render("student-result-storage", {
    user: { user: req.user },
    cidResults: cidResultsFetched,
  });
});
module.exports = router;
