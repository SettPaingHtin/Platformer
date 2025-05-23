export default class BootScene extends Phaser.Scene {
    constructor() {
      super('BootScene');
    }
  
    preload() {
      this.load.tilemapTiledJSON('map', 'assets/tilemaps/Platformer.tmj');
      this.load.image('tiles_main', 'assets/tilesets/tilemap_packed.png');
      this.load.image('tiles_bg', 'assets/tilesets/tilemap-backgrounds_packed.png');
      this.load.image('tiles_chars', 'assets/tilesets/tilemap-characters_packed.png');
  
      this.load.image('coin', 'assets/sprites/coin 1.png');
      this.load.image('enemy', 'assets/sprites/enemy.png');
      this.load.image('heart', 'assets/ui/heart.png');
  
      this.load.image('player1', 'assets/sprites/player 1.png');
      this.load.image('player2', 'assets/sprites/player 2.png');
  
      this.load.audio('coinSound', 'assets/audio/coin.wav');
      this.load.audio('jumpSound', 'assets/audio/jump.wav');

      this.load.image('walkParticle', 'assets/particles/walk.png');
      this.load.image('jumpParticle', 'assets/particles/Jump.png');
    }
  
    create() {
      this.scene.start('GameScene');
    }
  }
  