/**
 * The game itself
 */
class Game {
    constructor () {
        this.started = false;
        this.ended = false;
        this.keys = { left: false, right: false, shoot: false }; // Soporte para múltiples teclas
        this.lastShotTime = 0;
        this.width = 0;
        this.height = 0;
        this.player = undefined;
        this.playerShots = [];
        this.opponent = undefined;
        this.opponentShots = [];
        this.xDown = null;
        this.paused = false;
        this.score = 0;
    }

    start () {
        if (!this.started) {
            window.addEventListener("keydown", (e) => this.checkKey(e, true));
            window.addEventListener("keyup", (e) => this.checkKey(e, false));
            window.addEventListener("touchstart", (e) => this.handleTouchStart(e, true));
            window.addEventListener("touchmove", (e) => this.handleTouchMove(e, false));
            document.getElementById("pause").addEventListener("click", () => {
                this.pauseOrResume();
            });
            document.getElementById("reset").addEventListener("click", () => {
                this.resetGame();
            });
            this.started = true;
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.player = new Player(this);
            // 60 FOTOGRAMAS POR SEGUNDO PARA FLUIDEZ
            this.timer = setInterval(() => this.update(), 16);
        }
    }

    pauseOrResume() {
        if (this.paused) {
            this.timer = setInterval(() => this.update(), 16);
            document.body.classList.remove('paused');
            this.paused = false;
        } else {
            clearInterval(this.timer);
            document.body.classList.add('paused');
            this.paused = true;
        }
    }

    shoot (character) {
        const arrayShots = character instanceof Player ? this.playerShots : this.opponentShots;
        arrayShots.push(new Shot(this, character));
    }

    removeShot (shot) {
        const shotsArray = shot.type === "PLAYER" ? this.playerShots : this.opponentShots,
            index = shotsArray.indexOf(shot);

        if (index > -1) {
            shotsArray.splice(index, 1);
        }
    }

    removeOpponent () {
        if (this.opponent) {
            document.body.removeChild(this.opponent.image);
        }
        if (this.opponent instanceof Boss) {
            this.endGame();
        } else {
            this.opponent = new Boss(this);
        }
    }

    checkKey (event, isKeyDown) {
        switch (event.keyCode) {
            case 37: // Left
                this.keys.left = isKeyDown;
                break;
            case 32: // Space
                this.keys.shoot = isKeyDown;
                break;
            case 39: // Right
                this.keys.right = isKeyDown;
                break;
            case 27: case 81: // ESC/Q
                if (isKeyDown) this.pauseOrResume();
                break;
        }
    }

    getTouches (evt) {
        return evt.touches || evt.originalEvent.touches;
    }

    handleTouchStart (evt) {
        const firstTouch = this.getTouches(evt)[0];
        this.xDown = firstTouch.clientX;
        this.keys.shoot = true;
        setTimeout(() => this.keys.shoot = false, 100);
    }

    handleTouchMove (evt) {
        if (!this.xDown) return;
        const xUp = evt.touches[0].clientX,
            xDiff = this.xDown - xUp;

        if (xDiff > MIN_TOUCHMOVE) { 
            this.keys.left = true;
            this.keys.right = false;
            setTimeout(() => this.keys.left = false, 200);
        } else if (xDiff < -MIN_TOUCHMOVE) { 
            this.keys.right = true;
            this.keys.left = false;
            setTimeout(() => this.keys.right = false, 200);
        }
        this.xDown = null;
    }

    checkCollisions () {
        let impact = false;
        // FÍSICAS CORREGIDAS: ELIMINAMOS LA BALA ENEMIGA SI NOS DA
        for (let i = 0; i < this.opponentShots.length; i++) {
            if (this.hasCollision(this.player, this.opponentShots[i])) {
                impact = true;
                this.opponentShots[i].remove();
                this.opponentShots.splice(i, 1);
                i--;
            }
        }
        if (impact || this.hasCollision(this.player, this.opponent)) {
            this.player.collide();
        }

        let killed = false;
        // FÍSICAS CORREGIDAS: ELIMINAMOS NUESTRA BALA SI IMPACTAMOS
        for (let i = 0; i < this.playerShots.length; i++) {
            if (this.hasCollision(this.opponent, this.playerShots[i])) {
                killed = true;
                this.playerShots[i].remove();
                this.playerShots.splice(i, 1);
                i--;
            }
        }
        if (killed) {
            this.opponent.collide();
        }
    }

    hasCollision (item1, item2) {
        if (item2 === undefined) return false;
        const b1 = item1.y + item1.height,
            r1 = item1.x + item1.width,
            b2 = item2.y + item2.height,
            r2 = item2.x + item2.width;

        if (b1 < item2.y || item1.y > b2 || r1 < item2.x || item1.x > r2) {
            return false;
        }
        return true;
    }

    endGame () {
        this.ended = true;
        let gameOver;
        if (this.player.lives > 0) {
            gameOver = new Entity(this, this.width / 2, "auto", this.width / 4, this.height / 4, 0, YOU_WIN_PICTURE);
        } else {
            gameOver = new Entity(this, this.width / 2, "auto", this.width / 4, this.height / 4, 0, GAME_OVER_PICTURE);
        }
        gameOver.render();
    }

    resetGame () {
       document.location.reload();
    }

    update () {
        if (!this.ended) {
            this.player.update();
            if (this.opponent === undefined) {
                this.opponent = new Opponent(this);
            }
            this.opponent.update();
            this.playerShots.forEach((shot) => {
                shot.update();
            });
            this.opponentShots.forEach((shot) => {
                shot.update();
            });
            this.checkCollisions();
            this.render();
        }
    }

    render () {
        this.player.render();
        if (this.opponent !== undefined) {
            this.opponent.render();
        }
        this.playerShots.forEach((shot) => {
            shot.render();
        });
        this.opponentShots.forEach((shot) => {
            shot.render();
        });
        document.getElementById("scoreli").innerHTML = `Score: ${this.score}`;
        document.getElementById("livesli").innerHTML = `Lives: ${this.player.lives}`;
    }
}
