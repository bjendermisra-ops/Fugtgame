// ------------------- Game Scene -------------------
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {

    this.load.image("bg", "bgplanat.jpg");
    this.load.image("bg2", "land.jpg");



     this.load.spritesheet("player", "bee.png", {
        frameWidth: 133,  
        frameHeight: 109,
      });

      
     this.load.spritesheet("enemy1", "enemy_fly.png", {
        frameWidth: 60,  
        frameHeight: 44,
      });

      this.load.spritesheet("enemy2", "ghost.png", {
        frameWidth: 2000/30, 
        frameHeight: 91,
      });


       this.load.spritesheet("worm", "enemy_worm.png", {
        frameWidth: 1374/6, 
        frameHeight: 171,
      });
   
   

    this.load.spritesheet("explosion", "explosions.png", {
        frameWidth: 96,  // depends on your sprite sheet
        frameHeight: 85,
      });

  }

  create() {

    this.score = 0;

    // allow 3 simultaneous touches
  this.input.addPointer(2); // 1 extra pointer = total 3 pointers including default


    this.isGameOver = false;


    this.bg = this.add.tileSprite(
        0,
        0,
       0,
        0,
        "bg"
    ).setOrigin(0, 0);
    this.bg.setAlpha(0.8);   // 1 = full visible, 0 = invisible


    this.bg2 = this.add.tileSprite(
        0,
        this.cameras.main.height - 176,
       0,
        0,
        "bg2"
    ).setOrigin(0, 0);


















 







 this.anims.create({
      key: "player",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 14 }),
      frameRate: 25,
      repeat: -1,
    });


     this.player = this.physics.add.sprite(
  50,
  this.cameras.main.height / 2,
  "player"
).setScale(0.7);
 this.player.play("player");

this.player.body.setAllowGravity(false);
this.player.body.setCollideWorldBounds(true);
this.player.body.setGravityY(800);
this.player.body.setCollideWorldBounds(true);








     // --- ANIMATIONS ---
    if (!this.anims.exists("enemy1_fly")) {
      this.anims.create({
        key: "enemy1_fly",
        frames: this.anims.generateFrameNumbers("enemy1", {
          start: 0,
          end: 5,
        }),
        frameRate: 25,
        repeat: -1,
      });
    }

    if (!this.anims.exists("enemy2_fly")) {
      this.anims.create({
        key: "enemy2_fly",
        frames: this.anims.generateFrameNumbers("enemy2", {
          start: 0,
          end: 29,
        }),
        frameRate: 25,
        repeat: -1,
      });
    }

   this.anims.create({
      key: "worm",
      frames: this.anims.generateFrameNumbers("worm", { start: 0, end: 5 }),
      frameRate: 25,
      repeat: -1,
    }); 


    // --- GROUP FOR MULTIPLE ENEMIES ---
    this.enemies = this.physics.add.group();

    this.worms = this.physics.add.group();

    // --- FLY LIMITS (between 2 vertical levels) ---
    this.enemyTopY = this.cameras.main.height * 0.08;
    this.enemyBottomY = this.cameras.main.height * 0.6;

    // --- CONSTANT SPAWNING ---
    this.time.addEvent({
      delay: 800,   // spawn every 1 second
      loop: true,
      callback: () => this.spawnEnemy()
    });


     this.time.addEvent({
      delay: 1500,   // spawn every 1 second
      loop: true,
      callback: () => this.spawnWorms()
    });



// 🟫 Invisible ground collider
this.ground = this.add.rectangle(
  this.scale.width / 2,
  this.cameras.main.height - 88,
  this.scale.width,
  176
);

this.physics.add.existing(this.ground, true); // true = static body




this.physics.add.collider(this.player, this.ground);
this.physics.add.collider(this.worms, this.ground);





// this.scale.on("resize", (gameSize) => {




//   this.bg.setSize(gameSize.width, gameSize.height);
//   this.bg2.setSize(gameSize.width, gameSize.height);

//   this.ground.setPosition(
//     gameSize.width / 2,
//     gameSize.height - 88
//   );

