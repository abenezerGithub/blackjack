function shuffleCard() {
  const cardShuffleCanvas = document.querySelector(".card-shuffle-canvas");
  const scale = window.devicePixelRatio; // e.g., 2 for Retina displays
  cardShuffleCanvas.width = cardShuffleCanvas.clientWidth * scale;
  cardShuffleCanvas.height = cardShuffleCanvas.clientHeight * scale;
  const cardShuffleCanvasWidth = cardShuffleCanvas.width;
  const cardShuffleCanvasHeight = cardShuffleCanvas.height;
  const shuffleCardWidth = cardShuffleCanvasWidth * 0.3;
  const shuffleCardHeight = shuffleCardWidth * (3.5 / 2.5); // Assuming a card aspect ratio of 2.5:3.5
  const cardShuffleCtx = cardShuffleCanvas.getContext("2d");
  cardShuffleCtx.clearRect(
    0,
    0,
    cardShuffleCanvasWidth,
    cardShuffleCanvasHeight
  );
  class CardImage {
    constructor(src, x, y, width, height, skewFactor) {
      this.src = src;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.skewFactor = skewFactor;
    }
    draw(ctx) {
      this.src.onload = () => {
        ctx.imageSmoothingEnabled = true;
        // const rotateAngle = this.skewFactor * Math.PI;
        // ctx.imageSmoothingQuality = "high";
        ctx.setTransform(1, this.skewFactor, 0, 1, 0, 0);
        ////prod-commented console.log({ rotateAngle, skewFactor: this.skewFactor });
        // ctx.rotate(rotateAngle);
        ctx.drawImage(this.src, this.x, this.y, this.width, this.height);
        ctx.restore();
      };
    }
  }

  const images = [2, "Q", "K", "A", 8, 10, "J"]
    .map((src, i) => [new Image(), src])
    .map((imgInfo, i) => {
      imgInfo[0].src = `/blackjack_assets/images/${imgInfo[1]}.png`;
      return imgInfo[0];
    });
  const cardInstances = [];
  const midCard = Math.floor(images.length / 2);
  images.map((img, i) => {
    const isLeft = i + 1 < midCard;
    const isRight = i + 1 > midCard;
    let x = cardShuffleCanvasWidth / 2 - shuffleCardWidth / 2;
    let y = cardShuffleCanvasHeight / 2 - shuffleCardHeight / 2;
    if (isLeft) {
      x -= (midCard - i) * 15;
    } else if (isRight) {
      x += (i - midCard) * 15;
    }
    const skewFactor = isLeft
      ? -0.06 * (i + 1 - midCard)
      : isRight
      ? -0.06 * (i + 1 - midCard)
      : 0;
    cardInstances.push(
      new CardImage(img, x, y, shuffleCardWidth, shuffleCardHeight, skewFactor)
    );
  });
  cardInstances.map((card, i) => {
    //prod-commented console.log(card);
    card.draw(cardShuffleCtx);
  });
}

shuffleCard();

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    shuffleCard();
  }, 200);
});
// setInterval(() => {
//   cardShuffleCtx.clearRect(
//     0,
//     0,
//     cardShuffleCanvasWidth,
//     cardShuffleCanvasHeight
//   );
// }, 2000);
