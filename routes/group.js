const router = require('express').Router();
const sql = require('../mysql.js');
router.route('/createGroup').post((req, res) => {
  const sqlQuery = 'INSERT INTO groupTable SET ?';
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
router.route('/listGroup').get(async (req, res) => {
  let result = await new Promise((resolve, reject) => {
    const sqlQuery = `SELECT groupTable.Id, groupTable.groupName 
                    FROM groupTable
                    JOIN userAccess
                    ON groupTable.id = userAccess.groupId
                    WHERE userAccess.userId = ${req.params.userId} OR groupTable.createdByUser = ${req.params.userId}`;

    sql.query(sqlQuery, req.body, function (err, result) {
      if (err) {
        res.status(400).send({error: err.sqlMessage});
        return;
      }
      resolve(result);
    });

    res.status(200).send({data: result});
  });

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

router.route('/getAllOrgs/:userId').get(withAuth, (req, res) => {
  const userId = req.params.userId;
  var sqlQuery = '';
  console.log(res.userType);
  switch (res.userType) {
    case 0:
      sqlQuery = `SELECT *
                  FROM organization 
                  WHERE organization.createdByUser=?`;
      break;
    case 1:
      sqlQuery = `SELECT *
                  FROM organization 
                  INNER JOIN 
                  teacherAccess ON organization.id = teacherAccess.organizationId
                  WHERE teacherAccess.teacherEmail=?`;
      break;
    case 2:
      sqlQuery = `SELECT *
                  FROM organization 
                  INNER JOIN 
                  (SELECT classroom.organizationId FROM
                  classroom JOIN studentAccess 
                  ON classroom.id = studentAccess.classroomId
                  WHERE studentAccess.studentEmail=?) classroomStudent
                  ON organization.id = classroomStudent.organizationId`;
      break;
  }

  console.log(sqlQuery);
  sql.query(sqlQuery, userId, function (err, result) {
    if (err) {
      console.log(err);
      res.sendStatus(400);
      return;
    }
    res.status(200).json({data: result});
  });
});

router.route('/grantAccess').post((req, res) => {
  const emailList = req.body.emails.split(',');
  const userAccessLevel = parseInt(req.body.currLevel) + 1;
  const organizationId = req.body.organizationId;
  const sqrt = parseInt(Math.sqrt(emailList.length));
  const sqlQuery = `INSERT INTO userAccess (userEmail , organizationId, accessType) VALUES ?`;
  for (let i = 0; i < emailList.length; ) {
    var values = [];
    for (var j = i; j < Math.min(emailList.length, i + sqrt); j++) {
      values.push([emailList[j], organizationId, userAccessLevel]);
    }
    sql.query(sqlQuery, [values], function (err, result) {
      if (err) {
        res.sendStatus(400);
        return;
      }
      console.log('Number of records inserted: ' + result.affectedRows);
    });
    i += sqrt;
  }
  res.sendStatus(201);
});

router.route(`/`);

module.exports = router;
