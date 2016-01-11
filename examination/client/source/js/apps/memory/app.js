var PwdApp = require("../../../js/PwdApp");
var Board = require("./Board.js");
var AppMenu = require("../../../js/AppMenu");

/**
 * Memory app constructor
 * @param {object} config - app config object
 */
function Memory(config) {
    PwdApp.call(this, config);
    this.board = new Board(this, 4,3);
    
    // this.menu = new AppMenu(this.board.menuElement, "File", [
    //     {
    //         name: "Settings",
    //         action: this.board.settings
    //     },
    //     {
    //         name: "New game",
    //         action: this.board.startGame
    //     }]
    // );
    this.board.startGame();
}

Memory.prototype = Object.create(PwdApp.prototype);
Memory.prototype.constructor = Memory;

/**
 * when the settings menu is clicked
 */
Memory.prototype.settings = function() {
    console.log("show settings");
};

/** 
 * when the app is closing
 */
Memory.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);
};

module.exports = Memory;
