// ------------------- Menu Scene -------------------
import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }


  preload() {
    this.load.image("play_btn", "button.png"); // Game Over image
  }

  create() {

    this.cameras.main.setBackgroundColor("rgba(230, 151, 91, 1)");


     // --- Responsive Restart Instruction ---
    this.nameText = this.add.text(this.scale.width / 2, this.scale.height * 0.3, "Buzz Eye", {
      fontSize: `${Math.floor(this.scale.width * 0.06)}px`,
     fill: "rgba(244, 53, 28, 1)",
      fontFamily: "cursive",
      fontStyle: "bold",
    }).setOrigin(0.5);

    
    this.play_btn = this.add.image(this.scale.width / 2, this.scale.height * 0.5,"play_btn");

    const maxWidth = this.scale.width * 0.2;
    const maxHeight = this.scale.height * 0.2;

    const scaleX = maxWidth / this.play_btn.width;
    const scaleY = maxHeight / this.play_btn.height;
    const scale = Math.min(scaleX, scaleY);

    this.play_btn.setScale(scale);
    this.play_btn.setOrigin(0.5, 0.5);

    // --- Make Image Interactive ---
    this.play_btn.setInteractive({ useHandCursor: true });

    // Save original scale for hover effect
    const originalScale = scale;
    const hoverScale = scale * 1.1; // scale up by 10%

    // Hover over: scale up
    this.play_btn.on("pointerover", () => {
      this.play_btn.setScale(hoverScale);
    });

    // Hover out: return to normal scale
    this.play_btn.on("pointerout", () => {
      this.play_btn.setScale(originalScale);
    });

    // Click
    this.play_btn.on("pointerdown", () => {
      this.scene.start("GameScene");
    });



   


    // --- Handle Window Resize ---
    this.scale.on("resize", this.resize, this);
  }

  // --- Resize Handler Function ---
  resize(gameSize) {
    const { width, height } = gameSize;

    // Scale button again (keep aspect ratio)
    const maxWidth = width * 0.6;
    const maxHeight = height * 0.4;

    const scaleX = maxWidth / this.play_btn.width;
    const scaleY = maxHeight / this.play_btn.height;
    const scale = Math.min(scaleX, scaleY);

    this.play_btn.setScale(scale);
    this.play_btn.setPosition(width / 2, height * 0.3);


    this.nameText.setFontSize(Math.floor(width * 0.03));
    this.nameText.setPosition(width / 2, height * 0.65);
  }
}
