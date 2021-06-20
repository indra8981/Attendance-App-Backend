const sql = require('../mysql.js');
const constants = require('./constants');

function distance(lat1, lon1, lat2, lon2) {
  lon1 = (lon1 * Math.PI) / 180;
  lon2 = (lon2 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));
  let r = constants.EARTH_RADIUS_IN_METRES;
  return c * r;
}

function getUsersWithinThresholdRadius(
  allUsersInClassroom,
  groupCreatorLocation,
) {
  let allPresentUsers = [];
  for (let i = 0; i < allUsersInClassroom.length; i++) {
    let user = allUsersInClassroom[i];
    let currDist = distance(
      user.latitude,
      user.longitude,
      groupCreatorLocation.latitude,
      groupCreatorLocation.longitude,
    );
    if (currDist <= constants.THRESHOLD_DISTANCE_FOR_ATTENDANCE_IN_METRES) {
      allPresentUsers.push(user.userId);
    }
  }

  return allPresentUsers;
}

function logAttendanceFirstTime(
  allUsersInClassroom,
  groupCreatorLocation,
  groupId,
) {
  const allPresentUsers = getUsersWithinThresholdRadius(
    allUsersInClassroom,
    groupCreatorLocation,
  );
  const currEpoch = +new Date();
  const sqlQuery = `INSERT INTO attendance (userId, groupId, createdAtEpoch, updatedAtEpoch) VALUES ?`;
  var values = [];
  for (let user of allPresentUsers) {
    values.push([user, groupId, currEpoch, currEpoch]);
  }
  sql.query(sqlQuery, [values], function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    console.log('Number of records inserted: ' + result.affectedRows);
  });

  return currEpoch;
}

function logAttendanceSecondTime(
  allUsersInClassroom,
  groupCreatorLocation,
  groupId,
  lastEpoch,
) {
  const allPresentUsers = getUsersWithinThresholdRadius(
    allUsersInClassroom,
    groupCreatorLocation,
  );
  const currEpoch = +new Date();
  const sqlQuery = `UPDATE attendance 
    SET updatedAtEpoch = ${currEpoch}
    WHERE userId IN (?) AND groupId = ${groupId} AND createdAtEpoch = ${lastEpoch};`;
  sql.query(sqlQuery, allPresentUsers, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    console.log('Number of records inserted: ' + result.affectedRows);
  });
}

module.exports = {
  getUsersWithinThresholdRadius,
  logAttendanceFirstTime,
  logAttendanceSecondTime,
};
