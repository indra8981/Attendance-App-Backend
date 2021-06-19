const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const withAuth = require('./middleware.js');
const User = require('./models/user.model');
const sql = require('./mysql.js');
const chat = require('./utils/chat.js')
require('dotenv').config();
const secret = process.env.SECRET_JWT;

const app = express();
const port = process.env.PORT || 8000;
const {addUser, getUser, deleteUser, getUsers} = require('./utils/user');

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

io.on('connection', socket => {
  socket.on('login', ({name, room}, callback) => {
    const {user, error} = addUser(socket.id, name, room);
    console.log("Hola ", socket.id, name, room)
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
    console.log(message)
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
app.get('/checkToken', withAuth, function (req, res) {
  res
    .status(200)
    .json({email: res.email, name: res.name, userType: res.userType});
});

http.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
