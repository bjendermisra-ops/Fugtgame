
import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("play_btn", "button.png"); 
    this.load.image("bg", "bgplanat.jpg");
  }

  create() {
    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, "bg");
    
    // Background scaling logic
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    bg.setTint(0x888888); 

    this.titleText = this.add.text(this.scale.width / 2, this.scale.height * 0.25, "BUZZ EYE", {
      fontSize: '64px',
      fill: "#ffffff",
      fontFamily: "cursive",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#FF4500', blur: 10, stroke: true, fill: true }
    }).setOrigin(0.5);

    this.play_btn = this.add.image(this.scale.width / 2, this.scale.height * 0.55, "play_btn");
    this.play_btn.setInteractive({ useHandCursor: true });

    // Pulse Animation
    this.tweens.add({
      targets: this.play_btn,
      scaleX: '+=0.05', 
      scaleY: '+=0.05',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.play_btn.on("pointerdown", () => {
       this.scene.start("GameScene");
    });

    this.scale.on("resize", this.resize, this);
    this.resize({ width: this.scale.width, height: this.scale.height });
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    
    // Title resize
    const fontSize = Math.floor(Math.min(width, height) * 0.12);
    this.titleText.setFontSize(fontSize);
    this.titleText.setPosition(width / 2, height * 0.25);

    // Play Button Logic - FORCE SIZE
    // Button will always be 25% of the smaller screen dimension
    const btnSize = Math.min(width, height) * 0.25;
    
    // Force specific pixel size
    this.play_btn.setDisplaySize(btnSize, btnSize);
    this.play_btn.setPosition(width / 2, height * 0.55);
  }
}