//   this.ground.width = gameSize.width;

//   // 🔥 THIS LINE MAKES COLLISION WORK AFTER RESIZE
//   this.ground.body.setSize(this.ground.width, this.ground.height);
//   this.ground.body.updateFromGameObject();
// });


// === handle resize events ===
this.scale.on("resize", this.resize, this);

// === remove the listener when leaving scene ===
this.events.once("shutdown", this.shutdown, this);




    

    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion", { start: 0, end: 20 }),
      frameRate: 15,
      repeat: 0,
      hideOnComplete: true, // removes it after playing
    });


    // Responsive score text
    const fontSize = Math.round(this.scale.width * 0.03); // 3% of width
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: `${fontSize}px`,
      fontStyle: "bold",
      fill: "#32d7d7",
    });

    this.scoreText.setDepth(10); // keep UI bright

 


// inside create()
if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
  
  const radius = 30;
  const gfx = this.add.graphics({ x: 0, y: 0, add: false });
  gfx.fillStyle(0xff4d4d, 1);
  gfx.fillCircle(radius, radius, radius);
  gfx.generateTexture("shootCircle", radius * 2, radius * 2);
  gfx.destroy();

  this.shootButton = this.add.image(
    this.scale.width * 0.88,
    this.scale.height * 0.8,
    "shootCircle"
  )
  .setScrollFactor(0)
  .setDepth(200)
  .setAlpha(0.85)
  .setInteractive();

  this.isShooting = false;

  this.shootButton.on("pointerdown", () => {
    this.isShooting = true;
  });

  this.shootButton.on("pointerup", () => {
    this.isShooting = false;
  });
}





