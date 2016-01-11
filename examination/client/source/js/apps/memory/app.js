var PwdApp = require("../../../js/PwdApp");
var Board = require("./Board.js");
var AppMenu = require("../../../js/AppMenu");

/**
 * Memory app constructor
 * @param {object} config - app config object
 */
function Memory(config) {
    PwdApp.call(this, config);

    // add a dropdown menu to the window
    this.menu = new AppMenu(this.appWindow.menuElement, [
        {
            name: "File",
            items: [
                {
                    name: "New game",
                    action: this.newGame.bind(this)
                },
                {
                    name: "Quit",
                    action: this.appWindow.close.bind(this.appWindow)
                }
            ]
        }
        ]
    );

    this.board = new Board(this, 4,3);
    this.board.startGame();
}

Memory.prototype = Object.create(PwdApp.prototype);
Memory.prototype.constructor = Memory;

Memory.prototype.newGame = function() {
    var contentElement = document.querySelector("#window-" + this.id + " .window-content");
    contentElement.textContent = "";

    // input rows/cols html
    var template = document.querySelector("#memory-setup");
    var clone = document.importNode(template.content, true);
    contentElement.appendChild(clone);
    
    var button = document.querySelector("#window-" + this.id + " .btn");
    var rowsInput = document.querySelector("#window-" + this.id + " .memory-rows-input");
    var colsInput = document.querySelector("#window-" + this.id + " .memory-cols-input");

    rowsInput.value = this.board.rows;
    colsInput.value = this.board.columns;

    button.addEventListener("click", function() {
        this.board = new Board(this, colsInput.value,rowsInput.value);
        this.board.startGame();
    }.bind(this));
};

/**
 * when the app is closing
 */
Memory.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);
};

module.exports = Memory;
