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

router.get("/getAllForTeacher/:classRoomId/", withAuth, async (req, res) => {
  const classroomId = req.params.classRoomId;
  const creatorEmail = await ClassRoom.find({ _id: classroomId }).select(
    "creatorEmail"
  );
  if (res.email != creatorEmail[0]["creatorEmail"]) return res.sendStatus(404);
  Assignment.find({ classRoomId: classroomId })
    .select("assignmentTitle")
    .exec()
    .then((docs) => {
      console.log(docs);
      const response = {
        assignments: docs.map((doc) => {
          return {
            assignmentTitle: doc.assignmentTitle,
            _id: doc._id,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/getAllForStudent/:classRoomId/", withAuth, async (req, res) => {
  const classroomId = req.params.classRoomId;
  console.log(res.email);
  const query = await StudentAdd.find({
    classRoomId: classroomId,
    studentEmail: res.email,
  })
    .then((classrooms) => {
      return classrooms;
    })
    .catch((err) => res.status(400).json("Error: " + err));
  console.log(query.length);
  if (query.length === 0) {
    console.log("Hola");
    res.status(404).json(query);
    return;
  }
  console.log("Jaa raha hai ki nahi");
  Assignment.find({ classRoomId: classroomId })
    .select("assignmentTitle")
    .exec()
    .then((docs) => {
      console.log(docs);
      const response = {
        assignments: docs.map((doc) => {
          return {
            assignmentTitle: doc.assignmentTitle,
            _id: doc._id,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", upload.single("assignmentImage"), (req, res, next) => {
  console.log(req.body);
  const assignment = new Assignment({
    classRoomId: req.body.classRoomId,
    assignmentTitle: req.body.assignmentTitle,
    maximumMarks: req.body.maximumMarks,
    assignmentImage: req.file.path,
    date: req.body.date,
  });
  assignment
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created assignment successfully",
        createdAssignment: {
          name: result.name,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/assignment/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:assignmentId", (req, res, next) => {
  const id = req.params.assignmentId;
  Assignment.findById(id)
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          assignment: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/products",
          },
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:assignmentId", async (req, res, next) => {
  const id = req.params.assignmentId;
  const fileName = "./uploads/2020-10-07T18:14:12.248ZCS605A_Assignment_20.pdf";
  await unlinkAsync(fileName);

  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Assignment.update({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Assignment updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/assignment/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// router.delete("/:productId", (req, res, next) => {
//   const id = req.params.productId;
//   Product.remove({ _id: id })
//     .exec()
//     .then(result => {
//       res.status(200).json({
//           message: 'Product deleted',
//           request: {
//               type: 'POST',
//               url: 'http://localhost:3000/products',
//               body: { name: 'String', price: 'Number' }
//           }
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });

module.exports = router;
