const { db } = require("../db/db");
const { insertPlayer, insertGame } = require("../db/queries");
const clients = require("./clients");
const generateRandomString = require("./generateRandomString");

module.exports = async (data, ws) => {
  const uid = generateRandomString();
  const gid = data.gid ?? generateRandomString();

  await insertPlayer(uid, data.name);
  await insertGame(gid, uid);
  clients.set(uid, ws);
  ws?.send(
    JSON.stringify({
      id: "GAME_CREATED",
      name: data.name,
      uid,
      gid,
      player: {
        uid,
        name: data.name,
      },
      game: {
        gid,
        playerOne: uid,
      },
    })
  );
};
