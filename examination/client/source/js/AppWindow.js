function AppWindow(pwd, config) {
  this.pwd = pwd;
  this.element;
  this.id = config.id;
  this.init(config);
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
  this.element.style.height = config.height + "px";

  // drag
  document.querySelector("#window-" + this.id + " .window-bar").addEventListener("mousedown", this.startDrag.bind(this));
}

AppWindow.prototype.startDrag = function(event) {
  this.pwd.mouse.draggedObject = this;
  this.pwd.mouse.dragOffsetX = this.element.offsetLeft - event.pageX;
  this.pwd.mouse.dragOffsetY = this.element.offsetTop - event.pageY;
  this.element.classList.add("dragging");
  this.pwd.zIndex += 1;
  this.element.style.zIndex = this.pwd.zIndex;
  //this.pwd.mouse.dragOffset.x = event.pageX -
  // this.pwd.mouse.selectedWindow = this;
  // window.addEventListener("mousemove", this.pwd.mouse.move.bind(this.pwd.mouse));
  // window.addEventListener("mouseup", this.stopDrag.bind(this));
  //this.dragged = true;
  //console.log(this.dragged)
  //this.element.classList.toggle("dragging");
  //this.pwd.mouse.selected = this;
}

AppWindow.prototype.drag = function(e) {
  this.element.style.left = e.pageX + this.pwd.mouse.dragOffsetX + "px";
  this.element.style.top = e.pageY + this.pwd.mouse.dragOffsetY + "px";
}

AppWindow.prototype.stopDrag = function() {
  //window.removeEventListener("mousemove");
}

module.exports = AppWindow;
