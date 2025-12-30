
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("bg", "bgplanat.jpg");
    this.load.image("bg2", "land.jpg");
    this.load.image("btn", "button.png"); 
    
    // --- Sprites ---
    this.load.spritesheet("player", "bee.png", { frameWidth: 133, frameHeight: 109 });
    this.load.spritesheet("enemy1", "enemy_fly.png", { frameWidth: 60, frameHeight: 44 });
    this.load.spritesheet("enemy2", "ghost.png", { frameWidth: 2000/30, frameHeight: 91 });
    this.load.spritesheet("worm", "enemy_worm.png", { frameWidth: 1374/6, frameHeight: 171 });
    this.load.spritesheet("explosion", "explosions.png", { frameWidth: 96, frameHeight: 85 });

    // Simple bullet texture
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(5, 5, 5);
    graphics.generateTexture('simple_bullet', 10, 10);
  }

  create() {
    this.score = 0;
    this.isGameOver = false;
    this.input.addPointer(2); 

    // --- Backgrounds ---
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "bg").setOrigin(0, 0);
    this.bg.setScrollFactor(0);
    
    this.bg2 = this.add.tileSprite(0, this.scale.height - 176, this.scale.width, 176, "bg2").setOrigin(0, 0);
    this.bg2.setScrollFactor(0);

    // --- Animations ---
    this.createAnimations();

    // --- Player ---
    this.player = this.physics.add.sprite(100, this.scale.height / 2, "player").setScale(0.6);
    this.player.play("player");
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);
    this.player.body.setSize(80, 80);

    // --- Groups ---
    this.enemies = this.physics.add.group();
    this.worms = this.physics.add.group();
    this.playerBullets = this.physics.add.group({ maxSize: 50 });

    // --- Ground ---
    this.ground = this.add.rectangle(this.scale.width/2, this.scale.height - 20, this.scale.width, 40, 0x000000, 0); 
    this.physics.add.existing(this.ground, true);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.worms, this.ground);

    // --- Spawners ---
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.spawnEnemy() });
    this.time.addEvent({ delay: 2000, loop: true, callback: () => this.spawnWorms() });

    // --- Collisions ---
    this.physics.add.overlap(this.playerBullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.playerBullets, this.worms, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, [this.enemies, this.worms], this.endGame, null, this);

    // --- Score ---
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      fontSize: "32px",
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    }).setDepth(100);

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    
    // Create Controls (Desktop pe hidden rahenge)
    this.createMobileControls();

    // Initial resize call
    this.resize({ width: this.scale.width, height: this.scale.height });
    this.scale.on("resize", this.resize, this);
  }

  createAnimations() {
    this.anims.create({ key: "player", frames: this.anims.generateFrameNumbers("player", { start: 0, end: 14 }), frameRate: 25, repeat: -1 });
    this.anims.create({ key: "enemy1_fly", frames: this.anims.generateFrameNumbers("enemy1", { start: 0, end: 5 }), frameRate: 25, repeat: -1 });
    this.anims.create({ key: "enemy2_fly", frames: this.anims.generateFrameNumbers("enemy2", { start: 0, end: 29 }), frameRate: 25, repeat: -1 });
    this.anims.create({ key: "worm", frames: this.anims.generateFrameNumbers("worm", { start: 0, end: 5 }), frameRate: 25, repeat: -1 });
    this.anims.create({ key: "explode", frames: this.anims.generateFrameNumbers("explosion", { start: 0, end: 20 }), frameRate: 20, hideOnComplete: true });
  }

  createMobileControls() {
    this.mobileUp = false;
    this.mobileDown = false;
    this.isShooting = false;
    this.lastFired = 0;

    // Start with visible false, resize will show them
    this.upBtn = this.add.image(0, 0, "btn").setInteractive().setDepth(200).setScrollFactor(0).setAlpha(0.6).setVisible(false);
    this.downBtn = this.add.image(0, 0, "btn").setInteractive().setDepth(200).setScrollFactor(0).setAlpha(0.6).setVisible(false);
    this.shootBtn = this.add.image(0, 0, "btn").setInteractive().setDepth(200).setScrollFactor(0).setAlpha(0.6).setTint(0xff4444).setVisible(false);

    // Rotate arrows
    this.upBtn.setRotation(-1.57); // Up
    this.downBtn.setRotation(1.57); // Down

    // Events
    this.upBtn.on("pointerdown", () => { this.mobileUp = true; this.upBtn.setAlpha(1); });
    this.upBtn.on("pointerup", () => { this.mobileUp = false; this.upBtn.setAlpha(0.6); });
    this.upBtn.on("pointerout", () => { this.mobileUp = false; this.upBtn.setAlpha(0.6); });

    this.downBtn.on("pointerdown", () => { this.mobileDown = true; this.downBtn.setAlpha(1); });
    this.downBtn.on("pointerup", () => { this.mobileDown = false; this.downBtn.setAlpha(0.6); });
    this.downBtn.on("pointerout", () => { this.mobileDown = false; this.downBtn.setAlpha(0.6); });

    this.shootBtn.on("pointerdown", () => { this.isShooting = true; this.shootBtn.setAlpha(1); });
    this.shootBtn.on("pointerup", () => { this.isShooting = false; this.shootBtn.setAlpha(0.6); });
    this.shootBtn.on("pointerout", () => { this.isShooting = false; this.shootBtn.setAlpha(0.6); });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    this.bg.tilePositionX += 2;
    this.bg2.tilePositionX += 4;

    const speed = 400;

    // Movement
    if (this.cursors.up.isDown || this.mobileUp) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.mobileDown) {
      this.player.setVelocityY(speed);
    } 

    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.flipX = false;
    } else {
        this.player.setVelocityX(0);
    }

    // Bounds
    if(this.player.y < 0) this.player.y = 0;
    if(this.player.y > this.scale.height - 50) this.player.y = this.scale.height - 50;

    // Shooting
    if ((this.sKey.isDown || this.isShooting) && time > this.lastFired) {
        this.fireBullet();
        this.lastFired = time + 200; 
    }

    // Cleanup
    this.playerBullets.children.iterate(b => {
        if (b && (b.x > this.scale.width + 50 || b.x < -50)) b.destroy();
    });
    this.enemies.children.iterate(e => { if (e && e.x < -100) e.destroy(); });
  }

  fireBullet() {
    const offsetX = this.player.flipX ? -50 : 50;
    const velocityX = this.player.flipX ? -900 : 900;
    const colors = [0x00ff00, 0xff0000, 0x00ffff, 0xffff00];
    const color = Phaser.Utils.Array.GetRandom(colors);

    let bullet = this.playerBullets.get(this.player.x + offsetX, this.player.y, "simple_bullet");
    if (bullet) {
        bullet.setActive(true).setVisible(true);
        bullet.setTint(color);
        bullet.body.allowGravity = false;
        bullet.setVelocityX(velocityX);
    }
  }

  spawnEnemy() {
    const types = ["enemy1", "enemy2"];
    const type = Phaser.Utils.Array.GetRandom(types);
    const enemy = this.enemies.create(this.scale.width + 50, Phaser.Math.Between(50, this.scale.height - 200), type);
    enemy.setScale(1.2);
    enemy.body.allowGravity = false;
    enemy.setVelocityX(Phaser.Math.Between(-300, -500));
    enemy.play(type + "_fly");
  }

  spawnWorms() {
    const worm = this.worms.create(this.scale.width + 50, this.scale.height - 100, "worm");
    worm.setScale(0.5);
    worm.body.setGravityY(1000);
    worm.setVelocityX(-150);
    worm.play("worm");
    this.time.addEvent({ delay: Phaser.Math.Between(1000, 3000), callback: () => { if(worm.active) worm.setVelocityY(-500); }, loop: true });
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    const explosion = this.add.sprite(enemy.x, enemy.y, "explosion").setScale(1.5);
    explosion.play("explode");
    enemy.destroy();
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
  }

  endGame() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
        this.scene.start("GameOverScene", { score: this.score });
    });
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    
    // Backgrounds
    this.bg.setSize(width, height);
    this.bg2.setPosition(0, height - 176);
    this.bg2.setSize(width, 176);
    this.ground.setPosition(width/2, height - 20);
    this.ground.width = width;
    if(this.ground.body) this.ground.body.updateFromGameObject();

    // --- BUTTON RESIZING (FORCE SIZE) ---
    const isDesktop = this.sys.game.device.os.desktop;

    if (isDesktop) {
        if(this.upBtn) this.upBtn.setVisible(false);
        if(this.downBtn) this.downBtn.setVisible(false);
        if(this.shootBtn) this.shootBtn.setVisible(false);
    } else {
        if(this.upBtn) {
            this.upBtn.setVisible(true);
            this.downBtn.setVisible(true);
            this.shootBtn.setVisible(true);

            // FORCE button to be exactly 15% of screen width
            // This ignores the original image size completely
            const btnSize = width * 0.15; 
            
            this.upBtn.setDisplaySize(btnSize, btnSize);
            this.downBtn.setDisplaySize(btnSize, btnSize);
            this.shootBtn.setDisplaySize(btnSize * 1.3, btnSize * 1.3); // Shoot thoda bada

            // Positions
            const paddingX = width * 0.08;
            const paddingY = height * 0.1;

            // Left Controls
            this.downBtn.setPosition(paddingX + btnSize/2, height - paddingY - btnSize/2);
            this.upBtn.setPosition(paddingX + btnSize/2, height - paddingY - (btnSize * 1.5) - btnSize/2);

            // Right Controls
            this.shootBtn.setPosition(width - paddingX - btnSize/2, height - paddingY - btnSize/2);
        }
    }
  }
}
