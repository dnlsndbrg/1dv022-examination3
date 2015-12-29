(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ResizeWindowWidth = require("./ResizeWindowWidth");
var ResizeWindowHeight = require("./ResizeWindowHeight");
var ResizeWindowWidthHeight = require("./ResizeWindowWidthHeight");

function AppWindow(config) {
  this.pwd = config.pwd;
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

  this.content = document.querySelector("#window-" + this.id + " .window-content");

  // put on top if clicked
  this.element.addEventListener("mousedown", this.moveToTop.bind(this), true);
  // drag the window from the window bar
  document.querySelector("#window-" + this.id + " .window-bar").addEventListener("mousedown", this.startDrag.bind(this));
  // close
  document.querySelector("#window-" + this.id + " .close-window").addEventListener("click", this.close.bind(this));
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
  this.pwd.lastZIndex += 1;
  this.element.style.zIndex = this.pwd.lastZIndex;
}

AppWindow.prototype.close = function(event) {
  this.pwd.closeApp(this);
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
function Shortcut(config, pwd) {
  this.title = config.title;
  this.entry = config.entry;
  this.pwd = pwd;
  // create html
  var template = document.querySelector("#shortcut");
  var clone = document.importNode(template.content, true);
  document.querySelector("#pwd").appendChild(clone);
  this.element = document.querySelector("#pwd").lastElementChild;
  this.element.textContent = this.title;
  //add event listener
  this.element.addEventListener("click", function() {
    this.pwd.startApp(this.entry);
  }.bind(this));
}

module.exports = Shortcut;

},{}],7:[function(require,module,exports){
var AppWindow = require("./AppWindow");
var Mouse = require("./Mouse");
var Shortcut = require("./Shortcut");
var appList = require("./appList");

var Pwd = function(){
  this.mouse = new Mouse();
  this.installedApps = [];
  this.startedApps = {};
  this.lastZIndex = 1;
  this.lastID = 1;
  this.newX = 10;
  this.newY = 10;

  // creates shortcuts for all available apps
  this.installApps = function() {
    for (var app in appList) {
      this.installedApps.push(new Shortcut(appList[app], this))
    };
  }

  // start an app
  this.startApp = function(app) {
    var newApp = new app({
      pwd: this,
      id: this.lastID,
      x: this.newX,
      y: this.newY,
      zIndex: this.lastZIndex,
    });
    this.startedApps[this.lastID] = newApp;
    this.lastZIndex += 1;
    this.lastID += 1;
    this.newX += 10;
    this.newY += 10;
  }

  this.closeApp = function(app) {
    console.log(app, this.startedApps)
    this.startedApps[app.id].close();
    delete this.startedApps[app.id];
  }

  this.resize = function(event) {
    console.log("resize", event);
  }
}

var pwd = new Pwd();
pwd.installApps();
window.addEventListener("resize", pwd.resize);

},{"./AppWindow":1,"./Mouse":2,"./Shortcut":6,"./appList":8}],8:[function(require,module,exports){
module.exports = {
  "Chat": {
    entry: require("./apps/chat/app"),
    title: "Chat2",
    width: 400,
    height: 300
  }
}

},{"./apps/chat/app":9}],9:[function(require,module,exports){
var AppWindow = require("../../../js/AppWindow");
var config = require("./config.json");

function Chat(config) {
  this.title = "Chat";
  this.width = 400;
  this.height = 300;
  this.id = config.id;
  config.width = this.width;
  config.height = this.height;
  config.title = this.title;
  this.appWindow = new AppWindow(config);
  this.socket = null;
  var template = document.querySelector("#chat");
  this.chatDiv = document.importNode(template.content.firstElementChild, true);
  this.connect().then(function(socket) {

  });

  this.chatDiv.addEventListener("keypress", function(event) {
    // listen for enter key
    if (event.keyCode === 13) {
      //send a message
      this.sendMessage(event.target.value);
      // empty textarea
      event.target.value = "";

      event.preventDefault();
    }
  }.bind(this));


  this.appWindow.content.appendChild(this.chatDiv);


}

Chat.prototype.connect = function() {
  return new Promise(function(resolve, reject){

    if (this.socket && this.socket.readyState === 1) {
      resolve(this.socket);
      return;
    }

    this.socket = new WebSocket(config.address);

    this.socket.addEventListener("open", function() {
      resolve(this.socket)
    }.bind(this));

    this.socket.addEventListener("error", function(event) {
      reject(new Error("Could not connect"));
    }.bind(this));

    this.socket.addEventListener("message", function(event) {
      var message = JSON.parse(event.data);
      if (message.type === "message") {
          this.printMessage(message);
      }
    }.bind(this));

  }.bind(this));


};

Chat.prototype.sendMessage = function(text) {
  var data = {
    type: "message",
    data: text,
    username: "Daniel",
    channel: "",
    key: config.key
  }

  console.log(this);
  this.connect().then(function(socket){
    socket.send(JSON.stringify(data));
  }).catch(function(error) {
    console.log("Error: ", error);
  });

};

Chat.prototype.printMessage = function(message) {
  var template = this.chatDiv.querySelectorAll("template")[0];

  var messageDiv = document.importNode(template.content.firstElementChild, true);
  messageDiv.querySelectorAll(".chat-text")[0].textContent = message.data;
  messageDiv.querySelectorAll(".chat-author")[0].textContent = message.username;

  this.chatDiv.querySelectorAll(".chat-messages")[0].appendChild(messageDiv);
};

Chat.prototype.close = function() {
  // remove the graphics
  document.querySelector("#pwd").removeChild(this.appWindow.element);

}

module.exports = Chat;

},{"../../../js/AppWindow":1,"./config.json":10}],10:[function(require,module,exports){
module.exports={
  "address": "ws://vhost3.lnu.se:20080/socket/",
  "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUmVzaXplV2luZG93SGVpZ2h0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aC5qcyIsImNsaWVudC9zb3VyY2UvanMvUmVzaXplV2luZG93V2lkdGhIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Nob3J0Y3V0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcExpc3QuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9jb25maWcuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVzaXplV2luZG93V2lkdGggPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aFwiKTtcclxudmFyIFJlc2l6ZVdpbmRvd0hlaWdodCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd0hlaWdodFwiKTtcclxudmFyIFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93V2lkdGhIZWlnaHRcIik7XHJcblxyXG5mdW5jdGlvbiBBcHBXaW5kb3coY29uZmlnKSB7XHJcbiAgdGhpcy5wd2QgPSBjb25maWcucHdkO1xyXG4gIHRoaXMuZWxlbWVudDtcclxuICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gIHRoaXMud2lkdGggPSBjb25maWcud2lkdGg7XHJcbiAgdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0O1xyXG4gIHRoaXMueCA9IGNvbmZpZy54O1xyXG4gIHRoaXMueSA9IGNvbmZpZy55O1xyXG4gIHRoaXMuaW5pdChjb25maWcpO1xyXG4gIHRoaXMudGl0bGVCYXJIZWlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5zY3JvbGxIZWlnaHQ7IC8vIHVzZWQgZm9yIGRyYWcgcmV6aXNpbmdcclxuICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoKHRoaXMpO1xyXG4gIHRoaXMucmVzaXplV2luZG93SGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd0hlaWdodCh0aGlzKTtcclxuICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0KHRoaXMpO1xyXG5cclxuICB0aGlzLmNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIik7XHJcblxyXG4gIC8vIHB1dCBvbiB0b3AgaWYgY2xpY2tlZFxyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW92ZVRvVG9wLmJpbmQodGhpcyksIHRydWUpO1xyXG4gIC8vIGRyYWcgdGhlIHdpbmRvdyBmcm9tIHRoZSB3aW5kb3cgYmFyXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxuICAvLyBjbG9zZVxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jbG9zZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gIC8vIGNyZWF0ZSBodG1sXHJcbiAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FwcFdpbmRvd1wiKS5jb250ZW50LCB0cnVlKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJ3aW5kb3ctXCIgKyB0aGlzLmlkKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhci10aXRsZVwiKS50ZXh0Q29udGVudCA9IGNvbmZpZy50aXRsZTtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGNvbmZpZy54ICsgXCJweFwiO1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBjb25maWcueSArIFwicHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gY29uZmlnLnpJbmRleDtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBjb25maWcud2lkdGggKyBcInB4XCI7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIikuc3R5bGUuaGVpZ2h0ID0gY29uZmlnLmhlaWdodCAgKyBcInB4XCI7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICB0aGlzLnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0IC0gZXZlbnQucGFnZVg7XHJcbiAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wIC0gZXZlbnQucGFnZVk7XHJcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcmFnZ2luZ1wiKTtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMueCA9IGUucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WDtcclxuICB0aGlzLnkgPSBlLnBhZ2VZICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSAgdGhpcy54ICsgXCJweFwiO1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnaW5nXCIpO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1vdmVUb1RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMucHdkLmxhc3RaSW5kZXggKz0gMTtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy5wd2QubGFzdFpJbmRleDtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgdGhpcy5wd2QuY2xvc2VBcHAodGhpcyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBwV2luZG93O1xyXG4iLCJmdW5jdGlvbiBNb3VzZSgpe1xyXG4gIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcbiAgdGhpcy5kcmFnT2Zmc2V0WCA9IDA7XHJcbiAgdGhpcy5kcmFnT2Zmc2V0WSA9IDA7XHJcblxyXG4gIHRoaXMubW91c2V1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIGlmICh0aGlzLmRyYWdnZWRPYmplY3QgIT09IG51bGwpIHtcclxuICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0LnN0b3BEcmFnKGUpO1xyXG4gICAgICB0aGlzLmRyYWdnZWRPYmplY3QgPSBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHRoaXMubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKHRoaXMuZHJhZ2dlZE9iamVjdCAhPT0gbnVsbCkge1xyXG4gICAgICB0aGlzLmRyYWdnZWRPYmplY3QuZHJhZyhlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbiAgLy8gdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgLy8gdGhpcy5tb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAvLyAgIGNvbnNvbGUubG9nKFwibW92ZVwiLCB0aGlzKVxyXG4gIC8vXHJcbiAgLy8gICAvLyBpZiAodGhpcy5zZWxlY3RlZCkge1xyXG4gIC8vICAgLy8gICB0aGlzLnNlbGVjdGVkLnN0eWxlLmxlZnQgPSBldmVudC5vZmZzZXRYICsgXCJweFwiO1xyXG4gIC8vICAgLy8gfVxyXG4gIC8vIH1cclxuICAvL1xyXG4gIC8vXHJcbiAgLy8gLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiKTtcclxuICAvL1xyXG4gIC8vIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcclxuIiwiZnVuY3Rpb24gUmVzaXplV2luZG93SGVpZ2h0KGFwcFdpbmRvdykge1xyXG4gIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIik7XHJcbiAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG4gIGNvbnNvbGUubG9nKHRoaXMucmVzaXplVGhpcylcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LnRpdGxlQmFySGVpZ2h0IC0gZXZlbnQucGFnZVk7XHJcbiAgLy8gVE9ETzogZml4IGRyYWcgb2Zmc2V0XHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLnJlc2l6ZVRoaXMuc3R5bGUuaGVpZ2h0ID0gKGUucGFnZVkgLSB0aGlzLmFwcFdpbmRvdy55IC0gdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZKSArIFwicHhcIjtcclxuICAvL3RoaXMuYXBwV2luZG93LmVsZW1lbnQuc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCArIFwicHhcIjtcclxuICAvL3RoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYICsgXCJweFwiO1xyXG4gIC8vdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IGUucGFnZVkgKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSArIFwicHhcIjtcclxufVxyXG5cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dIZWlnaHQ7XHJcbiIsImZ1bmN0aW9uIFJlc2l6ZVdpbmRvd1dpZHRoKGFwcFdpbmRvdykge1xyXG4gIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXhcIik7XHJcbiAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCk7XHJcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuXHJcbiAgLy9kcmFnIGZyb20gZXhhY3RseSB3aGVyZSB0aGUgY2xpY2sgaXNcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0TGVmdCAtIGUucGFnZVg7XHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMucmVzaXplVGhpcy5zdHlsZS53aWR0aCA9IChlLnBhZ2VYIC0gdGhpcy5hcHBXaW5kb3cueCArIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCkgKyBcInB4XCI7XHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dXaWR0aDtcclxuIiwiZnVuY3Rpb24gUmVzaXplV2luZG93V2lkdGhIZWlnaHQoYXBwV2luZG93KSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteHlcIik7XHJcbiAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcbiAgLy8gdGhpcyBlbGVtZW50IGhhcyBubyBvZmZzZXRUb3Agc28gaW5zdGVhZCB3ZSB1c2Ugd2luZG93LXJlc2l6ZXItaGVpZ2h0J3Mgb2Zmc2V0VG9wIHZhbHVlXHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy50aXRsZUJhckhlaWdodCAtIGV2ZW50LnBhZ2VZO1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0ICsgdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRMZWZ0IC0gZS5wYWdlWDtcclxuICAvLyBUT0RPOiBmaXggZHJhZyBvZmZzZXRcclxuICBlLnN0b3BQcm9wYWdhdGlvbigpOyAvL3RoaXMgY2xpY2sgc2hvdWxkbnQgZ28gdGhyb3VnaCB0byB0aGUgcGFyZW50IHdoaWNoIGlzIHRoZSBoZWlnaHQtcmVzaXplclxyXG5cclxufVxyXG5cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cucmVzaXplV2luZG93SGVpZ2h0LmRyYWcoZSk7XHJcbiAgdGhpcy5hcHBXaW5kb3cucmVzaXplV2luZG93V2lkdGguZHJhZyhlKTtcclxuICAvL3RoaXMucmVzaXplVGhpcy5zdHlsZS5oZWlnaHQgPSAoZS5wYWdlWSAtIHRoaXMuYXBwV2luZG93LnkpICsgXCJweFwiO1xyXG59XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGhIZWlnaHQ7XHJcbiIsImZ1bmN0aW9uIFNob3J0Y3V0KGNvbmZpZywgcHdkKSB7XHJcbiAgdGhpcy50aXRsZSA9IGNvbmZpZy50aXRsZTtcclxuICB0aGlzLmVudHJ5ID0gY29uZmlnLmVudHJ5O1xyXG4gIHRoaXMucHdkID0gcHdkO1xyXG4gIC8vIGNyZWF0ZSBodG1sXHJcbiAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzaG9ydGN1dFwiKTtcclxuICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG4gIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMudGl0bGU7XHJcbiAgLy9hZGQgZXZlbnQgbGlzdGVuZXJcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wd2Quc3RhcnRBcHAodGhpcy5lbnRyeSk7XHJcbiAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGN1dDtcclxuIiwidmFyIEFwcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0FwcFdpbmRvd1wiKTtcclxudmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XHJcbnZhciBTaG9ydGN1dCA9IHJlcXVpcmUoXCIuL1Nob3J0Y3V0XCIpO1xyXG52YXIgYXBwTGlzdCA9IHJlcXVpcmUoXCIuL2FwcExpc3RcIik7XHJcblxyXG52YXIgUHdkID0gZnVuY3Rpb24oKXtcclxuICB0aGlzLm1vdXNlID0gbmV3IE1vdXNlKCk7XHJcbiAgdGhpcy5pbnN0YWxsZWRBcHBzID0gW107XHJcbiAgdGhpcy5zdGFydGVkQXBwcyA9IHt9O1xyXG4gIHRoaXMubGFzdFpJbmRleCA9IDE7XHJcbiAgdGhpcy5sYXN0SUQgPSAxO1xyXG4gIHRoaXMubmV3WCA9IDEwO1xyXG4gIHRoaXMubmV3WSA9IDEwO1xyXG5cclxuICAvLyBjcmVhdGVzIHNob3J0Y3V0cyBmb3IgYWxsIGF2YWlsYWJsZSBhcHBzXHJcbiAgdGhpcy5pbnN0YWxsQXBwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgYXBwIGluIGFwcExpc3QpIHtcclxuICAgICAgdGhpcy5pbnN0YWxsZWRBcHBzLnB1c2gobmV3IFNob3J0Y3V0KGFwcExpc3RbYXBwXSwgdGhpcykpXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gc3RhcnQgYW4gYXBwXHJcbiAgdGhpcy5zdGFydEFwcCA9IGZ1bmN0aW9uKGFwcCkge1xyXG4gICAgdmFyIG5ld0FwcCA9IG5ldyBhcHAoe1xyXG4gICAgICBwd2Q6IHRoaXMsXHJcbiAgICAgIGlkOiB0aGlzLmxhc3RJRCxcclxuICAgICAgeDogdGhpcy5uZXdYLFxyXG4gICAgICB5OiB0aGlzLm5ld1ksXHJcbiAgICAgIHpJbmRleDogdGhpcy5sYXN0WkluZGV4LFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnN0YXJ0ZWRBcHBzW3RoaXMubGFzdElEXSA9IG5ld0FwcDtcclxuICAgIHRoaXMubGFzdFpJbmRleCArPSAxO1xyXG4gICAgdGhpcy5sYXN0SUQgKz0gMTtcclxuICAgIHRoaXMubmV3WCArPSAxMDtcclxuICAgIHRoaXMubmV3WSArPSAxMDtcclxuICB9XHJcblxyXG4gIHRoaXMuY2xvc2VBcHAgPSBmdW5jdGlvbihhcHApIHtcclxuICAgIGNvbnNvbGUubG9nKGFwcCwgdGhpcy5zdGFydGVkQXBwcylcclxuICAgIHRoaXMuc3RhcnRlZEFwcHNbYXBwLmlkXS5jbG9zZSgpO1xyXG4gICAgZGVsZXRlIHRoaXMuc3RhcnRlZEFwcHNbYXBwLmlkXTtcclxuICB9XHJcblxyXG4gIHRoaXMucmVzaXplID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKFwicmVzaXplXCIsIGV2ZW50KTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBwd2QgPSBuZXcgUHdkKCk7XHJcbnB3ZC5pbnN0YWxsQXBwcygpO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBwd2QucmVzaXplKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgXCJDaGF0XCI6IHtcclxuICAgIGVudHJ5OiByZXF1aXJlKFwiLi9hcHBzL2NoYXQvYXBwXCIpLFxyXG4gICAgdGl0bGU6IFwiQ2hhdDJcIixcclxuICAgIHdpZHRoOiA0MDAsXHJcbiAgICBoZWlnaHQ6IDMwMFxyXG4gIH1cclxufVxyXG4iLCJ2YXIgQXBwV2luZG93ID0gcmVxdWlyZShcIi4uLy4uLy4uL2pzL0FwcFdpbmRvd1wiKTtcclxudmFyIGNvbmZpZyA9IHJlcXVpcmUoXCIuL2NvbmZpZy5qc29uXCIpO1xyXG5cclxuZnVuY3Rpb24gQ2hhdChjb25maWcpIHtcclxuICB0aGlzLnRpdGxlID0gXCJDaGF0XCI7XHJcbiAgdGhpcy53aWR0aCA9IDQwMDtcclxuICB0aGlzLmhlaWdodCA9IDMwMDtcclxuICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gIGNvbmZpZy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgY29uZmlnLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gIGNvbmZpZy50aXRsZSA9IHRoaXMudGl0bGU7XHJcbiAgdGhpcy5hcHBXaW5kb3cgPSBuZXcgQXBwV2luZG93KGNvbmZpZyk7XHJcbiAgdGhpcy5zb2NrZXQgPSBudWxsO1xyXG4gIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFwiKTtcclxuICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xyXG4gIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7XHJcblxyXG4gIH0pO1xyXG5cclxuICB0aGlzLmNoYXREaXYuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAvLyBsaXN0ZW4gZm9yIGVudGVyIGtleVxyXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgIC8vc2VuZCBhIG1lc3NhZ2VcclxuICAgICAgdGhpcy5zZW5kTWVzc2FnZShldmVudC50YXJnZXQudmFsdWUpO1xyXG4gICAgICAvLyBlbXB0eSB0ZXh0YXJlYVxyXG4gICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xyXG5cclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICB9LmJpbmQodGhpcykpO1xyXG5cclxuXHJcbiAgdGhpcy5hcHBXaW5kb3cuY29udGVudC5hcHBlbmRDaGlsZCh0aGlzLmNoYXREaXYpO1xyXG5cclxuXHJcbn1cclxuXHJcbkNoYXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuXHJcbiAgICBpZiAodGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSkge1xyXG4gICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuYWRkcmVzcyk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpXHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICByZWplY3QobmV3IEVycm9yKFwiQ291bGQgbm90IGNvbm5lY3RcIikpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICB2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwibWVzc2FnZVwiKSB7XHJcbiAgICAgICAgICB0aGlzLnByaW50TWVzc2FnZShtZXNzYWdlKTtcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgfS5iaW5kKHRoaXMpKTtcclxuXHJcblxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KSB7XHJcbiAgdmFyIGRhdGEgPSB7XHJcbiAgICB0eXBlOiBcIm1lc3NhZ2VcIixcclxuICAgIGRhdGE6IHRleHQsXHJcbiAgICB1c2VybmFtZTogXCJEYW5pZWxcIixcclxuICAgIGNoYW5uZWw6IFwiXCIsXHJcbiAgICBrZXk6IGNvbmZpZy5rZXlcclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KXtcclxuICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcikge1xyXG4gICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIsIGVycm9yKTtcclxuICB9KTtcclxuXHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5wcmludE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XHJcbiAgdmFyIHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVwiKVswXTtcclxuXHJcbiAgdmFyIG1lc3NhZ2VEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xyXG4gIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbChcIi5jaGF0LXRleHRcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7XHJcbiAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtYXV0aG9yXCIpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS51c2VybmFtZTtcclxuXHJcbiAgdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1tZXNzYWdlc1wiKVswXS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gcmVtb3ZlIHRoZSBncmFwaGljc1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLnJlbW92ZUNoaWxkKHRoaXMuYXBwV2luZG93LmVsZW1lbnQpO1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xyXG4iLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgXCJhZGRyZXNzXCI6IFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIixcclxuICBcImtleVwiOiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcclxufVxyXG4iXX0=
