const { db } = require("../db/db");
const {
  getGame,
  updateGameHistory,
  updateGameStarter,
  getPlayer,
} = require("../db/queries");
const clients = require("./clients");

module.exports = async (data) => {
  const gid = data.gid;
  let game = await getGame(gid);
  if (!game?.data) {
    return;
  }
  if (game.data) {
    const history = [
      ...JSON.parse(game.history ?? "[]"),
      JSON.parse(game.data),
    ].filter((item) => item !== null);

    await updateGameHistory(gid, JSON.stringify(history));
  }

  const starter = [1, 2][Math.floor(Math.random() * 2)];

  await updateGameStarter(gid, starter == 1 ? game.playerOne : game.playerTwo);

  game = await getGame(gid);

  const playerOne = await getPlayer(game.playerOne);
  const playerTwo = await getPlayer(game.playerTwo);

  const msg = JSON.stringify({
    starter,
    id: "GAME_RESTART",
    gid,
    game,
    playerOne,
    playerTwo,
  });
  clients.get(game.playerOne)?.send(msg);
  clients.get(game.playerTwo)?.send(msg);
};
