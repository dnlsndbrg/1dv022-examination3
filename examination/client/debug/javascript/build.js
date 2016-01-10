(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ResizeWindowWidth = require("./ResizeWindowWidth");
var ResizeWindowHeight = require("./ResizeWindowHeight");
var ResizeWindowWidthHeight = require("./ResizeWindowWidthHeight");

function AppWindow(config) {
    this.id = config.id;
    this.pwd = config.pwd;
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

AppWindow.prototype.checkBounds = function(e) {
    if (e.pageX > this.pwd.width) {
        this.x = this.pwd.width + this.pwd.mouse.dragOffsetX;
    }
    if (e.pageY > this.pwd.height) {
        this.y = this.pwd.height + this.pwd.mouse.dragOffsetY;
    }
    else if (e.pageY < 1) {
        this.y = this.pwd.mouse.dragOffsetY;
    };
};

AppWindow.prototype.stopDrag = function() {
    this.element.classList.remove("dragging");
};

AppWindow.prototype.moveToTop = function() {
    this.pwd.lastZIndex += 1;
    this.element.style.zIndex = this.pwd.lastZIndex;
};

AppWindow.prototype.close = function() {
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
};

module.exports = Mouse;

},{}],3:[function(require,module,exports){
var AppWindow = require("./AppWindow");
//var Taskbar = require("./Taskbar");

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

},{"./AppWindow":1}],4:[function(require,module,exports){
function ResizeWindowHeight(appWindow) {
    this.appWindow = appWindow;
    this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-y");
    this.resizeThis = document.querySelector("#window-" + this.appWindow.id + " .window-content-wrapper");
    this.element.addEventListener("mousedown", this.startDrag.bind(this));
}

ResizeWindowHeight.prototype.startDrag = function() {
    this.appWindow.pwd.mouse.draggedObject = this;
    this.appWindow.pwd.mouse.dragOffsetY = this.element.offsetTop + this.appWindow.element.offsetTop + this.appWindow.titleBarHeight - event.pageY;
    // TODO: fix drag offset
};

ResizeWindowHeight.prototype.drag = function(e) {
    this.resizeThis.style.height = (e.pageY - this.appWindow.y - this.appWindow.pwd.mouse.dragOffsetY) + "px";
    //this.appWindow.element.style.left = e.pageX + this.pwd.mouse.dragOffsetX + "px";
    //this.element.style.left = e.pageX + this.pwd.mouse.dragOffsetX + "px";
    //this.element.style.top = e.pageY + this.pwd.mouse.dragOffsetY + "px";
};

ResizeWindowHeight.prototype.stopDrag = function() {

};

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
//var AppWindow = require("./AppWindow");
var Mouse = require("./Mouse");
var Shortcut = require("./Shortcut");
var appList = require("./appList");

// var Taskbar = require("./Taskbar");

var Pwd = function() {
    this.mouse = new Mouse();

    // this.taskbar = new Taskbar.Taskbar();
    this.installedApps = [];
    this.startedApps = {};
    this.lastZIndex = 1;
    this.lastID = 1;
    this.fullscreenedWindow = null;

    // creates shortcuts for all available apps
    this.installApps = function() {
    for (var app in appList) {
        this.installedApps.push(new Shortcut(appList[app], this));
    }
};

    // start an app
    this.startApp = function(config) {

        var position = this.calculateStartPosition(config);

        var newApp = new config.entry({
            title: config.title,
            width: config.width,
            height: config.height,
            icon: config.icon,
            pwd: this,
            id: this.lastID,
            x: position.x,
            y: position.y,
            zIndex: this.lastZIndex
        });
        this.startedApps[this.lastID] = newApp;
        this.lastZIndex += 1;
        this.lastID += 1;

    };

    this.calculateStartPosition = function(config) {
        // make sure the starting X Y coordinates are good

        var x = this.newX - config.width / 2;
        var y = this.newY - config.height / 2;

        // reset if X is off screen
        if (x > this.width - 40 || y > this.height - 40) {
            this.originalX += 20;
            if (this.originalX > this.width - 20) {
                this.originalX = 20;
            }

            this.newX = this.originalX;
            this.newY = this.originalY;
        }

        // reset if Y is off screen

        this.newX += 20;
        this.newY += 20;

        // check if the new app is bigger than the pwd window
        if (x < 0) {
            x = 0;
        }

        if (y < 0) {
            y = 0;
        }

        return {x: x, y: y};
    };

    this.closeApp = function(app) {
        this.startedApps[app.id].close();
        delete this.startedApps[app.id];
    };

    this.resize = function() {

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.newX = this.width / 2;
        this.newY = this.height / 2.5;
        this.originalX = this.newX;
        this.originalY = this.newY;

        if (this.fullscreenedWindow) {
            this.fullscreenedWindow.maximize();
        }
    };
};

var pwd = new Pwd();
pwd.installApps(); // create shortcuts for all available apps
pwd.resize(); // run resize once to get width and calculate start position of apps
window.addEventListener("resize", pwd.resize.bind(pwd));

},{"./Mouse":2,"./Shortcut":7,"./appList":9}],9:[function(require,module,exports){
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
    width: 550,
    height: 440,
    icon: "fa-clone"
  }
}

},{"./apps/chat/app":11,"./apps/memory/app":15}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

            // show name input text and button
            var template = document.querySelector("#chat-username-input");
            var clone = document.importNode(template.content, true);
            this.appWindow.content.appendChild(clone);

            var button = document.querySelector("#window-" + this.id + " .chat-btn-username");
            var textInput = document.querySelector("#window-" + this.id + " .chat-username-input input[type=text]");

            textInput.focus();

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

},{"../../../js/PwdApp":3,"./Channel":10,"./socketConfig.json":12}],12:[function(require,module,exports){
module.exports={
  "address": "ws://vhost3.lnu.se:20080/socket/",
  "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}],13:[function(require,module,exports){
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

    // Attempts html
    var template = document.querySelector("#memory-attempts");
    var clone = document.importNode(template.content, true);
    document.querySelector("#window-" + this.pwd.id + " .window-content").appendChild(clone);
    this.attemptsDiv = document.querySelector("#window-" + this.pwd.id + " .memory-attempts");

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
        this.attempts = 0;
        this.selected = false;

        //flip images
        this.imageArray.forEach(function(image) {
            image.element.style.backgroundImage = "url('image/apps/memory/0.png')";
        });
    };
}

module.exports = Board;

},{"./Image":14,"./keyboard":16}],14:[function(require,module,exports){
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

    if (this.clickable) {
        this.clickable = false;
        this.show();

        if (!this.board.selected) {
            this.board.selected = this;

        } else {
            var _selected = this.board.selected;
            this.board.attempts += 1;

            this.board.attemptsDiv.textContent = "Attempts: " + this.board.attempts;
            if (this.board.selected.imageNumber === this.imageNumber) {
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
},{"./keyboard":16}],15:[function(require,module,exports){
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

},{"../../../js/PwdApp":3,"./Board.js":13}],16:[function(require,module,exports){
function removeOutline(board) {
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
        } else if (key === 40) {
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

},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHdkQXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Jlc2l6ZVdpbmRvd1dpZHRoLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5qcyIsImNsaWVudC9zb3VyY2UvanMvU2hvcnRjdXQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwTGlzdC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9jaGF0L0NoYW5uZWwuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9zb2NrZXRDb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9tZW1vcnkvQm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L0ltYWdlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L2tleWJvYXJkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZXNpemVXaW5kb3dXaWR0aCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd1dpZHRoXCIpO1xyXG52YXIgUmVzaXplV2luZG93SGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93SGVpZ2h0XCIpO1xyXG52YXIgUmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aEhlaWdodFwiKTtcclxuXHJcbmZ1bmN0aW9uIEFwcFdpbmRvdyhjb25maWcpIHtcclxuICAgIHRoaXMuaWQgPSBjb25maWcuaWQ7XHJcbiAgICB0aGlzLnB3ZCA9IGNvbmZpZy5wd2Q7XHJcbiAgICB0aGlzLndpZHRoID0gY29uZmlnLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0O1xyXG4gICAgdGhpcy54ID0gY29uZmlnLng7XHJcbiAgICB0aGlzLnkgPSBjb25maWcueTtcclxuICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBodG1sXHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYXBwV2luZG93XCIpLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgIC8vIGRlZmluZSB0aGlzLmVsZW1lbnRcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmxhc3RFbGVtZW50Q2hpbGQ7XHJcblxyXG4gICAgLy8gc2V0IGlkXHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJ3aW5kb3ctXCIgKyB0aGlzLmlkKTtcclxuXHJcbiAgICAvLyBkZWZpbmUgdGhpcy53cmFwcGVyRWxlbWVudFxyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG5cclxuICAgIC8vIHNldCB3aW5kb3cgYmFyIGljb25cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5mYVwiKS5jbGFzc0xpc3QuYWRkKGNvbmZpZy5pY29uKTtcclxuXHJcbiAgICAvLyBzZXQgd2luZG93IGJhciB0aXRsZVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXItdGl0bGVcIikudGV4dENvbnRlbnQgPSBjb25maWcudGl0bGU7XHJcblxyXG4gICAgLy8gc2V0IHBvc2l0aW9uIGFuZCBzaXplXHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGNvbmZpZy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IGNvbmZpZy55ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnpJbmRleCA9IGNvbmZpZy56SW5kZXg7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBjb25maWcud2lkdGggKyBcInB4XCI7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQgICsgXCJweFwiO1xyXG4gICAgdGhpcy50aXRsZUJhckhlaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLnNjcm9sbEhlaWdodDsgLy8gdXNlZCBmb3IgZHJhZyByZXppc2luZ1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dXaWR0aCA9IG5ldyBSZXNpemVXaW5kb3dXaWR0aCh0aGlzKTtcclxuICAgIHRoaXMucmVzaXplV2luZG93SGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd0hlaWdodCh0aGlzKTtcclxuICAgIHRoaXMucmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSBuZXcgUmVzaXplV2luZG93V2lkdGhIZWlnaHQodGhpcyk7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIik7XHJcblxyXG4gICAgLy8gcHV0IG9uIHRvcCBpZiBjbGlja2VkXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdmVUb1RvcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuXHJcbiAgICAvLyBkcmFnIHRoZSB3aW5kb3cgZnJvbSB0aGUgd2luZG93IGJhclxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBkb3VibGUgY2xpY2sgd2luZG93IGJhclxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIHRoaXMuZGJsY2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gY2xvc2UgZXZlbnRcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jbG9zZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gbWF4aW1pemUgZXZlbnRcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWF4aW1pemUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gcmVzdG9yZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnJlc3RvcmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gbWluaW1pemVcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5taW5pbWl6ZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWluaW1pemUuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gICAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCAtIGV2ZW50LnBhZ2VYO1xyXG4gICAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wIC0gZXZlbnQucGFnZVk7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyYWdnaW5nXCIpO1xyXG59O1xyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gICAgdGhpcy54ID0gZS5wYWdlWCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gICAgdGhpcy55ID0gZS5wYWdlWSArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZO1xyXG4gICAgdGhpcy5jaGVja0JvdW5kcyhlKTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gIHRoaXMueCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLmNoZWNrQm91bmRzID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKGUucGFnZVggPiB0aGlzLnB3ZC53aWR0aCkge1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMucHdkLndpZHRoICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFg7XHJcbiAgICB9XHJcbiAgICBpZiAoZS5wYWdlWSA+IHRoaXMucHdkLmhlaWdodCkge1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMucHdkLmhlaWdodCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZS5wYWdlWSA8IDEpIHtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICAgIH07XHJcbn07XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnaW5nXCIpO1xyXG59O1xyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5tb3ZlVG9Ub3AgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHdkLmxhc3RaSW5kZXggKz0gMTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLnB3ZC5sYXN0WkluZGV4O1xyXG59O1xyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IDA7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgMjAgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLndpZHRoIC0gMTAwICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLnggKyA1MCArIFwicHhcIjtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wd2QuY2xvc2VBcHAodGhpcyk7XHJcbiAgICB9LmJpbmQodGhpcyksIDEwMCk7XHJcbn07XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1heGltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IHRydWU7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuXHJcbiAgICAvLyBzYXZlIHRoZSBzaXplIGFuZCBwb3NpdGlvbiBzbyB3ZSBjYW4gcmV0dXJuIHRvIGl0IHdpdGggdGhlIHJlc3RvcmUgd2luZG93IGZ1bmN0aW9uXHJcbiAgICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gICAgdGhpcy5sYXN0WSA9IHRoaXMueTtcclxuICAgIHRoaXMubGFzdFdpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMubGFzdEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIC8vIHRlbGwgcHdkIHRoaXMgd2luZG93IGlzIGluIGZ1bGxzY3JlZW4gKGluIGNhc2Ugb2YgYnJvd3NlciByZXNpemluZylcclxuICAgIHRoaXMucHdkLmZ1bGxzY3JlZW5lZFdpbmRvdyA9IHRoaXM7XHJcblxyXG4gICAgLy8gbWFrZSB0aGUgd2luZG93IGZ1bGxzY3JlZW5cclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5wd2Qud2lkdGggKyBcInB4XCI7XHJcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5wd2QuaGVpZ2h0IC0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XHJcbiAgICB0aGlzLnggPSAwO1xyXG4gICAgdGhpcy55ID0gMDtcclxuXHJcbiAgICAvLyBoaWRlL3Nob3cgdGhlIG1heGltaXplIGFuZCByZXN0b3JlIHdpbmRvd2JhciBidXR0b25zXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAvLyBpZiBpdCBpcyBtYXhpbWl6ZWQgZnJvbSBhIG1pbmltaXplZCBzdGF0ZVxyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XHJcbn07XHJcblxyXG5BcHBXaW5kb3cucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubWF4aW1pemVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgIHRoaXMueCA9IHRoaXMubGFzdFg7XHJcbiAgICB0aGlzLnkgPSB0aGlzLmxhc3RZO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5sYXN0V2lkdGggKyBcInB4XCI7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMubGFzdEhlaWdodCArIFwicHhcIjtcclxuXHJcbiAgICAvL3RlbGwgcHdkIHRoaXMgd2luZG93IGlzIG5vIGxvbmdlciBpbiBmdWxsc2NyZWVuIChpbiBjYXNlIG9mIGJyb3dzZXIgcmVzaXppbmcpXHJcbiAgICB0aGlzLnB3ZC5mdWxsc2NyZWVuZWRXaW5kb3cgPSBudWxsO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5yZXN0b3JlLXdpbmRvd1wiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgIC8vIGlmIGl0IGlzIHJlc3RvcmVkIGZyb20gYSBtaW5pbWl6ZWQgc3RhdGVcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIXRoaXMubWluaW1pemVkKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICAgICAgdGhpcy5sYXN0WCA9IHRoaXMueDtcclxuICAgICAgICB0aGlzLmxhc3RZID0gdGhpcy55O1xyXG4gICAgICAgIHRoaXMubGFzdFdpZHRoID0gdGhpcy53aWR0aDtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBcIjIwMHB4XCI7XHJcbiAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgICAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMubGFzdFg7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5sYXN0WTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLmxhc3RXaWR0aCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuZGJsY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLm1pbmltaXplZCkge1xyXG4gICAgICAgIHRoaXMubWluaW1pemUoKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5tYXhpbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLnJlc3RvcmUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tYXhpbWl6ZSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQXBwV2luZG93LnByb3RvdHlwZS5hbmltYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBhZGQgYW5pbWF0aW9uIGNsYXNzXHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIndpbmRvdy1hbmltYXRlZFwiKTtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJ3aW5kb3ctYW5pbWF0ZWRcIik7XHJcbiAgICB9LmJpbmQodGhpcyksIDEwMCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFdpbmRvdztcclxuIiwiZnVuY3Rpb24gTW91c2UoKXtcclxuICB0aGlzLmRyYWdnZWRPYmplY3QgPSBudWxsO1xyXG4gIHRoaXMuZHJhZ09mZnNldFggPSAwO1xyXG4gIHRoaXMuZHJhZ09mZnNldFkgPSAwO1xyXG5cclxuICB0aGlzLm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5zdG9wRHJhZyhlKTtcclxuICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0ID0gbnVsbDtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIGlmICh0aGlzLmRyYWdnZWRPYmplY3QgIT09IG51bGwpIHtcclxuICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0LmRyYWcoZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcclxuIiwidmFyIEFwcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0FwcFdpbmRvd1wiKTtcclxuLy92YXIgVGFza2JhciA9IHJlcXVpcmUoXCIuL1Rhc2tiYXJcIik7XHJcblxyXG5mdW5jdGlvbiBQd2RBcHAoY29uZmlnKSB7XHJcbiAgICB0aGlzLnRpdGxlID0gY29uZmlnLnRpdGxlO1xyXG4gICAgdGhpcy53aWR0aCA9IGNvbmZpZy53aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gY29uZmlnLmhlaWdodDtcclxuICAgIHRoaXMuaWQgPSBjb25maWcuaWQ7XHJcbiAgICBjb25maWcud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgY29uZmlnLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgY29uZmlnLnRpdGxlID0gdGhpcy50aXRsZTtcclxuICAgIHRoaXMuYXBwV2luZG93ID0gbmV3IEFwcFdpbmRvdyhjb25maWcpO1xyXG5cclxuICAgIC8vIGFkZCB0byB0YXNrYmFyXHJcbiAgICAvLyB0aGlzLnRhc2tiYXJBcHAgPSBuZXcgVGFza2Jhci5UYXNrYmFyQXBwKGNvbmZpZywgdGhpcyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHdkQXBwO1xyXG4iLCJmdW5jdGlvbiBSZXNpemVXaW5kb3dIZWlnaHQoYXBwV2luZG93KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIik7XHJcbiAgICB0aGlzLnJlc2l6ZVRoaXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LnRpdGxlQmFySGVpZ2h0IC0gZXZlbnQucGFnZVk7XHJcbiAgICAvLyBUT0RPOiBmaXggZHJhZyBvZmZzZXRcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHRoaXMucmVzaXplVGhpcy5zdHlsZS5oZWlnaHQgPSAoZS5wYWdlWSAtIHRoaXMuYXBwV2luZG93LnkgLSB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkpICsgXCJweFwiO1xyXG4gICAgLy90aGlzLmFwcFdpbmRvdy5lbGVtZW50LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFggKyBcInB4XCI7XHJcbiAgICAvL3RoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYICsgXCJweFwiO1xyXG4gICAgLy90aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gZS5wYWdlWSArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZICsgXCJweFwiO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93SGVpZ2h0O1xyXG4iLCJmdW5jdGlvbiBSZXNpemVXaW5kb3dXaWR0aChhcHBXaW5kb3cpIHtcclxuICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci14XCIpO1xyXG4gIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQpO1xyXG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcblxyXG4gIC8vZHJhZyBmcm9tIGV4YWN0bHkgd2hlcmUgdGhlIGNsaWNrIGlzXHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldExlZnQgLSBlLnBhZ2VYO1xyXG59XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICB0aGlzLnJlc2l6ZVRoaXMuc3R5bGUud2lkdGggPSAoZS5wYWdlWCAtIHRoaXMuYXBwV2luZG93LnggKyB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFgpICsgXCJweFwiO1xyXG59XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGg7XHJcbiIsImZ1bmN0aW9uIFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0KGFwcFdpbmRvdykge1xyXG4gIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXh5XCIpO1xyXG4gIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gIC8vIHRoaXMgZWxlbWVudCBoYXMgbm8gb2Zmc2V0VG9wIHNvIGluc3RlYWQgd2UgdXNlIHdpbmRvdy1yZXNpemVyLWhlaWdodCdzIG9mZnNldFRvcCB2YWx1ZVxyXG4gIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cudGl0bGVCYXJIZWlnaHQgLSBldmVudC5wYWdlWTtcclxuICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0TGVmdCAtIGUucGFnZVg7XHJcbiAgLy8gVE9ETzogZml4IGRyYWcgb2Zmc2V0XHJcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTsgLy90aGlzIGNsaWNrIHNob3VsZG50IGdvIHRocm91Z2ggdG8gdGhlIHBhcmVudCB3aGljaCBpcyB0aGUgaGVpZ2h0LXJlc2l6ZXJcclxuXHJcbn1cclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd0hlaWdodC5kcmFnKGUpO1xyXG4gIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd1dpZHRoLmRyYWcoZSk7XHJcbiAgLy90aGlzLnJlc2l6ZVRoaXMuc3R5bGUuaGVpZ2h0ID0gKGUucGFnZVkgLSB0aGlzLmFwcFdpbmRvdy55KSArIFwicHhcIjtcclxufVxyXG5cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0O1xyXG4iLCJmdW5jdGlvbiBTaG9ydGN1dChjb25maWcsIHB3ZCkge1xyXG4gIHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG4gIHRoaXMudGl0bGUgPSBjb25maWcudGl0bGU7XHJcbiAgdGhpcy5lbnRyeSA9IGNvbmZpZy5lbnRyeTtcclxuICB0aGlzLnB3ZCA9IHB3ZDtcclxuICAvLyBjcmVhdGUgaHRtbFxyXG4gIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvcnRjdXRcIik7XHJcbiAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuICAvLyBhZGQgaWNvbiBhbmQgdGV4dFxyXG4gIHRoaXMuZWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKGNvbmZpZy5pY29uKTtcclxuICB0aGlzLmVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IHRoaXMudGl0bGU7XHJcbiAgLy9hZGQgZXZlbnQgbGlzdGVuZXJcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wd2Quc3RhcnRBcHAodGhpcy5jb25maWcpO1xyXG4gIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hvcnRjdXQ7XHJcbiIsIi8vdmFyIEFwcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0FwcFdpbmRvd1wiKTtcclxudmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XHJcbnZhciBTaG9ydGN1dCA9IHJlcXVpcmUoXCIuL1Nob3J0Y3V0XCIpO1xyXG52YXIgYXBwTGlzdCA9IHJlcXVpcmUoXCIuL2FwcExpc3RcIik7XHJcblxyXG4vLyB2YXIgVGFza2JhciA9IHJlcXVpcmUoXCIuL1Rhc2tiYXJcIik7XHJcblxyXG52YXIgUHdkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1vdXNlID0gbmV3IE1vdXNlKCk7XHJcblxyXG4gICAgLy8gdGhpcy50YXNrYmFyID0gbmV3IFRhc2tiYXIuVGFza2JhcigpO1xyXG4gICAgdGhpcy5pbnN0YWxsZWRBcHBzID0gW107XHJcbiAgICB0aGlzLnN0YXJ0ZWRBcHBzID0ge307XHJcbiAgICB0aGlzLmxhc3RaSW5kZXggPSAxO1xyXG4gICAgdGhpcy5sYXN0SUQgPSAxO1xyXG4gICAgdGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cgPSBudWxsO1xyXG5cclxuICAgIC8vIGNyZWF0ZXMgc2hvcnRjdXRzIGZvciBhbGwgYXZhaWxhYmxlIGFwcHNcclxuICAgIHRoaXMuaW5zdGFsbEFwcHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGFwcCBpbiBhcHBMaXN0KSB7XHJcbiAgICAgICAgdGhpcy5pbnN0YWxsZWRBcHBzLnB1c2gobmV3IFNob3J0Y3V0KGFwcExpc3RbYXBwXSwgdGhpcykpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuICAgIC8vIHN0YXJ0IGFuIGFwcFxyXG4gICAgdGhpcy5zdGFydEFwcCA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG5cclxuICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmNhbGN1bGF0ZVN0YXJ0UG9zaXRpb24oY29uZmlnKTtcclxuXHJcbiAgICAgICAgdmFyIG5ld0FwcCA9IG5ldyBjb25maWcuZW50cnkoe1xyXG4gICAgICAgICAgICB0aXRsZTogY29uZmlnLnRpdGxlLFxyXG4gICAgICAgICAgICB3aWR0aDogY29uZmlnLndpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IGNvbmZpZy5oZWlnaHQsXHJcbiAgICAgICAgICAgIGljb246IGNvbmZpZy5pY29uLFxyXG4gICAgICAgICAgICBwd2Q6IHRoaXMsXHJcbiAgICAgICAgICAgIGlkOiB0aGlzLmxhc3RJRCxcclxuICAgICAgICAgICAgeDogcG9zaXRpb24ueCxcclxuICAgICAgICAgICAgeTogcG9zaXRpb24ueSxcclxuICAgICAgICAgICAgekluZGV4OiB0aGlzLmxhc3RaSW5kZXhcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnN0YXJ0ZWRBcHBzW3RoaXMubGFzdElEXSA9IG5ld0FwcDtcclxuICAgICAgICB0aGlzLmxhc3RaSW5kZXggKz0gMTtcclxuICAgICAgICB0aGlzLmxhc3RJRCArPSAxO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jYWxjdWxhdGVTdGFydFBvc2l0aW9uID0gZnVuY3Rpb24oY29uZmlnKSB7XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBzdGFydGluZyBYIFkgY29vcmRpbmF0ZXMgYXJlIGdvb2RcclxuXHJcbiAgICAgICAgdmFyIHggPSB0aGlzLm5ld1ggLSBjb25maWcud2lkdGggLyAyO1xyXG4gICAgICAgIHZhciB5ID0gdGhpcy5uZXdZIC0gY29uZmlnLmhlaWdodCAvIDI7XHJcblxyXG4gICAgICAgIC8vIHJlc2V0IGlmIFggaXMgb2ZmIHNjcmVlblxyXG4gICAgICAgIGlmICh4ID4gdGhpcy53aWR0aCAtIDQwIHx8IHkgPiB0aGlzLmhlaWdodCAtIDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxYICs9IDIwO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcmlnaW5hbFggPiB0aGlzLndpZHRoIC0gMjApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxYID0gMjA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMubmV3WCA9IHRoaXMub3JpZ2luYWxYO1xyXG4gICAgICAgICAgICB0aGlzLm5ld1kgPSB0aGlzLm9yaWdpbmFsWTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlc2V0IGlmIFkgaXMgb2ZmIHNjcmVlblxyXG5cclxuICAgICAgICB0aGlzLm5ld1ggKz0gMjA7XHJcbiAgICAgICAgdGhpcy5uZXdZICs9IDIwO1xyXG5cclxuICAgICAgICAvLyBjaGVjayBpZiB0aGUgbmV3IGFwcCBpcyBiaWdnZXIgdGhhbiB0aGUgcHdkIHdpbmRvd1xyXG4gICAgICAgIGlmICh4IDwgMCkge1xyXG4gICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh5IDwgMCkge1xyXG4gICAgICAgICAgICB5ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7eDogeCwgeTogeX07XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY2xvc2VBcHAgPSBmdW5jdGlvbihhcHApIHtcclxuICAgICAgICB0aGlzLnN0YXJ0ZWRBcHBzW2FwcC5pZF0uY2xvc2UoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5zdGFydGVkQXBwc1thcHAuaWRdO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMubmV3WCA9IHRoaXMud2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMubmV3WSA9IHRoaXMuaGVpZ2h0IC8gMi41O1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxYID0gdGhpcy5uZXdYO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxZID0gdGhpcy5uZXdZO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cpIHtcclxuICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cubWF4aW1pemUoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxudmFyIHB3ZCA9IG5ldyBQd2QoKTtcclxucHdkLmluc3RhbGxBcHBzKCk7IC8vIGNyZWF0ZSBzaG9ydGN1dHMgZm9yIGFsbCBhdmFpbGFibGUgYXBwc1xyXG5wd2QucmVzaXplKCk7IC8vIHJ1biByZXNpemUgb25jZSB0byBnZXQgd2lkdGggYW5kIGNhbGN1bGF0ZSBzdGFydCBwb3NpdGlvbiBvZiBhcHBzXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHB3ZC5yZXNpemUuYmluZChwd2QpKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgXCJDaGF0XCI6IHtcclxuICAgIGVudHJ5OiByZXF1aXJlKFwiLi9hcHBzL2NoYXQvYXBwXCIpLFxyXG4gICAgdGl0bGU6IFwiQ2hhdFwiLFxyXG4gICAgd2lkdGg6IDUwMCxcclxuICAgIGhlaWdodDogNDAwLFxyXG4gICAgaWNvbjogXCJmYS1jb21tZW50aW5nXCJcclxuICB9LFxyXG4gICAgXCJNZW1vcnlcIjoge1xyXG4gICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvbWVtb3J5L2FwcFwiKSxcclxuICAgIHRpdGxlOiBcIk1lbW9yeVwiLFxyXG4gICAgd2lkdGg6IDU1MCxcclxuICAgIGhlaWdodDogNDQwLFxyXG4gICAgaWNvbjogXCJmYS1jbG9uZVwiXHJcbiAgfVxyXG59XHJcbiIsInZhciBDaGFubmVsID0gZnVuY3Rpb24oY2hhdCwgbmFtZSkge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuY2hhdCA9IGNoYXQ7XHJcbiAgICB0aGlzLmNoYXQuY2hhbm5lbHNbbmFtZV0gPSB0aGlzO1xyXG5cclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC1jaGFubmVsXCIpO1xyXG4gICAgdGhpcy5jaGF0RGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcclxuXHJcbiAgICB0aGlzLmNoYXREaXYuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgLy8gbGlzdGVuIGZvciBlbnRlciBrZXlcclxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgLy9zZW5kIGEgbWVzc2FnZVxyXG4gICAgICAgICAgICB0aGlzLmNoYXQuc2VuZE1lc3NhZ2UodGhpcy5uYW1lLCBldmVudC50YXJnZXQudmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgLy8gZW1wdHkgdGV4dGFyZWFcclxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuY2hhdC5jaGF0Q2hhbm5lbEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5jaGF0RGl2KTtcclxuXHJcbiAgICAvL2NoYW5uZWwgbGlzdCBlbnRyeVxyXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXQtY2hhbm5lbC1saXN0LWVudHJ5XCIpO1xyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsTGlzdEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLmNoYXQuam9pbkNoYW5uZWxCdXR0b24pO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50ID0gdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLnByZXZpb3VzRWxlbWVudFNpYmxpbmcucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgIGlmIChuYW1lID09PSBcIlwiKSB7XHJcbiAgICAgICAgbmFtZSA9IFwiRGVmYXVsdFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gbmFtZTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuY2hhdC5hY3RpdmVDaGFubmVsID0gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gY2xvc2UgY2hhbm5lbFxyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNsb3NlQ2hhbm5lbCgpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYW5uZWwucHJvdG90eXBlLnByaW50TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVcIilbMF07XHJcbiAgICB2YXIgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XHJcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC10ZXh0XCIpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS5kYXRhO1xyXG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtYXV0aG9yXCIpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS51c2VybmFtZTtcclxuICAgIHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtbWVzc2FnZXNcIilbMF0uYXBwZW5kQ2hpbGQobWVzc2FnZURpdik7XHJcblxyXG4gICAgaWYgKHRoaXMuY2hhdC5hY3RpdmVDaGFubmVsICE9PSB0aGlzKSB7XHJcbiAgICAgICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjaGF0LWNoYW5uZWwtbmV3bWVzc2FnZVwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYW5uZWwucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY2hhdERpdi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LWFjdGl2ZS1jaGFubmVsXCIpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jaGF0RGl2LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImNoYXQtYWN0aXZlLWNoYW5uZWxcIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtY2hhbm5lbC1uZXdtZXNzYWdlXCIpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuY2xvc2VDaGFubmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3JlbW92ZSBjaGFubmVsIGxpc3QgZW50cnlcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsTGlzdEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5saXN0RW50cnlFbGVtZW50KTtcclxuXHJcbiAgICAvL3JlbW92ZSBjaGF0IGRpdlxyXG4gICAgdGhpcy5jaGF0LmNoYXRDaGFubmVsRWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmNoYXREaXYpO1xyXG5cclxuICAgIHRoaXMuY2hhdC5jbG9zZUNoYW5uZWwodGhpcyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYW5uZWw7XHJcbiIsInZhciBQd2RBcHAgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvUHdkQXBwXCIpO1xyXG52YXIgc29ja2V0Q29uZmlnID0gcmVxdWlyZShcIi4vc29ja2V0Q29uZmlnLmpzb25cIik7XHJcbnZhciBDaGFubmVsID0gcmVxdWlyZShcIi4vQ2hhbm5lbFwiKTtcclxuXHJcbmZ1bmN0aW9uIENoYXQoY29uZmlnKSB7XHJcbiAgICBQd2RBcHAuY2FsbCh0aGlzLCBjb25maWcpOyAvL2luaGVyaXQgZnJvbSBwd2RBcHAgb2JqZWN0XHJcbiAgICB0aGlzLmNoYW5uZWxzID0ge307XHJcbiAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBudWxsO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuaW5wdXROYW1lKCkgLy8gZ2V0IHVzZXJuYW1lXHJcbiAgICAudGhlbihmdW5jdGlvbih1c2VybmFtZSkge1xyXG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSB1c2VybmFtZTtcclxuICAgICAgICB0aGlzLnN0YXJ0Q2hhdCgpO1xyXG4gICAgfS5iaW5kKHRoaXMpKVxyXG4gICAgLnRoZW4odGhpcy5jb25uZWN0KCkpIC8vIHRoZW4gd2UgY29ubmVjdFxyXG4gICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVDaGFubmVsID0gbmV3IENoYW5uZWwodGhpcywgXCJcIik7IC8vIHRoZW4gd2UgY29ubmVjdCB0byB0aGUgZGVmYXVsdCBjaGFubmVsXHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5DaGF0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHdkQXBwLnByb3RvdHlwZSk7XHJcbkNoYXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2hhdDtcclxuXHJcbkNoYXQucHJvdG90eXBlLmlucHV0TmFtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKFxyXG4gICAgICAgIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cclxuICAgICAgICAgICAgLy8gc2hvdyBuYW1lIGlucHV0IHRleHQgYW5kIGJ1dHRvblxyXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXQtdXNlcm5hbWUtaW5wdXRcIik7XHJcbiAgICAgICAgICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwV2luZG93LmNvbnRlbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWJ0bi11c2VybmFtZVwiKTtcclxuICAgICAgICAgICAgdmFyIHRleHRJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LXVzZXJuYW1lLWlucHV0IGlucHV0W3R5cGU9dGV4dF1cIik7XHJcblxyXG4gICAgICAgICAgICB0ZXh0SW5wdXQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRleHRJbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0ZXh0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRleHRJbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnN0YXJ0Q2hhdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gY2xlYXIgd2luZG93IG9mIHByZXZpb3VzIGVsZW1lbnQgKHRoZSBpbnB1dCB1c2VybmFtZSBzY3JlZW4pXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIHRoaXMuYXBwV2luZG93LmNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcclxuICAgIHRoaXMuY2hhdENoYW5uZWxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtY2hhbm5lbHNcIik7XHJcbiAgICB0aGlzLmNoYW5uZWxMaXN0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWNoYW5uZWwtbGlzdFwiKTtcclxuXHJcbiAgICAvLyBob29rIHVwIGpvaW4gY2hhbm5lbCBidXR0b25cclxuICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiBpbnB1dFt0eXBlPWJ1dHRvblwiKTtcclxuICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWpvaW4tY2hhbm5lbFwiKTtcclxuXHJcbiAgICB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBsaXN0ZW5lclxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG5cclxuICAgICAgICAvLyBzaG93IHRoZSBqb2luIG5ldyBjaGFubmVsIGZvcm0gYW5kIHBvc2l0aW9uIGl0IG5leHQgdG8gdGhlIG1vdXNlIGN1cnNvclxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB2YXIgYnRuYm91bmRpbmdSZWN0ID0gdGhpcy5qb2luQ2hhbm5lbEJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB2YXIgaW5wdXRCb3VuZGluZ1JlY3QgPSB0aGlzLmpvaW5DaGFubmVsSW5wdXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIHZhciBsZWZ0ID0gYnRuYm91bmRpbmdSZWN0LmxlZnQgLSB0aGlzLmFwcFdpbmRvdy54ICsgYnRuYm91bmRpbmdSZWN0LndpZHRoICsgNCArIFwicHhcIjtcclxuICAgICAgICB2YXIgdG9wID0gYnRuYm91bmRpbmdSZWN0LnRvcCAtIHRoaXMuYXBwV2luZG93LnkgLSAoaW5wdXRCb3VuZGluZ1JlY3QuaGVpZ2h0IC8gMikgKyAoYnRuYm91bmRpbmdSZWN0LmhlaWdodCAvIDIpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuc3R5bGUubGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnN0eWxlLnRvcCA9IHRvcDtcclxuXHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnZhbHVlID0gXCJcIjtcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIHRoaXMgY2xpY2sgc2hvdWxkbnQgcGFzcyB0aHJvdWdoIG90aGVyd2lzZSB0aGUgaW5wdXQgd2lsbCBiZSBoaWRkZW4gYnkgdGhlIHdpbmRvd2NsaWNrbGlzdGVuZXJcclxuXHJcbiAgICAgICAgLy9oaWRlIHRoZSBqb2luIGNoYW5uZWwgZGl2IGlmIHRoZXJlcyBhIGNsaWNrIGFueXdoZXJlIG9uIHNjcmVlbiBleGNlcHQgaW4gdGhlIGpvaW4gY2hhbm5lbCBkaXZcclxuICAgICAgICB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKTtcclxuICAgICAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBqb2luIGNoYW5uZWwgYnV0dG9uIGFnYWluXHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gZG9udCBoaWRlIGlmIHRoZSBjbGljayBpcyBpbiB0aGUgam9pbiBjaGFubmVsIGRpdlxyXG4gICAgICAgIHRoaXMuY2xpY2tKb2luQ0hhbm5lbEZvcm0gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKTtcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tKb2luQ0hhbm5lbEZvcm0pO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG4gICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIC8vIGxpc3RlbiBmb3IgZW50ZXIga2V5XHJcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgIC8vIGpvaW4gY2hhbm5lbFxyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0aGlzLCBldmVudC50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0oKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoc29ja2V0Q29uZmlnLmFkZHJlc3MpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJDb3VsZCBub3QgY29ubmVjdFwiKSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY2hhbm5lbCBpbiB0aGlzLmNoYW5uZWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsc1ttZXNzYWdlLmNoYW5uZWxdLnByaW50TWVzc2FnZShtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbihjaGFubmVsLCB0ZXh0KSB7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcclxuICAgICAgICBkYXRhOiB0ZXh0LFxyXG4gICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXJuYW1lLFxyXG4gICAgICAgIGNoYW5uZWw6IGNoYW5uZWwsXHJcbiAgICAgICAga2V5OiBzb2NrZXRDb25maWcua2V5XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7XHJcbiAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZXJyb3IpO1xyXG4gICAgfSk7XHJcblxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xvc2VDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCkge1xyXG4gICAgZGVsZXRlIHRoaXMuY2hhbm5lbHNbY2hhbm5lbC5uYW1lXTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5yZW1vdmVDaGlsZCh0aGlzLmFwcFdpbmRvdy5lbGVtZW50KTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSB0YXNrYmFyXHJcbiAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZCAudGFza2JhclwiKS5yZW1vdmVDaGlsZCh0aGlzLnRhc2tiYXJBcHAuZWxlbWVudCk7XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xyXG4iLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgXCJhZGRyZXNzXCI6IFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIixcclxuICBcImtleVwiOiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcclxufVxyXG4iLCJ2YXIgSW1hZ2UgPSByZXF1aXJlKFwiLi9JbWFnZVwiKTtcclxudmFyIGtleWJvYXJkID0gcmVxdWlyZShcIi4va2V5Ym9hcmRcIik7XHJcblxyXG5mdW5jdGlvbiBzaHVmZmxlKGJvYXJkKSB7XHJcbiAgICB2YXIgaTtcclxuICAgIHZhciByYW5kb21JbmRleDtcclxuICAgIHZhciBiYWNrSW5kZXg7XHJcblxyXG4gICAgLy8gbW92ZSB0aHJvdWdoIHRoZSBkZWNrIG9mIGNhcmRzIGZyb20gdGhlIGJhY2sgdG8gZnJvbnRcclxuICAgIGZvciAoaSA9IGJvYXJkLmltYWdlQXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xyXG4gICAgICAgIC8vcGljayBhIHJhbmRvbSBjYXJkIGFuZCBzd2FwIGl0IHdpdGggdGhlIGNhcmQgZnVydGhlc3QgYmFjayBvZiB0aGUgdW5zaHVmZmxlZCBjYXJkc1xyXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XHJcbiAgICAgICAgYmFja0luZGV4ID0gYm9hcmQuaW1hZ2VBcnJheVtpXTtcclxuICAgICAgICBib2FyZC5pbWFnZUFycmF5W2ldID0gYm9hcmQuaW1hZ2VBcnJheVtyYW5kb21JbmRleF07XHJcbiAgICAgICAgYm9hcmQuaW1hZ2VBcnJheVtyYW5kb21JbmRleF0gPSBiYWNrSW5kZXg7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEJvYXJkKHB3ZCwgY29sdW1ucywgcm93cykge1xyXG4gICAgdGhpcy5wd2QgPSBwd2Q7XHJcblxyXG4gICAgLy8gVE9ETzogdmVyaWZ5IHdpZHRoL2hlaWdodFxyXG4gICAgdGhpcy5yb3dzID0gcm93cztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnM7XHJcbiAgICB0aGlzLmltYWdlU2l6ZSA9IDExMDtcclxuICAgIHRoaXMuYXR0ZW1wdHMgPSAwO1xyXG4gICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5rZXlib2FyZFNlbGVjdCA9IHtcclxuICAgICAgICB4OiAwLFxyXG4gICAgICAgIHk6IDBcclxuICAgIH07XHJcblxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXdyYXBwZXJcIik7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCkuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgMSk7XHJcblxyXG4gICAgLy8gQXR0ZW1wdHMgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnktYXR0ZW1wdHNcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICB0aGlzLmF0dGVtcHRzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC5tZW1vcnktYXR0ZW1wdHNcIik7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWJvYXJkXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5jb2x1bW5zICogdGhpcy5pbWFnZVNpemUgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubWluV2lkdGggPSB0aGlzLmNvbHVtbnMgKiB0aGlzLmltYWdlU2l6ZSArIFwicHhcIjtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRoaXMud3JhcHBlckVsZW1lbnQpO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG5cclxuICAgIC8vY3JlYXRlIGFycmF5IG9mIGltYWdlc1xyXG4gICAgdGhpcy5pbWFnZUFycmF5ID0gW107XHJcbiAgICB2YXIgZG9jZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb2x1bW5zICogdGhpcy5yb3dzOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgbmV3SW1hZ2UgPSBuZXcgSW1hZ2UoTWF0aC5mbG9vcihpIC8gMikgKyAxLCBpLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmltYWdlQXJyYXkucHVzaChuZXdJbWFnZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNodWZmbGUodGhpcyk7XHJcblxyXG4gICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICBkb2NmcmFnLmFwcGVuZENoaWxkKGltYWdlLmVsZW1lbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY2ZyYWcpO1xyXG5cclxuICAgIC8vaGFuZGxlIGNsaWNrc1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIC8vcmVtb3ZlIGtleWJvYXJkIHNlbGVjdCBvdXRsaW5lXHJcbiAgICAgICAga2V5Ym9hcmQucmVtb3ZlT3V0bGluZSh0aGlzKTtcclxuICAgICAgICB2YXIgY2xpY2tlZElkID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtaWRcIik7XHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICAgICAgaWYgKGNsaWNrZWRJZCA9PSBpbWFnZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UuY2xpY2sodGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy9oYW5kbGUga2V5Ym9hcmRcclxuICAgIGtleWJvYXJkLmhhbmRsZUlucHV0KHRoaXMpO1xyXG5cclxuICAgIHRoaXMuc3RhcnRHYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5hdHRlbXB0cyA9IDA7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL2ZsaXAgaW1hZ2VzXHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICAgICAgaW1hZ2UuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCgnaW1hZ2UvYXBwcy9tZW1vcnkvMC5wbmcnKVwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb2FyZDtcclxuIiwidmFyIGtleWJvYXJkID0gcmVxdWlyZShcIi4va2V5Ym9hcmRcIik7XHJcblxyXG5mdW5jdGlvbiBJbWFnZShpbWFnZU51bWJlciwgaWQsIGJvYXJkKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktaW1hZ2VcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pbWFnZW51bWJlclwiLCBpbWFnZU51bWJlcik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBpZCk7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmltYWdlTnVtYmVyID0gaW1hZ2VOdW1iZXI7XHJcbiAgICB0aGlzLmJvYXJkID0gYm9hcmQ7XHJcbiAgICB0aGlzLmNsaWNrYWJsZSA9IHRydWU7XHJcbn1cclxuXHJcbkltYWdlLnByb3RvdHlwZS5jbGljayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmICh0aGlzLmNsaWNrYWJsZSkge1xyXG4gICAgICAgIHRoaXMuY2xpY2thYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93KCk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5ib2FyZC5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnNlbGVjdGVkID0gdGhpcztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIF9zZWxlY3RlZCA9IHRoaXMuYm9hcmQuc2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuYXR0ZW1wdHMgKz0gMTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuYXR0ZW1wdHNEaXYudGV4dENvbnRlbnQgPSBcIkF0dGVtcHRzOiBcIiArIHRoaXMuYm9hcmQuYXR0ZW1wdHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLnNlbGVjdGVkLmltYWdlTnVtYmVyID09PSB0aGlzLmltYWdlTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBtYXRjaFxyXG4gICAgICAgICAgICAgICAga2V5Ym9hcmQucmVtb3ZlT3V0bGluZSh0aGlzLmJvYXJkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWdyZWVuXCIpO1xyXG4gICAgICAgICAgICAgICAgX3NlbGVjdGVkLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1ncmVlblwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbm90IGEgbWF0Y2hcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLmNsaWNrYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGlja2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkltYWdlLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5LzAucG5nJylcIjtcclxufTtcclxuXHJcbkltYWdlLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5L1wiICsgdGhpcy5pbWFnZU51bWJlciArIFwiLnBuZycpXCI7XHJcbn07XHJcblxyXG5JbWFnZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1mYWRlLW91dFwiKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2U7IiwidmFyIFB3ZEFwcCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9Qd2RBcHBcIik7XHJcbnZhciBCb2FyZCA9IHJlcXVpcmUoXCIuL0JvYXJkLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5KGNvbmZpZykge1xyXG4gICAgUHdkQXBwLmNhbGwodGhpcywgY29uZmlnKTtcclxuXHJcbiAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKHRoaXMsIDQsMyk7XHJcbiAgICB0aGlzLmJvYXJkLnN0YXJ0R2FtZSgpO1xyXG59XHJcblxyXG5NZW1vcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQd2RBcHAucHJvdG90eXBlKTtcclxuTWVtb3J5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbW9yeTtcclxuTWVtb3J5LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gcmVtb3ZlIHRoZSBncmFwaGljc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikucmVtb3ZlQ2hpbGQodGhpcy5hcHBXaW5kb3cuZWxlbWVudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gdGFza2JhclxyXG4gICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2QgLnRhc2tiYXJcIikucmVtb3ZlQ2hpbGQodGhpcy50YXNrYmFyQXBwLmVsZW1lbnQpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnk7XHJcbiIsImZ1bmN0aW9uIHJlbW92ZU91dGxpbmUoYm9hcmQpIHtcclxuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCArIFwiIC5tZW1vcnkta2V5Ym9hcmRTZWxlY3RcIikpIHtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCArIFwiIC5tZW1vcnkta2V5Ym9hcmRTZWxlY3RcIikuY2xhc3NMaXN0LnJlbW92ZShcIm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2VsZWN0KGJvYXJkKSB7XHJcbiAgICByZW1vdmVPdXRsaW5lKGJvYXJkKTtcclxuICAgIHZhciBzZWxlY3RlZCA9IGJvYXJkLmtleWJvYXJkU2VsZWN0LnggKyBib2FyZC5rZXlib2FyZFNlbGVjdC55ICogYm9hcmQuY29sdW1ucztcclxuICAgIGJvYXJkLmltYWdlQXJyYXlbc2VsZWN0ZWRdLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlSW5wdXQoYm9hcmQpIHtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYm9hcmQucHdkLmlkKS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBrZXkgPSBlLmtleUNvZGUgPyBlLmtleUNvZGUgOiBlLndoaWNoO1xyXG4gICAgICAgIGlmIChrZXkgPT09IDM3KSB7XHJcbiAgICAgICAgICAgIC8vbGVmdFxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmtleWJvYXJkU2VsZWN0LnggLT0gMTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZSBpZiAoa2V5ID09PSAzOCkge1xyXG4gICAgICAgICAgICAvL3VwXHJcbiAgICAgICAgICAgIGlmIChib2FyZC5rZXlib2FyZFNlbGVjdC55ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQua2V5Ym9hcmRTZWxlY3QueSAtPSAxO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0KGJvYXJkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNlIGlmIChrZXkgPT09IDM5KSB7XHJcbiAgICAgICAgICAgIC8vcmlnaHRcclxuICAgICAgICAgICAgaWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnggPCBib2FyZC5jb2x1bW5zIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQua2V5Ym9hcmRTZWxlY3QueCArPSAxO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0KGJvYXJkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSA0MCkge1xyXG4gICAgICAgICAgICAvL2Rvd25cclxuICAgICAgICAgICAgaWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgPCBib2FyZC5yb3dzIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQua2V5Ym9hcmRTZWxlY3QueSArPSAxO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0KGJvYXJkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAzMikge1xyXG4gICAgICAgICAgICAvL3NwYWNlXHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IGJvYXJkLmtleWJvYXJkU2VsZWN0LnggKyBib2FyZC5rZXlib2FyZFNlbGVjdC55ICogYm9hcmQuY29sdW1ucztcclxuICAgICAgICAgICAgYm9hcmQuaW1hZ2VBcnJheVtzZWxlY3RlZF0uY2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9LCB0cnVlKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuaGFuZGxlSW5wdXQgPSBoYW5kbGVJbnB1dDtcclxubW9kdWxlLmV4cG9ydHMucmVtb3ZlT3V0bGluZSA9IHJlbW92ZU91dGxpbmU7XHJcbiJdfQ==
