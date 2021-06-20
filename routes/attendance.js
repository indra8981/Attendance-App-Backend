const router = require('express').Router();
const sql = require('../mysql.js');
const {route} = require('./users.js');
const group = require('../service/group.js');
const attendance = require('../service/attendance.js');
const constants = require('../service/constants.js')
const dsu = require('../utils/dsu.js')

router.route('/start-attendance').get(async (req, res) => {
  const currEpoch = +new Date();
  const groupId = req.query.groupId;
  let [allUsersInClassroom, groupCreatorLocation] = await Promise.all([
    group.getAllUsersInClassroom(groupId),
    group.getGroupCreatorLocation(groupId),
  ]);
  new Promise((resolve, reject) => {
    let usersLoggedFirstTime = attendance.logAttendanceFirstTime(
      allUsersInClassroom,
      groupCreatorLocation,
      currEpoch
    );
    setTimeout(async function () {
      let [allUsersInClassroom, groupCreatorLocation] = await Promise.all([
        group.getAllUsersInClassroom(groupId),
        group.getGroupCreatorLocation(groupId),
        currEpoch
      ]);
      let usersLoggedSecondTime = attendance.logAttendanceSecondTime(
        allUsersInClassroom,
        groupCreatorLocation,
        currEpoch
      );
      const usersLoggedInBothTimes = []
      for(let user1 of usersLoggedFirstTime) {
        for(let user2 of usersLoggedSecondTime) {
          if(user2.userId === user1.userId) {
            usersLoggedInBothTimes.push(user1);
            break;
          }
        }
      }
      const usersPresent = dsu.getClusterOfPresentStudents(usersLoggedInBothTimes);
      attendance.markStudentsPresentInDataBase(usersPresent, currEpoch, groupId);
    }, constants.EPOCH_DIFFERENCE_BETWEEN_TWO_ATTENDANCE_LOGS);
    resolve();
  });
  res.sendStatus(200);
});

router.route(`/`);

module.exports = router;
