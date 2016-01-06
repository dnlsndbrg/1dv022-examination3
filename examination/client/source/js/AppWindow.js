var ResizeWindowWidth = require("./ResizeWindowWidth");
var ResizeWindowHeight = require("./ResizeWindowHeight");
var ResizeWindowWidthHeight = require("./ResizeWindowWidthHeight");

function AppWindow(config) {
  console.log("CONFIG", config);
  this.id = config.id;
  this.pwd = config.pwd;
  this.element;
  this.elementWrapper;
  this.width = config.width;
  this.height = config.height;
  this.x = config.x;
  this.y = config.y;
  this.init(config);
  this.titleBarHeight = document.querySelector("#window-" + this.id + " .window-bar").scrollHeight; // used for drag rezising
  this.resizeWindowWidth = new ResizeWindowWidth(this);
  this.resizeWindowHeight = new ResizeWindowHeight(this);
  this.resizeWindowWidthHeight = new ResizeWindowWidthHeight(this);
  this.content = document.querySelector("#window-" + this.id + " .window-content");
  // put on top if clicked
  this.element.addEventListener("mousedown", this.moveToTop.bind(this), true);
  // drag the window from the window bar
  document.querySelector("#window-" + this.id + " .window-bar").addEventListener("mousedown", this.startDrag.bind(this));
  // close event
  document.querySelector("#window-" + this.id + " .close-window").addEventListener("click", this.close.bind(this));
  // maximize event
  document.querySelector("#window-" + this.id + " .maximize-window").addEventListener("click", this.maximize.bind(this));
  // restore event
  document.querySelector("#window-" + this.id + " .restore-window").addEventListener("click", this.restore.bind(this));
}

AppWindow.prototype.init = function(config) {
  // create html
  var clone = document.importNode(document.querySelector("#appWindow").content, true);
  document.querySelector("#pwd").appendChild(clone);

  // define this.element
  this.element = document.querySelector("#pwd").lastElementChild;

  // set id
  this.element.setAttribute("id", "window-" + this.id);

  // define this.wrapperElement
  this.wrapperElement = document.querySelector("#window-" + this.id + " .window-content-wrapper");

  // set window bar icon
  document.querySelector("#window-" + this.id + " .fa").classList.add(config.icon);

  // set window bar title
  document.querySelector("#window-" + this.id + " .window-bar-title").textContent = config.title;

  // set position and size
  this.element.style.left = config.x + "px";
  this.element.style.top = config.y + "px";
  this.element.style.zIndex = config.zIndex;
  this.element.style.width = config.width + "px";
  this.wrapperElement.style.height = config.height  + "px";

}

AppWindow.prototype.startDrag = function(event) {
  this.pwd.mouse.draggedObject = this;
  this.pwd.mouse.dragOffsetX = this.element.offsetLeft - event.pageX;
  this.pwd.mouse.dragOffsetY = this.element.offsetTop - event.pageY;
  this.element.classList.add("dragging");
}

AppWindow.prototype.drag = function(e) {
  this.x = e.pageX + this.pwd.mouse.dragOffsetX;
  this.y = e.pageY + this.pwd.mouse.dragOffsetY;
  this.checkBounds(e);
  this.element.style.left =  this.x + "px";
  this.element.style.top = this.y + "px";
}

AppWindow.prototype.checkBounds = function(e){
  console.log(this.pwd.width, this.pwd.height);
  if (e.pageX > this.pwd.width)
    this.x = this.pwd.width + this.pwd.mouse.dragOffsetX;
  if (e.pageY > this.pwd.height)
    this.y = this.pwd.height + this.pwd.mouse.dragOffsetY;
  else if (e.pageY < 1)
    this.y = this.pwd.mouse.dragOffsetY;

}

AppWindow.prototype.stopDrag = function() {
  this.element.classList.remove("dragging");
}

AppWindow.prototype.moveToTop = function() {
  this.pwd.lastZIndex += 1;
  this.element.style.zIndex = this.pwd.lastZIndex;
}

AppWindow.prototype.close = function(event) {
  this.pwd.closeApp(this);
}

AppWindow.prototype.maximize = function() {
  // save the size and position so we can return to it with the restore window function
  this.lastX = this.x;
  this.lastY = this.y;
  this.lastWidth = this.width;
  this.lastHeight = this.height;

  // tell pwd this window is in fullscreen (in case of browser resizing)
  this.pwd.fullscreenedWindow = this;

  // make the window fullscreen
  this.element.style.left = "0px";
  this.element.style.top = "0px";
  this.element.style.width = this.pwd.width + "px";
  this.wrapperElement.style.height = this.pwd.height + "px";

  // hide/show the maximize and restore windowbar buttons
  document.querySelector("#window-" + this.id + " .maximize-window").classList.add("hidden");
  document.querySelector("#window-" + this.id + " .restore-window").classList.remove("hidden");
}

AppWindow.prototype.restore = function() {
  this.element.style.left = this.lastX + "px";
  this.element.style.top = this.lastY + "px";
  this.element.style.width = this.lastWidth + "px";
  this.wrapperElement.style.height = this.lastHeight + "px";

  //tell pwd this window is no longer in fullscreen (in case of browser resizing)
  this.pwd.fullscreenedWindow = null;

  document.querySelector("#window-" + this.id + " .maximize-window").classList.remove("hidden");
  document.querySelector("#window-" + this.id + " .restore-window").classList.add("hidden");
}

module.exports = AppWindow;
