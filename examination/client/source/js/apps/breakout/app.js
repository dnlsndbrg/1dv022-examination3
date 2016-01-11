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

    this.game.newGame();


}

Breakout.prototype = Object.create(PwdApp.prototype);
Breakout.prototype.constructor = Breakout;


/**
 * when the app is closing
 */
Breakout.prototype.close = function() {
    this.game.running = false;

    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);
};

module.exports = Breakout;
