var PwdApp = require("../../../js/PwdApp");
var Game = require("./Game");
var AppMenu = require("../../../js/AppMenu");

// Created from this tutorial https://developer.mozilla.org/en-US/docs/Games/Workflows/2D_Breakout_game_pure_JavaScript

/**
 * Breakout app constructor
 * @param {object} config - app config object
 */
function Breakout(config) {
    PwdApp.call(this, config);

    // create HTML
    var template = document.querySelector("#breakout");
    var clone = document.importNode(template.content, true);
    document.querySelector("#window-" + this.id + " .window-content").appendChild(clone);

    this.game = new Game(this);

    // add a dropdown menu to the window
    this.menu = new AppMenu(this.appWindow.menuElement, [
        {
            name: "File",
            items: [
                {
                    name: "New game",
                    action: this.game.newGame.bind(this.game)
                },
                {
                    name: "Quit",
                    action: this.appWindow.close.bind(this.appWindow)
                }
            ]
        }
        ]
    );

    this.appWindow.resized = this.resized.bind(this);

    this.game.newGame();
}

Breakout.prototype = Object.create(PwdApp.prototype);
Breakout.prototype.constructor = Breakout;

/**
 * We overwrite appwindow resize to match the canvas width with the window width
 * http://www.html5rocks.com/en/tutorials/casestudies/gopherwoord-studios-resizing-html5-games/
 */
Breakout.prototype.resized = function() {
    this.appWindow.element.classList.remove("dragging");

    var widthToHeight = 480 / 320;
    var newWidth = this.appWindow.element.offsetWidth;
    var newHeight = this.appWindow.element.offsetheight;
    var newWidthToHeight = newWidth / newHeight;

    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        this.game.canvas.style.height = newHeight + "px";
        this.game.canvas.style.width = newWidth + "px";
    } else {
        newHeight = newWidth / widthToHeight;
        this.game.canvas.style.width = newWidth + "px";
        this.game.canvas.style.height = newHeight + "px";
    }

    //this.game.canvas.style.marginTop = (-newHeight / 2) + "px";
    //this.game.canvas.style.marginLeft = (-newWidth / 2) + "px";

    //var gameCanvas = document.getElementById('gameCanvas');
    //gameCanvas.width = newWidth;
    //gameCanvas.height = newHeight;
};

/**
 * when the app is closing
 */
Breakout.prototype.close = function() {
    this.game.running = false;
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);
};

module.exports = Breakout;
