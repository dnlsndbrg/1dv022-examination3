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
    this.minimized = false;
    this.maximized = false;

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
    this.titleBarHeight = document.querySelector("#window-" + this.id + " .window-bar").scrollHeight; // used for drag rezising
    this.resizeWindowWidth = new ResizeWindowWidth(this);
    this.resizeWindowHeight = new ResizeWindowHeight(this);
    this.resizeWindowWidthHeight = new ResizeWindowWidthHeight(this);
    this.content = document.querySelector("#window-" + this.id + " .window-content");

    // put on top if clicked
    this.element.addEventListener("mousedown", this.moveToTop.bind(this), true);

    // drag the window from the window bar
    document.querySelector("#window-" + this.id + " .window-bar").addEventListener("mousedown", this.startDrag.bind(this));

    // double click window bar
    document.querySelector("#window-" + this.id + " .window-bar").addEventListener("dblclick", this.dblclick.bind(this));

    // close event
    document.querySelector("#window-" + this.id + " .close-window").addEventListener("click", this.close.bind(this));

    // maximize event
    document.querySelector("#window-" + this.id + " .maximize-window").addEventListener("click", this.maximize.bind(this));

    // restore event
    document.querySelector("#window-" + this.id + " .restore-window").addEventListener("click", this.restore.bind(this));

    // minimize
    document.querySelector("#window-" + this.id + " .minimize-window").addEventListener("click", this.minimize.bind(this));
}

AppWindow.prototype.startDrag = function(event) {
    this.pwd.mouse.draggedObject = this;
    this.pwd.mouse.dragOffsetX = this.element.offsetLeft - event.pageX;
    this.pwd.mouse.dragOffsetY = this.element.offsetTop - event.pageY;
    this.element.classList.add("dragging");
};

AppWindow.prototype.drag = function(e) {
    this.x = e.pageX + this.pwd.mouse.dragOffsetX;
    this.y = e.pageY + this.pwd.mouse.dragOffsetY;
    this.checkBounds(e);
    this.element.style.left =  this.x + "px";
    this.element.style.top = this.y + "px";
};

AppWindow.prototype.checkBounds = function(e){
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
    this.animate();
    this.element.style.opacity = 0;
    this.element.style.top = this.y + 20 + "px";
    this.element.style.width = this.width - 100 + "px";
    this.element.style.left = this.x + 50 + "px";
    setTimeout(function() {
        this.pwd.closeApp(this);
    }.bind(this), 100);
};

AppWindow.prototype.maximize = function() {
    this.maximized = true;
    this.animate();

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
    var height = this.pwd.height - document.querySelector("#window-" + this.id + " .window-bar").getBoundingClientRect().height;
    this.wrapperElement.style.height = height + "px";
    this.x = 0;
    this.y = 0;

    // hide/show the maximize and restore windowbar buttons
    document.querySelector("#window-" + this.id + " .maximize-window").classList.add("hidden");
    document.querySelector("#window-" + this.id + " .restore-window").classList.remove("hidden");

    // if it is maximized from a minimized state
    this.wrapperElement.classList.remove("hidden");
    document.querySelector("#window-" + this.id + " .window-resizer-y").classList.remove("hidden");
    this.minimized = false;
};

AppWindow.prototype.restore = function() {
    this.maximized = false;
    this.animate();
    this.x = this.lastX;
    this.y = this.lastY;
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    this.element.style.width = this.lastWidth + "px";
    this.wrapperElement.style.height = this.lastHeight + "px";

    //tell pwd this window is no longer in fullscreen (in case of browser resizing)
    this.pwd.fullscreenedWindow = null;

    document.querySelector("#window-" + this.id + " .maximize-window").classList.remove("hidden");
    document.querySelector("#window-" + this.id + " .restore-window").classList.add("hidden");

    // if it is restored from a minimized state
    this.wrapperElement.classList.remove("hidden");
    document.querySelector("#window-" + this.id + " .window-resizer-y").classList.remove("hidden");
    this.minimized = false;
};

AppWindow.prototype.minimize = function() {
    this.maximized = false;

    if (!this.minimized) {
        this.animate();
        this.lastX = this.x;
        this.lastY = this.y;
        this.lastWidth = this.width;
        document.querySelector("#window-" + this.id + " .window-resizer-y").classList.add("hidden");
        this.wrapperElement.classList.add("hidden");
        this.element.style.width = "200px";
        this.minimized = true;
    } else {
        this.animate();
        this.minimized = false;
        this.x = this.lastX;
        this.y = this.lastY;
        this.element.style.width = this.lastWidth + "px";
        this.wrapperElement.classList.remove("hidden");
        document.querySelector("#window-" + this.id + " .window-resizer-y").classList.remove("hidden");
    }
};

AppWindow.prototype.dblclick = function() {
    if (this.minimized) {
        this.minimize();
    } else if (this.maximized) {
        this.restore();
    } else {
        this.maximize();
    }
};

AppWindow.prototype.animate = function() {
    // add animation class
    this.element.classList.add("window-animated");
    setTimeout(function() {
        this.element.classList.remove("window-animated");
    }.bind(this), 100);
};

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
  // this.taskbarApp = new Taskbar.TaskbarApp(config, this);
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
// var Taskbar = require("./Taskbar");

var Pwd = function(){
  this.mouse = new Mouse();
  // this.taskbar = new Taskbar.Taskbar();
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
      x: this.newX - config.width / 2,
      y: this.newY - config.height / 3,
      zIndex: this.lastZIndex,
    });
    this.startedApps[this.lastID] = newApp;
    this.lastZIndex += 1;
    this.lastID += 1;
    this.newX += 20;
    this.newY += 20;
  }

    this.closeApp = function(app) {
        this.startedApps[app.id].close();
        delete this.startedApps[app.id];
    };

    this.resize = function() {

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.newX = this.width / 2;
        this.newY = this.height / 3;

        if (this.fullscreenedWindow) {
            this.fullscreenedWindow.maximize();
        }
    };
};

