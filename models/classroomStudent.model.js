const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StudentAddSchema = new Schema(
  {
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    classRoomId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const StudentAdd = mongoose.model("StudentAdd", StudentAddSchema);
module.exports = StudentAdd;
