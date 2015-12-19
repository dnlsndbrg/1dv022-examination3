(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
function Mouse(){
  this.draggedObject = null;

  this.mouseup = function() {
    this.draggedObject = null;
  };

  this.mousemove = function(e) {

    //console.log(this.draggedObject)
    if (this.draggedObject !== null) {

      console.log("DRAG",this.draggedObject)

      //this.draggedObject.classList.addClass("dragging");
      this.draggedObject.element.style.left = e.offsetX;
      this.draggedObject.element.style.top = e.offsetY;
    }
  }

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
  selectedWindow: null,
  mouse: new Mouse(),
  apps: []
}

pwd.apps.push(new AppWindow(pwd, {id: 1}));
pwd.apps.push(new AppWindow(pwd, {id: 2}));

},{"./AppWindow":1,"./Mouse":2,"./desktop":4}],4:[function(require,module,exports){
console.log("desktop");

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIEFwcFdpbmRvdyhwd2QsIGNvbmZpZykge1xyXG4gIHRoaXMucHdkID0gcHdkO1xyXG4gIHRoaXMuZWxlbWVudDtcclxuICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gIHRoaXMuaW5pdCgpO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAvLyBjcmVhdGUgaHRtbFxyXG4gIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBXaW5kb3dcIikuY29udGVudCwgdHJ1ZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwid2luZG93LVwiICsgdGhpcy5pZCk7XHJcblxyXG4gIC8vIGRyYWdcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIGNvbnNvbGUubG9nKFwiZHJhZyFcIiwgdGhpcylcclxuICB0aGlzLnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICAvLyB0aGlzLnB3ZC5tb3VzZS5zZWxlY3RlZFdpbmRvdyA9IHRoaXM7XHJcbiAgLy8gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5wd2QubW91c2UubW92ZS5iaW5kKHRoaXMucHdkLm1vdXNlKSk7XHJcbiAgLy8gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMuc3RvcERyYWcuYmluZCh0aGlzKSk7XHJcbiAgLy90aGlzLmRyYWdnZWQgPSB0cnVlO1xyXG4gIC8vY29uc29sZS5sb2codGhpcy5kcmFnZ2VkKVxyXG4gIC8vdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJkcmFnZ2luZ1wiKTtcclxuICAvL3RoaXMucHdkLm1vdXNlLnNlbGVjdGVkID0gdGhpcztcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBwV2luZG93O1xyXG4iLCJmdW5jdGlvbiBNb3VzZSgpe1xyXG4gIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcblxyXG4gIHRoaXMubW91c2V1cCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5kcmFnZ2VkT2JqZWN0ID0gbnVsbDtcclxuICB9O1xyXG5cclxuICB0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZHJhZ2dlZE9iamVjdClcclxuICAgIGlmICh0aGlzLmRyYWdnZWRPYmplY3QgIT09IG51bGwpIHtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKFwiRFJBR1wiLHRoaXMuZHJhZ2dlZE9iamVjdClcclxuXHJcbiAgICAgIC8vdGhpcy5kcmFnZ2VkT2JqZWN0LmNsYXNzTGlzdC5hZGRDbGFzcyhcImRyYWdnaW5nXCIpO1xyXG4gICAgICB0aGlzLmRyYWdnZWRPYmplY3QuZWxlbWVudC5zdHlsZS5sZWZ0ID0gZS5vZmZzZXRYO1xyXG4gICAgICB0aGlzLmRyYWdnZWRPYmplY3QuZWxlbWVudC5zdHlsZS50b3AgPSBlLm9mZnNldFk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbiAgLy8gdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgLy8gdGhpcy5tb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAvLyAgIGNvbnNvbGUubG9nKFwibW92ZVwiLCB0aGlzKVxyXG4gIC8vXHJcbiAgLy8gICAvLyBpZiAodGhpcy5zZWxlY3RlZCkge1xyXG4gIC8vICAgLy8gICB0aGlzLnNlbGVjdGVkLnN0eWxlLmxlZnQgPSBldmVudC5vZmZzZXRYICsgXCJweFwiO1xyXG4gIC8vICAgLy8gfVxyXG4gIC8vIH1cclxuICAvL1xyXG4gIC8vXHJcbiAgLy8gLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiKTtcclxuICAvL1xyXG4gIC8vIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcclxuIiwidmFyIGRlc2t0b3AgPSByZXF1aXJlKFwiLi9kZXNrdG9wXCIpO1xyXG52YXIgQXBwV2luZG93ID0gcmVxdWlyZShcIi4vQXBwV2luZG93XCIpO1xyXG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcclxuXHJcbnZhciBwd2QgPSB7XHJcbiAgc2VsZWN0ZWRXaW5kb3c6IG51bGwsXHJcbiAgbW91c2U6IG5ldyBNb3VzZSgpLFxyXG4gIGFwcHM6IFtdXHJcbn1cclxuXHJcbnB3ZC5hcHBzLnB1c2gobmV3IEFwcFdpbmRvdyhwd2QsIHtpZDogMX0pKTtcclxucHdkLmFwcHMucHVzaChuZXcgQXBwV2luZG93KHB3ZCwge2lkOiAyfSkpO1xyXG4iLCJjb25zb2xlLmxvZyhcImRlc2t0b3BcIik7XHJcbiJdfQ==
