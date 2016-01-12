var Ball = require("./Ball");
var Paddle = require("./Paddle");
var Brick = require("./Brick");

function Game(pwd) {
    this.pwd = pwd;
    this.canvas = document.querySelector("#window-" + this.pwd.id + " .window-content").lastElementChild;
    this.ctx = this.canvas.getContext("2d");

    this.brickRowCount = 3;
    this.brickColumnCount = 5;
    this.brickWidth = 75;
    this.brickHeight = 20;
    this.brickPadding = 10;
    this.brickOffsetTop = 30;
    this.brickOffsetLeft = 30;

    this.pwd.appWindow.element.addEventListener("keydown", this.keyDownHandler.bind(this), false);
    this.pwd.appWindow.element.addEventListener("keyup", this.keyUpHandler.bind(this), false);
}

Game.prototype.newGame = function() {

    this.pwd.appWindow.element.focus();

    this.ball = new Ball(this);
    this.paddle = new Paddle(this);
    this.lastTime = new Date().getTime();

    // generate bricks
    this.bricks = [];
    for (var y = 0; y < this.brickRowCount; y += 1) {
        this.bricks[y] = [];
        for (var x = 0; x < this.brickColumnCount; x += 1) {
            var brickX = (x * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
            var brickY = (y * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
            var color = 120 + y * 30;
            this.bricks[y][x] = new Brick(this, brickX, brickY, color);
        }
    }

    this.score = 0;

    this.rightPressed = false;
    this.leftPressed = false;
    this.running = true;
    this.loop();
};

Game.prototype.drawScore = function() {
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#363636";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Score: " + this.score, 8, 20);
};

Game.prototype.gameOver = function() {
    this.running = false;
    this.ctx.font = "46px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#d26b30";
    this.ctx.fillText("Game Over!", this.canvas.width / 2, this.canvas.height / 2);
};

Game.prototype.gameWon = function() {
    this.running = false;
    this.ctx.font = "46px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#7eb364";
    this.ctx.fillText("Win!", this.canvas.width / 2, this.canvas.height / 2);
};

Game.prototype.keyDownHandler = function(e) {
    if (e.keyCode == 39) {
        this.rightPressed = true;
    }
    else if (e.keyCode == 37) {
        this.leftPressed = true;
    }
};

Game.prototype.keyUpHandler = function(e) {
    if (e.keyCode == 39) {
        this.rightPressed = false;
    }
    else if (e.keyCode == 37) {
        this.leftPressed = false;
    }
};

Game.prototype.loop = function() {
    // clear screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // calculate time
    var currentTime = new Date().getTime();
    var dt = (currentTime - this.lastTime);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    // loop
    if (this.running) {
        requestAnimationFrame(this.loop.bind(this));
    }
};

Game.prototype.update = function(dt) {
    this.ball.update(dt);
    this.paddle.update(dt);
};

Game.prototype.draw = function() {
    // draw bricks
    this.bricks.forEach(function(brickRow) {
        brickRow.forEach(function(brick) {
            if (brick.active) {
                brick.draw(this.ctx);
            }
        }.bind(this));
    }.bind(this));

    this.ball.draw(this.ctx);
    this.paddle.draw(this.ctx);

    this.drawScore();
};

module.exports = Game;
