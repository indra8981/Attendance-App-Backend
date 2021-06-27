const router = require('express').Router();
const sql = require('../mysql.js');
const groupService = require('../service/group')

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
    console.log(result);
    res.status(201).send(result);
  });
});

router.route('/listGroup').get(async (req, res) => {
  const userId = req.query.userId;
  let resu = await new Promise((resolve, reject) => {
    const sqlQuery = `SELECT DISTINCT
                          groupTable.id,
                          groupTable.groupName,
                          groupTable.groupType,
                          groupTable.createdByUser
                      FROM
                          groupTable
                      JOIN userAccess ON groupTable.id = userAccess.groupId
                      WHERE
                          userAccess.userId = '${userId}' OR groupTable.createdByUser = '${userId}'`;
    sql.query(sqlQuery, req.body, function (err, result) {
      if (err) {
        res.status(400).send({error: err.sqlMessage});
        return;
      }
      resolve(result);
    });
  });
  res.status(200).send({data: resu});
});

router.route('/inviteUsers').post((req, res) => {
  const emailList = req.body.emails.split(',');
  const groupId = req.body.groupId;
  const sqlQuery = `INSERT INTO userAccess (userId, groupId) VALUES ?`;
  var values = [];
  for (var i = 0; i < emailList.length; i++) {
    values.push([emailList[i], groupId]);
  }
  sql.query(sqlQuery, [values], function (err, result) {
    if (err) {
      res.sendStatus(400);
      return;
    }
    console.log('Number of records inserted: ' + result.affectedRows);
  });
  res.sendStatus(201);
});

router.route('/getGroupDetails').get(async (req, res) => {
  const groupId = req.query.groupId;
  const groupDetails = await groupService.getGroupDetails(groupId);
  const invitedUsers = await groupService.getAllUsersInGroup(groupId);

  groupDetails['invitedUsers'] = invitedUsers;
  
  res.status(200).send({groupDetails: groupDetails});
});

router.route('/updateGroupDetails').post(async (req, res) => {
  const groupId = req.body.groupId;
  const groupName = req.body.groupName;
  const groupDescription = req.body.groupDescription;
  const groupType = req.body.groupType;
  const createdByUser = req.body.createdByUser;
  const additionalInfo = req.body.additionalInfo;

  const sqlQuery = `UPDATE
                      groupTable
                    SET
                      groupName = '${groupName}',
                      groupDescription = '${groupDescription}',
                      groupType = ${groupType},
                      createdByUser = '${createdByUser}',
                      additionalInfo = '${additionalInfo}'
                    WHERE
                      id = ${groupId}`;

  sql.query(sqlQuery, function (err, result) {
    if (err) {
      res.status(400).send({error: err.sqlMessage});
      return;
    }
    console.log(
      'Number of records updated: ' +
        result.affectedRows +
        ' ' +
        result.insertId,
    );
    console.log(result);
    res.status(201).send(result);
  });
});

router.route(`/`);

module.exports = router;
