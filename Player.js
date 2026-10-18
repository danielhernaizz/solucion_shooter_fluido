/**
 * Main character of the game. Inherits from the Character class
 */
class Player extends Character {
    constructor (game) {
        const height = PLAYER_HEIGHT * game.width / 100,
            width = PLAYER_WIDTH * game.width / 100,
            x = game.width / 2 - width / 2,
            y = game.height - height,
            speed = PLAYER_SPEED,
            myImage = PLAYER_PICTURE,
            myImageDead = PLAYER_PICTURE_DEAD;

        super(game, width, height, x, y, speed, myImage, myImageDead);
        this.lives = LIVES;
    }

    update () {
        if (!this.dead) {
            // Movimiento suave leyendo múltiples teclas
            if (this.game.keys.left && this.x > 0) {
                this.x -= this.speed;
            }
            if (this.game.keys.right && this.x < this.game.width - this.width) {
                this.x += this.speed;
            }
            if (this.game.keys.shoot) {
                const now = Date.now();
                if (now - this.game.lastShotTime > 300) { // Límite para no ametrallar
                    this.game.shoot(this);
                    this.game.lastShotTime = now;
                }
            }
        }
    }

    collide() {
        if (!this.dead) {
            this.lives--;
            if (this.lives > 0) {
                super.collide();
                setTimeout(() => {
                    this.image.src = this.myImage;
                    this.dead = false;
                }, 2000);
            } else {
                super.collide();
                this.game.endGame();
            }
        }
    }
}
