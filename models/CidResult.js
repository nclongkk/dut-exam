const mongoose = require("mongoose");

const CidResultSchema = new mongoose.Schema(
  {
    cid: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const CidResult = mongoose.model("CidResult", CidResultSchema);

module.exports = CidResult;
