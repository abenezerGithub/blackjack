require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const { db } = require("./db/db");
const startGame = require("./game_logics/startGame");
const joinGame = require("./game_logics/joinGame");
const gamePlay = require("./game_logics/gamePlay");
const gameStand = require("./game_logics/gameStand");
const restartGame = require("./game_logics/restartGame");
const clients = require("./game_logics/clients");
const { deleteGame, getGamesByPlayer } = require("./db/queries");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static files from the 'client' folder
app.use(express.static(path.join(__dirname, "client")));

// WebSocket connection
wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    if (data.id == "NEW_GAME") {
      await startGame(data, ws);
    }
    if (data.id == "JOIN_GAME") {
      //prod-commented console.log(data);

      await joinGame(data, ws);
    }
    if (data.id == "GAME_PLAY") {
      await gamePlay(data);
    }
    if (data.id == "GAME_STAND") {
      await gameStand(data);
    }
    if (data.id == "GAME_RESTART") {
      //prod-commented console.log("restart game");
      await restartGame(data);
    }
  });

  ws.on("close", async () => {
    //prod-commented console.log("WebSocket connection closed");
    const playerId = Array.from(clients.entries()).find(
      ([key, val]) => val === ws
    )?.[0];
    if (!playerId) {
      //prod-commented console.log("WebSocket not found in the map.");
      return;
    }

    let games = await getGamesByPlayer(playerId);
    if (!games && games.length == 0) {
      return;
    }
    const game = games[0];
    if (!game) {
      return;
    }
    const isPlayerOne = game?.playerOne === playerId;
    const isPlayerTwo = !isPlayerOne;
    if (isPlayerTwo && clients.get(game?.playerOne)) {
      clients.delete(game?.playerTwo);
      clients
        .get(game?.playerOne)
        ?.send(JSON.stringify({ id: "GAME_JOINER_OFFLINE", gid: game?.gid }));
      await deleteGame(game?.gid);
    } else if (isPlayerOne && clients.get(game?.playerTwo)) {
      clients
        .get(game?.playerTwo)
        ?.send(JSON.stringify({ id: "GAME_CREATER_OFFLINE" }));
      clients.delete(game?.playerOne);
      clients.delete(game?.playerTwo);
    } else if (isPlayerTwo) {
      clients.delete(game?.playerTwo);
    }
  });

  ws.on("error", (err) => {
    //prod-commented console.log(err);
  });
});

// Serve the index.html file

// Start the server
server.listen(PORT, () => {
  //prod-commented console.log(`Server is running on http://localhost:${PORT}`);
});
