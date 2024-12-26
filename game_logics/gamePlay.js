const { db } = require("../db/db");
const { getGame, updateGameData } = require("../db/queries");
const clients = require("./clients");

const cardValues = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 10,
  K: 10,
  Q: 10,
  A: [1, 11],
};

module.exports = async (data) => {
  const game = await getGame(data.gid);
  let gameData;
  const card = data.card;

  const index = data.uid == game.playerOne ? 1 : 2;
  if (game.data) {
    const parsedPrevData = JSON.parse(game.data);
    //prod-commented console.log(parsedPrevData);
    gameData = {
      cards: {
        ...parsedPrevData.cards,
        [index]: [...(parsedPrevData.cards[index] ?? []), data.card],
      },
      score: {
        ...parsedPrevData.score,
        [index]:
          card == "A"
            ? (parsedPrevData.score[index] ?? 0) + 11 > 21
              ? (parsedPrevData.score[index] ?? 0) + 1
              : (parsedPrevData.score[index] ?? 0) + 11
            : (parsedPrevData.score[index] ?? 0) + cardValues[card],
      },
    };
  } else {
    gameData = {
      cards: { [index]: [data.card] },
      score: { [index]: card == "A" ? 11 : cardValues[card] },
    };
  }
  await updateGameData(data.gid, JSON.stringify(gameData));

  const updatedGame = await getGame(data.gid);
  const msg = {
    id: "GAME_PLAY_RESPONSE",
    actor: data.uid,
    game: updatedGame,
    card: data.card,
  };

  //prod-commented console.log(
  //   data.uid,
  //   game.playerOne,
  //   game.playerTwo,
  //   data.uid == game.playerOne ? false : true,
  //   data.uid == game.playerTwo ? false : true
  // );
  clients.get(game.playerOne)?.send(
    JSON.stringify({
      ...msg,
      needUpdate: data.uid == game.playerOne ? false : true,
    })
  );
  clients.get(game.playerTwo)?.send(
    JSON.stringify({
      ...msg,
      needUpdate: data.uid == game.playerTwo ? false : true,
    })
  );
};
