function Ball(game) {
    this.game = game;
    this.x = this.game.canvas.width / 2;
    this.y = this.game.canvas.height - 30;
    this.dx = 200;
    this.dy = -200;
    this.radius = 10;
}

Ball.prototype.update = function(dt) {

    // collision detection with outer walls
    var dy = (this.dy * dt) / 1000;
    var dx = (this.dx * dt) / 1000;

    // bounce against side walls
    if (this.x + dx > this.game.canvas.width - this.radius || this.x + dx < this.radius) {
        this.dx = -this.dx;
    }

    // bounce against the roof
    if (this.y + dy < this.radius) {
        this.dy = -this.dy;

    // ball has hit the bottom
    } else if (this.y + dy > this.game.canvas.height - this.radius) {

        // check if it hits the paddle
        if (this.x > this.game.paddle.x && this.x < this.game.paddle.x + this.game.paddle.width) {
            this.dy = -this.dy;
        }
        else {
            // game over
            this.game.gameOver();
        }
    }

    // collision detection with bricks
    for (var y = 0; y < this.game.brickRowCount; y += 1) {
        for (var x = 0; x < this.game.brickColumnCount; x += 1) {
            var brick = this.game.bricks[y][x];
            if(brick.active) {
                if (this.x > brick.x && this.x < brick.x + this.game.brickWidth && this.y > brick.y && this.y < brick.y + this.game.brickHeight) {
                    this.dy = -this.dy;
                    brick.active = false;
                    this.game.score += 1;

                    if (this.game.score === this.game.brickRowCount * this.game.brickColumnCount) {
                        this.game.gameWon();
                    }
                }
            }
        }
    }

    // update position
    this.x += (this.dx * dt) / 1000;
    this.y += (this.dy * dt) / 1000;
};

Ball.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#d26b30";
    ctx.fill();
    ctx.closePath();
};

module.exports = Ball;
