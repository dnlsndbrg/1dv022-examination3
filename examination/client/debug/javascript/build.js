(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./ResizeWindowHeight":4,"./ResizeWindowWidth":5,"./ResizeWindowWidthHeight":6}],2:[function(require,module,exports){
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
var AppWindow = require("./AppWindow");
var Taskbar = require("./Taskbar");

function PwdApp(config) {
  this.title = config.title;
  this.width = config.width;
  this.height = config.height;
  this.id = config.id;
  config.width = this.width;
  config.height = this.height;
  config.title = this.title;
  this.appWindow = new AppWindow(config);

  // add to taskbar
  this.taskbarApp = new Taskbar.TaskbarApp(config, this);
}

module.exports = PwdApp;

},{"./AppWindow":1,"./Taskbar":8}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
function Shortcut(config, pwd) {
  this.config = config;
  this.title = config.title;
  this.entry = config.entry;
  this.pwd = pwd;
  // create html
  var template = document.querySelector("#shortcut");
  var clone = document.importNode(template.content, true);
  document.querySelector("#pwd").appendChild(clone);
  this.element = document.querySelector("#pwd").lastElementChild;
  // add icon and text
  this.element.firstElementChild.classList.add(config.icon);
  this.element.lastElementChild.textContent = this.title;
  //add event listener
  this.element.addEventListener("click", function() {
    this.pwd.startApp(this.config);
  }.bind(this));
}

