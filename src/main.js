import Phaser from "phaser";
import GameScene from "./scenes/GameScene.js";
import GameOverScene from "./scenes/GameOverScene.js";
import MenuScene from "./scenes/MainMenu.js";





const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#000000",
  parent: "app",          // attach canvas to #app div
  physics: { default: "arcade" },
  scale: {
    mode: Phaser.Scale.RESIZE,        // fit canvas to screen
    autoCenter: Phaser.Scale.CENTER_BOTH, // center canvas
  },
  scene: [MenuScene,GameScene, GameOverScene]
};

const game = new Phaser.Game(config);

