const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const withAuth = require('./middleware.js');
const User = require('./models/user.model');
const sql = require('./mysql.js');
require('dotenv').config();
const secret = process.env.SECRET_JWT;

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
// app.post("/users/login", function (req, res) {
//   const { email, password } = req.body;
//   const sqlQuery= "select * from users where email=? and password=?";
//   sql.query(sqlQuery,[email, password],(err,result)=>{
//     if(err || result.length === 0){
//       res.status(400).json({
//         error: "Incorrect email or password",
//       });
//       return;
//     }
//       const payload = { email: email };
//         const token = jwt.sign(payload, secret, {
//           expiresIn: "1h",
//         });
//         res.cookie("token", token, { httpOnly: false }).sendStatus(200);
//   });
// });

app.use('/uploads', express.static('uploads'));

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);
const groupsRouter = require('./routes/group');
app.use('/group', groupsRouter);
const classRoomsRouter = require('./routes/classrooms');
app.use('/classrooms', classRoomsRouter);
const assignmentRouter = require('./routes/assignment');
app.use('/assignment', assignmentRouter);
const assignmentSubmitRouter = require('./routes/assignment-submit');
app.use('/assignment-submit', assignmentSubmitRouter);

app.get('/checkToken', withAuth, function (req, res) {
  res
    .status(200)
    .json({email: res.email, name: res.name, userType: res.userType});
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
