var Ball = require("./Ball");
var Paddle = require("./Paddle");

function Game(pwd) {
    this.pwd = pwd;
    this.canvas = document.querySelector("#window-" + this.pwd.id + " .window-content").lastElementChild;
    this.ctx = this.canvas.getContext("2d");
    this.ball = new Ball(this);
    this.paddle =new Paddle(this);
    this.lastTime = new Date().getTime();

    // start game loop
    this.loop();
}

Game.prototype.loop = function() {
    var currentTime = new Date().getTime();
    var dt = (currentTime - this.lastTime);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
};

Game.prototype.update = function(dt) {
    this.ball.update(dt);
};

Game.prototype.draw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ball.draw();
};

module.exports = Game;
