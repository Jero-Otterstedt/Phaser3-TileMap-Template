export default class Game3 extends Phaser.Scene {
  constructor() {
    super("game3");
  }

  preload() {
    this.load.tilemapTiledJSON("map3", "public/assets/tilemap/map3.json");
    this.load.image("tileset", "public/assets/tileset.png");
    this.load.image("star", "public/assets/objeto.png");
    this.load.spritesheet("dude", "public/assets/personaje.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const map = this.make.tilemap({ key: "map3" });
    const tileset = map.addTilesetImage("tileset", "tileset");
    const layerNames = map.layers.map(l => l.name);
    const objectLayer = map.getObjectLayer(map.objects[0].name);

    map.createLayer(layerNames[0], tileset);
    this.platformLayer = map.createLayer(layerNames[1], tileset);

    const spawnPoint = objectLayer.objects.find(o => o.name === "player");
    const { x = 0, y = 0 } = spawnPoint || {};

    this.player = this.physics.add.sprite(x, y, "dude")
      .setCollideWorldBounds(true)
      .setGravityY(0)
      .setBounce(0.2);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.platformLayer.setCollisionByProperty({ esColisionable: true });
    this.physics.add.collider(this.player, this.platformLayer);

    this.stars = this.physics.add.group();
    objectLayer.objects.forEach(obj => {
      if (obj.type === "star") {
        this.stars.create(obj.x, obj.y, "star")
          .setGravityY(0)
          .setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      }
    });

    this.physics.add.collider(this.stars, this.platformLayer);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

    this.scoreText = this.add.text(16, 16, `Score: ${this.registry.get("score")}`, {
      fontSize: "32px", fill: "#000",
    }).setScrollFactor(0);

    const exitObj = objectLayer.objects.find(o => o.name === "salida");
    if (exitObj) {
      this.exit = this.physics.add.sprite(exitObj.x, exitObj.y)
        .setSize(32, 32)
        .setVisible(false)
        .setImmovable(true);
      this.physics.add.overlap(this.player, this.exit, this.endGame, null, this);
    }

    this.anims.create({ key: "turn", frames: [{ key: "dude", frame: 0 }], frameRate: 20 });
    this.anims.create({ key: "left", frames: [{ key: "dude", frame: 0 }], frameRate: 10, repeat: -1 });
    this.anims.create({ key: "right", frames: [{ key: "dude", frame: 0 }], frameRate: 10, repeat: -1 });
  }

  update() {
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown) vx = -160;
    else if (this.cursors.right.isDown) vx = 160;
    if (this.cursors.up.isDown) vy = -160;
    else if (this.cursors.down.isDown) vy = 160;

    this.player.setVelocity(vx, vy);

    if (vx < 0) this.player.anims.play("left", true);
    else if (vx > 0) this.player.anims.play("right", true);
    else if (vx === 0 && vy === 0) this.player.anims.play("turn");

    if (Phaser.Input.Keyboard.JustDown(this.keyR)) this.scene.restart();
  }

  collectStar(_, star) {
    star.disableBody(true, true);
    const score = this.registry.get("score") + 10;
    this.registry.set("score", score);
    this.scoreText.setText(`Score: ${score}`);
  }

  endGame() {
    if (this.stars.countActive(true) === 0 && !this.winText) {
      const cam = this.cameras.main;
      const centerX = cam.worldView.x + cam.width / 2;
      const centerY = cam.worldView.y + cam.height / 2;

      this.winText = this.add.text(centerX, centerY, "¡Ganaste!\nPresiona P para reiniciar", {
        fontSize: "48px",
        fill: "#0000FF",
        align: "center"
      }).setOrigin(0.5);

      
      this.input.keyboard.once('keydown-P', () => {
        this.scene.start("game"); 
      });
    }
  }
}
