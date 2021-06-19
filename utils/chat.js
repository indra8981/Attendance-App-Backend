const sql = require('../mysql.js');

function addChat(chat, groupId) {
  const sentAtEpoch = +new Date();
  const sqlQuery = `INSERT INTO chats (groupId, chat, sentAtEpoch) VALUES (${groupId}, '${JSON.stringify(chat)}', ${sentAtEpoch})`;
  console.log(sqlQuery);
  sql.query(sqlQuery, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    console.log('Number of records inserted: ' + result.affectedRows);
  });
}

module.exports = addChat;