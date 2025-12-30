import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("play_btn", "button.png"); 
    // Backgrounds ko yahi load kar lete hain taaki menu sundar dikhe
    this.load.image("bg", "bgplanat.jpg");
  }

  create() {
    // Background setup
    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, "bg");
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    bg.setTint(0x888888); // Thoda dark kiya taaki text chamke

    // --- Title Text ---
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height * 0.25, "BUZZ EYE", {
      fontSize: '64px', // Bada font start me
      fill: "#ffffff",
      fontFamily: "cursive",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#FF4500', blur: 10, stroke: true, fill: true }
    }).setOrigin(0.5);

    // --- Play Button ---
    this.play_btn = this.add.image(this.scale.width / 2, this.scale.height * 0.55, "play_btn");
    
    // Button ko screen ke hisab se scale karein
    const btnScale = Math.min(this.scale.width, this.scale.height) * 0.0005; // Dynamic scaling
    this.play_btn.setScale(0.5); // Default start scaling
    
    this.play_btn.setInteractive({ useHandCursor: true });

    // --- Button Animation (Pulse Effect) ---
    this.tweens.add({
      targets: this.play_btn,
      scale: 0.55, // Thoda bada hoga
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Click Event
    this.play_btn.on("pointerdown", () => {
      // Click hone par thoda chota hoga (feedback)
      this.tweens.add({
        targets: this.play_btn,
        scale: 0.4,
        duration: 100,
        onComplete: () => {
          this.scene.start("GameScene");
        }
      });
    });

    // Resize handle
    this.scale.on("resize", this.resize, this);
    this.resize({ width: this.scale.width, height: this.scale.height });
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    
    // Text resize
    const fontSize = Math.floor(Math.min(width, height) * 0.12);
    this.titleText.setFontSize(fontSize);
    this.titleText.setPosition(width / 2, height * 0.25);

    // Button resize logic
    this.play_btn.setPosition(width / 2, height * 0.55);
  }
}