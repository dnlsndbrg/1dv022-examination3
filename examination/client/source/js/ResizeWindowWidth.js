/**
 * App window width resizer Constructor
 * This is a small element on the right side of app windows. it can be dragged left and right to resize the width of app windows
 * @param {object} appWindow - what window to resize
 */
function ResizeWindowWidth(appWindow) {
    this.appWindow = appWindow;
    this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-x");
    this.resizeThis = document.querySelector("#window-" + this.appWindow.id);
    this.element.addEventListener("mousedown", this.startDrag.bind(this));
}

/**
 * drag is started
 * @param  {object} event mouse click event handler object
 * @return {[type]}   [description]
 */
ResizeWindowWidth.prototype.startDrag = function(event) {
    this.appWindow.pwd.mouse.draggedObject = this;

    //drag from exactly where the click is
    this.appWindow.pwd.mouse.dragOffsetX = this.element.offsetLeft + this.element.clientWidth + this.appWindow.element.offsetLeft - event.pageX;
};

/**
 * width resizer is dragged
 * @param  {object} event - mousemove event object
 */
ResizeWindowWidth.prototype.drag = function(event) {
    this.resizeThis.style.width = (event.pageX - this.appWindow.x + this.appWindow.pwd.mouse.dragOffsetX) + "px";
};

ResizeWindowWidth.prototype.stopDrag = function() {

};

module.exports = ResizeWindowWidth;
