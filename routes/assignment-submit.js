const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const withAuth = require("../middleware");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const Assignment = require("../models/assignment.model.js");
const ClassRoom = require("../models/classroom.model.js");
const StudentAdd = require("../models/classroomStudent.model.js");
const AssignmentSubmit = require("../models/assignmentSolution.model.js");

router.get("/submission/:assignmentId", withAuth, async (req, res) => {
  const id = req.params.assignmentId;
  const filters = { assignmentId: id, ...req.query };
  AssignmentSubmit.find(filters)
    .exec()
    .then((doc) => {
      res.status(200).json({
        submission: doc,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post("/", upload.single("assignmentImage"), (req, res) => {
  console.log(req.email);
  const assignmentSolution = new AssignmentSubmit({
    studentEmail: req.body.email,
    assignmentId: req.body.assignmentId,
    assignmentImage: req.file.path,
    marksScored: -1,
  });
  console.log(assignmentSolution);
  assignmentSolution
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Assignment submission successfull!",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
