export default class UIScene extends Phaser.Scene {
    constructor() {
      super('UIScene');
    }
  
    init(data) {
      this.gameScene = data.game;
      this.win = data.win;
      this.gameOver = data.gameOver;
      this.score = data.score;
    }
  
    create() {
      const cx = this.scale.width / 2;
      const cy = this.scale.height / 2;
  
      if (this.win) {
        this.add.rectangle(cx, cy, 300, 150, 0x000000, 0.8)
          .setStrokeStyle(2, 0xffffff)
          .setOrigin(0.5);
  
        this.add.text(cx, cy - 40, '🎉 Congratulations! 🎉', {
          fontSize: '20px',
          fill: '#fff'
        }).setOrigin(0.5);
  
        this.add.text(cx, cy - 10, `Final Score: ${this.score}`, {
          fontSize: '16px',
          fill: '#ffff66'
        }).setOrigin(0.5);
  
        const restartBtn = this.add.text(cx, cy + 30, 'Restart Level', {
          fontSize: '14px',
          fill: '#00ffff',
          backgroundColor: '#003344',
          padding: { x: 10, y: 5 }
        })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop();
            this.scene.start('GameScene');
          })
          .on('pointerover', () => restartBtn.setStyle({ fill: '#ffffff' }))
          .on('pointerout', () => restartBtn.setStyle({ fill: '#00ffff' }));
      }
  
      else if (this.gameOver) {
        this.add.rectangle(cx, cy, 300, 150, 0x000000, 0.8)
          .setStrokeStyle(2, 0xff0000)
          .setOrigin(0.5);
  
        this.add.text(cx, cy - 40, '💀 Game Over 💀', {
          fontSize: '20px',
          fill: '#ff4444'
        }).setOrigin(0.5);
  
        this.add.text(cx, cy - 10, `Final Score: ${this.score}`, {
          fontSize: '16px',
          fill: '#ffff66'
        }).setOrigin(0.5);
  
        const restartBtn = this.add.text(cx, cy + 30, 'Restart Level', {
          fontSize: '14px',
          fill: '#ffffff',
          backgroundColor: '#440000',
          padding: { x: 10, y: 5 }
        })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop();
            this.scene.start('GameScene');
          })
          .on('pointerover', () => restartBtn.setStyle({ fill: '#ff9999' }))
          .on('pointerout', () => restartBtn.setStyle({ fill: '#ffffff' }));
      }
  
      else {
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '14px', fill: '#fff' });
        this.hearts = [];
        for (let i = 0; i < 3; i++) {
          const heart = this.add.image(16 + i * 20, 32, 'heart').setScrollFactor(0);
          this.hearts.push(heart);
        }
  
        this.gameScene.events.on('update-score', score => {
          this.scoreText.setText('Score: ' + score);
        });
  
        this.gameScene.events.on('update-health', health => {
          this.hearts.forEach((heart, i) => {
            heart.setVisible(i < health);
          });
        });
      }
    }
  }
  