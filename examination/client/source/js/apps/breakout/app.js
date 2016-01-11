var PwdApp = require("../../../js/PwdApp");
var Game = require("./Game");

// Created from https://developer.mozilla.org/en-US/docs/Games/Workflows/2D_Breakout_game_pure_JavaScript

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

    // start game
    new Game(this);

}

Breakout.prototype = Object.create(PwdApp.prototype);
Breakout.prototype.constructor = Breakout;


/**
 * when the app is closing
 */
Breakout.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);
};

module.exports = Breakout;
