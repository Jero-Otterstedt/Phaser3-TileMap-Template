import Game from "./scenes/Game.js";
import Game2 from "./scenes/Game2.js";
import Game3 from "./scenes/Game3.js";

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 960,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 800, height: 600 },
    max: { width: 1600, height: 1200 },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [Game, Game2, Game3],
};

new Phaser.Game(config);
