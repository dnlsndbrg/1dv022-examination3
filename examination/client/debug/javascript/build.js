(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  document.querySelector("#window-" + this.id + " .window-bar").textContent = config.title;
  this.element.style.left = config.x + "px";
  this.element.style.top = config.y + "px";
  this.element.style.zIndex = config.zIndex;

  // drag
  this.element.addEventListener("mousedown", this.startDrag.bind(this));
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

},{}],2:[function(require,module,exports){
function Mouse(){
  this.draggedObject = null;
  this.dragOffsetX = 0;
  this.dragOffsetY = 0;

  this.mouseup = function() {
    this.draggedObject.element.classList.remove("dragging");
    this.draggedObject = null;
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
  zIndex: 1
}));
pwd.apps.push(new AppWindow(pwd, {
  id: 2,
  title: "another window",
  x: 100,
  y: 300,
  zIndex: 2
}));

},{"./AppWindow":1,"./Mouse":2,"./desktop":4}],4:[function(require,module,exports){
console.log("desktop");

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIEFwcFdpbmRvdyhwd2QsIGNvbmZpZykge1xyXG4gIHRoaXMucHdkID0gcHdkO1xyXG4gIHRoaXMuZWxlbWVudDtcclxuICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gIHRoaXMuaW5pdChjb25maWcpO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcclxuICAvLyBjcmVhdGUgaHRtbFxyXG4gIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBXaW5kb3dcIikuY29udGVudCwgdHJ1ZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwid2luZG93LVwiICsgdGhpcy5pZCk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikudGV4dENvbnRlbnQgPSBjb25maWcudGl0bGU7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSBjb25maWcueCArIFwicHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gY29uZmlnLnkgKyBcInB4XCI7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnpJbmRleCA9IGNvbmZpZy56SW5kZXg7XHJcblxyXG4gIC8vIGRyYWdcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIHRoaXMucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxuICB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5vZmZzZXRUb3AgLSBldmVudC5wYWdlWTtcclxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyYWdnaW5nXCIpO1xyXG4gIHRoaXMucHdkLnpJbmRleCArPSAxO1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLnB3ZC56SW5kZXg7XHJcbiAgLy90aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0LnggPSBldmVudC5wYWdlWCAtXHJcbiAgLy8gdGhpcy5wd2QubW91c2Uuc2VsZWN0ZWRXaW5kb3cgPSB0aGlzO1xyXG4gIC8vIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMucHdkLm1vdXNlLm1vdmUuYmluZCh0aGlzLnB3ZC5tb3VzZSkpO1xyXG4gIC8vIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLnN0b3BEcmFnLmJpbmQodGhpcykpO1xyXG4gIC8vdGhpcy5kcmFnZ2VkID0gdHJ1ZTtcclxuICAvL2NvbnNvbGUubG9nKHRoaXMuZHJhZ2dlZClcclxuICAvL3RoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiZHJhZ2dpbmdcIik7XHJcbiAgLy90aGlzLnB3ZC5tb3VzZS5zZWxlY3RlZCA9IHRoaXM7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCArIFwicHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gZS5wYWdlWSArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZICsgXCJweFwiO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgLy93aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcHBXaW5kb3c7XHJcbiIsImZ1bmN0aW9uIE1vdXNlKCl7XHJcbiAgdGhpcy5kcmFnZ2VkT2JqZWN0ID0gbnVsbDtcclxuICB0aGlzLmRyYWdPZmZzZXRYID0gMDtcclxuICB0aGlzLmRyYWdPZmZzZXRZID0gMDtcclxuXHJcbiAgdGhpcy5tb3VzZXVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmRyYWdnZWRPYmplY3QuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dpbmdcIik7XHJcbiAgICB0aGlzLmRyYWdnZWRPYmplY3QgPSBudWxsO1xyXG4gIH07XHJcblxyXG4gIHRoaXMubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKHRoaXMuZHJhZ2dlZE9iamVjdCAhPT0gbnVsbCkge1xyXG4gICAgICB0aGlzLmRyYWdnZWRPYmplY3QuZHJhZyhlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbiAgLy8gdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgLy8gdGhpcy5tb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAvLyAgIGNvbnNvbGUubG9nKFwibW92ZVwiLCB0aGlzKVxyXG4gIC8vXHJcbiAgLy8gICAvLyBpZiAodGhpcy5zZWxlY3RlZCkge1xyXG4gIC8vICAgLy8gICB0aGlzLnNlbGVjdGVkLnN0eWxlLmxlZnQgPSBldmVudC5vZmZzZXRYICsgXCJweFwiO1xyXG4gIC8vICAgLy8gfVxyXG4gIC8vIH1cclxuICAvL1xyXG4gIC8vXHJcbiAgLy8gLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiKTtcclxuICAvL1xyXG4gIC8vIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcclxuIiwidmFyIGRlc2t0b3AgPSByZXF1aXJlKFwiLi9kZXNrdG9wXCIpO1xyXG52YXIgQXBwV2luZG93ID0gcmVxdWlyZShcIi4vQXBwV2luZG93XCIpO1xyXG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcclxuXHJcbnZhciBwd2QgPSB7XHJcbiAgbW91c2U6IG5ldyBNb3VzZSgpLFxyXG4gIGFwcHM6IFtdLFxyXG4gIHpJbmRleDogM1xyXG59XHJcblxyXG5wd2QuYXBwcy5wdXNoKG5ldyBBcHBXaW5kb3cocHdkLCB7XHJcbiAgaWQ6IDEsXHJcbiAgdGl0bGU6IFwidGVzdCB3aW5kb3dcIixcclxuICB4OiAyMCxcclxuICB5OiAxMDAsXHJcbiAgekluZGV4OiAxXHJcbn0pKTtcclxucHdkLmFwcHMucHVzaChuZXcgQXBwV2luZG93KHB3ZCwge1xyXG4gIGlkOiAyLFxyXG4gIHRpdGxlOiBcImFub3RoZXIgd2luZG93XCIsXHJcbiAgeDogMTAwLFxyXG4gIHk6IDMwMCxcclxuICB6SW5kZXg6IDJcclxufSkpO1xyXG4iLCJjb25zb2xlLmxvZyhcImRlc2t0b3BcIik7XHJcbiJdfQ==
