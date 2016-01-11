function Brick(game, x, y, color) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.color = "rgb(" + color + "," + color + "," + color + ")";
    this.active = true;
}

Brick.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.game.brickWidth, this.game.brickHeight);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
};

module.exports = Brick;
