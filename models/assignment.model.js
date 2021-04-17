const mongoose = require("mongoose");

const assignmentSchema = mongoose.Schema(
  {
    classRoomId: {
      type: String,
      required: true,
    },
    assignmentTitle: {
      type: String,
      required: true,
    },
    maximumMarks: {
      type: Number,
      required: true,
    },
    assignmentImage: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
