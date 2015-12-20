var ResizeWindowWidth = require("./ResizeWindowWidth");
var ResizeWindowHeight = require("./ResizeWindowHeight");

function AppWindow(pwd, config) {
  this.pwd = pwd;
  this.element;
  this.id = config.id;
  this.width = config.width;
  this.height = config.height;
  this.x = config.x;
  this.init(config);
  this.resizeWindowWidth = new ResizeWindowWidth(this);
  this.resizeWindowHeight = new ResizeWindowHeight(this);

  document.querySelector("#window-" + this.id + " .window-bar").addEventListener("mousedown", this.startDrag.bind(this));
}

AppWindow.prototype.init = function(config) {
  // create html
  var clone = document.importNode(document.querySelector("#appWindow").content, true);
  document.querySelector("#pwd").appendChild(clone);
  this.element = document.querySelector("#pwd").lastElementChild;
  this.element.setAttribute("id", "window-" + this.id);
  document.querySelector("#window-" + this.id + " .window-bar-title").textContent = config.title;
  this.element.style.left = config.x + "px";
  this.element.style.top = config.y + "px";
  this.element.style.zIndex = config.zIndex;
  this.element.style.width = config.width + "px";
  document.querySelector("#window-" + this.id + " .window-content-wrapper").style.height = config.height  + "px";

  // drag

}

AppWindow.prototype.startDrag = function(event) {
  this.pwd.mouse.draggedObject = this;
  this.pwd.mouse.dragOffsetX = this.element.offsetLeft - event.pageX;
  this.pwd.mouse.dragOffsetY = this.element.offsetTop - event.pageY;
  this.element.classList.add("dragging");
  this.pwd.zIndex += 1;
  this.element.style.zIndex = this.pwd.zIndex;
}

AppWindow.prototype.drag = function(e) {
  this.x = e.pageX + this.pwd.mouse.dragOffsetX;
  this.y = e.pageY + this.pwd.mouse.dragOffsetY;
  this.element.style.left =  this.x + "px";
  this.element.style.top = this.y + "px";
}

AppWindow.prototype.stopDrag = function() {
  this.element.classList.remove("dragging");
}

module.exports = AppWindow;
