var PwdApp = require("../../../js/PwdApp");

function Memory(config) {
    PwdApp.call(this, config);
}

Memory.prototype = Object.create(PwdApp.prototype);
Memory.prototype.constructor = Memory;
Memory.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);

    // remove from taskbar
    document.querySelector("#pwd .taskbar").removeChild(this.taskbarApp.element);
};

module.exports = Memory;
