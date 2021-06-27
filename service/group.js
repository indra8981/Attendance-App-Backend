const sql = require('../mysql.js');
 
function inviteUsersToGroup(emailList, groupId) {
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
}

async function getAllUsersInClassroom(groupId) {
  let resu = await new Promise((resolve, reject) => {
    const sqlQuery = `SELECT 
    userAccess.userId, locationTable.*
    FROM
    userAccess
    JOIN locationTable ON userAccess.userId = locationTable.userId
    WHERE
    userAccess.groupId = ${groupId}`;
    console.log(sqlQuery);
    sql.query(sqlQuery, function (err, result) {
      if (err) {
          console.log(err);
        return;
      }
      resolve(result);
    });
  });

  console.log(resu);

  return resu;
}

async function getGroupCreatorLocation(groupId) {
  let resu = await new Promise((resolve, reject) => {
    const sqlQuery = `SELECT *
        FROM
        groupTable
        JOIN locationTable ON groupTable.createdByUser = locationTable.userId
        WHERE
        groupTable.id = ${groupId}`;
    console.log(sqlQuery);
    sql.query(sqlQuery, function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      resolve(result);
    });
  });

  console.log(resu);

  return resu[0];
}

async function getAllUsersInGroup(groupId) {
  let resu = await new Promise((resolve, reject) => {
    const sqlQuery = `SELECT userID FROM userAccess WHERE groupId = ${groupId}`;
    console.log(sqlQuery);
    sql.query(sqlQuery, function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      resolve(result);
    });
  });

  var val = []
  for (var i = 0; i <resu.length; i++) {
    val.push(resu[i].userID);
  }

  console.log(resu);

  return val;
}

async function getGroupDetails(groupId) {
  let resu = await new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM groupTable WHERE id = ${groupId}`;
    console.log(sqlQuery);
    sql.query(sqlQuery, function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      resolve(result);
    });
  });

  console.log(resu);

  return resu[0];
}





module.exports = {inviteUsersToGroup, getAllUsersInClassroom, getGroupCreatorLocation, getAllUsersInGroup, getGroupDetails};
