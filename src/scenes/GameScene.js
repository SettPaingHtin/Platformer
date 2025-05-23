export default class GameScene extends Phaser.Scene {
    constructor() {
      super('GameScene');
    }
  
    create() {
      this.health = 3;
      this.score = 0;
      this.invulnerable = false;
  
      const map = this.make.tilemap({ key: 'map' });
      const tilesetMain = map.addTilesetImage('tilemap_packed', 'tiles_main');
      const tilesetBG = map.addTilesetImage('tilemap-backgrounds_packed', 'tiles_bg');
      const tilesetChars = map.addTilesetImage('tilemap-characters_packed', 'tiles_chars');
  
      const bgLayer = map.createLayer('Background', [tilesetMain, tilesetBG, tilesetChars]);
      bgLayer.setScrollFactor(0.5);
  
      const ground = map.createLayer('Ground', [tilesetMain, tilesetBG, tilesetChars]);
      const platforms = map.createLayer('Platforms', [tilesetMain, tilesetBG, tilesetChars]);
      const decorations = map.createLayer('Decorations', [tilesetMain, tilesetBG, tilesetChars]);
  
      ground.setCollisionBetween(1, 999);
      platforms.setCollisionBetween(1, 999);
  
      const spawn = map.findObject('Objects', obj => obj.name === 'spawn');
      this.player = this.physics.add.sprite(spawn.x, spawn.y, 'player1').setCollideWorldBounds(true);
      this.player.setMaxVelocity(150, 1000);
      this.player.setDragX(600);
      this.player.setData('frameToggle', false);
      this.jumpHeld = false;
      this.lastFrameSwitch = 0;
      this.frameInterval = 500;
  
      this.physics.add.collider(this.player, ground);
      this.physics.add.collider(this.player, platforms);
  
      this.cursors = this.input.keyboard.createCursorKeys();
      this.jumpSound = this.sound.add('jumpSound');
      this.coinSound = this.sound.add('coinSound');
  
      this.coins = this.physics.add.group();
      map.getObjectLayer('Coins')?.objects.forEach(obj => {
        const coin = this.coins.create(obj.x, obj.y - 16, 'coin').setOrigin(0);
        coin.body.setAllowGravity(false);
      });
      this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
  
      const flag = map.findObject('Objects', obj => obj.name === 'flag');
      this.flagZone = this.add.zone(flag.x, flag.y, flag.width, flag.height).setOrigin(0);
      this.physics.world.enable(this.flagZone, Phaser.Physics.Arcade.STATIC_BODY);
      this.physics.add.overlap(this.player, this.flagZone, this.levelComplete, null, this);
  
      this.ladders = this.physics.add.staticGroup();
      map.getObjectLayer('Ladders')?.objects.forEach(obj => {
        const ladder = this.add.zone(obj.x, obj.y, obj.width, obj.height).setOrigin(0);
        this.physics.world.enable(ladder, Phaser.Physics.Arcade.STATIC_BODY);
        this.ladders.add(ladder);
      });
  
      this.enemies = this.physics.add.group();
      map.getObjectLayer('Enemies')?.objects.forEach(obj => {
        if (obj.name === 'enemy') {
          const enemy = this.enemies.create(obj.x, obj.y - 16, 'enemy');
          enemy.setVelocityX(-20);
          enemy.setCollideWorldBounds(true);
          enemy.setData('direction', -1);
          enemy.setImmovable(true);
        }
      });
      this.physics.add.collider(this.enemies, ground);
      this.physics.add.collider(this.enemies, platforms);
      this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);
  
      this.enemyBounds = this.physics.add.staticGroup();
      map.getObjectLayer('EnemyBounds')?.objects.forEach(obj => {
        const bound = this.enemyBounds
          .create(obj.x, obj.y - obj.height)
          .setOrigin(0)
          .setSize(obj.width, obj.height)
          .setVisible(false);
      });
      this.physics.add.collider(this.enemies, this.enemyBounds, (enemy) => {
        const current = enemy.body.velocity.x;
        enemy.setVelocityX(-current);
        enemy.setFlipX(current > 0);
      });
  
      this.walkEmitter = this.add.particles(this.player.x, this.player.y, 'walkParticle', {
        speed: { min: -5, max: 5 },
        scale: { start: 0.1, end: 0 },
        lifespan: 1200,
        quantity: 1,
        frequency: 180,
        alpha: { start: 0.4, end: 0 },
        angle: { min: 260, max: 280 }
      });
  
      this.jumpEmitter = this.add.particles(0, -10, 'jumpParticle', {
        speed: 0,
        scale: 0.1,
        lifespan: 300,
        quantity: 1
      });
  
      this.scene.launch('UIScene', { game: this });
  
      this.lookAheadOffset = 40;
  
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    }
  
    update() {
      const body = this.player.body;
      const onLadder = this.physics.overlap(this.player, this.ladders.getChildren());
  
      if (onLadder && this.cursors.up.isDown) {
        body.setAllowGravity(false);
        this.player.setVelocityY(-50);
      } else if (onLadder && this.cursors.down.isDown) {
        body.setAllowGravity(false);
        this.player.setVelocityY(50);
      } else if (onLadder) {
        this.player.setVelocityY(0);
      } else {
        body.setAllowGravity(true);
      }
  
      if (this.cursors.left.isDown) {
        body.setAccelerationX(-300);
        this.player.setFlipX(false);
      } else if (this.cursors.right.isDown) {
        body.setAccelerationX(300);
        this.player.setFlipX(true);
      } else {
        body.setAccelerationX(0);
      }
  
      if (this.cursors.up.isDown && body.onFloor()) {
        body.setVelocityY(-400);
        this.jumpHeld = true;
        this.jumpStartTime = this.time.now;
        this.jumpSound.play();
  
        const jumpX = this.player.x;
        const jumpY = this.player.y + this.player.displayHeight * 0.5 - 2;
        this.jumpEmitter.emitParticleAt(jumpX, jumpY);
      }
  
      if (this.jumpHeld && !this.cursors.up.isDown) {
        this.jumpHeld = false;
        if (body.velocity.y < -150) {
          body.setVelocityY(-150);
        }
      }
  
      if (!body.onFloor() && body.velocity.y > 0) {
        body.setGravityY(900);
      } else {
        body.setGravityY(600);
      }
  
      const xOffset = this.player.flipX ? -6 : 6;
      this.walkEmitter.setPosition(this.player.x - xOffset, this.player.body.bottom);
      this.walkEmitter.visible = body.velocity.x !== 0 && body.onFloor();
  
      if (body.velocity.x !== 0 && body.onFloor()) {
        if (this.time.now - this.lastFrameSwitch > this.frameInterval) {
          const toggle = this.player.getData('frameToggle');
          this.player.setTexture(toggle ? 'player1' : 'player2');
          this.player.setData('frameToggle', !toggle);
          this.lastFrameSwitch = this.time.now;
        }
      }
  
      this.enemies.children.iterate(enemy => {
        if (!enemy.body) return;
        if (enemy.body.blocked.right) {
          enemy.setVelocityX(-20);
          enemy.setFlipX(false);
          enemy.setData('direction', -1);
        } else if (enemy.body.blocked.left) {
          enemy.setVelocityX(20);
          enemy.setFlipX(true);
          enemy.setData('direction', 1);
        }
      });
  
      // ✅ Smooth camera look-ahead based on movement
      const cam = this.cameras.main;
      const dir = body.velocity.x > 0 ? 1 : body.velocity.x < 0 ? -1 : 0;
      const lookX = this.player.x + dir * this.lookAheadOffset;
      const lookY = this.player.y;
  
      cam.centerOn(
        Phaser.Math.Linear(cam.midPoint.x, lookX, 0.1),
        Phaser.Math.Linear(cam.midPoint.y, lookY, 0.1)
      );
    }
  
    handleEnemyCollision(player, enemy) {
      const playerBottom = player.y + player.height / 2;
      const enemyTop = enemy.y - enemy.height / 2;
      const playerIsAbove = playerBottom < enemyTop + 5;
      const playerIsFalling = player.body.velocity.y > 0;
  
      if (playerIsAbove && playerIsFalling) {
        enemy.destroy();
        player.setVelocityY(-200);
      } else {
        this.playerHit(player, enemy);
      }
    }
  
    collectCoin(player, coin) {
      this.coinSound.play();
      coin.destroy();
      this.score += 10;
      this.events.emit('update-score', this.score);
    }
  
    levelComplete() {
      this.scene.pause();
      this.scene.launch('UIScene', { win: true, score: this.score });
    }
  
    playerHit(player, enemy) {
      if (this.invulnerable) return;
      this.health--;
      this.invulnerable = true;
      player.setTint(0xff0000);
  
      if (this.health <= 0) {
        this.scene.pause();
        this.scene.launch('UIScene', { gameOver: true, score: this.score });
      } else {
        this.time.delayedCall(1000, () => {
          this.invulnerable = false;
          player.clearTint();
        });
      }
  
      this.events.emit('update-health', this.health);
    }
  }
  