// ===== SHOW MOBILE BUTTONS ONLY =====
if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {

  this.mobileMovingUp = false;
  this.mobileMovingDown = false;

  // ---- REUSABLE CIRCLE TEXTURE ----
  const radius = 26;
  const gfx = this.add.graphics({ x: 0, y: 0, add: false });
  gfx.fillStyle(0x33aaff, 1);
  gfx.fillCircle(radius, radius, radius);
  gfx.generateTexture("controlCircle", radius * 2, radius * 2);
  gfx.destroy();


  // 🔼 **UP button**
  this.upBtn = this.add.image(
    this.scale.width * 0.15,
    this.scale.height * 0.8,
    "controlCircle"
  )
  .setScrollFactor(0)
  .setDepth(200)
  .setAlpha(0.8)
  .setInteractive();

  this.upBtn.on("pointerdown", () => { this.mobileMovingUp = true; });
  this.upBtn.on("pointerup",   () => { this.mobileMovingUp = false; });
  this.upBtn.on("pointerout",  () => { this.mobileMovingUp = false; });


  // 🔽 **DOWN button**
  this.downBtn = this.add.image(
    this.scale.width * 0.15,
    this.scale.height * 0.9,
    "controlCircle"
  )
  .setScrollFactor(0)
  .setDepth(200)
  .setAlpha(0.8)
  .setInteractive();

  this.downBtn.on("pointerdown", () => { this.mobileMovingDown = true; });
  this.downBtn.on("pointerup",   () => { this.mobileMovingDown = false; });
  this.downBtn.on("pointerout",  () => { this.mobileMovingDown = false; });
}
























   

    // // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);



    // // Bullet groups
    this.playerBullets = this.physics.add.group({ maxSize: 200 });


    this.lastFired = 0;

    // Player bullets vs enemies
    this.physics.add.overlap(this.playerBullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      const explosion = this.add.sprite(enemy.x, enemy.y, "explosion").setScale(1.4);
      explosion.play("explode");
      explosion.on("animationcomplete", () => explosion.destroy());
      enemy.destroy();
      this.addScore(5);
    });

    this.physics.add.overlap(this.playerBullets, this.worms, (bullet, enemy) => {
      bullet.destroy();
      const explosion = this.add.sprite(enemy.x, enemy.y, "explosion").setScale(1.6);
      explosion.play("explode");
      explosion.on("animationcomplete", () => explosion.destroy());
      enemy.destroy();
      this.addScore(6);
    });

   

    // Player vs enemies → Game Over
    this.physics.add.overlap(this.player, [this.enemies , this.worms], () => {
      this.endGame();
    });


   
   
  }

  shootBullet() {
  const bullet = this.physics.add.sprite(this.player.x + 40, this.player.y, "bullet");
  bullet.setVelocityX(550);
}


  shutdown() {
  this.scale.off("resize", this.resize, this);
}


  // 🟢 Add score method
  addScore(points) {
    this.score += points;
    this.scoreText.setText("Score: " + this.score);
  }

  // 🟢 End game method
  endGame() {
    this.isGameOver = true;
    this.scene.stop("GameScene");
    this.scene.start("GameOverScene", { score: this.score });
  }

  

  // 🟢 Bullet function (used by player & enemies)
  shootBullet(group, scene, x, y, velocityX = 600, color = 0xffa500) {
    const key = `bullet_${color.toString(16)}`;
    // Generate circular texture if not already created
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color, 1);

    const radius = 5; // radius of circle
    g.fillCircle(radius, radius, radius); // centerX, centerY, radius

    // Texture size must be diameter (radius * 2)
    g.generateTexture(key, radius * 2, radius * 2);
  }

  const bullet = group.get(x, y, key);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      scene.physics.world.enable(bullet);
      bullet.body.allowGravity = false;
      bullet.setVelocityX(velocityX);
    }

    return bullet;
  }



  update(time, delta) {
    if (this.isGameOver) return;



    const speed = 400;

    this.bg.tilePositionX += 4; // horizontal scroll
    this.bg2.tilePositionX += 4;












    // --- MOVE ALL ENEMIES ---
    this.enemies.children.iterate(enemy => {
      if (!enemy) return;

      // up-down movement
      enemy.y += 70 * enemy.dir * 0.016;

      if (enemy.y <= this.enemyTopY) enemy.dir = 1;
      if (enemy.y >= this.enemyBottomY) enemy.dir = -1;

      // remove when off screen
      if (enemy.x < -100) {
        enemy.destroy();
      }
    });



    this.worms.children.iterate(worm => {
  if (!worm) return;

  worm.x -=  3; // slow ground movement

  if (worm.x < -100) worm.destroy();
});









// Horizontal movement
if (this.cursors.left.isDown) {
  this.player.setVelocityX(-speed);
  this.player.flipX = true;
}
else if (this.cursors.right.isDown) {
  this.player.setVelocityX(speed);
  this.player.flipX = false;
}
else {
  this.player.setVelocityX(0);
}



if (this.cursors.up.isDown) {
  this.player.setVelocityY(-speed);
}
else if (this.cursors.down.isDown) {
  this.player.setVelocityY(speed);
}
else {
  this.player.setVelocityY(0);
}






// === MOBILE BUTTON MOVEMENT ===
if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
  const speed = 400;

  if (this.mobileMovingUp) {
    this.player.setVelocityY(-speed);
  } else if (this.mobileMovingDown) {
    this.player.setVelocityY(speed);
  } else {
    this.player.setVelocityY(0);
  }

}








    // Keep player inside screen
    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      this.player.width / 2,
      this.scale.width - this.player.width / 2
    );
    this.player.y = Phaser.Math.Clamp(
      this.player.y,
      this.player.height / 2,
      this.scale.height - this.player.height / 2
    );

    // Fire player bullets
//    if (this.sKey.isDown && time > this.lastFired) {
//   // Decide bullet direction based on player flip
//   const velocityX = this.player.flipX ? -800 : 800;

//   // Spawn bullet slightly in front of player depending on direction
//   const offsetX = this.player.flipX ? -48 : 48;

//   const bulletColors = {
//   green: 0x00ff00,
//   red: 0xff0000,
//   blue: 0x0000ff,
//   purple: 0x800080
// };


