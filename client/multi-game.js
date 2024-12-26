// alert("suu");
const socketLink = `${window.location.origin.replace(/^http/, "ws")}/ws`;
const gameHolder = document.querySelector(".game-holder");
const loadingWrapper = document.querySelector(".game-loading-wrapper");
const loadingMessage = document.querySelector(".game-loading-message");

const playerOneName = document.querySelector(".playerOneName");
const playerTwoName = document.querySelector(".playerTwoName");
const gameId = document.querySelector(".game-id");
const copyGameIdBtn = document.querySelector(".game-id-copy-button");
const copyGameLinkIdBtn = document.querySelector(".game-id-link-button");
const buttonHolder = document.querySelector(".btn-holder");

const socketConnectionStatusIndicator = document.querySelector(
  ".socket-status-indicator"
);
const socketConnectionStatusMessage = document.querySelector(
  ".socket-status-message"
);

const gameData = {
  starter: null,
  playerOneCards: [],
  playerTwoCards: [],
  playerOneScore: 0,
  playerTwoScore: 0,
  playerOneStands: false,
  playerTwoStands: false,
  cards: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "K", "Q", "A"],
  cardValues: {
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
  },
};

document.addEventListener("DOMContentLoaded", function () {
  const name = sessionStorage.getItem("blackJack-playerName");
  const code = sessionStorage.getItem("blackJack-playerCode");
  const gid = localStorage.getItem("GAME_ROOM_SUGGESTION");
  //prod-commented console.log(code, name);
  if (name && !code) {
    disableGameButtons();
    let created = false;
    loadingMessage.textContent = "Creating Game Room...";
    const socket = new WebSocket(socketLink);
    socket.addEventListener("open", function () {
      socket.send(JSON.stringify({ id: "NEW_GAME", name: name, gid: gid }));
    });
    localStorage.removeItem("GAME_ROOM_SUGGESTION");

    socket.addEventListener("message", function (event) {
      const data = JSON.parse(event.data);
      const id = data.id;
      //prod-commented console.log("data", data);

      if (id == "GAME_CREATED") {
        created = true;
        loadingWrapper.style.display = "none";
        gameHolder.style.display = "block";
        playerOneName.textContent = `${data.name}: `;
        gameId.textContent = `Game Id: ${data.gid}`;
        socketConnectionStatusIndicator.style.background = "green";
        socketConnectionStatusMessage.textContent = "Connected";
        displayStyleForConnectionInfo("flex");
        copyGameIdBtn.addEventListener("click", () => {
          navigator.clipboard
            .writeText(data.gid)
            .then(() => {
              showToast("Game ID copied to clipboard! Share it with freind.");
            })
            .catch((err) => {
              console.error("Failed to copy: ", err);
            });
        });
        copyGameLinkIdBtn.addEventListener("click", () => {
          navigator.clipboard
            .writeText(
              `${window.location.origin}/multi-player.html?gameId=${data.gid}`
            )
            .then(() => {
              showToast("Game ID copied to clipboard! Share it with freind.");
            })
            .catch((err) => {
              console.error("Failed to copy: ", err);
            });
        });
      } else if (id == "FREIND_JOIN") {
        displayStyleForConnectionInfo("none");
        playerTwoName.textContent = `${data?.playerTwo?.name}: `;
        const starter = data.starter;
        if (starter == 1) {
          gameData.starter = starter;

          enableGameButtons(true);
          playLive(
            data.gid,
            starter == 1 ? data.playerOne.uid : data.playerTwo.uid,
            socket,
            starter
          );
        } else {
          disableGameButtons("Waiting for player two to play...");
        }
      } else if (id == "GAME_STAND") {
        gameStand(data, 1, socket);
      } else if (id == "GAME_PLAY_RESPONSE") {
        const needUpdate = data.needUpdate;
        if (needUpdate) {
          const { cards, score } = JSON.parse(data?.game?.data) ?? {};
          const card = data.card;
          updatePipedGamePlay(cards[2], card, score[2], 2);
        }
      } else if (id == "GAME_RESULT") {
        gameResult(data, 1, socket);
      } else if (id == "GAME_RESTART") {
        gameRestartSetup(data, 1, socket);
      } else if (id == "GAME_JOINER_OFFLINE") {
        localStorage.setItem("GAME_ROOM_SUGGESTION", data.gid);
        ////prod-commented console.log(data);
        showToast(
          "Your Freind just left the game. Waiting to other player to join. Refreshing state in 2 seconds...",
          {
            duration: 5000,
            backgroundColor: "crimson",
          }
        );

        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    });

    socket.addEventListener("close", function (event) {
      socketConnectionStatusIndicator.style.background = "red";
      socketConnectionStatusMessage.textContent = "Disconnected";
      if (!created) {
        showToast("Creating Game takes longer than expected, retrying...", {
          duration: 5000,
          backgroundColor: "crimson",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast("Disconnected, Refresh the page to create new Game room.", {
          duration: 5000,
          backgroundColor: "crimson",
        });
      }
    });
  } else if (code) {
    // reverse the box
    document.querySelector(".container-2").classList.add("container-2-reverse");
    gameId.textContent = `Finding Game Room...`;
    loadingMessage.textContent = "Joining Game Room...";
    let connected = false;
    const socket = new WebSocket(socketLink);
    socket.addEventListener("open", function () {
      socket.send(JSON.stringify({ id: "JOIN_GAME", name: name, gid: code }));
      setTimeout(() => {
        if (!connected) {
          showToast(
            "Joining takes unexpectedly longer. Please try again. Redirecting...",
            {
              duration: 5000,
              backgroundColor: "crimson",
            }
          );
          setTimeout(() => {
            window.history.back();
          }, 2000);
        }
      }, 8000);
    });

    socket.addEventListener("message", function (event) {
      const data = JSON.parse(event.data);
      const id = data.id;
      //prod-commented console.log("data", data);
      if (id == "FREIND_JOIN") {
        connected = true;
        loadingWrapper.style.display = "none";
        gameHolder.style.display = "block";
        playerOneName.textContent = `${data?.playerOne?.name}: `;
        playerTwoName.textContent = `${data?.playerTwo?.name}: `;
        gameId.textContent = `Game Id: ${data.gid}`;
        socketConnectionStatusIndicator.style.background = "green";
        socketConnectionStatusMessage.textContent = "Connected";

        copyGameIdBtn.addEventListener("click", () => {
          navigator.clipboard
            .writeText(data.gid)
            .then(() => {
              showToast("Game ID copied to clipboard! Share it with freind.");
            })
            .catch((err) => {
              console.error("Failed to copy: ", err);
            });
        });
        copyGameLinkIdBtn.addEventListener("click", () => {
          navigator.clipboard
            .writeText(
              `${window.location.origin}/multi-player.html?gameId=${data.gid}`
            )
            .then(() => {
              showToast("Game Link copied to clipboard! Share it with freind.");
            })
            .catch((err) => {
              console.error("Failed to copy: ", err);
            });
        });
        const starter = data.starter;
        if (starter == 2) {
          gameData.starter = starter;
          enableGameButtons(true);
          playLive(
            data.gid,
            starter == 1 ? data.playerTwo : data.playerTwo.uid,
            socket,
            starter
          );
        } else {
          disableGameButtons("Waiting for player one to play...");
        }
      }

      if (id == "GAME_PLAY_RESPONSE") {
        const needUpdate = data.needUpdate;
        if (needUpdate) {
          const { cards, score } = JSON.parse(data?.game?.data) ?? {};
          const card = data.card;

          updatePipedGamePlay(cards[1], card, score[1], 1);
        }
      }
      if (id == "GAME_STAND") {
        gameStand(data, 2, socket);
      }

      if (id == "GAME_RESULT") {
        gameResult(data, 2, socket);
      }

      if (id == "GAME_RESTART") {
        gameRestartSetup(data, 2, socket);
      }

      if (id == "GAME_CREATER_OFFLINE") {
        enableGameButtons(true);
        disableGameButtons("Game Creator left the game.");
        showToast(
          "Game Creator is offline. Please create another game. Redirecting...",
          {
            duration: 5000,
            backgroundColor: "crimson",
          }
        );
        setTimeout(() => {
          window.history.back();
        }, 2500);
      }
    });

    socket.addEventListener("close", function (event) {
      socketConnectionStatusIndicator.style.background = "red";
      socketConnectionStatusMessage.textContent = "Disconnected";
      connected = false;
      showToast("Connection Get's Intrupeted. Redirecting to home page...", {
        duration: 5000,
        backgroundColor: "crimson",
      });
      setTimeout(() => {
        window.history.back();
      }, 1000);
    });
  }
});

function disableGameButtons(msg) {
  buttonHolder.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    // button.style.visibility = "hidden";
  });
  const overlay = document.createElement("div");
  overlay.textContent =
    msg ?? "Buttons Will be available once a freind join the game.";
  overlay.classList.add("button-diable-overlay");

  buttonHolder.appendChild(overlay);
}

function disablePlayButtonsExceptRestart() {
  const overlays = buttonHolder.querySelectorAll(".button-diable-overlay");
  //prod-commented console.log(overlays);
  overlays.forEach((overlay) => {
    overlay.remove();
  });
  buttonHolder.querySelectorAll("button").forEach((button) => {
    if (button.id != "reset-btn-id") {
      button.disabled = true;
    } else {
      button.disabled = false;
    }
    // button.style.visibility = "hidden";
  });
}

function enableGameButtons(noPlay) {
  buttonHolder
    .querySelectorAll("button")

    .forEach((button) => {
      if (button.id != "reset-btn-id") {
        if (noPlay && button.id == "stand-btn-id") {
          button.disabled = true;
        } else {
          button.disabled = false;
        }
      } else {
        button.disabled = true;
      }
    });
  const overlays = buttonHolder.querySelectorAll(".button-diable-overlay");
  //prod-commented console.log(overlays);
  overlays.forEach((overlay) => {
    overlay.remove();
  });
}

function plaersJoined() {}

function gameStand(data, player, socket) {
  // if()
  const turnId = data.game.turnId;
  const initator = data.initator;
  //prod-commented console.log("TurnId ", turnId, "Player ", player, "Initator ", initator);
  if (initator != player) {
    enableGameButtons(true);
    playLive(
      data.gid,
      player == 1 ? data.game.playerOne : data.game.playerTwo,
      socket,
      player
    );
  }
}
function gameResult(data, player, socket) {
  const winner = data.winner;
  if (winner == player) {
    document.querySelector("#letsplay").textContent = "YOU WIN!";
    document.querySelector("#letsplay").style.color = "#28a745";
    playResultAudio(1);
  } else if (winner == 0) {
    document.querySelector("#letsplay").textContent = "Draw!";
    document.querySelector("#letsplay").style.color = "#ffc107";
    playResultAudio(0);
  } else {
    document.querySelector("#letsplay").textContent = "YOU LOSE!";
    document.querySelector("#letsplay").style.color = "#dc3545";
    playResultAudio();
  }

  disablePlayButtonsExceptRestart();
  document.querySelector("#reset-btn-id").classList.add("glow-effect");
  document.querySelector("#reset-btn-id").onclick = () =>
    restartGame(socket, data.gid);
}

function restartGame(socket, gid) {
  //prod-commented console.log("Restart called");
  socket.send(
    JSON.stringify({
      id: "GAME_RESTART",
      gid,
    })
  );

  document.querySelector("#reset-btn-id").onclick = null;
}

function gameRestartSetup(data, player, socket) {
  if (
    document.querySelector("#reset-btn-id").classList.contains("glow-effect")
  ) {
    document.querySelector("#reset-btn-id").classList.remove("glow-effect");
  }
  const starter = data.starter;
  gameData.starter = starter;
  if (player == starter) {
    enableGameButtons(true);
    playLive(
      data.gid,
      player == 1 ? data.playerOne.uid : data.playerTwo.uid,
      socket,
      starter
    );
  } else {
    if (
      document.querySelector("#hit-btn-id").classList.contains("glow-effect")
    ) {
      document.querySelector("#hit-btn-id").classList.remove("glow-effect");
    }
    disableGameButtons(
      starter == 1
        ? "Waiting for player one to play..."
        : "Waiting for player two to play..."
    );
  }

  gameData.playerOneScore = 0;
  gameData.playerTwoScore = 0;
  gameData.playerOneCards = [];
  gameData.playerTwoCards = [];
  emptyCardBox("#player-1");
  emptyCardBox("#player-2");
  document.querySelector("#player-score").textContent = 0;
  document.querySelector("#bot-score").textContent = 0;
  document.querySelector("#player-score").style.color = "#fff";
  document.querySelector("#bot-score").style.color = "#fff";

  document.querySelector("#letsplay").textContent = "Let's Play!";
  document.querySelector("#letsplay").style.color = "#fff";
}

function playLive(gid, uid, socket, player) {
  //prod-commented console.log("Play live run here");

  document.querySelector("#hit-btn-id").classList.add("glow-effect");

  document.querySelector("#hit-btn-id").onclick = hitCard;
  document.querySelector("#stand-btn-id").onclick = standCard;

  function hitCard() {
    let card = rndNoCard();
    showCard(card, "#player-" + player);
    if (
      document.querySelector("#hit-btn-id").classList.contains("glow-effect")
    ) {
      document.querySelector("#hit-btn-id").classList.remove("glow-effect");
    }
    const score = cardScore(
      player == 1 ? gameData.playerOneScore : gameData.playerTwoScore,
      card
    );
    if (player == 1) {
      gameData.playerOneScore += score;
    } else {
      gameData.playerTwoScore += score;
    }

    socket.send(
      JSON.stringify({
        id: "GAME_PLAY",
        gid,
        uid,
        card,
      })
    );
    //prod-commented console.log("Starter ", gameData.starter, "Player ", player);
    const shouldEnableStand = showScore(
      player == 1 ? gameData.playerOneScore : gameData.playerTwoScore,
      player == 1 ? "#player-score" : "#bot-score",
      gameData.starter == player ||
        (player == 1 ? gameData.playerOneScore : gameData.playerTwoScore) > 21, // client change
      player == 2 ? gameData.playerOneScore : gameData.playerTwoScore
    );
    if (shouldEnableStand) {
      if (document.querySelector("#stand-btn-id").disabled) {
        document.querySelector("#stand-btn-id").disabled = false;
      }
    }
  }
  function standCard() {
    if (
      document.querySelector("#stand-btn-id").classList.contains("glow-effect")
    ) {
      document.querySelector("#stand-btn-id").classList.remove("glow-effect");
    }
    if (player == gameData.starter) {
      disableGameButtons("Waiting for player two to play...");
    }

    socket.send(
      JSON.stringify({
        id: "GAME_STAND",
        gid,
        uid,
      })
    );
  }
}

/// common things

class CustomAudio extends Audio {
  constructor(src) {
    super(src);
  }
  play() {
    if (SOUND) {
      super.play();
    }
  }
}
const swish = new CustomAudio("sounds/swish.m4a");
const bustsan = new CustomAudio("sounds/bust.m4a");
const losesan = new CustomAudio("sounds/aww.mp3");
const drawsan = new CustomAudio("sounds/draw.m4a");
const winsan = new CustomAudio("sounds/cash.mp3");

function playResultAudio(result) {
  if (result == 0) {
    setTimeout(() => {
      drawsan.play();
    }, 500);
  } else if (result == 1) {
    setTimeout(() => {
      winsan.play();
    }, 500);
  } else {
    setTimeout(() => {
      losesan.play();
    }, 500);
  }
}

function rndNoCard() {
  let a = Math.floor(Math.random() * 13);
  return gameData.cards[a];
}

function showCard(card, id) {
  let cardImg = document.createElement("img");
  cardImg.src =
    "https://myaws-bkackjack-buck.s3.us-east-1.amazonaws.com/" + card + ".png";
  document.querySelector(id).appendChild(cardImg);
  swish.play();
}
function emptyCardBox(id) {
  const cardBox = document.querySelector(id);
  cardBox.querySelectorAll("img").forEach((img) => {
    img.remove();
  });
}

function cardScore(playerScore, card) {
  if (card == "A" && playerScore > 10) {
    return 1;
  } else if (card == "A" && playerScore <= 10) {
    return 11;
  }
  return gameData.cardValues[card];
}

function showScore(playerScore, scoreSpan, clientChange, opponentScore) {
  let shouldEnableStand = true;
  if (playerScore <= 21) {
    document.querySelector(scoreSpan).textContent = playerScore;
    //prod-commented console.log("Player Score ", playerScore, "Opponent Score ", opponentScore);
    if (opponentScore && playerScore > opponentScore) {
      document.querySelector("#stand-btn-id").classList.add("glow-effect");
    }
  } else {
    document.querySelector(scoreSpan).textContent = " Bust!";
    bustsan.play();
    document.querySelector(scoreSpan).style.color = "red";
    if (clientChange) {
      shouldEnableStand = false;
      document.querySelector("#hit-btn-id").disabled = true;
      document.querySelector("#hit-btn-id").onclick = null;
      document.querySelector("#stand-btn-id").click();
      document.querySelector("#stand-btn-id").disabled = true;
      document.querySelector("#stand-btn-id").onclick = null;
    }

    // If your busted automatically stand
  }
  //console.log(YOU.score);

  return shouldEnableStand;
}

function updatePipedGamePlay(cards, card, score, player) {
  //prod-commented console.log(cards, card, score, player);
  if (player == 1) {
    gameData.playerOneScore = score;
  } else {
    gameData.playerTwoScore = score;
  }
  showScore(score, player == 1 ? "#player-score" : "#bot-score");
  showCard(card, "#player-" + player);
}

function displayStyleForConnectionInfo(display) {
  document.querySelector(".connecting-tools").style.display = display;
}