var pwd = new Pwd();
pwd.installApps(); // create shortcuts for all available apps
pwd.resize(); // run resize once to set width and height
window.addEventListener("resize", pwd.resize.bind(pwd));

},{"./AppWindow":1,"./Mouse":2,"./Shortcut":7,"./appList":10}],10:[function(require,module,exports){
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
    height: 390,
    icon: "fa-clone"
  }
}

},{"./apps/chat/app":12,"./apps/memory/app":16}],11:[function(require,module,exports){
var Channel = function(chat, name) {
    this.name = name;
    this.chat = chat;
    this.chat.channels[name] = this;

    var template = document.querySelector("#chat-channel");
    this.chatDiv = document.importNode(template.content.firstElementChild, true);

    this.chatDiv.addEventListener("keypress", function(event) {
        // listen for enter key
        if (event.keyCode === 13) {
            //send a message
            this.chat.sendMessage(this.name, event.target.value);

            // empty textarea
            event.target.value = "";

            event.preventDefault();
        }
    }.bind(this));
    this.chat.chatChannelElement.appendChild(this.chatDiv);

    //channel list entry
    template = document.querySelector("#chat-channel-list-entry");
    var clone = document.importNode(template.content, true);
    this.chat.channelListElement.insertBefore(clone, this.chat.joinChannelButton);
    this.listEntryElement = this.chat.channelListElement.lastElementChild.previousElementSibling.previousElementSibling;
    if (name === "") {
        name = "Default";
    }

    this.listEntryElement.lastElementChild.textContent = name;
    this.listEntryElement.addEventListener("click", function() {
        this.chat.activeChannel.hide();
        this.show();
        this.chat.activeChannel = this;
    }.bind(this));

    // close channel
    this.listEntryElement.firstElementChild.addEventListener("click", function() {
        this.closeChannel();
    }.bind(this));
};

Channel.prototype.printMessage = function(message) {
    var template = this.chatDiv.querySelectorAll("template")[0];
    var messageDiv = document.importNode(template.content.firstElementChild, true);
    messageDiv.querySelectorAll(".chat-text")[0].textContent = message.data;
    messageDiv.querySelectorAll(".chat-author")[0].textContent = message.username;
    this.chatDiv.querySelectorAll(".chat-messages")[0].appendChild(messageDiv);

    if (this.chat.activeChannel !== this) {
        this.listEntryElement.classList.add("chat-channel-newmessage");
    }
};

Channel.prototype.hide = function() {
    this.chatDiv.classList.add("hidden");
    this.listEntryElement.classList.remove("chat-active-channel");
};

Channel.prototype.show = function() {
    this.chatDiv.classList.remove("hidden");
    this.listEntryElement.classList.add("chat-active-channel");
    this.listEntryElement.classList.remove("chat-channel-newmessage");
};

Channel.prototype.closeChannel = function() {
    //remove channel list entry
    this.chat.channelListElement.removeChild(this.listEntryElement);

    //remove chat div
    this.chat.chatChannelElement.removeChild(this.chatDiv);

    this.chat.closeChannel(this);
};

module.exports = Channel;

},{}],12:[function(require,module,exports){
var PwdApp = require("../../../js/PwdApp");
var socketConfig = require("./socketConfig.json");
var Channel = require("./Channel");

function Chat(config) {
    PwdApp.call(this, config); //inherit from pwdApp object
    this.channels = {};
    this.activeChannel = null;
    this.socket = null;

    this.inputName() // get username
    .then(function(username) {
        this.username = username;
        this.startChat();
    }.bind(this))
    .then(this.connect()) // then we connect
    .then(function() {
        this.activeChannel = new Channel(this, ""); // then we connect to the default channel
    }.bind(this));
}

Chat.prototype = Object.create(PwdApp.prototype);
Chat.prototype.constructor = Chat;

Chat.prototype.inputName = function() {
    return new Promise(
        function(resolve, reject) {
            // setTimeout(function() {
            //     resolve();
            // }, 2000);
            var template = document.querySelector("#chat-username-input");
            var clone = document.importNode(template.content, true);
            this.appWindow.content.appendChild(clone);

            var button = document.querySelector("#window-" + this.id + " .chat-btn-username");
            var textInput = document.querySelector("#window-" + this.id + " .chat-username-input input[type=text]");

            button.addEventListener("click", function() {
                resolve(textInput.value);
            }.bind(this));

            textInput.addEventListener("keypress", function(event) {
                if (event.keyCode === 13) {
                    resolve(textInput.value);
                }
            }.bind(this));

        }.bind(this)
    );
};

Chat.prototype.startChat = function() {
    // clear window of previous element (the input username screen)
    document.querySelector("#window-" + this.id + " .window-content").textContent = "";
    
    // create html
    var template = document.querySelector("#chat");
    this.element = document.importNode(template.content, true);
    this.appWindow.content.appendChild(this.element);
    this.chatChannelElement = document.querySelector("#window-" + this.id + " .chat-channels");
    this.channelListElement = document.querySelector("#window-" + this.id + " .chat-channel-list");

    // hook up join channel button
    this.joinChannelButton = document.querySelector("#window-" + this.id + " input[type=button");
    this.joinChannelInput = document.querySelector("#window-" + this.id + " .chat-join-channel");

    this.showJoinChannelInput = function() {
        // remove the listener
        this.joinChannelButton.removeEventListener("click", this.showJoinChannelInput);

        // show the join new channel form and position it next to the mouse cursor
        this.joinChannelInput.classList.remove("hidden");

        var btnboundingRect = this.joinChannelButton.getBoundingClientRect();
        var inputBoundingRect = this.joinChannelInput.getBoundingClientRect();

        var left = btnboundingRect.left - this.appWindow.x + btnboundingRect.width + 4 + "px";
        var top = btnboundingRect.top - this.appWindow.y - (inputBoundingRect.height / 2) + (btnboundingRect.height / 2) + "px";

        console.log(btnboundingRect.left,this.appWindow.x)

        this.joinChannelInput.style.left = left;
        this.joinChannelInput.style.top = top;

        this.joinChannelInput.value = "";
        this.joinChannelInput.focus();

        event.stopPropagation(); // this click shouldnt pass through otherwise the input will be hidden by the windowclicklistener

        //hide the join channel div if theres a click anywhere on screen except in the join channel div
        this.hideJoinChannelForm = function() {
            this.joinChannelInput.classList.add("hidden");
            window.removeEventListener("click", this.hideJoinChannelForm);
            this.joinChannelInput.removeEventListener("click", this.clickJoinCHannelForm);

            // activate the join channel button again
            this.joinChannelButton.addEventListener("click", this.showJoinChannelInput);
        }.bind(this);

        // dont hide if the click is in the join channel div
        this.clickJoinCHannelForm = function(event) {
            event.stopPropagation();
        }.bind(this);

        window.addEventListener("click", this.hideJoinChannelForm);
        this.joinChannelInput.addEventListener("click", this.clickJoinCHannelForm);
    }.bind(this);

    this.joinChannelButton.addEventListener("click", this.showJoinChannelInput);
    this.joinChannelInput.addEventListener("keypress", function(event) {
        // listen for enter key
        if (event.keyCode === 13) {
            // join channel
            this.activeChannel.hide();
            this.activeChannel = new Channel(this, event.target.value);
            event.target.value = "";
            this.hideJoinChannelForm();
        }
    }.bind(this));
};

Chat.prototype.connect = function() {
    return new Promise(function(resolve, reject){

        if (this.socket && this.socket.readyState === 1) {
            resolve(this.socket);
            return;
        }

        this.socket = new WebSocket(socketConfig.address);

        this.socket.addEventListener("open", function() {
            resolve(this.socket);
        }.bind(this));

        this.socket.addEventListener("error", function(event) {
            reject(new Error("Could not connect"));
        }.bind(this));

        this.socket.addEventListener("message", function(event) {
            var message = JSON.parse(event.data);
            if (message.type === "message") {
                if (message.channel in this.channels) {
                    this.channels[message.channel].printMessage(message);
                }
            }
        }.bind(this));
    }.bind(this));
};

Chat.prototype.sendMessage = function(channel, text) {
    var data = {
        type: "message",
        data: text,
        username: this.username,
        channel: channel,
        key: socketConfig.key
    };

    this.connect().then(function(socket) {
        socket.send(JSON.stringify(data));
    }).catch(function(error) {
        console.log("Error: ", error);
    });

};

Chat.prototype.closeChannel = function(channel) {
    delete this.channels[channel.name];
};

Chat.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);

    // remove from taskbar
    // document.querySelector("#pwd .taskbar").removeChild(this.taskbarApp.element);
};


