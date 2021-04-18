const router = require('express').Router();
const withAuth = require('../middleware');
let User = require('../models/user.model');
const sql = require('../mysql.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET_JWT;
router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/getbyemail').get(async (req, res) => {
  User.findOne({email: req.body.email})
    .then(user => {
      if (user == null) throw 'Not Found';
      res.json(user);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/').patch(async (req, res) => {
  const filter = {email: req.body.email};
  const update = req.body;
  let doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });
  if (doc == null) res.status(400).json('Error');
  else res.status(200).json(doc);
});

router.route('/signup').post((req, res) => {
  console.log(req.body);
  var password = req.body.password;
  bcrypt.hash(password, 10, function (err, hash) {
    // 10 is salt rounds, which we have no idea about
    req.body.password = hash;
    const sqlQuery = 'INSERT INTO users SET ?';
    sql.query(sqlQuery, req.body, function (err, result) {
      if (err) {
        res.status(400).send({error: err.sqlMessage});
        return;
      }
      console.log(
        'Number of records inserted: ' +
          result.affectedRows +
          ' ' +
          result.insertId,
      );
      res.sendStatus(201);
    });
  });
});

router.route('/login').post((req, res) => {
  console.log(req.body);
  const {email, password} = req.body;
  const sqlQuery = 'select * from users where email=?';
  sql.query(sqlQuery, [email], (err, result) => {
    if (err || result.length === 0) {
      res.status(400).json({
        error: 'Incorrect email or password',
      });
      return;
    }
    bcrypt.compare(password, result[0].password, function (err, matched) {
      if (!matched) {
        res.status(400).json({
          error: 'Incorrect email or password',
        });
        return;
      }
      const payload = {
        email: email,
        name: result[0].name,
        organizationName: result[0].organizationName,
        phone: result[0].phone,
        userType: result[0].userType,
      };
      // const token = jwt.sign(payload, secret, {
      //   expiresIn: "1h",
      // });
      // res.cookie("token", token, { httpOnly: false }).sendStatus(200);
      res.status(200).json(payload);
    });
  });
});

router.route('/updateLocation').post(function (req, res) {
  console.log(req.body)
  const userEmail = req.body.userEmail;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const timestamp = req.body.timestamp;
  const sqlQuery = `INSERT INTO locationTable (userEmail, latitude, longitude,timestamp) VALUES ('${userEmail}', ${latitude}, ${longitude}, ${timestamp}) ON DUPLICATE KEY UPDATE latitude = ${latitude}, longitude = ${longitude}, timestamp=${timestamp}`;
  console.log(sqlQuery)
  sql.query(
    sqlQuery,
    function (err, result) {
      if (err) {
        res.sendStatus(400);
        console.log(err)
        return;
      }
      console.log('Number of records inserted: ' + result.affectedRows);
      res.sendStatus(200);
    },
  );
});

router.route(`/`);

module.exports = router;
