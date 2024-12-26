const { db } = require("../db/db");
const {
  getGame,
  insertPlayer,
  updateGamePlayers,
  getPlayer,
} = require("../db/queries");
const clients = require("./clients");
const generateRandomString = require("./generateRandomString");

module.exports = async (data, ws) => {
  const gid = data.gid;
  let uid = generateRandomString();
  // Fetch existing game with the given gid
  const prevGame = await getGame(gid);

  if (prevGame) {
    //prod-commented console.log("Previous Game Found:", prevGame);

    // Insert new player
    await insertPlayer(uid, data.name);

    const starter = [1, 2][Math.floor(Math.random() * 2)];
    const starterId = starter == 1 ? prevGame.playerOne : uid;
    // Update the game's playerTwo field
    await updateGamePlayers(gid, uid, starterId, starterId);
    // Fetch updated game details
    const updatedGame = await getGame(gid);

    // Send updated game details back to the WebSocket client
    clients.set(updatedGame.playerTwo, ws);
    const playerOne = await getPlayer(updatedGame.playerOne);
    const playerTwo = await getPlayer(updatedGame.playerTwo);
    const msg = JSON.stringify({
      starter,
      id: "FREIND_JOIN",
      gid,
      uid,
      game: updatedGame,
      playerOne,
      playerTwo,
    });
    clients.get(prevGame.playerOne)?.send(msg);
    ws?.send(msg);
  } else {
    //prod-commented console.log(`No game found with gid: ${gid}`);
    ws?.send(
      JSON.stringify({
        id: "ERROR",
        message: `Game with gid: ${gid} not found.`,
      })
    );
  }
};
