const sql = require('../mysql.js');
const constants = require('./constants');
const common_utils = require('../utils/common_utils')

function getUsersWithinThresholdRadius(
  allUsersInClassroom,
  groupCreatorLocation,
  currEpoch
) {
  let allPresentUsers = [];
  for (let i = 0; i < allUsersInClassroom.length; i++) {
    let user = allUsersInClassroom[i];
    let currDist = common_utils.distance(
      user.latitude,
      user.longitude,
      groupCreatorLocation.latitude,
      groupCreatorLocation.longitude,
    );
    if (
      currDist <= constants.THRESHOLD_DISTANCE_FOR_ATTENDANCE_IN_METRES &&
      currEpoch - groupCreatorLocation.timestamp <=
        constants.ALLOWED_TIME_DIFFERENCE_TO_REMAIN_OFFLINE
    ) {
      allPresentUsers.push(user);
    }
  }

  return allPresentUsers;
}

function logAttendanceFirstTime(
  allUsersInClassroom,
  groupCreatorLocation,
  currEpoch
) {
  const allPresentUsers = getUsersWithinThresholdRadius(
    allUsersInClassroom,
    groupCreatorLocation,
    currEpoch
  );
  return allPresentUsers;
}

function logAttendanceSecondTime(
  allUsersInClassroom,
  groupCreatorLocation,
  currEpoch
) {
  const allPresentUsers = getUsersWithinThresholdRadius(
    allUsersInClassroom,
    groupCreatorLocation,
    currEpoch
  );

  return allPresentUsers;
}

function markStudentsPresentInDataBase(presentStudents, currEpoch, groupId) {
  const sqlQuery = `INSERT INTO attendance (userId, groupId, timestamp) VALUES ?`;
  var values = [];
  for (let user of presentStudents) {
    values.push([user.userId, groupId, currEpoch]);
  }
  sql.query(sqlQuery, [values], function (err, result) {
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
  markStudentsPresentInDataBase
};
