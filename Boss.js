/**
 * Final Boss to destroy. Inherits from the Opponent class
 */
class Boss extends Opponent {
    constructor (game) {
        super(game);
        this.speed = this.speed * 2;
        this.myImage = BOSS_PICTURE;
        this.myImageDead = BOSS_PICTURE_DEAD;
        this.image.src = this.myImage;
    }
}
