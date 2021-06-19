const router = require('express').Router();
const sql = require('../mysql.js');
const {route} = require('./users.js');

router.route('/start-attendance').post((req, res) => {
  const groupId = req.body.groupId;
  const sqlQuery = `SELECT
                        users
                    FROM
                        userAccess
                    JOIN users ON userAccess.userId = users.email
                    WHERE
                        userAccess.groupId = '${groupId}'`
    

    let resu = await new Promise((resolve, reject) => {
        const sqlQuery = `SELECT DISTINCT
                                groupTable.Id,
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
});

router.route(`/`);

module.exports = router;
