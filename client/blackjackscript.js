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

let blackJakGame = {
  you: {
    scoreSpan: "#player-score",
    div: "#player-1",
    score: 0,
  },
  dealer: {
    scoreSpan: "#bot-score",
    div: "#player-2",
    score: 0,
  },
  cards: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "K", "Q", "A"],
  cardOwener: {
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
  wins: 0,
  loses: 0,
  drews: 0,
  isStand: false,
  isTurnOver: false,
  one: false,
  two: false,
  three: false,
  four: false,
  five: false,
};
const kk = new CustomAudio(
  "https://myaws-bkackjack-buck.s3.us-east-1.amazonaws.com/coin.wav"
);
document.querySelector("#hit-btn-id").addEventListener("click", blackJackHit);
document.querySelector("#stand-btn-id").addEventListener("click", dealerLogic);
//document.querySelector('#stand-btn-id').addEventListener('click',dealerLogic);
document.querySelector("#reset-btn-id").addEventListener("click", blackJakDeal);
const YOU = blackJakGame.you;
const swish = new CustomAudio(
  "https://myaws-bkackjack-buck.s3.us-east-1.amazonaws.com/swish.m4a"
);
const winsan = new CustomAudio(
  "https://myaws-bkackjack-buck.s3.us-east-1.amazonaws.com/cash.mp3"
);
const losesan = new CustomAudio(
  "https://myaws-bkackjack-buck.s3.us-east-1.amazonaws.com/aww.mp3"
);
const bustsan = new CustomAudio(
  "https://myaws-bkackjack-buck.s3.us-east-1.amazonaws.com/bust.m4a"
);
const drawsan = new CustomAudio(
  "https://myaws-bkackjack-buck.s3.us-east-1.amazonaws.com/draw.m4a"
);

const DEALER = blackJakGame.dealer;
//const rndCard = rndNoCard();
const owner = blackJakGame.cardOwener;
function blackJackHit() {
  if (document.querySelector("#stand-btn-id").disabled) {
    document.querySelector("#stand-btn-id").disabled = false;
  }
  if (!blackJakGame.isStand && YOU.score <= 21) {
    let card = rndNoCard();
    showCard(card, YOU);
    updateScore(card, YOU);
    showScore(YOU);
    blackJakGame.one = true;
  }
}
function showCard(card, activePlayer) {
  // let a = Math.floor(Math.random() * 13);
  //console.log(card, activePlayer);
  //   if (activePlayer.score <= 16) {
  let cardImg = document.createElement("img");
  cardImg.src =
    "https://myaws-bkackjack-buck.s3.us-east-1.amazonaws.com/" + card + ".png";
  document.querySelector(activePlayer.div).appendChild(cardImg);
  swish.play();
  //console.log(card);
  //   }
}

function blackJakDeal() {
  if (blackJakGame.isTurnOver === true) {
    blackJakGame.isStand = false;
    let yourImage = document.querySelector(YOU.div).querySelectorAll("img");
    for (let i = 0; i < yourImage.length; i++) {
      yourImage[i].remove();
    }
    let botImage = document.querySelector(DEALER.div).querySelectorAll("img");
    for (let i = 0; i < botImage.length; i++) {
      botImage[i].remove();
    }
    YOU.score = 0;
    DEALER.score = 0;
    document.querySelector(YOU.scoreSpan).textContent = 0;
    document.querySelector(DEALER.scoreSpan).textContent = 0;

    document.querySelector(YOU.scoreSpan).style.color = "#fff";
    document.querySelector(DEALER.scoreSpan).style.color = "#fff";
    document.querySelector("#letsplay").textContent = "Let 's Play";
    document.querySelector("#letsplay").style.color = "#fff";
    blackJakGame.isTurnOver = false;
    if (blackJakGame.four === true) {
      document.querySelector("#above-select").textContent = " Bet By Coin";
    }

    if (document.querySelector("#hit-btn-id").disabled) {
      document.querySelector("#hit-btn-id").disabled = false;
    }
    if (!document.querySelector("#stand-btn-id").disabled) {
      document.querySelector("#stand-btn-id").disabled = true;
    }
  } else {
    //console.log("Please finish the current game.");
  }
}

function rndNoCard() {
  let a = Math.floor(Math.random() * 13);
  return blackJakGame.cards[a];
}

function updateScore(card, YOU) {
  if (card === "A") {
    if (YOU.score + blackJakGame.cardOwener[card][1] <= 21) {
      YOU.score += blackJakGame.cardOwener[card][1];
    } else {
      YOU.score += blackJakGame.cardOwener[card][0];
    }
  } else {
    YOU.score += blackJakGame.cardOwener[card];
  }

  //  //console.log(blackJakGame.cardOwener[card]);
}

