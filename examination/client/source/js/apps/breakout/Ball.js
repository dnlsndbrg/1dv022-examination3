function Ball(game) {
    this.game = game;
    this.x = this.game.canvas.width / 2;
    this.y = this.game.canvas.height - 30;
    this.dx = 100;
    this.dy = -100;
    this.radius = 10;
}

Ball.prototype.update = function(dt) {

    // collision detection with outer walls
    var dy = (this.dy * dt) / 1000;
    var dx = (this.dx * dt) / 1000;

    if (this.x + dx > this.game.canvas.width - this.radius || this.x + dx < this.radius) {
        this.dx = -this.dx;
    }

    if (this.y + dy > this.game.canvas.height - this.radius || this.y + dy < this.radius) {
        this.dy = -this.dy;
    }

    // update position
    this.x += (this.dx * dt) / 1000;
    this.y += (this.dy * dt) / 1000;
};

Ball.prototype.draw = function() {
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.game.ctx.fillStyle = "#0095DD";
    this.game.ctx.fill();
    this.game.ctx.closePath();
};

module.exports = Ball;
