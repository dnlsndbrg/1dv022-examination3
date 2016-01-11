/**
 * App window resizer Constructor
 * This controls both width and height resizing of an app window. its element is a small square at the bottom left corner of its app window
 * @param {object} appWindow - what window to resize
 */
function ResizeWindowWidthHeight(appWindow) {
    this.appWindow = appWindow;
    this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-xy");
    this.resizeThis = document.querySelector("#window-" + this.appWindow.id + " .window-content-wrapper");
    this.element.addEventListener("mousedown", this.startDrag.bind(this));
}

/**
 * resizer drag is started
 */
ResizeWindowWidthHeight.prototype.startDrag = function(event) {
    this.appWindow.pwd.mouse.draggedObject = this;

    // this element has no offsetTop so instead we use window-resizer-height's offsetTop value
    this.appWindow.pwd.mouse.dragOffsetY = this.element.parentElement.offsetTop + this.appWindow.element.offsetTop + this.appWindow.titleBarHeight - event.pageY;
    this.appWindow.pwd.mouse.dragOffsetX = this.element.offsetLeft + this.element.clientWidth + this.appWindow.element.offsetLeft - event.pageX;
    event.stopPropagation(); // this click shouldnt go through to the parent which is the height-resizer
};

/** 
 * width&height resizer is being dragged 
*/
ResizeWindowWidthHeight.prototype.drag = function(e) {
    this.appWindow.resizeWindowHeight.drag(e);
    this.appWindow.resizeWindowWidth.drag(e);
};

ResizeWindowWidthHeight.prototype.stopDrag = function() {
    this.appWindow.resized();
};

module.exports = ResizeWindowWidthHeight;