//  // 🎨 Pick random from green, red, blue, purple
//   const colors = [bulletColors.green, bulletColors.red, bulletColors.blue, bulletColors.purple];
//   const color = Phaser.Utils.Array.GetRandom(colors);


//   this.shootBullet(
//     this.playerBullets,
//     this,
//     this.player.x + offsetX,
//     this.player.y,
//     velocityX,
//     color
//   );

//   this.lastFired = time + 250; // cooldown
// }




// === SHOOTING ===
const shouldShootDesktop = this.sKey.isDown;
const shouldShootMobile  = this.isShooting;

if ((shouldShootDesktop || shouldShootMobile) && time > this.lastFired) {
  const velocityX = this.player.flipX ? -800 : 800;
  const offsetX = this.player.flipX ? -48 : 48;

  const bulletColors = [0x00ff00, 0xff0000, 0x0000ff, 0x800080];
  const color = Phaser.Utils.Array.GetRandom(bulletColors);

  this.shootBullet(
    this.playerBullets,
    this,
    this.player.x + offsetX,
    this.player.y,
    velocityX,
    color
  );

  this.lastFired = time + 100;
}



// // --- MOBILE shooting ---
// if (this.isShooting && time > this.lastFired) {
//   const velocityX = this.player.flipX ? -800 : 800;
//   const offsetX   = this.player.flipX ? -48 : 48;

//   this.shootBullet(this.playerBullets, this, this.player.x + offsetX, this.player.y, velocityX);

//   this.lastFired = time + 250; // cooldown
// }













    // // Destroy off-screen bullets
   this.playerBullets.getChildren().forEach((b) => {
  if (b.active && (b.x < -50 || b.x > this.scale.width + 50)) {
    b.destroy();
  }
});


  }



  // 🟢 Resize handler function
resize(gameSize) {
  if (!this.bg || !this.bg2 || !this.ground) return; // avoid errors before create()

  const { width, height } = gameSize;

  // Resize backgrounds
  this.bg.setSize(width, height);
  this.bg2.setSize(width, height);

  // Move & resize ground
  this.ground.setPosition(width / 2, height - 88);
  this.ground.width = width;

  if (this.ground.body) {
    this.ground.body.setSize(this.ground.width, this.ground.height);
    this.ground.body.updateFromGameObject();
  }

  // Resize score text
  if (this.scoreText) {
    this.scoreText.setFontSize(Math.floor(width * 0.03));
  }
}






  spawnEnemy() {
    // pick random type
    const types = ["enemy1", "enemy2"];
    const type = Phaser.Utils.Array.GetRandom(types);

    const enemy = this.enemies.create(
      this.cameras.main.width + 50,                             // start off screen right
      Phaser.Math.Between(this.enemyTopY, this.enemyBottomY),   // random height
      type
    );

    // scale + physics
    enemy.setScale(1.3);
    enemy.body.allowGravity = false;
    enemy.setVelocityX(Phaser.Math.Between(-300, -600)); // speed to left

    // play animation
    enemy.play(type + "_fly");

    // choose random fly direction (up-down)
    enemy.dir = Phaser.Math.Between(0, 1) ? 1 : -1;
  }


  spawnWorms() {
  const worm = this.worms.create(
    this.cameras.main.width + 100,
      this.ground.y-150, // spawn above ground so gravity pulls it down
    "worm"
  );

  worm.setScale(0.5);
  worm.refreshBody();
  worm.body.setGravityY(800);     // <-- important
  worm.setVelocityX(-120);         // crawling speed
  worm.play("worm");


// 👇 Make every worm jump differently
const randomDelay = Phaser.Math.Between(800, 4000);   // jump interval per worm
const randomJump = Phaser.Math.Between(-300, -550);    // jump force per worm

  // 👇 Make worm jump every 2 seconds
  worm.jumpEvent = this.time.addEvent({
    delay: randomDelay,
    loop: true,
    callback: () => {
      if (!worm.active) return; // prevent errors if worm destroyed
      worm.setVelocityY(randomJump);  // jump force
    }
  });

}




}


