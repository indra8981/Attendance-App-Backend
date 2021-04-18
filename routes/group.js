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
  const userId = req.query.userId;
  let resu = await new Promise((resolve, reject) => {
    const sqlQuery = `SELECT groupTable.Id, groupTable.groupName, groupTable.groupType
                    FROM groupTable
                    JOIN userAccess
                    ON groupTable.id = userAccess.groupId
                    WHERE userAccess.userId = '${userId}' OR groupTable.createdByUser = '${userId}'`;
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

router.route(`/`);

module.exports = router;
