const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    students: { type: [mongoose.Schema.ObjectId], ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Class = mongoose.model("Class", ClassSchema);

module.exports = Class;
