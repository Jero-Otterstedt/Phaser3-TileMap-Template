export default class Game2 extends Phaser.Scene {
  constructor() {
    super("game2");
  }

  preload() {
    this.load.tilemapTiledJSON("map2", "public/assets/tilemap/map2.json");
    this.load.image("tileset", "public/assets/tileset.png");
    this.load.image("star", "public/assets/objeto.png");
    this.load.spritesheet("dude", "public/assets/personaje.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const map = this.make.tilemap({ key: "map2" });
    const tileset = map.addTilesetImage("tileset", "tileset");
    const layers = map.layers.map(l => l.name);
    const objectsLayer = map.getObjectLayer(map.objects[0].name);

    map.createLayer(layers[0], tileset);
    this.platformLayer = map.createLayer(layers[1], tileset);

    const spawnPoint = objectsLayer.objects.find(o => o.name === "player");
    const { x = 0, y = 0 } = spawnPoint || {};

    this.player = this.physics.add.sprite(x, y, "dude")
      .setCollideWorldBounds(true)
      .setBounce(0.2)
      .setGravityY(0);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.platformLayer.setCollisionByProperty({ esColisionable: true });
    this.physics.add.collider(this.player, this.platformLayer);

    this.stars = this.physics.add.group();
    objectsLayer.objects.forEach(obj => {
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
    });

    const exitObj = objectsLayer.objects.find(obj => obj.name === "salida");
    if (exitObj) {
      this.exit = this.physics.add.sprite(exitObj.x, exitObj.y)
        .setSize(32, 32)
        .setVisible(false)
        .setImmovable(true);
      this.physics.add.overlap(this.player, this.exit, this.tryNextLevel, null, this);
    }

    this.anims.create({ key: "turn", frames: [{ key: "dude", frame: 0 }], frameRate: 20 });
    this.anims.create({ key: "left", frames: [{ key: "dude", frame: 0 }], frameRate: 10, repeat: -1 });
    this.anims.create({ key: "right", frames: [{ key: "dude", frame: 0 }], frameRate: 10, repeat: -1 });

    this.add.text(100, 100, "¡Nivel 2!", { fontSize: "48px", fill: "#000" });
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

  tryNextLevel() {
    console.log("Intentando pasar de nivel", this.stars.countActive(true));
    if (this.stars.countActive(true) === 0) {
      this.scene.start("game3");
    }
  }
}
