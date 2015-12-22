function ResizeWindowWidthHeight(appWindow) {
  this.appWindow = appWindow;
  this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-xy");
  this.resizeThis = document.querySelector("#window-" + this.appWindow.id + " .window-content-wrapper");
  this.element.addEventListener("mousedown", this.startDrag.bind(this));
};

ResizeWindowWidthHeight.prototype.startDrag = function(e) {
  this.appWindow.pwd.mouse.draggedObject = this;
  // this element has no offsetTop so instead we use window-resizer-height's offsetTop value
  this.appWindow.pwd.mouse.dragOffsetY = this.element.parentElement.offsetTop + this.appWindow.element.offsetTop + this.appWindow.titleBarHeight - event.pageY;
  this.appWindow.pwd.mouse.dragOffsetX = this.element.offsetLeft + this.element.clientWidth + this.appWindow.element.offsetLeft - e.pageX;
  // TODO: fix drag offset
  e.stopPropagation(); //this click shouldnt go through to the parent which is the height-resizer

}

ResizeWindowWidthHeight.prototype.drag = function(e) {
  this.appWindow.resizeWindowHeight.drag(e);
  this.appWindow.resizeWindowWidth.drag(e);
  //this.resizeThis.style.height = (e.pageY - this.appWindow.y) + "px";
}

ResizeWindowWidthHeight.prototype.stopDrag = function() {

}

module.exports = ResizeWindowWidthHeight;
