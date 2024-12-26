const { db } = require("../db/db");
const { updateGameTurn, getGame } = require("../db/queries");
const clients = require("./clients");

module.exports = async (data) => {
  const gid = data.gid;
  const uid = data.uid;
  const game = await getGame(gid);
  //prod-commented console.log("Game Stand", game);
  if (game.starter == game.turnId) {
    await updateGameTurn(
      gid,
      game.playerOne == uid ? game.playerTwo : game.playerOne
    );
    const updatedGame = await getGame(gid);
    const msg = JSON.stringify({
      initator: uid == game.playerOne ? 1 : 2,
      id: "GAME_STAND",
      gid,
      game: updatedGame,
    });
    clients.get(game.playerOne)?.send(msg);
    clients.get(game.playerTwo)?.send(msg);
  } else {
    // result here Attach
    const data = JSON.parse(game.data);
    const playerOneScore = data?.score[1];
    const playerTwoScore = data?.score[2];

    const getWinner = (score1, score2) => {
      if (score1 > 21 && score2 > 21) return 0; // Both players bust
      if (score1 > 21) return 2; // Player one busts
      if (score2 > 21) return 1; // Player two busts
      if (score1 === score2) return 0; // Tie
      return score1 > score2 ? 1 : 2; // Highest score wins
    };

    const winner = getWinner(playerOneScore, playerTwoScore);

    const msg = JSON.stringify({
      initator: uid == game.playerOne ? 1 : 2,
      id: "GAME_RESULT",
      gid,
      game,
      winner,
    });

    clients.get(game.playerOne)?.send(msg);
    clients.get(game.playerTwo)?.send(msg);
  }
};
