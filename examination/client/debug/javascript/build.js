(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ResizeWindowWidth = require("./ResizeWindowWidth");
var ResizeWindowHeight = require("./ResizeWindowHeight");
var ResizeWindowWidthHeight = require("./ResizeWindowWidthHeight");

function AppWindow(pwd, config) {
  this.pwd = pwd;
  this.element;
  this.id = config.id;
  this.width = config.width;
  this.height = config.height;
  this.x = config.x;
  this.y = config.y;
  this.init(config);
  this.titleBarHeight = document.querySelector("#window-" + this.id + " .window-bar").scrollHeight; // used for drag rezising
  this.resizeWindowWidth = new ResizeWindowWidth(this);
  this.resizeWindowHeight = new ResizeWindowHeight(this);
  this.resizeWindowWidthHeight = new ResizeWindowWidthHeight(this);

  // put on top if clicked
  this.element.addEventListener("mousedown", this.moveToTop.bind(this), true);

  // drag the window from the window bar
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
  this.element.style.left =  this.x + "px";
  this.element.style.top = this.y + "px";
}

AppWindow.prototype.stopDrag = function() {
  this.element.classList.remove("dragging");
}

AppWindow.prototype.moveToTop = function() {
  this.pwd.zIndex += 1;
  this.element.style.zIndex = this.pwd.zIndex;
}

module.exports = AppWindow;

},{"./ResizeWindowHeight":3,"./ResizeWindowWidth":4,"./ResizeWindowWidthHeight":5}],2:[function(require,module,exports){
function Mouse(){
  this.draggedObject = null;
  this.dragOffsetX = 0;
  this.dragOffsetY = 0;

  this.mouseup = function(e) {
    if (this.draggedObject !== null) {
      this.draggedObject.stopDrag(e);
      this.draggedObject = null;
    }
  };

  this.mousemove = function(e) {
    if (this.draggedObject !== null) {
      this.draggedObject.drag(e);
    }
  };

  document.addEventListener("mouseup", this.mouseup.bind(this));
  document.addEventListener("mousemove", this.mousemove.bind(this));

  return this;
  // this.selected = null;
  // this.move = function(event) {
  //   console.log("move", this)
  //
  //   // if (this.selected) {
  //   //   this.selected.style.left = event.offsetX + "px";
  //   // }
  // }
  //
  //
  // //window.addEventListener("mousemove");
  //
  // return this;
};

module.exports = Mouse;

},{}],3:[function(require,module,exports){
function ResizeWindowHeight(appWindow) {
  this.appWindow = appWindow;
  this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-y");
  this.resizeThis = document.querySelector("#window-" + this.appWindow.id + " .window-content-wrapper");
  console.log(this.resizeThis)
  this.element.addEventListener("mousedown", this.startDrag.bind(this));
};

ResizeWindowHeight.prototype.startDrag = function() {
  this.appWindow.pwd.mouse.draggedObject = this;
  this.appWindow.pwd.mouse.dragOffsetY = this.element.offsetTop + this.appWindow.element.offsetTop + this.appWindow.titleBarHeight - event.pageY;
  // TODO: fix drag offset
}

ResizeWindowHeight.prototype.drag = function(e) {
  this.resizeThis.style.height = (e.pageY - this.appWindow.y - this.appWindow.pwd.mouse.dragOffsetY) + "px";
  //this.appWindow.element.style.left = e.pageX + this.pwd.mouse.dragOffsetX + "px";
  //this.element.style.left = e.pageX + this.pwd.mouse.dragOffsetX + "px";
  //this.element.style.top = e.pageY + this.pwd.mouse.dragOffsetY + "px";
}

ResizeWindowHeight.prototype.stopDrag = function() {

}

module.exports = ResizeWindowHeight;

},{}],4:[function(require,module,exports){
function ResizeWindowWidth(appWindow) {
  this.appWindow = appWindow;
  this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-x");
  this.resizeThis = document.querySelector("#window-" + this.appWindow.id);
  this.element.addEventListener("mousedown", this.startDrag.bind(this));
};

ResizeWindowWidth.prototype.startDrag = function(e) {
  this.appWindow.pwd.mouse.draggedObject = this;

  //drag from exactly where the click is
  this.appWindow.pwd.mouse.dragOffsetX = this.element.offsetLeft + this.element.clientWidth + this.appWindow.element.offsetLeft - e.pageX;
}

ResizeWindowWidth.prototype.drag = function(e) {
  this.resizeThis.style.width = (e.pageX - this.appWindow.x + this.appWindow.pwd.mouse.dragOffsetX) + "px";
}

ResizeWindowWidth.prototype.stopDrag = function() {

}

module.exports = ResizeWindowWidth;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
var desktop = require("./desktop");
var AppWindow = require("./AppWindow");
var Mouse = require("./Mouse");

var pwd = {
  mouse: new Mouse(),
  apps: [],
  zIndex: 3
}

pwd.apps.push(new AppWindow(pwd, {
  id: 1,
  title: "test window",
  x: 20,
  y: 100,
  zIndex: 1,
  width: 300,
  height: 300
}));
pwd.apps.push(new AppWindow(pwd, {
  id: 2,
  title: "another window",
  x: 100,
  y: 300,
  zIndex: 2,
  width: 250,
  height: 400
}));

},{"./AppWindow":1,"./Mouse":2,"./desktop":7}],7:[function(require,module,exports){
console.log("desktop");

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUmVzaXplV2luZG93SGVpZ2h0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aC5qcyIsImNsaWVudC9zb3VyY2UvanMvUmVzaXplV2luZG93V2lkdGhIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvZGVza3RvcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZXNpemVXaW5kb3dXaWR0aCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd1dpZHRoXCIpO1xyXG52YXIgUmVzaXplV2luZG93SGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93SGVpZ2h0XCIpO1xyXG52YXIgUmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aEhlaWdodFwiKTtcclxuXHJcbmZ1bmN0aW9uIEFwcFdpbmRvdyhwd2QsIGNvbmZpZykge1xyXG4gIHRoaXMucHdkID0gcHdkO1xyXG4gIHRoaXMuZWxlbWVudDtcclxuICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gIHRoaXMud2lkdGggPSBjb25maWcud2lkdGg7XHJcbiAgdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0O1xyXG4gIHRoaXMueCA9IGNvbmZpZy54O1xyXG4gIHRoaXMueSA9IGNvbmZpZy55O1xyXG4gIHRoaXMuaW5pdChjb25maWcpO1xyXG4gIHRoaXMudGl0bGVCYXJIZWlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5zY3JvbGxIZWlnaHQ7IC8vIHVzZWQgZm9yIGRyYWcgcmV6aXNpbmdcclxuICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoKHRoaXMpO1xyXG4gIHRoaXMucmVzaXplV2luZG93SGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd0hlaWdodCh0aGlzKTtcclxuICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0KHRoaXMpO1xyXG5cclxuICAvLyBwdXQgb24gdG9wIGlmIGNsaWNrZWRcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdmVUb1RvcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuXHJcbiAgLy8gZHJhZyB0aGUgd2luZG93IGZyb20gdGhlIHdpbmRvdyBiYXJcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcclxuICAvLyBjcmVhdGUgaHRtbFxyXG4gIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBXaW5kb3dcIikuY29udGVudCwgdHJ1ZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwid2luZG93LVwiICsgdGhpcy5pZCk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXItdGl0bGVcIikudGV4dENvbnRlbnQgPSBjb25maWcudGl0bGU7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSBjb25maWcueCArIFwicHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gY29uZmlnLnkgKyBcInB4XCI7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnpJbmRleCA9IGNvbmZpZy56SW5kZXg7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gY29uZmlnLndpZHRoICsgXCJweFwiO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpLnN0eWxlLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQgICsgXCJweFwiO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgdGhpcy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcbiAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCAtIGV2ZW50LnBhZ2VYO1xyXG4gIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50Lm9mZnNldFRvcCAtIGV2ZW50LnBhZ2VZO1xyXG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHJhZ2dpbmdcIik7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLnggPSBlLnBhZ2VYICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFg7XHJcbiAgdGhpcy55ID0gZS5wYWdlWSArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZO1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gIHRoaXMueCArIFwicHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2luZ1wiKTtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5tb3ZlVG9Ub3AgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLnB3ZC56SW5kZXggKz0gMTtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy5wd2QuekluZGV4O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFdpbmRvdztcclxuIiwiZnVuY3Rpb24gTW91c2UoKXtcclxuICB0aGlzLmRyYWdnZWRPYmplY3QgPSBudWxsO1xyXG4gIHRoaXMuZHJhZ09mZnNldFggPSAwO1xyXG4gIHRoaXMuZHJhZ09mZnNldFkgPSAwO1xyXG5cclxuICB0aGlzLm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5zdG9wRHJhZyhlKTtcclxuICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0ID0gbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIGlmICh0aGlzLmRyYWdnZWRPYmplY3QgIT09IG51bGwpIHtcclxuICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0LmRyYWcoZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG4gIC8vIHRoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gIC8vIHRoaXMubW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgLy8gICBjb25zb2xlLmxvZyhcIm1vdmVcIiwgdGhpcylcclxuICAvL1xyXG4gIC8vICAgLy8gaWYgKHRoaXMuc2VsZWN0ZWQpIHtcclxuICAvLyAgIC8vICAgdGhpcy5zZWxlY3RlZC5zdHlsZS5sZWZ0ID0gZXZlbnQub2Zmc2V0WCArIFwicHhcIjtcclxuICAvLyAgIC8vIH1cclxuICAvLyB9XHJcbiAgLy9cclxuICAvL1xyXG4gIC8vIC8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIik7XHJcbiAgLy9cclxuICAvLyByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW91c2U7XHJcbiIsImZ1bmN0aW9uIFJlc2l6ZVdpbmRvd0hlaWdodChhcHBXaW5kb3cpIHtcclxuICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpO1xyXG4gIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICBjb25zb2xlLmxvZyh0aGlzLnJlc2l6ZVRoaXMpXHJcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy50aXRsZUJhckhlaWdodCAtIGV2ZW50LnBhZ2VZO1xyXG4gIC8vIFRPRE86IGZpeCBkcmFnIG9mZnNldFxyXG59XHJcblxyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy5yZXNpemVUaGlzLnN0eWxlLmhlaWdodCA9IChlLnBhZ2VZIC0gdGhpcy5hcHBXaW5kb3cueSAtIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSkgKyBcInB4XCI7XHJcbiAgLy90aGlzLmFwcFdpbmRvdy5lbGVtZW50LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFggKyBcInB4XCI7XHJcbiAgLy90aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCArIFwicHhcIjtcclxuICAvL3RoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBlLnBhZ2VZICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFkgKyBcInB4XCI7XHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93SGVpZ2h0O1xyXG4iLCJmdW5jdGlvbiBSZXNpemVXaW5kb3dXaWR0aChhcHBXaW5kb3cpIHtcclxuICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci14XCIpO1xyXG4gIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQpO1xyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcblxyXG4gIC8vZHJhZyBmcm9tIGV4YWN0bHkgd2hlcmUgdGhlIGNsaWNrIGlzXHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldExlZnQgLSBlLnBhZ2VYO1xyXG59XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLnJlc2l6ZVRoaXMuc3R5bGUud2lkdGggPSAoZS5wYWdlWCAtIHRoaXMuYXBwV2luZG93LnggKyB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFgpICsgXCJweFwiO1xyXG59XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGg7XHJcbiIsImZ1bmN0aW9uIFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0KGFwcFdpbmRvdykge1xyXG4gIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXh5XCIpO1xyXG4gIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gIC8vIHRoaXMgZWxlbWVudCBoYXMgbm8gb2Zmc2V0VG9wIHNvIGluc3RlYWQgd2UgdXNlIHdpbmRvdy1yZXNpemVyLWhlaWdodCdzIG9mZnNldFRvcCB2YWx1ZVxyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cudGl0bGVCYXJIZWlnaHQgLSBldmVudC5wYWdlWTtcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0TGVmdCAtIGUucGFnZVg7XHJcbiAgLy8gVE9ETzogZml4IGRyYWcgb2Zmc2V0XHJcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTsgLy90aGlzIGNsaWNrIHNob3VsZG50IGdvIHRocm91Z2ggdG8gdGhlIHBhcmVudCB3aGljaCBpcyB0aGUgaGVpZ2h0LXJlc2l6ZXJcclxuXHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd0hlaWdodC5kcmFnKGUpO1xyXG4gIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd1dpZHRoLmRyYWcoZSk7XHJcbiAgLy90aGlzLnJlc2l6ZVRoaXMuc3R5bGUuaGVpZ2h0ID0gKGUucGFnZVkgLSB0aGlzLmFwcFdpbmRvdy55KSArIFwicHhcIjtcclxufVxyXG5cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0O1xyXG4iLCJ2YXIgZGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3BcIik7XHJcbnZhciBBcHBXaW5kb3cgPSByZXF1aXJlKFwiLi9BcHBXaW5kb3dcIik7XHJcbnZhciBNb3VzZSA9IHJlcXVpcmUoXCIuL01vdXNlXCIpO1xyXG5cclxudmFyIHB3ZCA9IHtcclxuICBtb3VzZTogbmV3IE1vdXNlKCksXHJcbiAgYXBwczogW10sXHJcbiAgekluZGV4OiAzXHJcbn1cclxuXHJcbnB3ZC5hcHBzLnB1c2gobmV3IEFwcFdpbmRvdyhwd2QsIHtcclxuICBpZDogMSxcclxuICB0aXRsZTogXCJ0ZXN0IHdpbmRvd1wiLFxyXG4gIHg6IDIwLFxyXG4gIHk6IDEwMCxcclxuICB6SW5kZXg6IDEsXHJcbiAgd2lkdGg6IDMwMCxcclxuICBoZWlnaHQ6IDMwMFxyXG59KSk7XHJcbnB3ZC5hcHBzLnB1c2gobmV3IEFwcFdpbmRvdyhwd2QsIHtcclxuICBpZDogMixcclxuICB0aXRsZTogXCJhbm90aGVyIHdpbmRvd1wiLFxyXG4gIHg6IDEwMCxcclxuICB5OiAzMDAsXHJcbiAgekluZGV4OiAyLFxyXG4gIHdpZHRoOiAyNTAsXHJcbiAgaGVpZ2h0OiA0MDBcclxufSkpO1xyXG4iLCJjb25zb2xlLmxvZyhcImRlc2t0b3BcIik7XHJcbiJdfQ==
