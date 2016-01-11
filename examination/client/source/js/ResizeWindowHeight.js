/**
 * App window resizer Constructor
 * This is a small element on the bottom of app windows. it can be dragged up and down to resize the height of app windows
 * @param {object} appWindow - what window to resize
 */
function ResizeWindowHeight(appWindow) {
    this.appWindow = appWindow;
    this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-y");
    this.resizeThis = document.querySelector("#window-" + this.appWindow.id + " .window-content-wrapper");
    this.element.addEventListener("mousedown", this.startDrag.bind(this));
}

/**
 * resizer drag is started
 */
ResizeWindowHeight.prototype.startDrag = function() {
    this.appWindow.pwd.mouse.draggedObject = this;
    this.appWindow.pwd.mouse.dragOffsetY = this.element.offsetTop + this.appWindow.element.offsetTop + this.appWindow.titleBarHeight - event.pageY;
};

/**
 * resizer is dragged
 * @param  {[type]} event - mousemove event object
 */
ResizeWindowHeight.prototype.drag = function(event) {
    this.resizeThis.style.height = (event.pageY - this.appWindow.y - this.appWindow.pwd.mouse.dragOffsetY) + "px";
};

/**
 * resizer drag stopped
*/
ResizeWindowHeight.prototype.stopDrag = function() {

};

module.exports = ResizeWindowHeight;
