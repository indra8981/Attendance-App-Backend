const router = require('express').Router();
const sql = require('../mysql.js');

router.route('').get(async (req, res) => {
  const groupId = req.query.groupId;
  let resu = await new Promise((resolve, reject) => {
    const sqlQuery = `SELECT chat FROM chats WHERE groupId = ${groupId} ORDER BY sentAtEpoch DESC`;
    console.log(sqlQuery);
    sql.query(sqlQuery, req.body, function (err, result) {
      if (err) {
        res.status(400).send({error: err.sqlMessage});
        return;
      }
      resolve(result);
    });
  });
  let chats = [];
  for(chat of resu)
    chats.push(chat.chat)
  res.status(200).send({chats: chats});
});

router.route(`/`);

module.exports = router;
