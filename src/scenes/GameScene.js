import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("bg", "bgplanat.jpg");
    this.load.image("bg2", "land.jpg");
    // Controls ke liye button use karenge
    this.load.image("btn", "button.png"); 
    
    // --- Sprites ---
    this.load.spritesheet("player", "bee.png", { frameWidth: 133, frameHeight: 109 });
    this.load.spritesheet("enemy1", "enemy_fly.png", { frameWidth: 60, frameHeight: 44 });
    this.load.spritesheet("enemy2", "ghost.png", { frameWidth: 2000/30, frameHeight: 91 });
    this.load.spritesheet("worm", "enemy_worm.png", { frameWidth: 1374/6, frameHeight: 171 });
    this.load.spritesheet("explosion", "explosions.png", { frameWidth: 96, frameHeight: 85 });

    // Bullet texture (Simple white circle for fallback)
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(5, 5, 5);
    graphics.generateTexture('simple_bullet', 10, 10);
  }

  create() {
    this.score = 0;
    this.isGameOver = false;
    
    // Multi-touch enable (For moving and shooting at same time)
    this.input.addPointer(2); 

    // --- Backgrounds ---
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "bg").setOrigin(0, 0);
    this.bg.setScrollFactor(0); // Background fixed
    
    this.bg2 = this.add.tileSprite(0, this.scale.height - 176, this.scale.width, 176, "bg2").setOrigin(0, 0);
    this.bg2.setScrollFactor(0);

    // --- Animations ---
    this.createAnimations();

    // --- Player ---
    this.player = this.physics.add.sprite(100, this.scale.height / 2, "player").setScale(0.6);
    this.player.play("player");
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);
    this.player.body.setSize(80, 80); // Hitbox adjustment

    // --- Groups ---
    this.enemies = this.physics.add.group();
    this.worms = this.physics.add.group();
    this.playerBullets = this.physics.add.group({ maxSize: 50 });

    // --- Ground ---
    this.ground = this.add.rectangle(this.scale.width/2, this.scale.height - 20, this.scale.width, 40, 0x000000, 0); // Invisible
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

    // --- UI Score ---
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      fontSize: "32px",
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    }).setDepth(100);

    // --- Controls Setup ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    
    // Create Mobile UI
    this.createMobileControls();

    // Resize Listener
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
    // Only show on touch devices or for testing
    // if (!this.sys.game.device.os.android && !this.sys.game.device.os.iOS) return;

    // Control Variables
    this.mobileUp = false;
    this.mobileDown = false;
    this.isShooting = false;
    this.lastFired = 0;

    const btnSize = 0.5; // Scale for buttons
    const alpha = 0.7;   // Transparency

    // 1. UP BUTTON (Left Side) - Using button.png rotated -90 deg to point up
    this.upBtn = this.add.image(100, this.scale.height - 200, "btn")
        .setInteractive()
        .setDepth(200)
        .setScrollFactor(0)
        .setScale(btnSize)
        .setRotation(-1.57) // -90 degrees
        .setAlpha(alpha);

    // 2. DOWN BUTTON (Left Side) - Using button.png rotated 90 deg to point down
    this.downBtn = this.add.image(100, this.scale.height - 80, "btn")
        .setInteractive()
        .setDepth(200)
        .setScrollFactor(0)
        .setScale(btnSize)
        .setRotation(1.57) // 90 degrees
        .setAlpha(alpha);

    // 3. SHOOT BUTTON (Right Side) - Normal button.png, maybe tinted Red
    this.shootBtn = this.add.image(this.scale.width - 100, this.scale.height - 100, "btn")
        .setInteractive()
        .setDepth(200)
        .setScrollFactor(0)
        .setScale(btnSize * 1.2) // Thoda bada
        .setTint(0xff4444) // Red tint for danger/attack
        .setAlpha(alpha);

    // --- Touch Events ---
    
    // UP
    this.upBtn.on("pointerdown", () => { this.mobileUp = true; this.upBtn.setAlpha(1); });
    this.upBtn.on("pointerup", () => { this.mobileUp = false; this.upBtn.setAlpha(alpha); });
    this.upBtn.on("pointerout", () => { this.mobileUp = false; this.upBtn.setAlpha(alpha); });

    // DOWN
    this.downBtn.on("pointerdown", () => { this.mobileDown = true; this.downBtn.setAlpha(1); });
    this.downBtn.on("pointerup", () => { this.mobileDown = false; this.downBtn.setAlpha(alpha); });
    this.downBtn.on("pointerout", () => { this.mobileDown = false; this.downBtn.setAlpha(alpha); });

    // SHOOT
    this.shootBtn.on("pointerdown", () => { this.isShooting = true; this.shootBtn.setScale(btnSize * 1.1); });
    this.shootBtn.on("pointerup", () => { this.isShooting = false; this.shootBtn.setScale(btnSize * 1.2); });
    this.shootBtn.on("pointerout", () => { this.isShooting = false; this.shootBtn.setScale(btnSize * 1.2); });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // Background Scroll
    this.bg.tilePositionX += 2;
    this.bg2.tilePositionX += 4;

    // --- Movement Logic ---
    const speed = 400;
    
    // Keyboard Support
    if (this.cursors.up.isDown || this.mobileUp) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.mobileDown) {
      this.player.setVelocityY(speed);
    } else {
      // Small gravity effect or stop immediately? Gravity is set in create, so we let physics handle falling if not pressing up
      // But for better control, we might want to stop Y velocity if gravity isn't desired.
      // Current setup: Gravity 800. If we want flappy bird style, logic is different.
      // If we want direct control (Jetpack style):
       this.player.setVelocityY(0); // Reset velocity if no input (remove this line if you want gravity fall)
    }

    // Left/Right (Optional if auto-runner)
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.flipX = false;
    } else {
        this.player.setVelocityX(0);
    }

    // --- Bounds ---
    if(this.player.y < 0) this.player.y = 0;
    if(this.player.y > this.scale.height - 50) this.player.y = this.scale.height - 50;

    // --- Shooting ---
    if ((this.sKey.isDown || this.isShooting) && time > this.lastFired) {
        this.fireBullet();
        this.lastFired = time + 200; // Fire rate
    }

    // --- Clean up ---
    this.playerBullets.children.iterate(b => {
        if (b && (b.x > this.scale.width + 50 || b.x < -50)) b.destroy();
    });

    this.enemies.children.iterate(enemy => {
        if (enemy) {
            // enemy movement logic if needed beyond velocity
            if (enemy.x < -100) enemy.destroy();
        }
    });
  }

  fireBullet() {
    const offsetX = this.player.flipX ? -50 : 50;
    const velocityX = this.player.flipX ? -900 : 900;
    
    // Random Colors
    const colors = [0x00ff00, 0xff0000, 0x00ffff, 0xffff00];
    const color = Phaser.Utils.Array.GetRandom(colors);

    let bullet = this.playerBullets.get(this.player.x + offsetX, this.player.y, "simple_bullet");
    
    if (bullet) {
        bullet.setActive(true).setVisible(true);
        bullet.setTint(color);
        bullet.body.allowGravity = false;
        bullet.setVelocityX(velocityX);
        // Play distinct sound here if you have one
    }
  }

  spawnEnemy() {
    const types = ["enemy1", "enemy2"];
    const type = Phaser.Utils.Array.GetRandom(types);
    const yPos = Phaser.Math.Between(50, this.scale.height - 200);
    
    const enemy = this.enemies.create(this.scale.width + 50, yPos, type);
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
    
    // Jumping Logic
    this.time.addEvent({
        delay: Phaser.Math.Between(1000, 3000),
        callback: () => {
            if(worm.active) worm.setVelocityY(-500);
        },
        loop: true
    });
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    
    // Explosion Effect
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
    
    this.bg.setSize(width, height);
    this.bg2.setPosition(0, height - 176);
    this.bg2.setSize(width, 176);
    
    // Reposition Buttons
    if(this.upBtn) this.upBtn.setPosition(100, height - 200);
    if(this.downBtn) this.downBtn.setPosition(100, height - 80);
    if(this.shootBtn) this.shootBtn.setPosition(width - 100, height - 100);
    
    // Ground
    this.ground.setPosition(width/2, height - 20);
    this.ground.width = width;
    if(this.ground.body) this.ground.body.updateFromGameObject();
  }
}