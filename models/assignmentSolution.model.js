const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AssignmentSubmitSchema = new Schema(
  {
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    assignmentId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    assignmentImage: {
      type: String,
      required: true,
    },
    marksScored: {
      type: Number,
      required: true,
      default: -1,
    },
  },
  {
    timestamps: true,
  }
);

const AssignmentSubmit = mongoose.model(
  "AssignmentSubmit",
  AssignmentSubmitSchema
);
module.exports = AssignmentSubmit;
