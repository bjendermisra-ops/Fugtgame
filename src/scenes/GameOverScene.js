// ------------------- Game Over Scene -------------------
import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this.finalScore = data.score || 0; 
  }

  preload() {
    this.load.image("replay_btn", "replay_btn.png");
  }

  create() {

    // Fix hover after scene switch in Phaser 3
this.input.topOnly = true;

    this.cameras.main.setBackgroundColor("rgba(230, 151, 91, 1)");

    // --- Replay Button ---
    this.gameOverImage = this.add.image(
      this.scale.width / 2,
      this.scale.height * 0.5,
      "replay_btn"
    );

    // scale responsive
    const maxWidth = this.scale.width * 0.2;
    const maxHeight = this.scale.height * 0.2;
    const scaleX = maxWidth / this.gameOverImage.width;
    const scaleY = maxHeight / this.gameOverImage.height;
    this.originalScale = Math.min(scaleX, scaleY);

    this.gameOverImage.setScale(this.originalScale).setOrigin(0.5);
    this.gameOverImage.setDepth(10); // ⭐ ensure button is on top
    this.gameOverImage.setInteractive({ useHandCursor: true });

    // ⭐ Hover logic using stored scale
    this.gameOverImage.on("pointerover", () => {
      this.gameOverImage.setScale(this.originalScale * 1.1);
    });

    this.gameOverImage.on("pointerout", () => {
      this.gameOverImage.setScale(this.originalScale);
    });

    this.gameOverImage.on("pointerdown", () => {
      this.scene.start("GameScene");
    });

    // --- Score Text ---
    this.scoreText = this.add.text(
      this.scale.width / 2,
      this.scale.height * 0.2,
      `Your Score is ${this.finalScore}.`,
      {
        fontSize: `${Math.floor(this.scale.width * 0.03)}px`,
        fill: "rgba(244, 53, 28, 1)",
        fontFamily: "cursive",
        fontStyle: "bold",
      }
    ).setOrigin(0.5).setDepth(10);

    // --- Instruction Text ---
    this.restartText = this.add.text(
      this.scale.width / 2,
      this.scale.height * 0.3,
      "Click on replay Button to play again.",
      {
        fontSize: `${Math.floor(this.scale.width * 0.03)}px`,
         fill: "rgba(244, 53, 28, 1)",
          fontFamily: "cursive",
          fontStyle: "bold",
      }
    ).setOrigin(0.5).setDepth(10);

    // Space to restart
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("GameScene");
    });

    // Responsive resize
    this.scale.on("resize", this.resize, this);
  }

  // --- Resize handler ---
  resize(gameSize) {
    const { width, height } = gameSize;

    const maxWidth = width * 0.2;
    const maxHeight = height * 0.2;
    const scaleX = maxWidth / this.gameOverImage.width;
    const scaleY = maxHeight / this.gameOverImage.height;
    this.originalScale = Math.min(scaleX, scaleY); // ⭐ update original scale

    this.gameOverImage.setScale(this.originalScale);
    this.gameOverImage.setPosition(width / 2, height * 0.3);

    this.scoreText.setFontSize(Math.floor(width * 0.04));
    this.scoreText.setPosition(width / 2, height * 0.5);

    this.restartText.setFontSize(Math.floor(width * 0.03));
    this.restartText.setPosition(width / 2, height * 0.65);
  }
}
