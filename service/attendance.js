const sql = require('../mysql.js');
const constants = require('./constants');
const common_utils = require('../utils/common_utils');

function getUsersWithinThresholdRadius(
  allUsersInClassroom,
  groupCreatorLocation,
  currEpoch,
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
  currEpoch,
) {
  const allPresentUsers = getUsersWithinThresholdRadius(
    allUsersInClassroom,
    groupCreatorLocation,
    currEpoch,
  );
  return allPresentUsers;
}

function logAttendanceSecondTime(
  allUsersInClassroom,
  groupCreatorLocation,
  currEpoch,
) {
  const allPresentUsers = getUsersWithinThresholdRadius(
    allUsersInClassroom,
    groupCreatorLocation,
    currEpoch,
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

function logClassroomRecord(groupId, currentEpoch) {
  const sqlQuery = `INSERT INTO classRecord (groupId, timestamp) VALUES (${groupId},${currentEpoch})`;
  sql.query(sqlQuery, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
  });
}

async function getAllStudentsWithAttendanceCountWithinRange(
  startDate,
  endDate,
  groupId,
) {
  const startTimestamp = common_utils.dateToTimestamp(startDate);
  const endTimestamp = common_utils.dateToTimestamp(endDate);
  const sqlQuery = `SELECT users.rollNumber,users.name,attendance.present from users
                    JOIN (SELECT userId,COUNT(userId) as present from attendance
                    WHERE groupId=${groupId} AND timestamp>=${startTimestamp} AND timestamp<=${endTimestamp}
                    GROUP BY userId) attendance
                    ON attendance.userId=users.email 
                    ORDER BY users.rollNumber ASC`;

  let [resu, classRecord] = await Promise.all([
    new Promise((resolve, reject) => {
      sql.query(sqlQuery, function (err, result) {
        if (err) {
          console.log(err);
          return;
        }
        resolve(result);
      });
    }),
    getClassCount(groupId, startTimestamp, endTimestamp),
  ]);

  const totalClasses = classRecord.totalClasses;
  const finalTableStructure = [];
  for (let user of resu) {
    const currentUser = [...Object.values(user)];

    currentUser.push(totalClasses - user.present);
    currentUser.push((user.present * 100) / totalClasses);
    finalTableStructure.push(currentUser);
  }
  return {
    data: finalTableStructure,
    totalClasses: totalClasses,
  };
}

async function getClassCount(groupId, startTimestamp, endTimestamp) {
  const sqlQuery = `SELECT groupId,COUNT(groupId) as totalClasses from classRecord
                    WHERE groupId=${groupId} AND timestamp>=${startTimestamp} AND timestamp<=${endTimestamp}
                    GROUP BY groupId`;

  let resu = await new Promise((resolve, reject) => {
    sql.query(sqlQuery, function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      resolve(result);
    });
  });
  if(resu.length == 0) {
    return {
      totalClasses: 0
    }
  }
  return resu[0];
}

module.exports = {
  getUsersWithinThresholdRadius,
  logAttendanceFirstTime,
  logAttendanceSecondTime,
  markStudentsPresentInDataBase,
  getAllStudentsWithAttendanceCountWithinRange,
  logClassroomRecord,
};