module.exports = Shortcut;

},{}],8:[function(require,module,exports){
function Taskbar() {
  // create html
  var template = document.querySelector("#taskbar");
  var clone = document.importNode(template.content, true);
  document.querySelector("#pwd").appendChild(clone);
  this.element = document.querySelector("#pwd").lastElementChild;
}

function TaskbarApp(config, app) {
  this.app = app;

  //create html
  var template = document.querySelector("#taskbarApp");
  var clone = document.importNode(template.content, true);
  document.querySelector("#pwd .taskbar").appendChild(clone);
  this.element = document.querySelector("#pwd .taskbar").lastElementChild;

  // set taskbar icon and text
  this.element.children[0].classList.add(config.icon);
  this.element.children[1].textContent = config.title;

  this.element.addEventListener("click", function(e) {
    this.appWindow.moveToTop();
  }.bind(this.app));

  this.click = function(e) {

  }
}

module.exports.TaskbarApp = TaskbarApp;
module.exports.Taskbar = Taskbar;

},{}],9:[function(require,module,exports){
var AppWindow = require("./AppWindow");
var Mouse = require("./Mouse");
var Shortcut = require("./Shortcut");
var appList = require("./appList");
var Taskbar = require("./Taskbar");

var Pwd = function(){
  this.mouse = new Mouse();
  this.taskbar = new Taskbar.Taskbar();
  this.installedApps = [];
  this.startedApps = {};
  this.lastZIndex = 1;
  this.lastID = 1;
  this.newX = 10;
  this.newY = 10;
  this.fullscreenedWindow = null;

  // creates shortcuts for all available apps
  this.installApps = function() {
    for (var app in appList) {
      this.installedApps.push(new Shortcut(appList[app], this))
    };
  }

  // start an app
  this.startApp = function(config) {
    var newApp = new config.entry({
      title: config.title,
      width: config.width,
      height: config.height,
      icon: config.icon,
      pwd: this,
      id: this.lastID,
      x: this.newX,
      y: this.newY,
      zIndex: this.lastZIndex,
    });
    this.startedApps[this.lastID] = newApp;
    this.lastZIndex += 1;
    this.lastID += 1;
    this.newX += 20;
    this.newY += 20;
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

    this.newX = this.width / 2 - 250;
    this.newY = this.height / 3 - 200;

    if (this.fullscreenedWindow)
      this.fullscreenedWindow.maximize();
  }
}

var pwd = new Pwd();
pwd.installApps(); // create shortcuts for all available apps
pwd.resize(); // run resize once to set width and height
window.addEventListener("resize", pwd.resize.bind(pwd));

},{"./AppWindow":1,"./Mouse":2,"./Shortcut":7,"./Taskbar":8,"./appList":10}],10:[function(require,module,exports){
module.exports = {
  "Chat": {
    entry: require("./apps/chat/app"),
    title: "Chat",
    width: 500,
    height: 400,
    icon: "fa-commenting"
  },
    "Memory": {
    entry: require("./apps/memory/app"),
    title: "Memory",
    width: 500,
    height: 400,
    icon: "fa-clone"
  }
}

},{"./apps/chat/app":11,"./apps/memory/app":13}],11:[function(require,module,exports){
var PwdApp = require("../../../js/PwdApp");
//var AppWindow = require("../../../js/AppWindow");
//var Taskbar = require("../../../js/Taskbar");
var config = require("./config.json");

function Chat(config) {
  PwdApp.call(this, config);
  // this.title = config.title;
  // this.width = config.width;
  // this.height = config.height;
  // this.id = config.id;
  // config.width = this.width;
  // config.height = this.height;
  // config.title = this.title;
  // this.appWindow = new AppWindow(config);
  //
  // // add to taskbar
  // this.taskbarApp = new Taskbar.TaskbarApp(config, this);

  // chat stuff
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

Chat.prototype = Object.create(PwdApp.prototype);
Chat.prototype.constructor = Chat;


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

  // remove from taskbar
  document.querySelector("#pwd .taskbar").removeChild(this.taskbarApp.element);

}

module.exports = Chat;

},{"../../../js/PwdApp":3,"./config.json":12}],12:[function(require,module,exports){
module.exports={
  "address": "ws://vhost3.lnu.se:20080/socket/",
  "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}],13:[function(require,module,exports){
var PwdApp = require("../../../js/PwdApp");

function Memory(config) {
    PwdApp.call(this, config);
}

Memory.prototype = Object.create(PwdApp.prototype);
Memory.prototype.constructor = Memory;
Memory.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);

    // remove from taskbar
    document.querySelector("#pwd .taskbar").removeChild(this.taskbarApp.element);
};

module.exports = Memory;

},{"../../../js/PwdApp":3}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHdkQXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Jlc2l6ZVdpbmRvd1dpZHRoLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5qcyIsImNsaWVudC9zb3VyY2UvanMvU2hvcnRjdXQuanMiLCJjbGllbnQvc291cmNlL2pzL1Rhc2tiYXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwTGlzdC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9jaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9jaGF0L2NvbmZpZy5qc29uIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZXNpemVXaW5kb3dXaWR0aCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd1dpZHRoXCIpO1xyXG52YXIgUmVzaXplV2luZG93SGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93SGVpZ2h0XCIpO1xyXG52YXIgUmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aEhlaWdodFwiKTtcclxuXHJcbmZ1bmN0aW9uIEFwcFdpbmRvdyhjb25maWcpIHtcclxuICBjb25zb2xlLmxvZyhcIkNPTkZJR1wiLCBjb25maWcpO1xyXG4gIHRoaXMuaWQgPSBjb25maWcuaWQ7XHJcbiAgdGhpcy5wd2QgPSBjb25maWcucHdkO1xyXG4gIHRoaXMuZWxlbWVudDtcclxuICB0aGlzLmVsZW1lbnRXcmFwcGVyO1xyXG4gIHRoaXMud2lkdGggPSBjb25maWcud2lkdGg7XHJcbiAgdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0O1xyXG4gIHRoaXMueCA9IGNvbmZpZy54O1xyXG4gIHRoaXMueSA9IGNvbmZpZy55O1xyXG4gIHRoaXMuaW5pdChjb25maWcpO1xyXG4gIHRoaXMudGl0bGVCYXJIZWlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5zY3JvbGxIZWlnaHQ7IC8vIHVzZWQgZm9yIGRyYWcgcmV6aXNpbmdcclxuICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoKHRoaXMpO1xyXG4gIHRoaXMucmVzaXplV2luZG93SGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd0hlaWdodCh0aGlzKTtcclxuICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0KHRoaXMpO1xyXG4gIHRoaXMuY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKTtcclxuICAvLyBwdXQgb24gdG9wIGlmIGNsaWNrZWRcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdmVUb1RvcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAvLyBkcmFnIHRoZSB3aW5kb3cgZnJvbSB0aGUgd2luZG93IGJhclxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbiAgLy8gY2xvc2UgZXZlbnRcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2xvc2Utd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsb3NlLmJpbmQodGhpcykpO1xyXG4gIC8vIG1heGltaXplIGV2ZW50XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1heGltaXplLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tYXhpbWl6ZS5iaW5kKHRoaXMpKTtcclxuICAvLyByZXN0b3JlIGV2ZW50XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnJlc3RvcmUuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gIC8vIGNyZWF0ZSBodG1sXHJcbiAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FwcFdpbmRvd1wiKS5jb250ZW50LCB0cnVlKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gIC8vIGRlZmluZSB0aGlzLmVsZW1lbnRcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG5cclxuICAvLyBzZXQgaWRcclxuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJ3aW5kb3ctXCIgKyB0aGlzLmlkKTtcclxuXHJcbiAgLy8gZGVmaW5lIHRoaXMud3JhcHBlckVsZW1lbnRcclxuICB0aGlzLndyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcblxyXG4gIC8vIHNldCB3aW5kb3cgYmFyIGljb25cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuZmFcIikuY2xhc3NMaXN0LmFkZChjb25maWcuaWNvbik7XHJcblxyXG4gIC8vIHNldCB3aW5kb3cgYmFyIHRpdGxlXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXItdGl0bGVcIikudGV4dENvbnRlbnQgPSBjb25maWcudGl0bGU7XHJcblxyXG4gIC8vIHNldCBwb3NpdGlvbiBhbmQgc2l6ZVxyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gY29uZmlnLnggKyBcInB4XCI7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IGNvbmZpZy55ICsgXCJweFwiO1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS56SW5kZXggPSBjb25maWcuekluZGV4O1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IGNvbmZpZy53aWR0aCArIFwicHhcIjtcclxuICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQgICsgXCJweFwiO1xyXG5cclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIHRoaXMucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxuICB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5vZmZzZXRUb3AgLSBldmVudC5wYWdlWTtcclxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyYWdnaW5nXCIpO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy54ID0gZS5wYWdlWCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gIHRoaXMueSA9IGUucGFnZVkgKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICB0aGlzLmNoZWNrQm91bmRzKGUpO1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gIHRoaXMueCArIFwicHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLmNoZWNrQm91bmRzID0gZnVuY3Rpb24oZSl7XHJcbiAgY29uc29sZS5sb2codGhpcy5wd2Qud2lkdGgsIHRoaXMucHdkLmhlaWdodCk7XHJcbiAgaWYgKGUucGFnZVggPiB0aGlzLnB3ZC53aWR0aClcclxuICAgIHRoaXMueCA9IHRoaXMucHdkLndpZHRoICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFg7XHJcbiAgaWYgKGUucGFnZVkgPiB0aGlzLnB3ZC5oZWlnaHQpXHJcbiAgICB0aGlzLnkgPSB0aGlzLnB3ZC5oZWlnaHQgKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICBlbHNlIGlmIChlLnBhZ2VZIDwgMSlcclxuICAgIHRoaXMueSA9IHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZO1xyXG5cclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dpbmdcIik7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUubW92ZVRvVG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5wd2QubGFzdFpJbmRleCArPSAxO1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLnB3ZC5sYXN0WkluZGV4O1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICB0aGlzLnB3ZC5jbG9zZUFwcCh0aGlzKTtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vIHNhdmUgdGhlIHNpemUgYW5kIHBvc2l0aW9uIHNvIHdlIGNhbiByZXR1cm4gdG8gaXQgd2l0aCB0aGUgcmVzdG9yZSB3aW5kb3cgZnVuY3Rpb25cclxuICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gIHRoaXMubGFzdFkgPSB0aGlzLnk7XHJcbiAgdGhpcy5sYXN0V2lkdGggPSB0aGlzLndpZHRoO1xyXG4gIHRoaXMubGFzdEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAvLyB0ZWxsIHB3ZCB0aGlzIHdpbmRvdyBpcyBpbiBmdWxsc2NyZWVuIChpbiBjYXNlIG9mIGJyb3dzZXIgcmVzaXppbmcpXHJcbiAgdGhpcy5wd2QuZnVsbHNjcmVlbmVkV2luZG93ID0gdGhpcztcclxuXHJcbiAgLy8gbWFrZSB0aGUgd2luZG93IGZ1bGxzY3JlZW5cclxuICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IFwiMHB4XCI7XHJcbiAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5wd2Qud2lkdGggKyBcInB4XCI7XHJcbiAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLnB3ZC5oZWlnaHQgKyBcInB4XCI7XHJcblxyXG4gIC8vIGhpZGUvc2hvdyB0aGUgbWF4aW1pemUgYW5kIHJlc3RvcmUgd2luZG93YmFyIGJ1dHRvbnNcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy5sYXN0WCArIFwicHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5sYXN0WSArIFwicHhcIjtcclxuICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLmxhc3RXaWR0aCArIFwicHhcIjtcclxuICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMubGFzdEhlaWdodCArIFwicHhcIjtcclxuXHJcbiAgLy90ZWxsIHB3ZCB0aGlzIHdpbmRvdyBpcyBubyBsb25nZXIgaW4gZnVsbHNjcmVlbiAoaW4gY2FzZSBvZiBicm93c2VyIHJlc2l6aW5nKVxyXG4gIHRoaXMucHdkLmZ1bGxzY3JlZW5lZFdpbmRvdyA9IG51bGw7XHJcblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcHBXaW5kb3c7XHJcbiIsImZ1bmN0aW9uIE1vdXNlKCl7XHJcbiAgdGhpcy5kcmFnZ2VkT2JqZWN0ID0gbnVsbDtcclxuICB0aGlzLmRyYWdPZmZzZXRYID0gMDtcclxuICB0aGlzLmRyYWdPZmZzZXRZID0gMDtcclxuXHJcbiAgdGhpcy5tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKHRoaXMuZHJhZ2dlZE9iamVjdCAhPT0gbnVsbCkge1xyXG4gICAgICB0aGlzLmRyYWdnZWRPYmplY3Quc3RvcERyYWcoZSk7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XHJcbiAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5kcmFnKGUpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxuICAvLyB0aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAvLyB0aGlzLm1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIC8vICAgY29uc29sZS5sb2coXCJtb3ZlXCIsIHRoaXMpXHJcbiAgLy9cclxuICAvLyAgIC8vIGlmICh0aGlzLnNlbGVjdGVkKSB7XHJcbiAgLy8gICAvLyAgIHRoaXMuc2VsZWN0ZWQuc3R5bGUubGVmdCA9IGV2ZW50Lm9mZnNldFggKyBcInB4XCI7XHJcbiAgLy8gICAvLyB9XHJcbiAgLy8gfVxyXG4gIC8vXHJcbiAgLy9cclxuICAvLyAvL3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIpO1xyXG4gIC8vXHJcbiAgLy8gcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlO1xyXG4iLCJ2YXIgQXBwV2luZG93ID0gcmVxdWlyZShcIi4vQXBwV2luZG93XCIpO1xyXG52YXIgVGFza2JhciA9IHJlcXVpcmUoXCIuL1Rhc2tiYXJcIik7XHJcblxyXG5mdW5jdGlvbiBQd2RBcHAoY29uZmlnKSB7XHJcbiAgdGhpcy50aXRsZSA9IGNvbmZpZy50aXRsZTtcclxuICB0aGlzLndpZHRoID0gY29uZmlnLndpZHRoO1xyXG4gIHRoaXMuaGVpZ2h0ID0gY29uZmlnLmhlaWdodDtcclxuICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gIGNvbmZpZy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgY29uZmlnLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gIGNvbmZpZy50aXRsZSA9IHRoaXMudGl0bGU7XHJcbiAgdGhpcy5hcHBXaW5kb3cgPSBuZXcgQXBwV2luZG93KGNvbmZpZyk7XHJcblxyXG4gIC8vIGFkZCB0byB0YXNrYmFyXHJcbiAgdGhpcy50YXNrYmFyQXBwID0gbmV3IFRhc2tiYXIuVGFza2JhckFwcChjb25maWcsIHRoaXMpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFB3ZEFwcDtcclxuIiwiZnVuY3Rpb24gUmVzaXplV2luZG93SGVpZ2h0KGFwcFdpbmRvdykge1xyXG4gIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIik7XHJcbiAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG4gIGNvbnNvbGUubG9nKHRoaXMucmVzaXplVGhpcylcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LnRpdGxlQmFySGVpZ2h0IC0gZXZlbnQucGFnZVk7XHJcbiAgLy8gVE9ETzogZml4IGRyYWcgb2Zmc2V0XHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLnJlc2l6ZVRoaXMuc3R5bGUuaGVpZ2h0ID0gKGUucGFnZVkgLSB0aGlzLmFwcFdpbmRvdy55IC0gdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZKSArIFwicHhcIjtcclxuICAvL3RoaXMuYXBwV2luZG93LmVsZW1lbnQuc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCArIFwicHhcIjtcclxuICAvL3RoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYICsgXCJweFwiO1xyXG4gIC8vdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IGUucGFnZVkgKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSArIFwicHhcIjtcclxufVxyXG5cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dIZWlnaHQ7XHJcbiIsImZ1bmN0aW9uIFJlc2l6ZVdpbmRvd1dpZHRoKGFwcFdpbmRvdykge1xyXG4gIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXhcIik7XHJcbiAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCk7XHJcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuXHJcbiAgLy9kcmFnIGZyb20gZXhhY3RseSB3aGVyZSB0aGUgY2xpY2sgaXNcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0TGVmdCAtIGUucGFnZVg7XHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMucmVzaXplVGhpcy5zdHlsZS53aWR0aCA9IChlLnBhZ2VYIC0gdGhpcy5hcHBXaW5kb3cueCArIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCkgKyBcInB4XCI7XHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dXaWR0aDtcclxuIiwiZnVuY3Rpb24gUmVzaXplV2luZG93V2lkdGhIZWlnaHQoYXBwV2luZG93KSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteHlcIik7XHJcbiAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcbiAgLy8gdGhpcyBlbGVtZW50IGhhcyBubyBvZmZzZXRUb3Agc28gaW5zdGVhZCB3ZSB1c2Ugd2luZG93LXJlc2l6ZXItaGVpZ2h0J3Mgb2Zmc2V0VG9wIHZhbHVlXHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy50aXRsZUJhckhlaWdodCAtIGV2ZW50LnBhZ2VZO1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0ICsgdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRMZWZ0IC0gZS5wYWdlWDtcclxuICAvLyBUT0RPOiBmaXggZHJhZyBvZmZzZXRcclxuICBlLnN0b3BQcm9wYWdhdGlvbigpOyAvL3RoaXMgY2xpY2sgc2hvdWxkbnQgZ28gdGhyb3VnaCB0byB0aGUgcGFyZW50IHdoaWNoIGlzIHRoZSBoZWlnaHQtcmVzaXplclxyXG5cclxufVxyXG5cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cucmVzaXplV2luZG93SGVpZ2h0LmRyYWcoZSk7XHJcbiAgdGhpcy5hcHBXaW5kb3cucmVzaXplV2luZG93V2lkdGguZHJhZyhlKTtcclxuICAvL3RoaXMucmVzaXplVGhpcy5zdHlsZS5oZWlnaHQgPSAoZS5wYWdlWSAtIHRoaXMuYXBwV2luZG93LnkpICsgXCJweFwiO1xyXG59XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGhIZWlnaHQ7XHJcbiIsImZ1bmN0aW9uIFNob3J0Y3V0KGNvbmZpZywgcHdkKSB7XHJcbiAgdGhpcy5jb25maWcgPSBjb25maWc7XHJcbiAgdGhpcy50aXRsZSA9IGNvbmZpZy50aXRsZTtcclxuICB0aGlzLmVudHJ5ID0gY29uZmlnLmVudHJ5O1xyXG4gIHRoaXMucHdkID0gcHdkO1xyXG4gIC8vIGNyZWF0ZSBodG1sXHJcbiAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzaG9ydGN1dFwiKTtcclxuICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG4gIC8vIGFkZCBpY29uIGFuZCB0ZXh0XHJcbiAgdGhpcy5lbGVtZW50LmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQoY29uZmlnLmljb24pO1xyXG4gIHRoaXMuZWxlbWVudC5sYXN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gdGhpcy50aXRsZTtcclxuICAvL2FkZCBldmVudCBsaXN0ZW5lclxyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnB3ZC5zdGFydEFwcCh0aGlzLmNvbmZpZyk7XHJcbiAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGN1dDtcclxuIiwiZnVuY3Rpb24gVGFza2JhcigpIHtcclxuICAvLyBjcmVhdGUgaHRtbFxyXG4gIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGFza2JhclwiKTtcclxuICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBUYXNrYmFyQXBwKGNvbmZpZywgYXBwKSB7XHJcbiAgdGhpcy5hcHAgPSBhcHA7XHJcblxyXG4gIC8vY3JlYXRlIGh0bWxcclxuICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Rhc2tiYXJBcHBcIik7XHJcbiAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZCAudGFza2JhclwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2QgLnRhc2tiYXJcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuXHJcbiAgLy8gc2V0IHRhc2tiYXIgaWNvbiBhbmQgdGV4dFxyXG4gIHRoaXMuZWxlbWVudC5jaGlsZHJlblswXS5jbGFzc0xpc3QuYWRkKGNvbmZpZy5pY29uKTtcclxuICB0aGlzLmVsZW1lbnQuY2hpbGRyZW5bMV0udGV4dENvbnRlbnQgPSBjb25maWcudGl0bGU7XHJcblxyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cubW92ZVRvVG9wKCk7XHJcbiAgfS5iaW5kKHRoaXMuYXBwKSk7XHJcblxyXG4gIHRoaXMuY2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcblxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuVGFza2JhckFwcCA9IFRhc2tiYXJBcHA7XHJcbm1vZHVsZS5leHBvcnRzLlRhc2tiYXIgPSBUYXNrYmFyO1xyXG4iLCJ2YXIgQXBwV2luZG93ID0gcmVxdWlyZShcIi4vQXBwV2luZG93XCIpO1xyXG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcclxudmFyIFNob3J0Y3V0ID0gcmVxdWlyZShcIi4vU2hvcnRjdXRcIik7XHJcbnZhciBhcHBMaXN0ID0gcmVxdWlyZShcIi4vYXBwTGlzdFwiKTtcclxudmFyIFRhc2tiYXIgPSByZXF1aXJlKFwiLi9UYXNrYmFyXCIpO1xyXG5cclxudmFyIFB3ZCA9IGZ1bmN0aW9uKCl7XHJcbiAgdGhpcy5tb3VzZSA9IG5ldyBNb3VzZSgpO1xyXG4gIHRoaXMudGFza2JhciA9IG5ldyBUYXNrYmFyLlRhc2tiYXIoKTtcclxuICB0aGlzLmluc3RhbGxlZEFwcHMgPSBbXTtcclxuICB0aGlzLnN0YXJ0ZWRBcHBzID0ge307XHJcbiAgdGhpcy5sYXN0WkluZGV4ID0gMTtcclxuICB0aGlzLmxhc3RJRCA9IDE7XHJcbiAgdGhpcy5uZXdYID0gMTA7XHJcbiAgdGhpcy5uZXdZID0gMTA7XHJcbiAgdGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cgPSBudWxsO1xyXG5cclxuICAvLyBjcmVhdGVzIHNob3J0Y3V0cyBmb3IgYWxsIGF2YWlsYWJsZSBhcHBzXHJcbiAgdGhpcy5pbnN0YWxsQXBwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgYXBwIGluIGFwcExpc3QpIHtcclxuICAgICAgdGhpcy5pbnN0YWxsZWRBcHBzLnB1c2gobmV3IFNob3J0Y3V0KGFwcExpc3RbYXBwXSwgdGhpcykpXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gc3RhcnQgYW4gYXBwXHJcbiAgdGhpcy5zdGFydEFwcCA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gICAgdmFyIG5ld0FwcCA9IG5ldyBjb25maWcuZW50cnkoe1xyXG4gICAgICB0aXRsZTogY29uZmlnLnRpdGxlLFxyXG4gICAgICB3aWR0aDogY29uZmlnLndpZHRoLFxyXG4gICAgICBoZWlnaHQ6IGNvbmZpZy5oZWlnaHQsXHJcbiAgICAgIGljb246IGNvbmZpZy5pY29uLFxyXG4gICAgICBwd2Q6IHRoaXMsXHJcbiAgICAgIGlkOiB0aGlzLmxhc3RJRCxcclxuICAgICAgeDogdGhpcy5uZXdYLFxyXG4gICAgICB5OiB0aGlzLm5ld1ksXHJcbiAgICAgIHpJbmRleDogdGhpcy5sYXN0WkluZGV4LFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnN0YXJ0ZWRBcHBzW3RoaXMubGFzdElEXSA9IG5ld0FwcDtcclxuICAgIHRoaXMubGFzdFpJbmRleCArPSAxO1xyXG4gICAgdGhpcy5sYXN0SUQgKz0gMTtcclxuICAgIHRoaXMubmV3WCArPSAyMDtcclxuICAgIHRoaXMubmV3WSArPSAyMDtcclxuICB9XHJcblxyXG4gIHRoaXMuY2xvc2VBcHAgPSBmdW5jdGlvbihhcHApIHtcclxuICAgIGNvbnNvbGUubG9nKGFwcCwgdGhpcy5zdGFydGVkQXBwcylcclxuICAgIHRoaXMuc3RhcnRlZEFwcHNbYXBwLmlkXS5jbG9zZSgpO1xyXG4gICAgZGVsZXRlIHRoaXMuc3RhcnRlZEFwcHNbYXBwLmlkXTtcclxuICB9XHJcblxyXG4gIHRoaXMucmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLCBcInJlc2l6ZVwiLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuXHJcbiAgICB0aGlzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICB0aGlzLm5ld1ggPSB0aGlzLndpZHRoIC8gMiAtIDI1MDtcclxuICAgIHRoaXMubmV3WSA9IHRoaXMuaGVpZ2h0IC8gMyAtIDIwMDtcclxuXHJcbiAgICBpZiAodGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cpXHJcbiAgICAgIHRoaXMuZnVsbHNjcmVlbmVkV2luZG93Lm1heGltaXplKCk7XHJcbiAgfVxyXG59XHJcblxyXG52YXIgcHdkID0gbmV3IFB3ZCgpO1xyXG5wd2QuaW5zdGFsbEFwcHMoKTsgLy8gY3JlYXRlIHNob3J0Y3V0cyBmb3IgYWxsIGF2YWlsYWJsZSBhcHBzXHJcbnB3ZC5yZXNpemUoKTsgLy8gcnVuIHJlc2l6ZSBvbmNlIHRvIHNldCB3aWR0aCBhbmQgaGVpZ2h0XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHB3ZC5yZXNpemUuYmluZChwd2QpKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgXCJDaGF0XCI6IHtcclxuICAgIGVudHJ5OiByZXF1aXJlKFwiLi9hcHBzL2NoYXQvYXBwXCIpLFxyXG4gICAgdGl0bGU6IFwiQ2hhdFwiLFxyXG4gICAgd2lkdGg6IDUwMCxcclxuICAgIGhlaWdodDogNDAwLFxyXG4gICAgaWNvbjogXCJmYS1jb21tZW50aW5nXCJcclxuICB9LFxyXG4gICAgXCJNZW1vcnlcIjoge1xyXG4gICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvbWVtb3J5L2FwcFwiKSxcclxuICAgIHRpdGxlOiBcIk1lbW9yeVwiLFxyXG4gICAgd2lkdGg6IDUwMCxcclxuICAgIGhlaWdodDogNDAwLFxyXG4gICAgaWNvbjogXCJmYS1jbG9uZVwiXHJcbiAgfVxyXG59XHJcbiIsInZhciBQd2RBcHAgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvUHdkQXBwXCIpO1xyXG4vL3ZhciBBcHBXaW5kb3cgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvQXBwV2luZG93XCIpO1xyXG4vL3ZhciBUYXNrYmFyID0gcmVxdWlyZShcIi4uLy4uLy4uL2pzL1Rhc2tiYXJcIik7XHJcbnZhciBjb25maWcgPSByZXF1aXJlKFwiLi9jb25maWcuanNvblwiKTtcclxuXHJcbmZ1bmN0aW9uIENoYXQoY29uZmlnKSB7XHJcbiAgUHdkQXBwLmNhbGwodGhpcywgY29uZmlnKTtcclxuICAvLyB0aGlzLnRpdGxlID0gY29uZmlnLnRpdGxlO1xyXG4gIC8vIHRoaXMud2lkdGggPSBjb25maWcud2lkdGg7XHJcbiAgLy8gdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0O1xyXG4gIC8vIHRoaXMuaWQgPSBjb25maWcuaWQ7XHJcbiAgLy8gY29uZmlnLndpZHRoID0gdGhpcy53aWR0aDtcclxuICAvLyBjb25maWcuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgLy8gY29uZmlnLnRpdGxlID0gdGhpcy50aXRsZTtcclxuICAvLyB0aGlzLmFwcFdpbmRvdyA9IG5ldyBBcHBXaW5kb3coY29uZmlnKTtcclxuICAvL1xyXG4gIC8vIC8vIGFkZCB0byB0YXNrYmFyXHJcbiAgLy8gdGhpcy50YXNrYmFyQXBwID0gbmV3IFRhc2tiYXIuVGFza2JhckFwcChjb25maWcsIHRoaXMpO1xyXG5cclxuICAvLyBjaGF0IHN0dWZmXHJcbiAgdGhpcy5zb2NrZXQgPSBudWxsO1xyXG4gIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFwiKTtcclxuICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xyXG4gIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7XHJcblxyXG4gIH0pO1xyXG5cclxuXHJcbiAgdGhpcy5jaGF0RGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgLy8gbGlzdGVuIGZvciBlbnRlciBrZXlcclxuICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAvL3NlbmQgYSBtZXNzYWdlXHJcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgLy8gZW1wdHkgdGV4dGFyZWFcclxuICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcclxuXHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfS5iaW5kKHRoaXMpKTtcclxuXHJcblxyXG4gIHRoaXMuYXBwV2luZG93LmNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5jaGF0RGl2KTtcclxufVxyXG5cclxuQ2hhdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFB3ZEFwcC5wcm90b3R5cGUpO1xyXG5DaGF0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENoYXQ7XHJcblxyXG5cclxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG5cclxuICAgIGlmICh0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XHJcbiAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZGRyZXNzKTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldClcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJDb3VsZCBub3QgY29ubmVjdFwiKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcclxuICAgICAgICAgIHRoaXMucHJpbnRNZXNzYWdlKG1lc3NhZ2UpO1xyXG4gICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICB9LmJpbmQodGhpcykpO1xyXG5cclxuXHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICB2YXIgZGF0YSA9IHtcclxuICAgIHR5cGU6IFwibWVzc2FnZVwiLFxyXG4gICAgZGF0YTogdGV4dCxcclxuICAgIHVzZXJuYW1lOiBcIkRhbmllbFwiLFxyXG4gICAgY2hhbm5lbDogXCJcIixcclxuICAgIGtleTogY29uZmlnLmtleVxyXG4gIH1cclxuXHJcbiAgdGhpcy5jb25uZWN0KCkudGhlbihmdW5jdGlvbihzb2NrZXQpe1xyXG4gICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZXJyb3IpO1xyXG4gIH0pO1xyXG5cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnByaW50TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcclxuICB2YXIgdGVtcGxhdGUgPSB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlXCIpWzBdO1xyXG5cclxuICB2YXIgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XHJcbiAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtdGV4dFwiKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuZGF0YTtcclxuICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1hdXRob3JcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xyXG5cclxuICB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbChcIi5jaGF0LW1lc3NhZ2VzXCIpWzBdLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikucmVtb3ZlQ2hpbGQodGhpcy5hcHBXaW5kb3cuZWxlbWVudCk7XHJcblxyXG4gIC8vIHJlbW92ZSBmcm9tIHRhc2tiYXJcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZCAudGFza2JhclwiKS5yZW1vdmVDaGlsZCh0aGlzLnRhc2tiYXJBcHAuZWxlbWVudCk7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XHJcbiIsIm1vZHVsZS5leHBvcnRzPXtcclxuICBcImFkZHJlc3NcIjogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxyXG4gIFwia2V5XCI6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxyXG59XHJcbiIsInZhciBQd2RBcHAgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvUHdkQXBwXCIpO1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5KGNvbmZpZykge1xyXG4gICAgUHdkQXBwLmNhbGwodGhpcywgY29uZmlnKTtcclxufVxyXG5cclxuTWVtb3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHdkQXBwLnByb3RvdHlwZSk7XHJcbk1lbW9yeS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1vcnk7XHJcbk1lbW9yeS5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHJlbW92ZSB0aGUgZ3JhcGhpY3NcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLnJlbW92ZUNoaWxkKHRoaXMuYXBwV2luZG93LmVsZW1lbnQpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIHRhc2tiYXJcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkIC50YXNrYmFyXCIpLnJlbW92ZUNoaWxkKHRoaXMudGFza2JhckFwcC5lbGVtZW50KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5O1xyXG4iXX0=
