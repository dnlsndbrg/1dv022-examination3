function AppWindow(pwd, config) {
  this.pwd = pwd;
  this.element;
  this.id = config.id;
  this.init();
}

AppWindow.prototype.init = function() {
  // create html
  var clone = document.importNode(document.querySelector("#appWindow").content, true);
  document.querySelector("#pwd").appendChild(clone);
  this.element = document.querySelector("body").lastElementChild;
  this.element.setAttribute("id", "window-" + this.id);

  // drag
  this.element.addEventListener("mousedown", this.startDrag.bind(this));
}

AppWindow.prototype.startDrag = function(event) {
  console.log("drag!", this)
  this.pwd.mouse.draggedObject = this;
  // this.pwd.mouse.selectedWindow = this;
  // window.addEventListener("mousemove", this.pwd.mouse.move.bind(this.pwd.mouse));
  // window.addEventListener("mouseup", this.stopDrag.bind(this));
  //this.dragged = true;
  //console.log(this.dragged)
  //this.element.classList.toggle("dragging");
  //this.pwd.mouse.selected = this;
}

AppWindow.prototype.stopDrag = function() {
  //window.removeEventListener("mousemove");
}

module.exports = AppWindow;
