const dynamoDb = require("./db");

module.exports = {
  deleteGame: async (gid) => {
    await dynamoDb.delete({ TableName: "games", Key: { gid } }).promise();
  },

  getGame: async (gid) => {
    const result = await dynamoDb
      .get({ TableName: "games", Key: { gid } })
      .promise();
    return result.Item;
  },
  getPlayer: async (uid) => {
    const result = await dynamoDb
      .get({ TableName: "players", Key: { uid } })
      .promise();
    return result.Item;
  },
  getGamesByPlayer: async (playerId) => {
    const result = await dynamoDb
      .scan({
        TableName: "games",
        FilterExpression: "playerOne = :playerId OR playerTwo = :playerId",
        ExpressionAttributeValues: { ":playerId": playerId },
      })
      .promise();
    return result.Items;
  },

  updateGameData: async (gid, gameData) => {
    await dynamoDb
      .update({
        TableName: "games",
        Key: { gid },
        UpdateExpression: "set #data = :data",
        ExpressionAttributeNames: { "#data": "data" },
        ExpressionAttributeValues: { ":data": gameData },
      })
      .promise();
  },

  updateGameTurn: async (gid, turnId) => {
    await dynamoDb
      .update({
        TableName: "games",
        Key: { gid },
        UpdateExpression: "set turnId = :turnId",
        ExpressionAttributeValues: { ":turnId": turnId },
      })
      .promise();
  },

  insertPlayer: async (uid, name) => {
    await dynamoDb
      .put({
        TableName: "players",
        Item: { uid, name },
      })
      .promise();
  },

  updateGamePlayers: async (gid, playerTwo, turnId, starter) => {
    await dynamoDb
      .update({
        TableName: "games",
        Key: { gid },
        UpdateExpression:
          "set playerTwo = :playerTwo, turnId = :turnId, starter = :starter",
        ExpressionAttributeValues: {
          ":playerTwo": playerTwo,
          ":turnId": turnId,
          ":starter": starter,
        },
      })
      .promise();
  },

  insertGame: async (gid, playerOne) => {
    await dynamoDb
      .put({
        TableName: "games",
        Item: { gid, playerOne },
      })
      .promise();
  },

  updateGameHistory: async (gid, history) => {
    await dynamoDb
      .update({
        TableName: "games",
        Key: { gid },
        UpdateExpression: "set history = :history, #data = :data",
        ExpressionAttributeNames: { "#data": "data" },
        ExpressionAttributeValues: {
          ":history": history,
          ":data": null,
        },
      })
      .promise();
  },

  updateGameStarter: async (gid, starterId) => {
    await dynamoDb
      .update({
        TableName: "games",
        Key: { gid },
        UpdateExpression: "set starter = :starter, turnId = :turnId",
        ExpressionAttributeValues: {
          ":starter": starterId,
          ":turnId": starterId,
        },
      })
      .promise();
  },
};
