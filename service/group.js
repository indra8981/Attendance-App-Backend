const sql = require('../mysql.js');

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

module.exports = {getAllUsersInClassroom, getGroupCreatorLocation};
