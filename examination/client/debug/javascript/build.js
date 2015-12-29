(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ResizeWindowWidth = require("./ResizeWindowWidth");
var ResizeWindowHeight = require("./ResizeWindowHeight");
var ResizeWindowWidthHeight = require("./ResizeWindowWidthHeight");

function AppWindow(config) {
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
  this.element = document.querySelector("#pwd").lastElementChild;
  this.element.setAttribute("id", "window-" + this.id);
  document.querySelector("#window-" + this.id + " .window-bar-title").textContent = config.title;
  this.element.style.left = config.x + "px";
  this.element.style.top = config.y + "px";
  this.element.style.zIndex = config.zIndex;
  this.element.style.width = config.width + "px";
  document.querySelector("#window-" + this.id + " .window-content-wrapper").style.height = config.height  + "px";
  this.wrapperElement = document.querySelector("#window-" + this.id + " .window-content-wrapper");
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
  // save the size and position so we can return to it with the restore function
  this.lastX = this.x;
  this.lastY = this.y;
  this.lastWidth = this.width;
  this.lastHeight = this.height;

  // make the window fullscreen
  this.element.style.left = "0px";
  this.element.style.top = "0px";
  this.element.style.width = this.pwd.width + "px";
  this.wrapperElement.style.height = this.pwd.height + "px";

  document.querySelector("#window-" + this.id + " .maximize-window").classList.add("hidden");
  document.querySelector("#window-" + this.id + " .restore-window").classList.remove("hidden");
}

AppWindow.prototype.restore = function() {
  this.element.style.left = this.lastX + "px";
  this.element.style.top = this.lastY + "px";
  this.element.style.width = this.lastWidth + "px";
  this.wrapperElement.style.height = this.lastHeight + "px";

  document.querySelector("#window-" + this.id + " .maximize-window").classList.remove("hidden");
  document.querySelector("#window-" + this.id + " .restore-window").classList.add("hidden");
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

  this.resize = function() {
    console.log(this, "resize", window.innerWidth, window.innerHeight);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

  }
}

var pwd = new Pwd();
pwd.installApps(); // create shortcuts for all available apps
pwd.resize(); // run resize once to set width and height
window.addEventListener("resize", pwd.resize.bind(pwd));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUmVzaXplV2luZG93SGVpZ2h0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aC5qcyIsImNsaWVudC9zb3VyY2UvanMvUmVzaXplV2luZG93V2lkdGhIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Nob3J0Y3V0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcExpc3QuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9jb25maWcuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVzaXplV2luZG93V2lkdGggPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aFwiKTtcclxudmFyIFJlc2l6ZVdpbmRvd0hlaWdodCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd0hlaWdodFwiKTtcclxudmFyIFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93V2lkdGhIZWlnaHRcIik7XHJcblxyXG5mdW5jdGlvbiBBcHBXaW5kb3coY29uZmlnKSB7XHJcbiAgdGhpcy5pZCA9IGNvbmZpZy5pZDtcclxuICB0aGlzLnB3ZCA9IGNvbmZpZy5wd2Q7XHJcbiAgdGhpcy5lbGVtZW50O1xyXG4gIHRoaXMuZWxlbWVudFdyYXBwZXI7XHJcbiAgdGhpcy53aWR0aCA9IGNvbmZpZy53aWR0aDtcclxuICB0aGlzLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQ7XHJcbiAgdGhpcy54ID0gY29uZmlnLng7XHJcbiAgdGhpcy55ID0gY29uZmlnLnk7XHJcbiAgdGhpcy5pbml0KGNvbmZpZyk7XHJcbiAgdGhpcy50aXRsZUJhckhlaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLnNjcm9sbEhlaWdodDsgLy8gdXNlZCBmb3IgZHJhZyByZXppc2luZ1xyXG4gIHRoaXMucmVzaXplV2luZG93V2lkdGggPSBuZXcgUmVzaXplV2luZG93V2lkdGgodGhpcyk7XHJcbiAgdGhpcy5yZXNpemVXaW5kb3dIZWlnaHQgPSBuZXcgUmVzaXplV2luZG93SGVpZ2h0KHRoaXMpO1xyXG4gIHRoaXMucmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSBuZXcgUmVzaXplV2luZG93V2lkdGhIZWlnaHQodGhpcyk7XHJcbiAgdGhpcy5jb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpO1xyXG4gIC8vIHB1dCBvbiB0b3AgaWYgY2xpY2tlZFxyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW92ZVRvVG9wLmJpbmQodGhpcyksIHRydWUpO1xyXG4gIC8vIGRyYWcgdGhlIHdpbmRvdyBmcm9tIHRoZSB3aW5kb3cgYmFyXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxuICAvLyBjbG9zZSBldmVudFxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jbG9zZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcbiAgLy8gbWF4aW1pemUgZXZlbnRcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm1heGltaXplLmJpbmQodGhpcykpO1xyXG4gIC8vIHJlc3RvcmUgZXZlbnRcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMucmVzdG9yZS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oY29uZmlnKSB7XHJcbiAgLy8gY3JlYXRlIGh0bWxcclxuICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYXBwV2luZG93XCIpLmNvbnRlbnQsIHRydWUpO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG4gIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcIndpbmRvdy1cIiArIHRoaXMuaWQpO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyLXRpdGxlXCIpLnRleHRDb250ZW50ID0gY29uZmlnLnRpdGxlO1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gY29uZmlnLnggKyBcInB4XCI7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IGNvbmZpZy55ICsgXCJweFwiO1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS56SW5kZXggPSBjb25maWcuekluZGV4O1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IGNvbmZpZy53aWR0aCArIFwicHhcIjtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKS5zdHlsZS5oZWlnaHQgPSBjb25maWcuaGVpZ2h0ICArIFwicHhcIjtcclxuICB0aGlzLndyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICB0aGlzLnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0IC0gZXZlbnQucGFnZVg7XHJcbiAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wIC0gZXZlbnQucGFnZVk7XHJcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcmFnZ2luZ1wiKTtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMueCA9IGUucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WDtcclxuICB0aGlzLnkgPSBlLnBhZ2VZICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgdGhpcy5jaGVja0JvdW5kcyhlKTtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9ICB0aGlzLnggKyBcInB4XCI7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5jaGVja0JvdW5kcyA9IGZ1bmN0aW9uKGUpe1xyXG4gIGNvbnNvbGUubG9nKHRoaXMucHdkLndpZHRoLCB0aGlzLnB3ZC5oZWlnaHQpO1xyXG4gIGlmIChlLnBhZ2VYID4gdGhpcy5wd2Qud2lkdGgpXHJcbiAgICB0aGlzLnggPSB0aGlzLnB3ZC53aWR0aCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gIGlmIChlLnBhZ2VZID4gdGhpcy5wd2QuaGVpZ2h0KVxyXG4gICAgdGhpcy55ID0gdGhpcy5wd2QuaGVpZ2h0ICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgZWxzZSBpZiAoZS5wYWdlWSA8IDEpXHJcbiAgICB0aGlzLnkgPSB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuXHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnaW5nXCIpO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1vdmVUb1RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMucHdkLmxhc3RaSW5kZXggKz0gMTtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy5wd2QubGFzdFpJbmRleDtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgdGhpcy5wd2QuY2xvc2VBcHAodGhpcyk7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUubWF4aW1pemUgPSBmdW5jdGlvbigpIHtcclxuICAvLyBzYXZlIHRoZSBzaXplIGFuZCBwb3NpdGlvbiBzbyB3ZSBjYW4gcmV0dXJuIHRvIGl0IHdpdGggdGhlIHJlc3RvcmUgZnVuY3Rpb25cclxuICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gIHRoaXMubGFzdFkgPSB0aGlzLnk7XHJcbiAgdGhpcy5sYXN0V2lkdGggPSB0aGlzLndpZHRoO1xyXG4gIHRoaXMubGFzdEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAvLyBtYWtlIHRoZSB3aW5kb3cgZnVsbHNjcmVlblxyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLnB3ZC53aWR0aCArIFwicHhcIjtcclxuICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMucHdkLmhlaWdodCArIFwicHhcIjtcclxuXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1heGltaXplLXdpbmRvd1wiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5yZXN0b3JlLXdpbmRvd1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMubGFzdFggKyBcInB4XCI7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMubGFzdFkgKyBcInB4XCI7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5sYXN0V2lkdGggKyBcInB4XCI7XHJcbiAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmxhc3RIZWlnaHQgKyBcInB4XCI7XHJcblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcHBXaW5kb3c7XHJcbiIsImZ1bmN0aW9uIE1vdXNlKCl7XHJcbiAgdGhpcy5kcmFnZ2VkT2JqZWN0ID0gbnVsbDtcclxuICB0aGlzLmRyYWdPZmZzZXRYID0gMDtcclxuICB0aGlzLmRyYWdPZmZzZXRZID0gMDtcclxuXHJcbiAgdGhpcy5tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKHRoaXMuZHJhZ2dlZE9iamVjdCAhPT0gbnVsbCkge1xyXG4gICAgICB0aGlzLmRyYWdnZWRPYmplY3Quc3RvcERyYWcoZSk7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XHJcbiAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5kcmFnKGUpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxuICAvLyB0aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAvLyB0aGlzLm1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIC8vICAgY29uc29sZS5sb2coXCJtb3ZlXCIsIHRoaXMpXHJcbiAgLy9cclxuICAvLyAgIC8vIGlmICh0aGlzLnNlbGVjdGVkKSB7XHJcbiAgLy8gICAvLyAgIHRoaXMuc2VsZWN0ZWQuc3R5bGUubGVmdCA9IGV2ZW50Lm9mZnNldFggKyBcInB4XCI7XHJcbiAgLy8gICAvLyB9XHJcbiAgLy8gfVxyXG4gIC8vXHJcbiAgLy9cclxuICAvLyAvL3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIpO1xyXG4gIC8vXHJcbiAgLy8gcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlO1xyXG4iLCJmdW5jdGlvbiBSZXNpemVXaW5kb3dIZWlnaHQoYXBwV2luZG93KSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKTtcclxuICB0aGlzLnJlc2l6ZVRoaXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcbiAgY29uc29sZS5sb2codGhpcy5yZXNpemVUaGlzKVxyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cudGl0bGVCYXJIZWlnaHQgLSBldmVudC5wYWdlWTtcclxuICAvLyBUT0RPOiBmaXggZHJhZyBvZmZzZXRcclxufVxyXG5cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMucmVzaXplVGhpcy5zdHlsZS5oZWlnaHQgPSAoZS5wYWdlWSAtIHRoaXMuYXBwV2luZG93LnkgLSB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkpICsgXCJweFwiO1xyXG4gIC8vdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYICsgXCJweFwiO1xyXG4gIC8vdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFggKyBcInB4XCI7XHJcbiAgLy90aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gZS5wYWdlWSArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZICsgXCJweFwiO1xyXG59XHJcblxyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd0hlaWdodDtcclxuIiwiZnVuY3Rpb24gUmVzaXplV2luZG93V2lkdGgoYXBwV2luZG93KSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteFwiKTtcclxuICB0aGlzLnJlc2l6ZVRoaXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuYXBwV2luZG93LmlkKTtcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG5cclxuICAvL2RyYWcgZnJvbSBleGFjdGx5IHdoZXJlIHRoZSBjbGljayBpc1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0ICsgdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRMZWZ0IC0gZS5wYWdlWDtcclxufVxyXG5cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy5yZXNpemVUaGlzLnN0eWxlLndpZHRoID0gKGUucGFnZVggLSB0aGlzLmFwcFdpbmRvdy54ICsgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYKSArIFwicHhcIjtcclxufVxyXG5cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd1dpZHRoO1xyXG4iLCJmdW5jdGlvbiBSZXNpemVXaW5kb3dXaWR0aEhlaWdodChhcHBXaW5kb3cpIHtcclxuICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci14eVwiKTtcclxuICB0aGlzLnJlc2l6ZVRoaXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICAvLyB0aGlzIGVsZW1lbnQgaGFzIG5vIG9mZnNldFRvcCBzbyBpbnN0ZWFkIHdlIHVzZSB3aW5kb3ctcmVzaXplci1oZWlnaHQncyBvZmZzZXRUb3AgdmFsdWVcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LnRpdGxlQmFySGVpZ2h0IC0gZXZlbnQucGFnZVk7XHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldExlZnQgLSBlLnBhZ2VYO1xyXG4gIC8vIFRPRE86IGZpeCBkcmFnIG9mZnNldFxyXG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7IC8vdGhpcyBjbGljayBzaG91bGRudCBnbyB0aHJvdWdoIHRvIHRoZSBwYXJlbnQgd2hpY2ggaXMgdGhlIGhlaWdodC1yZXNpemVyXHJcblxyXG59XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLmFwcFdpbmRvdy5yZXNpemVXaW5kb3dIZWlnaHQuZHJhZyhlKTtcclxuICB0aGlzLmFwcFdpbmRvdy5yZXNpemVXaW5kb3dXaWR0aC5kcmFnKGUpO1xyXG4gIC8vdGhpcy5yZXNpemVUaGlzLnN0eWxlLmhlaWdodCA9IChlLnBhZ2VZIC0gdGhpcy5hcHBXaW5kb3cueSkgKyBcInB4XCI7XHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dXaWR0aEhlaWdodDtcclxuIiwiZnVuY3Rpb24gU2hvcnRjdXQoY29uZmlnLCBwd2QpIHtcclxuICB0aGlzLnRpdGxlID0gY29uZmlnLnRpdGxlO1xyXG4gIHRoaXMuZW50cnkgPSBjb25maWcuZW50cnk7XHJcbiAgdGhpcy5wd2QgPSBwd2Q7XHJcbiAgLy8gY3JlYXRlIGh0bWxcclxuICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3J0Y3V0XCIpO1xyXG4gIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgdGhpcy5lbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy50aXRsZTtcclxuICAvL2FkZCBldmVudCBsaXN0ZW5lclxyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnB3ZC5zdGFydEFwcCh0aGlzLmVudHJ5KTtcclxuICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNob3J0Y3V0O1xyXG4iLCJ2YXIgQXBwV2luZG93ID0gcmVxdWlyZShcIi4vQXBwV2luZG93XCIpO1xyXG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcclxudmFyIFNob3J0Y3V0ID0gcmVxdWlyZShcIi4vU2hvcnRjdXRcIik7XHJcbnZhciBhcHBMaXN0ID0gcmVxdWlyZShcIi4vYXBwTGlzdFwiKTtcclxuXHJcbnZhciBQd2QgPSBmdW5jdGlvbigpe1xyXG4gIHRoaXMubW91c2UgPSBuZXcgTW91c2UoKTtcclxuICB0aGlzLmluc3RhbGxlZEFwcHMgPSBbXTtcclxuICB0aGlzLnN0YXJ0ZWRBcHBzID0ge307XHJcbiAgdGhpcy5sYXN0WkluZGV4ID0gMTtcclxuICB0aGlzLmxhc3RJRCA9IDE7XHJcbiAgdGhpcy5uZXdYID0gMTA7XHJcbiAgdGhpcy5uZXdZID0gMTA7XHJcblxyXG4gIC8vIGNyZWF0ZXMgc2hvcnRjdXRzIGZvciBhbGwgYXZhaWxhYmxlIGFwcHNcclxuICB0aGlzLmluc3RhbGxBcHBzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBhcHAgaW4gYXBwTGlzdCkge1xyXG4gICAgICB0aGlzLmluc3RhbGxlZEFwcHMucHVzaChuZXcgU2hvcnRjdXQoYXBwTGlzdFthcHBdLCB0aGlzKSlcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBzdGFydCBhbiBhcHBcclxuICB0aGlzLnN0YXJ0QXBwID0gZnVuY3Rpb24oYXBwKSB7XHJcbiAgICB2YXIgbmV3QXBwID0gbmV3IGFwcCh7XHJcbiAgICAgIHB3ZDogdGhpcyxcclxuICAgICAgaWQ6IHRoaXMubGFzdElELFxyXG4gICAgICB4OiB0aGlzLm5ld1gsXHJcbiAgICAgIHk6IHRoaXMubmV3WSxcclxuICAgICAgekluZGV4OiB0aGlzLmxhc3RaSW5kZXgsXHJcbiAgICB9KTtcclxuICAgIHRoaXMuc3RhcnRlZEFwcHNbdGhpcy5sYXN0SURdID0gbmV3QXBwO1xyXG4gICAgdGhpcy5sYXN0WkluZGV4ICs9IDE7XHJcbiAgICB0aGlzLmxhc3RJRCArPSAxO1xyXG4gICAgdGhpcy5uZXdYICs9IDEwO1xyXG4gICAgdGhpcy5uZXdZICs9IDEwO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5jbG9zZUFwcCA9IGZ1bmN0aW9uKGFwcCkge1xyXG4gICAgY29uc29sZS5sb2coYXBwLCB0aGlzLnN0YXJ0ZWRBcHBzKVxyXG4gICAgdGhpcy5zdGFydGVkQXBwc1thcHAuaWRdLmNsb3NlKCk7XHJcbiAgICBkZWxldGUgdGhpcy5zdGFydGVkQXBwc1thcHAuaWRdO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5yZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMsIFwicmVzaXplXCIsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG5cclxuICAgIHRoaXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICB9XHJcbn1cclxuXHJcbnZhciBwd2QgPSBuZXcgUHdkKCk7XHJcbnB3ZC5pbnN0YWxsQXBwcygpOyAvLyBjcmVhdGUgc2hvcnRjdXRzIGZvciBhbGwgYXZhaWxhYmxlIGFwcHNcclxucHdkLnJlc2l6ZSgpOyAvLyBydW4gcmVzaXplIG9uY2UgdG8gc2V0IHdpZHRoIGFuZCBoZWlnaHRcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcHdkLnJlc2l6ZS5iaW5kKHB3ZCkpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBcIkNoYXRcIjoge1xyXG4gICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvY2hhdC9hcHBcIiksXHJcbiAgICB0aXRsZTogXCJDaGF0MlwiLFxyXG4gICAgd2lkdGg6IDQwMCxcclxuICAgIGhlaWdodDogMzAwXHJcbiAgfVxyXG59XHJcbiIsInZhciBBcHBXaW5kb3cgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvQXBwV2luZG93XCIpO1xyXG52YXIgY29uZmlnID0gcmVxdWlyZShcIi4vY29uZmlnLmpzb25cIik7XHJcblxyXG5mdW5jdGlvbiBDaGF0KGNvbmZpZykge1xyXG4gIHRoaXMudGl0bGUgPSBcIkNoYXRcIjtcclxuICB0aGlzLndpZHRoID0gNDAwO1xyXG4gIHRoaXMuaGVpZ2h0ID0gMzAwO1xyXG4gIHRoaXMuaWQgPSBjb25maWcuaWQ7XHJcbiAgY29uZmlnLndpZHRoID0gdGhpcy53aWR0aDtcclxuICBjb25maWcuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgY29uZmlnLnRpdGxlID0gdGhpcy50aXRsZTtcclxuICB0aGlzLmFwcFdpbmRvdyA9IG5ldyBBcHBXaW5kb3coY29uZmlnKTtcclxuICB0aGlzLnNvY2tldCA9IG51bGw7XHJcbiAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpO1xyXG4gIHRoaXMuY2hhdERpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XHJcbiAgdGhpcy5jb25uZWN0KCkudGhlbihmdW5jdGlvbihzb2NrZXQpIHtcclxuXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMuY2hhdERpdi5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIC8vIGxpc3RlbiBmb3IgZW50ZXIga2V5XHJcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgLy9zZW5kIGEgbWVzc2FnZVxyXG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XHJcbiAgICAgIC8vIGVtcHR5IHRleHRhcmVhXHJcbiAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH0uYmluZCh0aGlzKSk7XHJcblxyXG5cclxuICB0aGlzLmFwcFdpbmRvdy5jb250ZW50LmFwcGVuZENoaWxkKHRoaXMuY2hhdERpdik7XHJcblxyXG5cclxufVxyXG5cclxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG5cclxuICAgIGlmICh0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XHJcbiAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZGRyZXNzKTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldClcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJDb3VsZCBub3QgY29ubmVjdFwiKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcclxuICAgICAgICAgIHRoaXMucHJpbnRNZXNzYWdlKG1lc3NhZ2UpO1xyXG4gICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICB9LmJpbmQodGhpcykpO1xyXG5cclxuXHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICB2YXIgZGF0YSA9IHtcclxuICAgIHR5cGU6IFwibWVzc2FnZVwiLFxyXG4gICAgZGF0YTogdGV4dCxcclxuICAgIHVzZXJuYW1lOiBcIkRhbmllbFwiLFxyXG4gICAgY2hhbm5lbDogXCJcIixcclxuICAgIGtleTogY29uZmlnLmtleVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgdGhpcy5jb25uZWN0KCkudGhlbihmdW5jdGlvbihzb2NrZXQpe1xyXG4gICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZXJyb3IpO1xyXG4gIH0pO1xyXG5cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnByaW50TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcclxuICB2YXIgdGVtcGxhdGUgPSB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlXCIpWzBdO1xyXG5cclxuICB2YXIgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XHJcbiAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtdGV4dFwiKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuZGF0YTtcclxuICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1hdXRob3JcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xyXG5cclxuICB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbChcIi5jaGF0LW1lc3NhZ2VzXCIpWzBdLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikucmVtb3ZlQ2hpbGQodGhpcy5hcHBXaW5kb3cuZWxlbWVudCk7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XHJcbiIsIm1vZHVsZS5leHBvcnRzPXtcclxuICBcImFkZHJlc3NcIjogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxyXG4gIFwia2V5XCI6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxyXG59XHJcbiJdfQ==
