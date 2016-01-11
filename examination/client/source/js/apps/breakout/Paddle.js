function Paddle(game) {
    this.game = game;
    this.height = 10;
    this.width = 75;
    this.speed = 200; // pixels per second
    this.x = (this.game.canvas.width - this.width) / 2;
}

Paddle.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.game.canvas.height - this.height, this.width, this.height);
    ctx.fillStyle = "#243342";
    ctx.fill();
    ctx.closePath();
};

Paddle.prototype.update = function(dt) {
    if (this.game.rightPressed && this.x < this.game.canvas.width - this.width) {
        this.x += (this.speed * dt) / 1000;
    }
    else if (this.game.leftPressed && this.x > 0) {
        this.x -= (this.speed * dt) / 1000;
    }
};

module.exports = Paddle;
