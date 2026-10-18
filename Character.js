/**
 *  Each of the characters in the game, that is, those elements that have "life."
 */
class Character extends Entity {
    constructor (game, width, height, x, y, speed, myImage, myImageDead) {
        super(game, width, height, x, y, speed, myImage);
        this.dead = false;
        this.myImageDead = myImageDead;
    }

    collide() {
        this.image.src = this.myImageDead;
        this.dead = true;
    }
}