function showScore(YOU) {
  if (YOU.score <= 21) {
    document.querySelector(YOU.scoreSpan).textContent = YOU.score;
  } else {
    document.querySelector(YOU.scoreSpan).textContent = " Bust!";
    if (!document.querySelector("#hit-btn-id").disabled) {
      document.querySelector("#hit-btn-id").disabled = true;
    }
    bustsan.play();
    document.querySelector(YOU.scoreSpan).style.color = "red";
  }
  ////console.log(YOU.score);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dealerLogic() {
  if (YOU.score >= 1) {
    blackJakGame.isStand = true;
  }
  document.querySelector("#hit-btn-id").disabled = true;
  document.querySelector("#stand-btn-id").disabled = true;
  if (DEALER.score === 0) {
    if (blackJakGame.one === true && blackJakGame.two === false) {
      while (
        ((DEALER.score < 16 &&
          blackJakGame.isStand === true &&
          DEALER.score <= YOU.score) ||
          (DEALER.score <= YOU.score && DEALER.score < 21)) &&
        YOU.score <= 21
          ? true
          : DEALER.score == 0
          ? true
          : false
      ) {
        let card = rndNoCard();
        showCard(card, DEALER);
        updateScore(card, DEALER);
        showScore(DEALER);
        await sleep(800);
      }
    }
    blackJakGame.two = false;
    // if (DEALER.score >= 16) {
    let winner = computeWinner();
    blackJakGame.isTurnOver = true;
    showResult(winner);
    // }
  }
}

//}
function showResult(winner) {
  let message, color;
  if (blackJakGame.isTurnOver === true) {
    if (winner == YOU) {
      message = "YOU WIN";
      color = "#0f2";
      winsan.play();
    } else if (winner == DEALER) {
      message = "YOU LOSE";
      color = "red";
      losesan.play();
    } else {
      message = "Draw";
      drawsan.play();
      color = "amber";
    }
    document.querySelector("#letsplay").textContent = message;
    document.querySelector("#letsplay").style.color = color;
    //  //console.log(YOU.score);
  }
}

function computeWinner() {
  let winner;
  //if (blackJakGame.two === true) {
  if (YOU.score <= 21) {
    if (YOU.score > DEALER.score || DEALER.score > 21) {
      blackJakGame.wins++;
      winner = YOU;
    } else if (YOU.score < DEALER.score) {
      blackJakGame.loses++;
      winner = DEALER;
    } else if (YOU.score === DEALER.score) {
      blackJakGame.drews++;
    }
  } else if (YOU.score > 21 && DEALER.score <= 21) {
    blackJakGame.loses++;
    winner = DEALER;
  } else if (YOU.score > 21 && DEALER.score > 21) {
    blackJakGame.drews++;
  }
  return winner;
}
// document.querySelector().addEventListener('click',);

function bettingSpot() {
  blackJakGame.five = true;
  let gameNumber = document.getElementById("Game-count").innerHTML;
  let d = gameNumber.indexOf("G") - 1;
  let e = gameNumber.slice(0, d);

  if (e != "") {
    let checker = document.querySelector("#above-select").textContent;
    if (checker == "insufficient Balance" || checker == " Bet By Coin") {
      let price = this.value;
      let botBlnc = parseInt(document.querySelector(".bot").innerHTML);
      let playerBlnc = parseInt(document.querySelector(".me").innerHTML);
      let updateBotBlnc = botBlnc - price;
      let updatePlrBlnc = playerBlnc - price;
      if (price == "custom") {
        let price1 = prompt("put The Price U want");
        if (!(botBlnc - price1 < 0) && !(playerBlnc - price1 < 0)) {
          document.querySelector("#above-select").textContent =
            price1 + "$ VS " + price1 + "$ ";
          document.querySelector(".bot").innerHTML = botBlnc - price1;
          document.querySelector(".me").innerHTML = playerBlnc - price1;
        }
      } else if (updateBotBlnc < 0 || updatePlrBlnc < 0) {
        if (updatePlrBlnc > 0) {
          document.querySelector("#fig").addEventListener("click", hell);
          function hell() {
            var don = prompt("Type To Donate");

            let botBlnc = parseInt(document.querySelector(".bot").innerHTML);
            document.querySelector(".bot").textContent =
              botBlnc + parseInt(don);
          }
          //console.log(hell());
        }
        document.querySelector("#above-select").textContent =
          "insufficient Balance";
        document.querySelector("#above-select").style.color = "red";
      } //lse if (price == '') {};
      else {
        document.querySelector("#above-select").style.color = "#000";
        document.querySelector(".bot").innerHTML = botBlnc - price;
        document.querySelector(".me").innerHTML = playerBlnc - price;
        document.querySelector("#above-select").textContent =
          price + "$ VS " + price + "$ ";
      }
    }
  } else {
    alert("Please Put Game To play");
  }
}

if (blackJakGame.wins == 1) {
  alert("oops");
}
