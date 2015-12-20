function ResizeWindowWidth(appWindow) {
  this.appWindow = appWindow;
  this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-x");
  this.resizeThis = document.querySelector("#window-" + this.appWindow.id);
  this.element.addEventListener("mousedown", this.startDrag.bind(this));
};

ResizeWindowWidth.prototype.startDrag = function() {
  this.appWindow.pwd.mouse.draggedObject = this;
  // TODO: fix drag offset
  //this.appWindow.pwd.mouse.dragOffsetX = this.element.offsetLeft - event.pageX;
  //this.appWindow.pwd.mouse.dragOffsetY = this.element.offsetTop - event.pageY;
  //this.appWindow.pwd.mouse.startDragX = event.pageX;
  console.log("Drag X");
}

ResizeWindowWidth.prototype.drag = function(e) {
  this.resizeThis.style.width = (e.pageX - this.appWindow.x) + "px";
  //this.appWindow.element.style.left = e.pageX + this.pwd.mouse.dragOffsetX + "px";
  //this.element.style.left = e.pageX + this.pwd.mouse.dragOffsetX + "px";
  //this.element.style.top = e.pageY + this.pwd.mouse.dragOffsetY + "px";
}

ResizeWindowWidth.prototype.stopDrag = function() {
  
}

module.exports = ResizeWindowWidth;
