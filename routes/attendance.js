const router = require('express').Router();
const sql = require('../mysql.js');
const {route} = require('./users.js');
const group = require('../service/group.js');
const attendance = require('../service/attendance.js');
const constants = require('../service/constants.js')

router.route('/start-attendance').get(async (req, res) => {
  const groupId = req.query.groupId;
  const [allUsersInClassroom, groupCreatorLocation] = await Promise.all([
    group.getAllUsersInClassroom(groupId),
    group.getGroupCreatorLocation(groupId),
  ]);
  new Promise((resolve, reject) => {
    let lastEpoch = attendance.logAttendanceFirstTime(
      allUsersInClassroom,
      groupCreatorLocation,
      groupId,
    );
    setTimeout(function () {
      attendance.logAttendanceSecondTime(
        allUsersInClassroom,
        groupCreatorLocation,
        groupId,
        lastEpoch
      );
    }, constants.EPOCH_DIFFERENCE_BETWEEN_TWO_ATTENDANCE_LOGS);
    resolve();
  });
  res.sendStatus(200);
});

router.route(`/`);

module.exports = router;