module.exports = Chat;

},{"../../../js/PwdApp":3,"./Channel":11,"./socketConfig.json":13}],13:[function(require,module,exports){
module.exports={
  "address": "ws://vhost3.lnu.se:20080/socket/",
  "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}],14:[function(require,module,exports){
var Image = require("./Image");
var keyboard = require("./keyboard");

function shuffle(board) {
    var i;
    var randomIndex;
    var backIndex;

    // move through the deck of cards from the back to front
    for (i = board.imageArray.length - 1; i > 0; i -= 1) {
        //pick a random card and swap it with the card furthest back of the unshuffled cards
        randomIndex = Math.floor(Math.random() * (i + 1));
        backIndex = board.imageArray[i];
        board.imageArray[i] = board.imageArray[randomIndex];
        board.imageArray[randomIndex] = backIndex;
    }
}

function Board(pwd, columns, rows) {
    this.pwd = pwd;

    // TODO: verify width/height
    this.rows = rows;
    this.columns = columns;
    this.imageSize = 110;
    this.attempts = 0;
    this.selected = false;
    this.keyboardSelect = {
        x: 0,
        y: 0
    };

    // create html
    this.wrapperElement = document.createElement("div");
    this.wrapperElement.classList.add("memory-wrapper");

    document.querySelector("#window-" + this.pwd.id).setAttribute("tabindex", 1);

    this.element = document.createElement("div");
    this.element.classList.add("memory-board");
    this.element.style.width = this.columns * this.imageSize + "px";
    this.element.style.minWidth = this.columns * this.imageSize + "px";

    document.querySelector("#window-" + this.pwd.id + " .window-content").appendChild(this.wrapperElement);
    this.wrapperElement.appendChild(this.element);

    //create array of images
    this.imageArray = [];
    var docfrag = document.createDocumentFragment();
    for (var i = 0; i < this.columns * this.rows; i += 1) {
        var newImage = new Image(Math.floor(i / 2) + 1, i, this);
        this.imageArray.push(newImage);

    }

    shuffle(this);

    this.imageArray.forEach(function(image) {
        docfrag.appendChild(image.element);
    });

    this.element.appendChild(docfrag);

    //handle clicks
    this.element.addEventListener("click", function(event) {
        //remove keyboard select outline
        keyboard.removeOutline(this);
        var clickedId = event.target.getAttribute("data-id");
        this.imageArray.forEach(function(image) {
            if (clickedId == image.id) {
                image.click(this);
            }
        });
    }.bind(this));

    //handle keyboard
    keyboard.handleInput(this);

    this.startGame = function() {
        console.log("start");
        this.attempts = 0;
        this.selected = false;

        //flip images
        this.imageArray.forEach(function(image) {
            image.element.style.backgroundImage = "url('image/apps/memory/0.png')";
        });
    };
}

module.exports = Board;

},{"./Image":15,"./keyboard":17}],15:[function(require,module,exports){
var keyboard = require("./keyboard");

function Image(imageNumber, id, board) {
    this.element = document.createElement("div");
    this.element.classList.add("memory-image");
    this.element.setAttribute("data-imagenumber", imageNumber);
    this.element.setAttribute("data-id", id);
    this.id = id;
    this.imageNumber = imageNumber;
    this.board = board;
    this.clickable = true;
}

Image.prototype.click = function() {
    var _this = this;

    if (this.clickable) {
        this.clickable = false;
        this.show();

        if (!this.board.selected) {
            this.board.selected = this;

        } else {
            var _selected = this.board.selected;
            this.board.attempts += 1;
            //document.querySelector("#attempts").textContent = this.board.attempts;

            if(this.board.selected.imageNumber === this.imageNumber) {
                // match
                keyboard.removeOutline(this.board);
                this.element.classList.add("memory-green");
                _selected.element.classList.add("memory-green");
                this.board.selected = false;
                setTimeout(function() {
                    _selected.remove();
                    this.remove();
                }.bind(this), 400);

            } else {
                // not a match
                this.element.classList.add("memory-red");
                _selected.element.classList.add("memory-red");
                this.board.selected = false;

                setTimeout(function() {
                    this.element.classList.remove("memory-red");
                    _selected.element.classList.remove("memory-red");
                    _selected.hide();
                    _selected.clickable = true;
                    this.hide();
                    this.clickable = true;
                }.bind(this), 1000);
            }
        }
    }
};

Image.prototype.hide = function() {
    this.element.style.backgroundImage = "url('image/apps/memory/0.png')";
};

Image.prototype.show = function() {
    this.element.style.backgroundImage = "url('image/apps/memory/" + this.imageNumber + ".png')";
};

Image.prototype.remove = function() {
    this.element.classList.add("memory-fade-out");
};

module.exports = Image;
},{"./keyboard":17}],16:[function(require,module,exports){
var PwdApp = require("../../../js/PwdApp");
var Board = require("./Board.js");

function Memory(config) {
    PwdApp.call(this, config);

    this.board = new Board(this, 4,3);
	this.board.startGame();
}

Memory.prototype = Object.create(PwdApp.prototype);
Memory.prototype.constructor = Memory;
Memory.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);

    // remove from taskbar
    // document.querySelector("#pwd .taskbar").removeChild(this.taskbarApp.element);
};

module.exports = Memory;

},{"../../../js/PwdApp":3,"./Board.js":14}],17:[function(require,module,exports){
function removeOutline(board){
    console.log("aaaaaa",document.querySelector("#window-" + board.pwd.id))
    if (document.querySelector("#window-" + board.pwd.id + " .memory-keyboardSelect")) {
        document.querySelector("#window-" + board.pwd.id + " .memory-keyboardSelect").classList.remove("memory-keyboardSelect");
    }
}

function select(board) {
    removeOutline(board);
    var selected = board.keyboardSelect.x + board.keyboardSelect.y * board.columns;
    board.imageArray[selected].element.classList.add("memory-keyboardSelect");
}


function handleInput(board) {

    document.querySelector("#window-" + board.pwd.id).addEventListener("keyup", function(e) {
        console.log("sss",e.which);
        var key = e.keyCode ? e.keyCode : e.which;
        if (key === 37) {
            //left
            if (board.keyboardSelect.x > 0) {
                board.keyboardSelect.x -= 1;
                select(board);
            }
        }else if (key === 38) {
        	//up
        	if (board.keyboardSelect.y > 0) {
        		board.keyboardSelect.y -= 1;
        		select(board);
        	}
        }else if (key === 39) {
        	//right
        	if (board.keyboardSelect.x < board.columns - 1) {
        		board.keyboardSelect.x += 1;
        		select(board);
        	}
        } else if(key === 40) {
        	//down
        	if (board.keyboardSelect.y < board.rows - 1) {
        		board.keyboardSelect.y += 1;
        		select(board);
        	}
        } else if (key === 32) {
        	//space
        var selected = board.keyboardSelect.x + board.keyboardSelect.y * board.columns;
        board.imageArray[selected].click();
        }
    }, true);
}



module.exports.handleInput = handleInput;
module.exports.removeOutline = removeOutline;
},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHdkQXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Jlc2l6ZVdpbmRvd1dpZHRoLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5qcyIsImNsaWVudC9zb3VyY2UvanMvU2hvcnRjdXQuanMiLCJjbGllbnQvc291cmNlL2pzL1Rhc2tiYXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwTGlzdC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9jaGF0L0NoYW5uZWwuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9zb2NrZXRDb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9tZW1vcnkvQm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L0ltYWdlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L2tleWJvYXJkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZXNpemVXaW5kb3dXaWR0aCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd1dpZHRoXCIpO1xyXG52YXIgUmVzaXplV2luZG93SGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93SGVpZ2h0XCIpO1xyXG52YXIgUmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aEhlaWdodFwiKTtcclxuXHJcbmZ1bmN0aW9uIEFwcFdpbmRvdyhjb25maWcpIHtcclxuICAgIHRoaXMuaWQgPSBjb25maWcuaWQ7XHJcbiAgICB0aGlzLnB3ZCA9IGNvbmZpZy5wd2Q7XHJcbiAgICB0aGlzLmVsZW1lbnQ7XHJcbiAgICB0aGlzLmVsZW1lbnRXcmFwcGVyO1xyXG4gICAgdGhpcy53aWR0aCA9IGNvbmZpZy53aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gY29uZmlnLmhlaWdodDtcclxuICAgIHRoaXMueCA9IGNvbmZpZy54O1xyXG4gICAgdGhpcy55ID0gY29uZmlnLnk7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FwcFdpbmRvd1wiKS5jb250ZW50LCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAvLyBkZWZpbmUgdGhpcy5lbGVtZW50XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG5cclxuICAgIC8vIHNldCBpZFxyXG4gICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwid2luZG93LVwiICsgdGhpcy5pZCk7XHJcblxyXG4gICAgLy8gZGVmaW5lIHRoaXMud3JhcHBlckVsZW1lbnRcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuXHJcbiAgICAvLyBzZXQgd2luZG93IGJhciBpY29uXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuZmFcIikuY2xhc3NMaXN0LmFkZChjb25maWcuaWNvbik7XHJcblxyXG4gICAgLy8gc2V0IHdpbmRvdyBiYXIgdGl0bGVcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyLXRpdGxlXCIpLnRleHRDb250ZW50ID0gY29uZmlnLnRpdGxlO1xyXG5cclxuICAgIC8vIHNldCBwb3NpdGlvbiBhbmQgc2l6ZVxyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSBjb25maWcueCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBjb25maWcueSArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS56SW5kZXggPSBjb25maWcuekluZGV4O1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gY29uZmlnLndpZHRoICsgXCJweFwiO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBjb25maWcuaGVpZ2h0ICArIFwicHhcIjtcclxuICAgIHRoaXMudGl0bGVCYXJIZWlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5zY3JvbGxIZWlnaHQ7IC8vIHVzZWQgZm9yIGRyYWcgcmV6aXNpbmdcclxuICAgIHRoaXMucmVzaXplV2luZG93V2lkdGggPSBuZXcgUmVzaXplV2luZG93V2lkdGgodGhpcyk7XHJcbiAgICB0aGlzLnJlc2l6ZVdpbmRvd0hlaWdodCA9IG5ldyBSZXNpemVXaW5kb3dIZWlnaHQodGhpcyk7XHJcbiAgICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0KHRoaXMpO1xyXG4gICAgdGhpcy5jb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpO1xyXG5cclxuICAgIC8vIHB1dCBvbiB0b3AgaWYgY2xpY2tlZFxyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3ZlVG9Ub3AuYmluZCh0aGlzKSwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gZHJhZyB0aGUgd2luZG93IGZyb20gdGhlIHdpbmRvdyBiYXJcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gZG91YmxlIGNsaWNrIHdpbmRvdyBiYXJcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCB0aGlzLmRibGNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIGNsb3NlIGV2ZW50XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2xvc2Utd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsb3NlLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIG1heGltaXplIGV2ZW50XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm1heGltaXplLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIHJlc3RvcmUgZXZlbnRcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5yZXN0b3JlLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5yZXN0b3JlLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIG1pbmltaXplXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWluaW1pemUtd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm1pbmltaXplLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50Lm9mZnNldFRvcCAtIGV2ZW50LnBhZ2VZO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcmFnZ2luZ1wiKTtcclxufTtcclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHRoaXMueCA9IGUucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WDtcclxuICAgIHRoaXMueSA9IGUucGFnZVkgKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICAgIHRoaXMuY2hlY2tCb3VuZHMoZSk7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9ICB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG59O1xyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5jaGVja0JvdW5kcyA9IGZ1bmN0aW9uKGUpe1xyXG4gIGlmIChlLnBhZ2VYID4gdGhpcy5wd2Qud2lkdGgpXHJcbiAgICB0aGlzLnggPSB0aGlzLnB3ZC53aWR0aCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gIGlmIChlLnBhZ2VZID4gdGhpcy5wd2QuaGVpZ2h0KVxyXG4gICAgdGhpcy55ID0gdGhpcy5wd2QuaGVpZ2h0ICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgZWxzZSBpZiAoZS5wYWdlWSA8IDEpXHJcbiAgICB0aGlzLnkgPSB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuXHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dpbmdcIik7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUubW92ZVRvVG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnB3ZC5sYXN0WkluZGV4ICs9IDE7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy5wd2QubGFzdFpJbmRleDtcclxufVxyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyAyMCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMud2lkdGggLSAxMDAgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIDUwICsgXCJweFwiO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnB3ZC5jbG9zZUFwcCh0aGlzKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxufTtcclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUubWF4aW1pemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubWF4aW1pemVkID0gdHJ1ZTtcclxuICAgIHRoaXMuYW5pbWF0ZSgpO1xyXG5cclxuICAgIC8vIHNhdmUgdGhlIHNpemUgYW5kIHBvc2l0aW9uIHNvIHdlIGNhbiByZXR1cm4gdG8gaXQgd2l0aCB0aGUgcmVzdG9yZSB3aW5kb3cgZnVuY3Rpb25cclxuICAgIHRoaXMubGFzdFggPSB0aGlzLng7XHJcbiAgICB0aGlzLmxhc3RZID0gdGhpcy55O1xyXG4gICAgdGhpcy5sYXN0V2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcblxyXG4gICAgLy8gdGVsbCBwd2QgdGhpcyB3aW5kb3cgaXMgaW4gZnVsbHNjcmVlbiAoaW4gY2FzZSBvZiBicm93c2VyIHJlc2l6aW5nKVxyXG4gICAgdGhpcy5wd2QuZnVsbHNjcmVlbmVkV2luZG93ID0gdGhpcztcclxuXHJcbiAgICAvLyBtYWtlIHRoZSB3aW5kb3cgZnVsbHNjcmVlblxyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSBcIjBweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IFwiMHB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLnB3ZC53aWR0aCArIFwicHhcIjtcclxuICAgIHZhciBoZWlnaHQgPSB0aGlzLnB3ZC5oZWlnaHQgLSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcclxuICAgIHRoaXMueCA9IDA7XHJcbiAgICB0aGlzLnkgPSAwO1xyXG5cclxuICAgIC8vIGhpZGUvc2hvdyB0aGUgbWF4aW1pemUgYW5kIHJlc3RvcmUgd2luZG93YmFyIGJ1dHRvbnNcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5yZXN0b3JlLXdpbmRvd1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgIC8vIGlmIGl0IGlzIG1heGltaXplZCBmcm9tIGEgbWluaW1pemVkIHN0YXRlXHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcclxufTtcclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuYW5pbWF0ZSgpO1xyXG4gICAgdGhpcy54ID0gdGhpcy5sYXN0WDtcclxuICAgIHRoaXMueSA9IHRoaXMubGFzdFk7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLmxhc3RXaWR0aCArIFwicHhcIjtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5sYXN0SGVpZ2h0ICsgXCJweFwiO1xyXG5cclxuICAgIC8vdGVsbCBwd2QgdGhpcyB3aW5kb3cgaXMgbm8gbG9uZ2VyIGluIGZ1bGxzY3JlZW4gKGluIGNhc2Ugb2YgYnJvd3NlciByZXNpemluZylcclxuICAgIHRoaXMucHdkLmZ1bGxzY3JlZW5lZFdpbmRvdyA9IG51bGw7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1heGltaXplLXdpbmRvd1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgLy8gaWYgaXQgaXMgcmVzdG9yZWQgZnJvbSBhIG1pbmltaXplZCBzdGF0ZVxyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XHJcbn07XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1pbmltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICghdGhpcy5taW5pbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgICAgICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gICAgICAgIHRoaXMubGFzdFkgPSB0aGlzLnk7XHJcbiAgICAgICAgdGhpcy5sYXN0V2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IFwiMjAwcHhcIjtcclxuICAgICAgICB0aGlzLm1pbmltaXplZCA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xyXG4gICAgICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy5sYXN0WDtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLmxhc3RZO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMubGFzdFdpZHRoICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5kYmxjbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMubWluaW1pemVkKSB7XHJcbiAgICAgICAgdGhpcy5taW5pbWl6ZSgpO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLm1heGltaXplZCkge1xyXG4gICAgICAgIHRoaXMucmVzdG9yZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1heGltaXplKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGFkZCBhbmltYXRpb24gY2xhc3NcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2luZG93LWFuaW1hdGVkXCIpO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIndpbmRvdy1hbmltYXRlZFwiKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBwV2luZG93O1xyXG4iLCJmdW5jdGlvbiBNb3VzZSgpe1xyXG4gIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcbiAgdGhpcy5kcmFnT2Zmc2V0WCA9IDA7XHJcbiAgdGhpcy5kcmFnT2Zmc2V0WSA9IDA7XHJcblxyXG4gIHRoaXMubW91c2V1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIGlmICh0aGlzLmRyYWdnZWRPYmplY3QgIT09IG51bGwpIHtcclxuICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0LnN0b3BEcmFnKGUpO1xyXG4gICAgICB0aGlzLmRyYWdnZWRPYmplY3QgPSBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHRoaXMubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKHRoaXMuZHJhZ2dlZE9iamVjdCAhPT0gbnVsbCkge1xyXG4gICAgICB0aGlzLmRyYWdnZWRPYmplY3QuZHJhZyhlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbiAgLy8gdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgLy8gdGhpcy5tb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAvLyAgIGNvbnNvbGUubG9nKFwibW92ZVwiLCB0aGlzKVxyXG4gIC8vXHJcbiAgLy8gICAvLyBpZiAodGhpcy5zZWxlY3RlZCkge1xyXG4gIC8vICAgLy8gICB0aGlzLnNlbGVjdGVkLnN0eWxlLmxlZnQgPSBldmVudC5vZmZzZXRYICsgXCJweFwiO1xyXG4gIC8vICAgLy8gfVxyXG4gIC8vIH1cclxuICAvL1xyXG4gIC8vXHJcbiAgLy8gLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiKTtcclxuICAvL1xyXG4gIC8vIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcclxuIiwidmFyIEFwcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0FwcFdpbmRvd1wiKTtcclxudmFyIFRhc2tiYXIgPSByZXF1aXJlKFwiLi9UYXNrYmFyXCIpO1xyXG5cclxuZnVuY3Rpb24gUHdkQXBwKGNvbmZpZykge1xyXG4gIHRoaXMudGl0bGUgPSBjb25maWcudGl0bGU7XHJcbiAgdGhpcy53aWR0aCA9IGNvbmZpZy53aWR0aDtcclxuICB0aGlzLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQ7XHJcbiAgdGhpcy5pZCA9IGNvbmZpZy5pZDtcclxuICBjb25maWcud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gIGNvbmZpZy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICBjb25maWcudGl0bGUgPSB0aGlzLnRpdGxlO1xyXG4gIHRoaXMuYXBwV2luZG93ID0gbmV3IEFwcFdpbmRvdyhjb25maWcpO1xyXG5cclxuICAvLyBhZGQgdG8gdGFza2JhclxyXG4gIC8vIHRoaXMudGFza2JhckFwcCA9IG5ldyBUYXNrYmFyLlRhc2tiYXJBcHAoY29uZmlnLCB0aGlzKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQd2RBcHA7XHJcbiIsImZ1bmN0aW9uIFJlc2l6ZVdpbmRvd0hlaWdodChhcHBXaW5kb3cpIHtcclxuICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpO1xyXG4gIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICBjb25zb2xlLmxvZyh0aGlzLnJlc2l6ZVRoaXMpXHJcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy50aXRsZUJhckhlaWdodCAtIGV2ZW50LnBhZ2VZO1xyXG4gIC8vIFRPRE86IGZpeCBkcmFnIG9mZnNldFxyXG59XHJcblxyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy5yZXNpemVUaGlzLnN0eWxlLmhlaWdodCA9IChlLnBhZ2VZIC0gdGhpcy5hcHBXaW5kb3cueSAtIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSkgKyBcInB4XCI7XHJcbiAgLy90aGlzLmFwcFdpbmRvdy5lbGVtZW50LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFggKyBcInB4XCI7XHJcbiAgLy90aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCArIFwicHhcIjtcclxuICAvL3RoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBlLnBhZ2VZICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFkgKyBcInB4XCI7XHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93SGVpZ2h0O1xyXG4iLCJmdW5jdGlvbiBSZXNpemVXaW5kb3dXaWR0aChhcHBXaW5kb3cpIHtcclxuICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci14XCIpO1xyXG4gIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQpO1xyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcblxyXG4gIC8vZHJhZyBmcm9tIGV4YWN0bHkgd2hlcmUgdGhlIGNsaWNrIGlzXHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldExlZnQgLSBlLnBhZ2VYO1xyXG59XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLnJlc2l6ZVRoaXMuc3R5bGUud2lkdGggPSAoZS5wYWdlWCAtIHRoaXMuYXBwV2luZG93LnggKyB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFgpICsgXCJweFwiO1xyXG59XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGg7XHJcbiIsImZ1bmN0aW9uIFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0KGFwcFdpbmRvdykge1xyXG4gIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXh5XCIpO1xyXG4gIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gIC8vIHRoaXMgZWxlbWVudCBoYXMgbm8gb2Zmc2V0VG9wIHNvIGluc3RlYWQgd2UgdXNlIHdpbmRvdy1yZXNpemVyLWhlaWdodCdzIG9mZnNldFRvcCB2YWx1ZVxyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cudGl0bGVCYXJIZWlnaHQgLSBldmVudC5wYWdlWTtcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0TGVmdCAtIGUucGFnZVg7XHJcbiAgLy8gVE9ETzogZml4IGRyYWcgb2Zmc2V0XHJcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTsgLy90aGlzIGNsaWNrIHNob3VsZG50IGdvIHRocm91Z2ggdG8gdGhlIHBhcmVudCB3aGljaCBpcyB0aGUgaGVpZ2h0LXJlc2l6ZXJcclxuXHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd0hlaWdodC5kcmFnKGUpO1xyXG4gIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd1dpZHRoLmRyYWcoZSk7XHJcbiAgLy90aGlzLnJlc2l6ZVRoaXMuc3R5bGUuaGVpZ2h0ID0gKGUucGFnZVkgLSB0aGlzLmFwcFdpbmRvdy55KSArIFwicHhcIjtcclxufVxyXG5cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0O1xyXG4iLCJmdW5jdGlvbiBTaG9ydGN1dChjb25maWcsIHB3ZCkge1xyXG4gIHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG4gIHRoaXMudGl0bGUgPSBjb25maWcudGl0bGU7XHJcbiAgdGhpcy5lbnRyeSA9IGNvbmZpZy5lbnRyeTtcclxuICB0aGlzLnB3ZCA9IHB3ZDtcclxuICAvLyBjcmVhdGUgaHRtbFxyXG4gIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvcnRjdXRcIik7XHJcbiAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuICAvLyBhZGQgaWNvbiBhbmQgdGV4dFxyXG4gIHRoaXMuZWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKGNvbmZpZy5pY29uKTtcclxuICB0aGlzLmVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IHRoaXMudGl0bGU7XHJcbiAgLy9hZGQgZXZlbnQgbGlzdGVuZXJcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wd2Quc3RhcnRBcHAodGhpcy5jb25maWcpO1xyXG4gIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hvcnRjdXQ7XHJcbiIsImZ1bmN0aW9uIFRhc2tiYXIoKSB7XHJcbiAgLy8gY3JlYXRlIGh0bWxcclxuICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Rhc2tiYXJcIik7XHJcbiAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikubGFzdEVsZW1lbnRDaGlsZDtcclxufVxyXG5cclxuZnVuY3Rpb24gVGFza2JhckFwcChjb25maWcsIGFwcCkge1xyXG4gIHRoaXMuYXBwID0gYXBwO1xyXG5cclxuICAvL2NyZWF0ZSBodG1sXHJcbiAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0YXNrYmFyQXBwXCIpO1xyXG4gIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2QgLnRhc2tiYXJcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkIC50YXNrYmFyXCIpLmxhc3RFbGVtZW50Q2hpbGQ7XHJcblxyXG4gIC8vIHNldCB0YXNrYmFyIGljb24gYW5kIHRleHRcclxuICB0aGlzLmVsZW1lbnQuY2hpbGRyZW5bMF0uY2xhc3NMaXN0LmFkZChjb25maWcuaWNvbik7XHJcbiAgdGhpcy5lbGVtZW50LmNoaWxkcmVuWzFdLnRleHRDb250ZW50ID0gY29uZmlnLnRpdGxlO1xyXG5cclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgIHRoaXMuYXBwV2luZG93Lm1vdmVUb1RvcCgpO1xyXG4gIH0uYmluZCh0aGlzLmFwcCkpO1xyXG5cclxuICB0aGlzLmNsaWNrID0gZnVuY3Rpb24oZSkge1xyXG5cclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLlRhc2tiYXJBcHAgPSBUYXNrYmFyQXBwO1xyXG5tb2R1bGUuZXhwb3J0cy5UYXNrYmFyID0gVGFza2JhcjtcclxuIiwidmFyIEFwcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0FwcFdpbmRvd1wiKTtcclxudmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XHJcbnZhciBTaG9ydGN1dCA9IHJlcXVpcmUoXCIuL1Nob3J0Y3V0XCIpO1xyXG52YXIgYXBwTGlzdCA9IHJlcXVpcmUoXCIuL2FwcExpc3RcIik7XHJcbi8vIHZhciBUYXNrYmFyID0gcmVxdWlyZShcIi4vVGFza2JhclwiKTtcclxuXHJcbnZhciBQd2QgPSBmdW5jdGlvbigpe1xyXG4gIHRoaXMubW91c2UgPSBuZXcgTW91c2UoKTtcclxuICAvLyB0aGlzLnRhc2tiYXIgPSBuZXcgVGFza2Jhci5UYXNrYmFyKCk7XHJcbiAgdGhpcy5pbnN0YWxsZWRBcHBzID0gW107XHJcbiAgdGhpcy5zdGFydGVkQXBwcyA9IHt9O1xyXG4gIHRoaXMubGFzdFpJbmRleCA9IDE7XHJcbiAgdGhpcy5sYXN0SUQgPSAxO1xyXG4gIHRoaXMubmV3WCA9IDEwO1xyXG4gIHRoaXMubmV3WSA9IDEwO1xyXG4gIHRoaXMuZnVsbHNjcmVlbmVkV2luZG93ID0gbnVsbDtcclxuXHJcbiAgLy8gY3JlYXRlcyBzaG9ydGN1dHMgZm9yIGFsbCBhdmFpbGFibGUgYXBwc1xyXG4gIHRoaXMuaW5zdGFsbEFwcHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGFwcCBpbiBhcHBMaXN0KSB7XHJcbiAgICAgIHRoaXMuaW5zdGFsbGVkQXBwcy5wdXNoKG5ldyBTaG9ydGN1dChhcHBMaXN0W2FwcF0sIHRoaXMpKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIHN0YXJ0IGFuIGFwcFxyXG4gIHRoaXMuc3RhcnRBcHAgPSBmdW5jdGlvbihjb25maWcpIHtcclxuICAgIHZhciBuZXdBcHAgPSBuZXcgY29uZmlnLmVudHJ5KHtcclxuICAgICAgdGl0bGU6IGNvbmZpZy50aXRsZSxcclxuICAgICAgd2lkdGg6IGNvbmZpZy53aWR0aCxcclxuICAgICAgaGVpZ2h0OiBjb25maWcuaGVpZ2h0LFxyXG4gICAgICBpY29uOiBjb25maWcuaWNvbixcclxuICAgICAgcHdkOiB0aGlzLFxyXG4gICAgICBpZDogdGhpcy5sYXN0SUQsXHJcbiAgICAgIHg6IHRoaXMubmV3WCAtIGNvbmZpZy53aWR0aCAvIDIsXHJcbiAgICAgIHk6IHRoaXMubmV3WSAtIGNvbmZpZy5oZWlnaHQgLyAzLFxyXG4gICAgICB6SW5kZXg6IHRoaXMubGFzdFpJbmRleCxcclxuICAgIH0pO1xyXG4gICAgdGhpcy5zdGFydGVkQXBwc1t0aGlzLmxhc3RJRF0gPSBuZXdBcHA7XHJcbiAgICB0aGlzLmxhc3RaSW5kZXggKz0gMTtcclxuICAgIHRoaXMubGFzdElEICs9IDE7XHJcbiAgICB0aGlzLm5ld1ggKz0gMjA7XHJcbiAgICB0aGlzLm5ld1kgKz0gMjA7XHJcbiAgfVxyXG5cclxuICAgIHRoaXMuY2xvc2VBcHAgPSBmdW5jdGlvbihhcHApIHtcclxuICAgICAgICB0aGlzLnN0YXJ0ZWRBcHBzW2FwcC5pZF0uY2xvc2UoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5zdGFydGVkQXBwc1thcHAuaWRdO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMubmV3WCA9IHRoaXMud2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMubmV3WSA9IHRoaXMuaGVpZ2h0IC8gMztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZnVsbHNjcmVlbmVkV2luZG93KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnVsbHNjcmVlbmVkV2luZG93Lm1heGltaXplKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbnZhciBwd2QgPSBuZXcgUHdkKCk7XHJcbnB3ZC5pbnN0YWxsQXBwcygpOyAvLyBjcmVhdGUgc2hvcnRjdXRzIGZvciBhbGwgYXZhaWxhYmxlIGFwcHNcclxucHdkLnJlc2l6ZSgpOyAvLyBydW4gcmVzaXplIG9uY2UgdG8gc2V0IHdpZHRoIGFuZCBoZWlnaHRcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcHdkLnJlc2l6ZS5iaW5kKHB3ZCkpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBcIkNoYXRcIjoge1xyXG4gICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvY2hhdC9hcHBcIiksXHJcbiAgICB0aXRsZTogXCJDaGF0XCIsXHJcbiAgICB3aWR0aDogNTAwLFxyXG4gICAgaGVpZ2h0OiA0MDAsXHJcbiAgICBpY29uOiBcImZhLWNvbW1lbnRpbmdcIlxyXG4gIH0sXHJcbiAgICBcIk1lbW9yeVwiOiB7XHJcbiAgICBlbnRyeTogcmVxdWlyZShcIi4vYXBwcy9tZW1vcnkvYXBwXCIpLFxyXG4gICAgdGl0bGU6IFwiTWVtb3J5XCIsXHJcbiAgICB3aWR0aDogNTAwLFxyXG4gICAgaGVpZ2h0OiAzOTAsXHJcbiAgICBpY29uOiBcImZhLWNsb25lXCJcclxuICB9XHJcbn1cclxuIiwidmFyIENoYW5uZWwgPSBmdW5jdGlvbihjaGF0LCBuYW1lKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5jaGF0ID0gY2hhdDtcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsc1tuYW1lXSA9IHRoaXM7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0LWNoYW5uZWxcIik7XHJcbiAgICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xyXG5cclxuICAgIHRoaXMuY2hhdERpdi5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvLyBsaXN0ZW4gZm9yIGVudGVyIGtleVxyXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAvL3NlbmQgYSBtZXNzYWdlXHJcbiAgICAgICAgICAgIHRoaXMuY2hhdC5zZW5kTWVzc2FnZSh0aGlzLm5hbWUsIGV2ZW50LnRhcmdldC52YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBlbXB0eSB0ZXh0YXJlYVxyXG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5jaGF0LmNoYXRDaGFubmVsRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmNoYXREaXYpO1xyXG5cclxuICAgIC8vY2hhbm5lbCBsaXN0IGVudHJ5XHJcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC1jaGFubmVsLWxpc3QtZW50cnlcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMuY2hhdC5qb2luQ2hhbm5lbEJ1dHRvbik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQgPSB0aGlzLmNoYXQuY2hhbm5lbExpc3RFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQucHJldmlvdXNFbGVtZW50U2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgaWYgKG5hbWUgPT09IFwiXCIpIHtcclxuICAgICAgICBuYW1lID0gXCJEZWZhdWx0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBuYW1lO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNoYXQuYWN0aXZlQ2hhbm5lbC5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwgPSB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBjbG9zZSBjaGFubmVsXHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VDaGFubmVsKCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUucHJpbnRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVwiKVswXTtcclxuICAgIHZhciBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcclxuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbChcIi5jaGF0LXRleHRcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7XHJcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1hdXRob3JcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xyXG4gICAgdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1tZXNzYWdlc1wiKVswXS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcclxuXHJcbiAgICBpZiAodGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwgIT09IHRoaXMpIHtcclxuICAgICAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImNoYXQtY2hhbm5lbC1uZXdtZXNzYWdlXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jaGF0RGl2LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtYWN0aXZlLWNoYW5uZWxcIik7XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNoYXREaXYuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY2hhdC1hY3RpdmUtY2hhbm5lbFwiKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jaGFubmVsLW5ld21lc3NhZ2VcIik7XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5jbG9zZUNoYW5uZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcmVtb3ZlIGNoYW5uZWwgbGlzdCBlbnRyeVxyXG4gICAgdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmxpc3RFbnRyeUVsZW1lbnQpO1xyXG5cclxuICAgIC8vcmVtb3ZlIGNoYXQgZGl2XHJcbiAgICB0aGlzLmNoYXQuY2hhdENoYW5uZWxFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuY2hhdERpdik7XHJcblxyXG4gICAgdGhpcy5jaGF0LmNsb3NlQ2hhbm5lbCh0aGlzKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhbm5lbDtcclxuIiwidmFyIFB3ZEFwcCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9Qd2RBcHBcIik7XHJcbnZhciBzb2NrZXRDb25maWcgPSByZXF1aXJlKFwiLi9zb2NrZXRDb25maWcuanNvblwiKTtcclxudmFyIENoYW5uZWwgPSByZXF1aXJlKFwiLi9DaGFubmVsXCIpO1xyXG5cclxuZnVuY3Rpb24gQ2hhdChjb25maWcpIHtcclxuICAgIFB3ZEFwcC5jYWxsKHRoaXMsIGNvbmZpZyk7IC8vaW5oZXJpdCBmcm9tIHB3ZEFwcCBvYmplY3RcclxuICAgIHRoaXMuY2hhbm5lbHMgPSB7fTtcclxuICAgIHRoaXMuYWN0aXZlQ2hhbm5lbCA9IG51bGw7XHJcbiAgICB0aGlzLnNvY2tldCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5pbnB1dE5hbWUoKSAvLyBnZXQgdXNlcm5hbWVcclxuICAgIC50aGVuKGZ1bmN0aW9uKHVzZXJuYW1lKSB7XHJcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgICAgIHRoaXMuc3RhcnRDaGF0KCk7XHJcbiAgICB9LmJpbmQodGhpcykpXHJcbiAgICAudGhlbih0aGlzLmNvbm5lY3QoKSkgLy8gdGhlbiB3ZSBjb25uZWN0XHJcbiAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0aGlzLCBcIlwiKTsgLy8gdGhlbiB3ZSBjb25uZWN0IHRvIHRoZSBkZWZhdWx0IGNoYW5uZWxcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkNoYXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQd2RBcHAucHJvdG90eXBlKTtcclxuQ2hhdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGF0O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuaW5wdXROYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoXHJcbiAgICAgICAgZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIC8vIH0sIDIwMDApO1xyXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXQtdXNlcm5hbWUtaW5wdXRcIik7XHJcbiAgICAgICAgICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwV2luZG93LmNvbnRlbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWJ0bi11c2VybmFtZVwiKTtcclxuICAgICAgICAgICAgdmFyIHRleHRJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LXVzZXJuYW1lLWlucHV0IGlucHV0W3R5cGU9dGV4dF1cIik7XHJcblxyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0ZXh0SW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGV4dElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0ZXh0SW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5zdGFydENoYXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGNsZWFyIHdpbmRvdyBvZiBwcmV2aW91cyBlbGVtZW50ICh0aGUgaW5wdXQgdXNlcm5hbWUgc2NyZWVuKVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLnRleHRDb250ZW50ID0gXCJcIjtcclxuICAgIFxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFwiKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5jb250ZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XHJcbiAgICB0aGlzLmNoYXRDaGFubmVsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWNoYW5uZWxzXCIpO1xyXG4gICAgdGhpcy5jaGFubmVsTGlzdEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1jaGFubmVsLWxpc3RcIik7XHJcblxyXG4gICAgLy8gaG9vayB1cCBqb2luIGNoYW5uZWwgYnV0dG9uXHJcbiAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgaW5wdXRbdHlwZT1idXR0b25cIik7XHJcbiAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1qb2luLWNoYW5uZWxcIik7XHJcblxyXG4gICAgdGhpcy5zaG93Sm9pbkNoYW5uZWxJbnB1dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0KTtcclxuXHJcbiAgICAgICAgLy8gc2hvdyB0aGUgam9pbiBuZXcgY2hhbm5lbCBmb3JtIGFuZCBwb3NpdGlvbiBpdCBuZXh0IHRvIHRoZSBtb3VzZSBjdXJzb3JcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdmFyIGJ0bmJvdW5kaW5nUmVjdCA9IHRoaXMuam9pbkNoYW5uZWxCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgdmFyIGlucHV0Qm91bmRpbmdSZWN0ID0gdGhpcy5qb2luQ2hhbm5lbElucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICB2YXIgbGVmdCA9IGJ0bmJvdW5kaW5nUmVjdC5sZWZ0IC0gdGhpcy5hcHBXaW5kb3cueCArIGJ0bmJvdW5kaW5nUmVjdC53aWR0aCArIDQgKyBcInB4XCI7XHJcbiAgICAgICAgdmFyIHRvcCA9IGJ0bmJvdW5kaW5nUmVjdC50b3AgLSB0aGlzLmFwcFdpbmRvdy55IC0gKGlucHV0Qm91bmRpbmdSZWN0LmhlaWdodCAvIDIpICsgKGJ0bmJvdW5kaW5nUmVjdC5oZWlnaHQgLyAyKSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYnRuYm91bmRpbmdSZWN0LmxlZnQsdGhpcy5hcHBXaW5kb3cueClcclxuXHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnN0eWxlLmxlZnQgPSBsZWZ0O1xyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5zdHlsZS50b3AgPSB0b3A7XHJcblxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC52YWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvLyB0aGlzIGNsaWNrIHNob3VsZG50IHBhc3MgdGhyb3VnaCBvdGhlcndpc2UgdGhlIGlucHV0IHdpbGwgYmUgaGlkZGVuIGJ5IHRoZSB3aW5kb3djbGlja2xpc3RlbmVyXHJcblxyXG4gICAgICAgIC8vaGlkZSB0aGUgam9pbiBjaGFubmVsIGRpdiBpZiB0aGVyZXMgYSBjbGljayBhbnl3aGVyZSBvbiBzY3JlZW4gZXhjZXB0IGluIHRoZSBqb2luIGNoYW5uZWwgZGl2XHJcbiAgICAgICAgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuaGlkZUpvaW5DaGFubmVsRm9ybSk7XHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0pvaW5DSGFubmVsRm9ybSk7XHJcblxyXG4gICAgICAgICAgICAvLyBhY3RpdmF0ZSB0aGUgam9pbiBjaGFubmVsIGJ1dHRvbiBhZ2FpblxyXG4gICAgICAgICAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0KTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIC8vIGRvbnQgaGlkZSBpZiB0aGUgY2xpY2sgaXMgaW4gdGhlIGpvaW4gY2hhbm5lbCBkaXZcclxuICAgICAgICB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuaGlkZUpvaW5DaGFubmVsRm9ybSk7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtKTtcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0KTtcclxuICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvLyBsaXN0ZW4gZm9yIGVudGVyIGtleVxyXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAvLyBqb2luIGNoYW5uZWxcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVDaGFubmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVDaGFubmVsID0gbmV3IENoYW5uZWwodGhpcywgZXZlbnQudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KHNvY2tldENvbmZpZy5hZGRyZXNzKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiQ291bGQgbm90IGNvbm5lY3RcIikpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLmNoYW5uZWwgaW4gdGhpcy5jaGFubmVscykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbHNbbWVzc2FnZS5jaGFubmVsXS5wcmludE1lc3NhZ2UobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24oY2hhbm5lbCwgdGV4dCkge1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXHJcbiAgICAgICAgZGF0YTogdGV4dCxcclxuICAgICAgICB1c2VybmFtZTogdGhpcy51c2VybmFtZSxcclxuICAgICAgICBjaGFubmVsOiBjaGFubmVsLFxyXG4gICAgICAgIGtleTogc29ja2V0Q29uZmlnLmtleVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKHNvY2tldCkge1xyXG4gICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIsIGVycm9yKTtcclxuICAgIH0pO1xyXG5cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNsb3NlQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpIHtcclxuICAgIGRlbGV0ZSB0aGlzLmNoYW5uZWxzW2NoYW5uZWwubmFtZV07XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gcmVtb3ZlIHRoZSBncmFwaGljc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikucmVtb3ZlQ2hpbGQodGhpcy5hcHBXaW5kb3cuZWxlbWVudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gdGFza2JhclxyXG4gICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2QgLnRhc2tiYXJcIikucmVtb3ZlQ2hpbGQodGhpcy50YXNrYmFyQXBwLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhdDtcclxuIiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gIFwiYWRkcmVzc1wiOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXHJcbiAgXCJrZXlcIjogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXHJcbn1cclxuIiwidmFyIEltYWdlID0gcmVxdWlyZShcIi4vSW1hZ2VcIik7XHJcbnZhciBrZXlib2FyZCA9IHJlcXVpcmUoXCIuL2tleWJvYXJkXCIpO1xyXG5cclxuZnVuY3Rpb24gc2h1ZmZsZShib2FyZCkge1xyXG4gICAgdmFyIGk7XHJcbiAgICB2YXIgcmFuZG9tSW5kZXg7XHJcbiAgICB2YXIgYmFja0luZGV4O1xyXG5cclxuICAgIC8vIG1vdmUgdGhyb3VnaCB0aGUgZGVjayBvZiBjYXJkcyBmcm9tIHRoZSBiYWNrIHRvIGZyb250XHJcbiAgICBmb3IgKGkgPSBib2FyZC5pbWFnZUFycmF5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpIC09IDEpIHtcclxuICAgICAgICAvL3BpY2sgYSByYW5kb20gY2FyZCBhbmQgc3dhcCBpdCB3aXRoIHRoZSBjYXJkIGZ1cnRoZXN0IGJhY2sgb2YgdGhlIHVuc2h1ZmZsZWQgY2FyZHNcclxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xyXG4gICAgICAgIGJhY2tJbmRleCA9IGJvYXJkLmltYWdlQXJyYXlbaV07XHJcbiAgICAgICAgYm9hcmQuaW1hZ2VBcnJheVtpXSA9IGJvYXJkLmltYWdlQXJyYXlbcmFuZG9tSW5kZXhdO1xyXG4gICAgICAgIGJvYXJkLmltYWdlQXJyYXlbcmFuZG9tSW5kZXhdID0gYmFja0luZGV4O1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBCb2FyZChwd2QsIGNvbHVtbnMsIHJvd3MpIHtcclxuICAgIHRoaXMucHdkID0gcHdkO1xyXG5cclxuICAgIC8vIFRPRE86IHZlcmlmeSB3aWR0aC9oZWlnaHRcclxuICAgIHRoaXMucm93cyA9IHJvd3M7XHJcbiAgICB0aGlzLmNvbHVtbnMgPSBjb2x1bW5zO1xyXG4gICAgdGhpcy5pbWFnZVNpemUgPSAxMTA7XHJcbiAgICB0aGlzLmF0dGVtcHRzID0gMDtcclxuICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMua2V5Ym9hcmRTZWxlY3QgPSB7XHJcbiAgICAgICAgeDogMCxcclxuICAgICAgICB5OiAwXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGNyZWF0ZSBodG1sXHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS13cmFwcGVyXCIpO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQpLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIDEpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1ib2FyZFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMuY29sdW1ucyAqIHRoaXMuaW1hZ2VTaXplICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLm1pbldpZHRoID0gdGhpcy5jb2x1bW5zICogdGhpcy5pbWFnZVNpemUgKyBcInB4XCI7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0aGlzLndyYXBwZXJFbGVtZW50KTtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICAvL2NyZWF0ZSBhcnJheSBvZiBpbWFnZXNcclxuICAgIHRoaXMuaW1hZ2VBcnJheSA9IFtdO1xyXG4gICAgdmFyIGRvY2ZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29sdW1ucyAqIHRoaXMucm93czsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIG5ld0ltYWdlID0gbmV3IEltYWdlKE1hdGguZmxvb3IoaSAvIDIpICsgMSwgaSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LnB1c2gobmV3SW1hZ2UpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzaHVmZmxlKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuaW1hZ2VBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XHJcbiAgICAgICAgZG9jZnJhZy5hcHBlbmRDaGlsZChpbWFnZS5lbGVtZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChkb2NmcmFnKTtcclxuXHJcbiAgICAvL2hhbmRsZSBjbGlja3NcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvL3JlbW92ZSBrZXlib2FyZCBzZWxlY3Qgb3V0bGluZVxyXG4gICAgICAgIGtleWJvYXJkLnJlbW92ZU91dGxpbmUodGhpcyk7XHJcbiAgICAgICAgdmFyIGNsaWNrZWRJZCA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChjbGlja2VkSWQgPT0gaW1hZ2UuaWQpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlLmNsaWNrKHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vaGFuZGxlIGtleWJvYXJkXHJcbiAgICBrZXlib2FyZC5oYW5kbGVJbnB1dCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0R2FtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RhcnRcIik7XHJcbiAgICAgICAgdGhpcy5hdHRlbXB0cyA9IDA7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL2ZsaXAgaW1hZ2VzXHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICAgICAgaW1hZ2UuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCgnaW1hZ2UvYXBwcy9tZW1vcnkvMC5wbmcnKVwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb2FyZDtcclxuIiwidmFyIGtleWJvYXJkID0gcmVxdWlyZShcIi4va2V5Ym9hcmRcIik7XHJcblxyXG5mdW5jdGlvbiBJbWFnZShpbWFnZU51bWJlciwgaWQsIGJvYXJkKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktaW1hZ2VcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pbWFnZW51bWJlclwiLCBpbWFnZU51bWJlcik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBpZCk7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmltYWdlTnVtYmVyID0gaW1hZ2VOdW1iZXI7XHJcbiAgICB0aGlzLmJvYXJkID0gYm9hcmQ7XHJcbiAgICB0aGlzLmNsaWNrYWJsZSA9IHRydWU7XHJcbn1cclxuXHJcbkltYWdlLnByb3RvdHlwZS5jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICBpZiAodGhpcy5jbGlja2FibGUpIHtcclxuICAgICAgICB0aGlzLmNsaWNrYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvdygpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuYm9hcmQuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5zZWxlY3RlZCA9IHRoaXM7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBfc2VsZWN0ZWQgPSB0aGlzLmJvYXJkLnNlbGVjdGVkO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmF0dGVtcHRzICs9IDE7XHJcbiAgICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhdHRlbXB0c1wiKS50ZXh0Q29udGVudCA9IHRoaXMuYm9hcmQuYXR0ZW1wdHM7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmJvYXJkLnNlbGVjdGVkLmltYWdlTnVtYmVyID09PSB0aGlzLmltYWdlTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBtYXRjaFxyXG4gICAgICAgICAgICAgICAga2V5Ym9hcmQucmVtb3ZlT3V0bGluZSh0aGlzLmJvYXJkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWdyZWVuXCIpO1xyXG4gICAgICAgICAgICAgICAgX3NlbGVjdGVkLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1ncmVlblwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbm90IGEgbWF0Y2hcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLmNsaWNrYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGlja2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkltYWdlLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5LzAucG5nJylcIjtcclxufTtcclxuXHJcbkltYWdlLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5L1wiICsgdGhpcy5pbWFnZU51bWJlciArIFwiLnBuZycpXCI7XHJcbn07XHJcblxyXG5JbWFnZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1mYWRlLW91dFwiKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2U7IiwidmFyIFB3ZEFwcCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9Qd2RBcHBcIik7XHJcbnZhciBCb2FyZCA9IHJlcXVpcmUoXCIuL0JvYXJkLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5KGNvbmZpZykge1xyXG4gICAgUHdkQXBwLmNhbGwodGhpcywgY29uZmlnKTtcclxuXHJcbiAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKHRoaXMsIDQsMyk7XHJcblx0dGhpcy5ib2FyZC5zdGFydEdhbWUoKTtcclxufVxyXG5cclxuTWVtb3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHdkQXBwLnByb3RvdHlwZSk7XHJcbk1lbW9yeS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1vcnk7XHJcbk1lbW9yeS5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHJlbW92ZSB0aGUgZ3JhcGhpY3NcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLnJlbW92ZUNoaWxkKHRoaXMuYXBwV2luZG93LmVsZW1lbnQpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIHRhc2tiYXJcclxuICAgIC8vIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkIC50YXNrYmFyXCIpLnJlbW92ZUNoaWxkKHRoaXMudGFza2JhckFwcC5lbGVtZW50KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5O1xyXG4iLCJmdW5jdGlvbiByZW1vdmVPdXRsaW5lKGJvYXJkKXtcclxuICAgIGNvbnNvbGUubG9nKFwiYWFhYWFhXCIsZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBib2FyZC5wd2QuaWQpKVxyXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYm9hcmQucHdkLmlkICsgXCIgLm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKSkge1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYm9hcmQucHdkLmlkICsgXCIgLm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwibWVtb3J5LWtleWJvYXJkU2VsZWN0XCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZWxlY3QoYm9hcmQpIHtcclxuICAgIHJlbW92ZU91dGxpbmUoYm9hcmQpO1xyXG4gICAgdmFyIHNlbGVjdGVkID0gYm9hcmQua2V5Ym9hcmRTZWxlY3QueCArIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgKiBib2FyZC5jb2x1bW5zO1xyXG4gICAgYm9hcmQuaW1hZ2VBcnJheVtzZWxlY3RlZF0uZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWtleWJvYXJkU2VsZWN0XCIpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaGFuZGxlSW5wdXQoYm9hcmQpIHtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCkuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInNzc1wiLGUud2hpY2gpO1xyXG4gICAgICAgIHZhciBrZXkgPSBlLmtleUNvZGUgPyBlLmtleUNvZGUgOiBlLndoaWNoO1xyXG4gICAgICAgIGlmIChrZXkgPT09IDM3KSB7XHJcbiAgICAgICAgICAgIC8vbGVmdFxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmtleWJvYXJkU2VsZWN0LnggLT0gMTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZSBpZiAoa2V5ID09PSAzOCkge1xyXG4gICAgICAgIFx0Ly91cFxyXG4gICAgICAgIFx0aWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgPiAwKSB7XHJcbiAgICAgICAgXHRcdGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgLT0gMTtcclxuICAgICAgICBcdFx0c2VsZWN0KGJvYXJkKTtcclxuICAgICAgICBcdH1cclxuICAgICAgICB9ZWxzZSBpZiAoa2V5ID09PSAzOSkge1xyXG4gICAgICAgIFx0Ly9yaWdodFxyXG4gICAgICAgIFx0aWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnggPCBib2FyZC5jb2x1bW5zIC0gMSkge1xyXG4gICAgICAgIFx0XHRib2FyZC5rZXlib2FyZFNlbGVjdC54ICs9IDE7XHJcbiAgICAgICAgXHRcdHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgXHR9XHJcbiAgICAgICAgfSBlbHNlIGlmKGtleSA9PT0gNDApIHtcclxuICAgICAgICBcdC8vZG93blxyXG4gICAgICAgIFx0aWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgPCBib2FyZC5yb3dzIC0gMSkge1xyXG4gICAgICAgIFx0XHRib2FyZC5rZXlib2FyZFNlbGVjdC55ICs9IDE7XHJcbiAgICAgICAgXHRcdHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgXHR9XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDMyKSB7XHJcbiAgICAgICAgXHQvL3NwYWNlXHJcbiAgICAgICAgdmFyIHNlbGVjdGVkID0gYm9hcmQua2V5Ym9hcmRTZWxlY3QueCArIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgKiBib2FyZC5jb2x1bW5zO1xyXG4gICAgICAgIGJvYXJkLmltYWdlQXJyYXlbc2VsZWN0ZWRdLmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgdHJ1ZSk7XHJcbn1cclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMuaGFuZGxlSW5wdXQgPSBoYW5kbGVJbnB1dDtcclxubW9kdWxlLmV4cG9ydHMucmVtb3ZlT3V0bGluZSA9IHJlbW92ZU91dGxpbmU7Il19
