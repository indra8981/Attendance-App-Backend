const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const withAuth = require('./middleware.js');
const sql = require('./mysql.js');
const chat = require('./service/chat.js');
require('dotenv').config();
const secret = process.env.SECRET_JWT;
var AWS = require('aws-sdk');

const app = express();
const port = process.env.PORT || 8000;
const fileUpload = require('express-fileupload');
const {addUser, getUser, deleteUser, getUsers} = require('./service/user');
app.use(fileUpload());
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
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const constants = require('./service/constants');

const s3 = new AWS.S3({
  accessKeyId: 'minioadmin',
  secretAccessKey: 'minioadmin',
  endpoint: constants.S3_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

io.on('connection', socket => {
  socket.on('login', ({name, room}, callback) => {
    const {user, error} = addUser(socket.id, name, room);
    console.log('Hola ', socket.id, name, room);
    if (error) {
      console.log(error);
      return error;
    }
    socket.join(user.room);
    socket.in(room).emit('notification', {
      title: "Someone's here",
      description: `${user.name} just entered the room`,
    });
    console.log(getUsers(room));
    io.in(room).emit('users', getUsers(room));
  });

  socket.on('sendMessage', message => {
    console.log('Sending Message', message);
    const user = getUser(socket.id);
    console.log(message);
    chat(message[0], user.room);
    socket.broadcast
      .to(user.room)
      .emit('message', {user: user.name, text: message});
  });

  socket.on('logout', () => {
    console.log('User disconnected');
    const user = deleteUser(socket.id);
    if (user) {
      io.in(user.room).emit('notification', {
        title: 'Someone just left',
        description: `${user.name} just left the room`,
      });
      io.in(user.room).emit('users', getUsers(user.room));
    }
    console.log(user);
  });
});

app.use('/uploads', express.static('uploads'));

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);
const groupsRouter = require('./routes/group');
app.use('/group', groupsRouter);
const chatsRouter = require('./routes/chat');
app.use('/chats', chatsRouter);
const attendanceRouter = require('./routes/attendance');
app.use('/attendance', attendanceRouter);

app.post('/upload', function (req, res) {
  const file = req.files.file_attachment;
  const fileContent = Buffer.from(file.data, 'binary');

  const params = {
    Bucket: constants.DEFAULT_BUCKET,
    Key: file.name, // File name you want to save as in S3
    Body: fileContent,
  };

  // Uploading files to the bucket
  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    res.send({
      url: `${constants.S3_ENDPOINT}${constants.DEFAULT_BUCKET}/${file.name}`,
    });
  });
});

http.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
