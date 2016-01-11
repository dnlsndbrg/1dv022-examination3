(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AppMenuItem = require("./AppMenuItem");

function AppMenu(menuElement, menuName, menuItems) {
    this.menuElement = menuElement;

    var template = document.querySelector("#window-menu-container");
    var clone = document.importNode(template.content, true);
    menuElement.appendChild(clone);
    this.container = menuElement.lastElementChild;
    this.container.lastElementChild.textContent = menuName;

    this.menuItems = [];

    // populate menu
    menuItems.forEach(function(item) {
        // var template = document.querySelector("#window-menu-item");
        // var clone = document.importNode(template.content, true);
        // this.container.appendChild(clone);
        // container.lastElementChild.textContent = item.name;

        // this.menuItems.push(new AppMenuItem(item));
    });
}

module.exports = AppMenu;

},{"./AppMenuItem":2}],2:[function(require,module,exports){
function AppMenuItem(item) {


	var newMenuItem = container.lastElementChild;
	newMenuItem.addEventListener("click", function() {
	    console.log("aa")   
	})
}

module.exports = AppMenuItem;
},{}],3:[function(require,module,exports){
var ResizeWindowWidth = require("./ResizeWindowWidth");
var ResizeWindowHeight = require("./ResizeWindowHeight");
var ResizeWindowWidthHeight = require("./ResizeWindowWidthHeight");

/**
 * AppWindow Constructor. This object handles the graphics and all related events such as resizing, maximizing, closing etc.
 * @param {object} config - it takes the app config as an argument
 */
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

/**
 * user has hast started to drag the window bar
 * @param  {object} event - the click handler event object
 */
AppWindow.prototype.startDrag = function(event) {
    this.pwd.mouse.draggedObject = this;
    this.pwd.mouse.dragOffsetX = this.element.offsetLeft - event.pageX;
    this.pwd.mouse.dragOffsetY = this.element.offsetTop - event.pageY;
    this.element.classList.add("dragging");
};

/**
 * user is dragging an app window
 * @param  {object} event - the mousemove event object
 */
AppWindow.prototype.drag = function(event) {
    this.x = event.pageX + this.pwd.mouse.dragOffsetX;
    this.y = event.pageY + this.pwd.mouse.dragOffsetY;
    this.checkBounds(event);
    this.element.style.left =  this.x + "px";
    this.element.style.top = this.y + "px";
};

/**
 * checks that a dragged window isnt dragged off screen
 * @param  {object} event - the mousemove event object
 */
AppWindow.prototype.checkBounds = function(event) {
    if (event.pageX > this.pwd.width) {
        this.x = this.pwd.width + this.pwd.mouse.dragOffsetX;
    }

    if (event.pageY > this.pwd.height) {
        this.y = this.pwd.height + this.pwd.mouse.dragOffsetY;
    }
    else if (event.pageY < 1) {
        this.y = this.pwd.mouse.dragOffsetY;
    }
};

/**
 * user has stopp dragging
 */
AppWindow.prototype.stopDrag = function() {
    this.element.classList.remove("dragging");
};

/**
 * position this window in front of other windows
 */
AppWindow.prototype.moveToTop = function() {
    this.pwd.lastZIndex += 1;
    this.element.style.zIndex = this.pwd.lastZIndex;
};

/**
 * close this window
 */
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

/**
 * make the window fullscreen
 */
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

/**
 * bring the window from fullscreen back to previous size
 */
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

/**
 * minimize this window
 */
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

/**
 * handle double clicks on the window bar
 */
AppWindow.prototype.dblclick = function() {
    if (this.minimized) {
        this.minimize();
    } else if (this.maximized) {
        this.restore();
    } else {
        this.maximize();
    }
};

/**
 * add css animations for 100ms and then remove it so it wont interfer with dragging behaviour
 */
AppWindow.prototype.animate = function() {
    // add animation class
    this.element.classList.add("window-animated");
    setTimeout(function() {
        this.element.classList.remove("window-animated");
    }.bind(this), 100);
};

module.exports = AppWindow;

},{"./ResizeWindowHeight":6,"./ResizeWindowWidth":7,"./ResizeWindowWidthHeight":8}],4:[function(require,module,exports){
/**
 * Mouse
 */
function Mouse(){
    this.draggedObject = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    /**
    * on mouseup event check if a window is being dragged
    * @param  {[type]} e - mouseup event object
    */
    this.mouseup = function(event) {
        if (this.draggedObject !== null) {
            this.draggedObject.stopDrag(event);
            this.draggedObject = null;
        }
    };

    /**
     * whenever mouse is moved
     * @param  {object} event - mousemove event objectn]
     */
    this.mousemove = function(event) {
        if (this.draggedObject !== null) {
            this.draggedObject.drag(event);
        }
    };

    document.addEventListener("mouseup", this.mouseup.bind(this));
    document.addEventListener("mousemove", this.mousemove.bind(this));

    return this;
}

module.exports = Mouse;

},{}],5:[function(require,module,exports){
var AppWindow = require("./AppWindow");
var AppMenu = require("./AppMenu");

function PwdApp(config) {
    this.title = config.title;
    this.width = config.width;
    this.height = config.height;
    this.id = config.id;
    config.width = this.width;
    config.height = this.height;
    config.title = this.title;
    this.appWindow = new AppWindow(config);
}

module.exports = PwdApp;

},{"./AppMenu":1,"./AppWindow":3}],6:[function(require,module,exports){
/**
 * App window resizer Constructor
 * This is a small element on the bottom of app windows. it can be dragged up and down to resize the height of app windows
 * @param {object} appWindow - what window to resize
 */
function ResizeWindowHeight(appWindow) {
    this.appWindow = appWindow;
    this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-y");
    this.resizeThis = document.querySelector("#window-" + this.appWindow.id + " .window-content-wrapper");
    this.element.addEventListener("mousedown", this.startDrag.bind(this));
}

/**
 * resizer drag is started
 */
ResizeWindowHeight.prototype.startDrag = function() {
    this.appWindow.pwd.mouse.draggedObject = this;
    this.appWindow.pwd.mouse.dragOffsetY = this.element.offsetTop + this.appWindow.element.offsetTop + this.appWindow.titleBarHeight - event.pageY;
};

/**
 * resizer is dragged
 * @param  {[type]} event - mousemove event object
 */
ResizeWindowHeight.prototype.drag = function(event) {
    this.resizeThis.style.height = (event.pageY - this.appWindow.y - this.appWindow.pwd.mouse.dragOffsetY) + "px";
};

/**
 * resizer drag stopped
*/
ResizeWindowHeight.prototype.stopDrag = function() {

};

module.exports = ResizeWindowHeight;

},{}],7:[function(require,module,exports){
/**
 * App window width resizer Constructor
 * This is a small element on the right side of app windows. it can be dragged left and right to resize the width of app windows
 * @param {object} appWindow - what window to resize
 */
function ResizeWindowWidth(appWindow) {
    this.appWindow = appWindow;
    this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-x");
    this.resizeThis = document.querySelector("#window-" + this.appWindow.id);
    this.element.addEventListener("mousedown", this.startDrag.bind(this));
}

/**
 * drag is started
 * @param  {object} event mouse click event handler object
 * @return {[type]}   [description]
 */
ResizeWindowWidth.prototype.startDrag = function(event) {
    this.appWindow.pwd.mouse.draggedObject = this;

    //drag from exactly where the click is
    this.appWindow.pwd.mouse.dragOffsetX = this.element.offsetLeft + this.element.clientWidth + this.appWindow.element.offsetLeft - event.pageX;
};

/**
 * width resizer is dragged
 * @param  {object} event - mousemove event object
 */
ResizeWindowWidth.prototype.drag = function(event) {
    this.resizeThis.style.width = (event.pageX - this.appWindow.x + this.appWindow.pwd.mouse.dragOffsetX) + "px";
};

ResizeWindowWidth.prototype.stopDrag = function() {

};

module.exports = ResizeWindowWidth;

},{}],8:[function(require,module,exports){
/**
 * App window resizer Constructor
 * This controls both width and height resizing of an app window. its element is a small square at the bottom left corner of its app window
 * @param {object} appWindow - what window to resize
 */
function ResizeWindowWidthHeight(appWindow) {
    this.appWindow = appWindow;
    this.element = document.querySelector("#window-" + appWindow.id + " .window-resizer-xy");
    this.resizeThis = document.querySelector("#window-" + this.appWindow.id + " .window-content-wrapper");
    this.element.addEventListener("mousedown", this.startDrag.bind(this));
}

/**
 * resizer drag is started
 */
ResizeWindowWidthHeight.prototype.startDrag = function(event) {
    this.appWindow.pwd.mouse.draggedObject = this;

    // this element has no offsetTop so instead we use window-resizer-height's offsetTop value
    this.appWindow.pwd.mouse.dragOffsetY = this.element.parentElement.offsetTop + this.appWindow.element.offsetTop + this.appWindow.titleBarHeight - event.pageY;
    this.appWindow.pwd.mouse.dragOffsetX = this.element.offsetLeft + this.element.clientWidth + this.appWindow.element.offsetLeft - event.pageX;
    event.stopPropagation(); // this click shouldnt go through to the parent which is the height-resizer
};

/** 
 * width&height resizer is being dragged 
*/
ResizeWindowWidthHeight.prototype.drag = function(e) {
    this.appWindow.resizeWindowHeight.drag(e);
    this.appWindow.resizeWindowWidth.drag(e);
};

ResizeWindowWidthHeight.prototype.stopDrag = function() {

};

module.exports = ResizeWindowWidthHeight;

},{}],9:[function(require,module,exports){
/**
 * constructor for a desktop app shortcut
 * @param {object} config - app config
 * @param {object} pwd - a reference to the pwd
 */
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
    this.element.addEventListener("dblclick", function() {
        this.pwd.startApp(this.config);
    }.bind(this));
}

module.exports = Shortcut;

},{}],10:[function(require,module,exports){
var Mouse = require("./Mouse");
var Shortcut = require("./Shortcut");
var appList = require("./appList");


/**
 * Personal Web Desktop
 */
var Pwd = function() {
    this.mouse = new Mouse();
    this.installedApps = [];
    this.startedApps = {};
    this.lastZIndex = 1;
    this.lastID = 1;
    this.fullscreenedWindow = null;

    /**
     * create shortcuts for all available apps
     */
    this.installApps = function() {
        for (var app in appList) {
            this.installedApps.push(new Shortcut(appList[app], this));
        }
    };

    /**
     * When the user clicks an app shortcut this function will start the app
     * @param  {object} config - contains app settings. The configuration comes from appList.js
     */
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

    /**
     * Calculate where new apps should appear on the screen
     * @param  {object} config - contains the  apps standard width and height
     */
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

    /**
     * Close an app
     * @param  {object} app
     */
    this.closeApp = function(app) {
        this.startedApps[app.id].close();
        delete this.startedApps[app.id];
    };

    /**
     * Browser resize
     */
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

},{"./Mouse":4,"./Shortcut":9,"./appList":11}],11:[function(require,module,exports){
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
};


},{"./apps/chat/app":13,"./apps/memory/app":17}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
var PwdApp = require("../../../js/PwdApp");
var socketConfig = require("./socketConfig.json");
var Channel = require("./Channel");

/**
 * Chat constructor
 * @param {Object} config - app configuration object
 */
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

/**
 * enter username
 */
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
                if (textInput.value.length > 0) {
                    resolve(textInput.value);
                }
            }.bind(this));

            textInput.addEventListener("keypress", function(event) {
                if (event.keyCode === 13) {
                    if (textInput.value.length > 0) {
                        resolve(textInput.value);
                    }
                }
            }.bind(this));

        }.bind(this)
    );
};

/**
 * create chat channel html
 */
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

},{"../../../js/PwdApp":5,"./Channel":12,"./socketConfig.json":14}],14:[function(require,module,exports){
module.exports={
  "address": "ws://vhost3.lnu.se:20080/socket/",
  "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}],15:[function(require,module,exports){
var Image = require("./Image");
var keyboard = require("./keyboard");

/**
 * shuffle the array of images
 * @param  {object} board - reference to the board
 */
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

/** 
 * Board 
 * @param {object} pwd - pwd reference
 * @param {number} columns - how many columns wide the memory game should me
 * @param {number} rows - how many rows
 */
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

    // menu
    this.menuElement = document.querySelector("#window-" + this.pwd.id + " .window-menu");

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

    this.settings = function() {

    };

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

},{"./Image":16,"./keyboard":18}],16:[function(require,module,exports){
var keyboard = require("./keyboard");

/**
 * image constructor
 * @param {Number} imageNumber
 * @param {Number} id
 * @param {Object} board
 */
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

/**
 * handle clicks
 */
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

/**
 * flip back the image
 */
Image.prototype.hide = function() {
    this.element.style.backgroundImage = "url('image/apps/memory/0.png')";
};

/** 
 * reveal image
 */
Image.prototype.show = function() {
    this.element.style.backgroundImage = "url('image/apps/memory/" + this.imageNumber + ".png')";
};

/** 
 * remove image
 */
Image.prototype.remove = function() {
    this.element.classList.add("memory-fade-out");
};

module.exports = Image;
},{"./keyboard":18}],17:[function(require,module,exports){
var PwdApp = require("../../../js/PwdApp");
var Board = require("./Board.js");
var AppMenu = require("../../../js/AppMenu");

/**
 * Memory app constructor
 * @param {object} config - app config object
 */
function Memory(config) {
    PwdApp.call(this, config);
    this.board = new Board(this, 4,3);
    
    // this.menu = new AppMenu(this.board.menuElement, "File", [
    //     {
    //         name: "Settings",
    //         action: this.board.settings
    //     },
    //     {
    //         name: "New game",
    //         action: this.board.startGame
    //     }]
    // );
    this.board.startGame();
}

Memory.prototype = Object.create(PwdApp.prototype);
Memory.prototype.constructor = Memory;

/**
 * when the settings menu is clicked
 */
Memory.prototype.settings = function() {
    console.log("show settings");
};

/** 
 * when the app is closing
 */
Memory.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);
};

module.exports = Memory;

},{"../../../js/AppMenu":1,"../../../js/PwdApp":5,"./Board.js":15}],18:[function(require,module,exports){
/**
 * remove the outline from selected memory image
 * @param  {object} board - board reference
 */
function removeOutline(board) {
    if (document.querySelector("#window-" + board.pwd.id + " .memory-keyboardSelect")) {
        document.querySelector("#window-" + board.pwd.id + " .memory-keyboardSelect").classList.remove("memory-keyboardSelect");
    }
}

/** 
 * select an image
 * @param  {object} board
 */
function select(board) {
    removeOutline(board);
    var selected = board.keyboardSelect.x + board.keyboardSelect.y * board.columns;
    board.imageArray[selected].element.classList.add("memory-keyboardSelect");
}

/** 
* Capture keyboard presses and use it to select memory cards
* @param  {object} board
 */
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

},{}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwTWVudS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwTWVudUl0ZW0uanMiLCJjbGllbnQvc291cmNlL2pzL0FwcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTW91c2UuanMiLCJjbGllbnQvc291cmNlL2pzL1B3ZEFwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvUmVzaXplV2luZG93SGVpZ2h0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aC5qcyIsImNsaWVudC9zb3VyY2UvanMvUmVzaXplV2luZG93V2lkdGhIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Nob3J0Y3V0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcExpc3QuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9DaGFubmVsLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2NoYXQvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2NoYXQvc29ja2V0Q29uZmlnLmpzb24iLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L0JvYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9JbWFnZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9tZW1vcnkvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9rZXlib2FyZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQXBwTWVudUl0ZW0gPSByZXF1aXJlKFwiLi9BcHBNZW51SXRlbVwiKTtcclxuXHJcbmZ1bmN0aW9uIEFwcE1lbnUobWVudUVsZW1lbnQsIG1lbnVOYW1lLCBtZW51SXRlbXMpIHtcclxuICAgIHRoaXMubWVudUVsZW1lbnQgPSBtZW51RWxlbWVudDtcclxuXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1tZW51LWNvbnRhaW5lclwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBtZW51RWxlbWVudC5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IG1lbnVFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICB0aGlzLmNvbnRhaW5lci5sYXN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gbWVudU5hbWU7XHJcblxyXG4gICAgdGhpcy5tZW51SXRlbXMgPSBbXTtcclxuXHJcbiAgICAvLyBwb3B1bGF0ZSBtZW51XHJcbiAgICBtZW51SXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgLy8gdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctbWVudS1pdGVtXCIpO1xyXG4gICAgICAgIC8vIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICAgICAgLy8gdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gICAgICAgIC8vIGNvbnRhaW5lci5sYXN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gaXRlbS5uYW1lO1xyXG5cclxuICAgICAgICAvLyB0aGlzLm1lbnVJdGVtcy5wdXNoKG5ldyBBcHBNZW51SXRlbShpdGVtKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcHBNZW51O1xyXG4iLCJmdW5jdGlvbiBBcHBNZW51SXRlbShpdGVtKSB7XHJcblxyXG5cclxuXHR2YXIgbmV3TWVudUl0ZW0gPSBjb250YWluZXIubGFzdEVsZW1lbnRDaGlsZDtcclxuXHRuZXdNZW51SXRlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblx0ICAgIGNvbnNvbGUubG9nKFwiYWFcIikgICBcclxuXHR9KVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwcE1lbnVJdGVtOyIsInZhciBSZXNpemVXaW5kb3dXaWR0aCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd1dpZHRoXCIpO1xyXG52YXIgUmVzaXplV2luZG93SGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93SGVpZ2h0XCIpO1xyXG52YXIgUmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aEhlaWdodFwiKTtcclxuXHJcbi8qKlxyXG4gKiBBcHBXaW5kb3cgQ29uc3RydWN0b3IuIFRoaXMgb2JqZWN0IGhhbmRsZXMgdGhlIGdyYXBoaWNzIGFuZCBhbGwgcmVsYXRlZCBldmVudHMgc3VjaCBhcyByZXNpemluZywgbWF4aW1pemluZywgY2xvc2luZyBldGMuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBpdCB0YWtlcyB0aGUgYXBwIGNvbmZpZyBhcyBhbiBhcmd1bWVudFxyXG4gKi9cclxuZnVuY3Rpb24gQXBwV2luZG93KGNvbmZpZykge1xyXG4gICAgdGhpcy5pZCA9IGNvbmZpZy5pZDtcclxuICAgIHRoaXMucHdkID0gY29uZmlnLnB3ZDtcclxuICAgIHRoaXMud2lkdGggPSBjb25maWcud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQ7XHJcbiAgICB0aGlzLnggPSBjb25maWcueDtcclxuICAgIHRoaXMueSA9IGNvbmZpZy55O1xyXG4gICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMubWF4aW1pemVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBXaW5kb3dcIikuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgLy8gZGVmaW5lIHRoaXMuZWxlbWVudFxyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuXHJcbiAgICAvLyBzZXQgaWRcclxuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcIndpbmRvdy1cIiArIHRoaXMuaWQpO1xyXG5cclxuICAgIC8vIGRlZmluZSB0aGlzLndyYXBwZXJFbGVtZW50XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcblxyXG4gICAgLy8gc2V0IHdpbmRvdyBiYXIgaWNvblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmZhXCIpLmNsYXNzTGlzdC5hZGQoY29uZmlnLmljb24pO1xyXG5cclxuICAgIC8vIHNldCB3aW5kb3cgYmFyIHRpdGxlXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhci10aXRsZVwiKS50ZXh0Q29udGVudCA9IGNvbmZpZy50aXRsZTtcclxuXHJcbiAgICAvLyBzZXQgcG9zaXRpb24gYW5kIHNpemVcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gY29uZmlnLnggKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gY29uZmlnLnkgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gY29uZmlnLnpJbmRleDtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IGNvbmZpZy53aWR0aCArIFwicHhcIjtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gY29uZmlnLmhlaWdodCAgKyBcInB4XCI7XHJcbiAgICB0aGlzLnRpdGxlQmFySGVpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuc2Nyb2xsSGVpZ2h0OyAvLyB1c2VkIGZvciBkcmFnIHJlemlzaW5nXHJcbiAgICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoKHRoaXMpO1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dIZWlnaHQgPSBuZXcgUmVzaXplV2luZG93SGVpZ2h0KHRoaXMpO1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dXaWR0aEhlaWdodCA9IG5ldyBSZXNpemVXaW5kb3dXaWR0aEhlaWdodCh0aGlzKTtcclxuICAgIHRoaXMuY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKTtcclxuXHJcbiAgICAvLyBwdXQgb24gdG9wIGlmIGNsaWNrZWRcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW92ZVRvVG9wLmJpbmQodGhpcyksIHRydWUpO1xyXG5cclxuICAgIC8vIGRyYWcgdGhlIHdpbmRvdyBmcm9tIHRoZSB3aW5kb3cgYmFyXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIGRvdWJsZSBjbGljayB3aW5kb3cgYmFyXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgdGhpcy5kYmxjbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBjbG9zZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNsb3NlLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBtYXhpbWl6ZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1heGltaXplLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tYXhpbWl6ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyByZXN0b3JlIGV2ZW50XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMucmVzdG9yZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBtaW5pbWl6ZVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1pbmltaXplLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5taW5pbWl6ZS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHVzZXIgaGFzIGhhc3Qgc3RhcnRlZCB0byBkcmFnIHRoZSB3aW5kb3cgYmFyXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSB0aGUgY2xpY2sgaGFuZGxlciBldmVudCBvYmplY3RcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gICAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCAtIGV2ZW50LnBhZ2VYO1xyXG4gICAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wIC0gZXZlbnQucGFnZVk7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyYWdnaW5nXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHVzZXIgaXMgZHJhZ2dpbmcgYW4gYXBwIHdpbmRvd1xyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gdGhlIG1vdXNlbW92ZSBldmVudCBvYmplY3RcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnggPSBldmVudC5wYWdlWCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gICAgdGhpcy55ID0gZXZlbnQucGFnZVkgKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICAgIHRoaXMuY2hlY2tCb3VuZHMoZXZlbnQpO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSAgdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBjaGVja3MgdGhhdCBhIGRyYWdnZWQgd2luZG93IGlzbnQgZHJhZ2dlZCBvZmYgc2NyZWVuXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSB0aGUgbW91c2Vtb3ZlIGV2ZW50IG9iamVjdFxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5jaGVja0JvdW5kcyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQucGFnZVggPiB0aGlzLnB3ZC53aWR0aCkge1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMucHdkLndpZHRoICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFg7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGV2ZW50LnBhZ2VZID4gdGhpcy5wd2QuaGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wd2QuaGVpZ2h0ICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChldmVudC5wYWdlWSA8IDEpIHtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiB1c2VyIGhhcyBzdG9wcCBkcmFnZ2luZ1xyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2luZ1wiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBwb3NpdGlvbiB0aGlzIHdpbmRvdyBpbiBmcm9udCBvZiBvdGhlciB3aW5kb3dzXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1vdmVUb1RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wd2QubGFzdFpJbmRleCArPSAxO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMucHdkLmxhc3RaSW5kZXg7XHJcbn07XHJcblxyXG4vKipcclxuICogY2xvc2UgdGhpcyB3aW5kb3dcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYW5pbWF0ZSgpO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAwO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIDIwICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy53aWR0aCAtIDEwMCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgNTAgKyBcInB4XCI7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHdkLmNsb3NlQXBwKHRoaXMpO1xyXG4gICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIG1ha2UgdGhlIHdpbmRvdyBmdWxsc2NyZWVuXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1heGltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IHRydWU7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuXHJcbiAgICAvLyBzYXZlIHRoZSBzaXplIGFuZCBwb3NpdGlvbiBzbyB3ZSBjYW4gcmV0dXJuIHRvIGl0IHdpdGggdGhlIHJlc3RvcmUgd2luZG93IGZ1bmN0aW9uXHJcbiAgICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gICAgdGhpcy5sYXN0WSA9IHRoaXMueTtcclxuICAgIHRoaXMubGFzdFdpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMubGFzdEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIC8vIHRlbGwgcHdkIHRoaXMgd2luZG93IGlzIGluIGZ1bGxzY3JlZW4gKGluIGNhc2Ugb2YgYnJvd3NlciByZXNpemluZylcclxuICAgIHRoaXMucHdkLmZ1bGxzY3JlZW5lZFdpbmRvdyA9IHRoaXM7XHJcblxyXG4gICAgLy8gbWFrZSB0aGUgd2luZG93IGZ1bGxzY3JlZW5cclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5wd2Qud2lkdGggKyBcInB4XCI7XHJcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5wd2QuaGVpZ2h0IC0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XHJcbiAgICB0aGlzLnggPSAwO1xyXG4gICAgdGhpcy55ID0gMDtcclxuXHJcbiAgICAvLyBoaWRlL3Nob3cgdGhlIG1heGltaXplIGFuZCByZXN0b3JlIHdpbmRvd2JhciBidXR0b25zXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAvLyBpZiBpdCBpcyBtYXhpbWl6ZWQgZnJvbSBhIG1pbmltaXplZCBzdGF0ZVxyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogYnJpbmcgdGhlIHdpbmRvdyBmcm9tIGZ1bGxzY3JlZW4gYmFjayB0byBwcmV2aW91cyBzaXplXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubWF4aW1pemVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgIHRoaXMueCA9IHRoaXMubGFzdFg7XHJcbiAgICB0aGlzLnkgPSB0aGlzLmxhc3RZO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5sYXN0V2lkdGggKyBcInB4XCI7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMubGFzdEhlaWdodCArIFwicHhcIjtcclxuXHJcbiAgICAvL3RlbGwgcHdkIHRoaXMgd2luZG93IGlzIG5vIGxvbmdlciBpbiBmdWxsc2NyZWVuIChpbiBjYXNlIG9mIGJyb3dzZXIgcmVzaXppbmcpXHJcbiAgICB0aGlzLnB3ZC5mdWxsc2NyZWVuZWRXaW5kb3cgPSBudWxsO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5yZXN0b3JlLXdpbmRvd1wiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgIC8vIGlmIGl0IGlzIHJlc3RvcmVkIGZyb20gYSBtaW5pbWl6ZWQgc3RhdGVcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIG1pbmltaXplIHRoaXMgd2luZG93XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1pbmltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICghdGhpcy5taW5pbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgICAgICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gICAgICAgIHRoaXMubGFzdFkgPSB0aGlzLnk7XHJcbiAgICAgICAgdGhpcy5sYXN0V2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IFwiMjAwcHhcIjtcclxuICAgICAgICB0aGlzLm1pbmltaXplZCA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xyXG4gICAgICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy5sYXN0WDtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLmxhc3RZO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMubGFzdFdpZHRoICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGhhbmRsZSBkb3VibGUgY2xpY2tzIG9uIHRoZSB3aW5kb3cgYmFyXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmRibGNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5taW5pbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLm1pbmltaXplKCk7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMubWF4aW1pemVkKSB7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubWF4aW1pemUoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBhZGQgY3NzIGFuaW1hdGlvbnMgZm9yIDEwMG1zIGFuZCB0aGVuIHJlbW92ZSBpdCBzbyBpdCB3b250IGludGVyZmVyIHdpdGggZHJhZ2dpbmcgYmVoYXZpb3VyXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGFkZCBhbmltYXRpb24gY2xhc3NcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2luZG93LWFuaW1hdGVkXCIpO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIndpbmRvdy1hbmltYXRlZFwiKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBwV2luZG93O1xyXG4iLCIvKipcclxuICogTW91c2VcclxuICovXHJcbmZ1bmN0aW9uIE1vdXNlKCl7XHJcbiAgICB0aGlzLmRyYWdnZWRPYmplY3QgPSBudWxsO1xyXG4gICAgdGhpcy5kcmFnT2Zmc2V0WCA9IDA7XHJcbiAgICB0aGlzLmRyYWdPZmZzZXRZID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICogb24gbW91c2V1cCBldmVudCBjaGVjayBpZiBhIHdpbmRvdyBpcyBiZWluZyBkcmFnZ2VkXHJcbiAgICAqIEBwYXJhbSAge1t0eXBlXX0gZSAtIG1vdXNldXAgZXZlbnQgb2JqZWN0XHJcbiAgICAqL1xyXG4gICAgdGhpcy5tb3VzZXVwID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5zdG9wRHJhZyhldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHdoZW5ldmVyIG1vdXNlIGlzIG1vdmVkXHJcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gbW91c2Vtb3ZlIGV2ZW50IG9iamVjdG5dXHJcbiAgICAgKi9cclxuICAgIHRoaXMubW91c2Vtb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5kcmFnKGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW91c2U7XHJcbiIsInZhciBBcHBXaW5kb3cgPSByZXF1aXJlKFwiLi9BcHBXaW5kb3dcIik7XHJcbnZhciBBcHBNZW51ID0gcmVxdWlyZShcIi4vQXBwTWVudVwiKTtcclxuXHJcbmZ1bmN0aW9uIFB3ZEFwcChjb25maWcpIHtcclxuICAgIHRoaXMudGl0bGUgPSBjb25maWcudGl0bGU7XHJcbiAgICB0aGlzLndpZHRoID0gY29uZmlnLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0O1xyXG4gICAgdGhpcy5pZCA9IGNvbmZpZy5pZDtcclxuICAgIGNvbmZpZy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICBjb25maWcuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICBjb25maWcudGl0bGUgPSB0aGlzLnRpdGxlO1xyXG4gICAgdGhpcy5hcHBXaW5kb3cgPSBuZXcgQXBwV2luZG93KGNvbmZpZyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHdkQXBwO1xyXG4iLCIvKipcclxuICogQXBwIHdpbmRvdyByZXNpemVyIENvbnN0cnVjdG9yXHJcbiAqIFRoaXMgaXMgYSBzbWFsbCBlbGVtZW50IG9uIHRoZSBib3R0b20gb2YgYXBwIHdpbmRvd3MuIGl0IGNhbiBiZSBkcmFnZ2VkIHVwIGFuZCBkb3duIHRvIHJlc2l6ZSB0aGUgaGVpZ2h0IG9mIGFwcCB3aW5kb3dzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcHBXaW5kb3cgLSB3aGF0IHdpbmRvdyB0byByZXNpemVcclxuICovXHJcbmZ1bmN0aW9uIFJlc2l6ZVdpbmRvd0hlaWdodChhcHBXaW5kb3cpIHtcclxuICAgIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKTtcclxuICAgIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vKipcclxuICogcmVzaXplciBkcmFnIGlzIHN0YXJ0ZWRcclxuICovXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy50aXRsZUJhckhlaWdodCAtIGV2ZW50LnBhZ2VZO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHJlc2l6ZXIgaXMgZHJhZ2dlZFxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IGV2ZW50IC0gbW91c2Vtb3ZlIGV2ZW50IG9iamVjdFxyXG4gKi9cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMucmVzaXplVGhpcy5zdHlsZS5oZWlnaHQgPSAoZXZlbnQucGFnZVkgLSB0aGlzLmFwcFdpbmRvdy55IC0gdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZKSArIFwicHhcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiByZXNpemVyIGRyYWcgc3RvcHBlZFxyXG4qL1xyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dIZWlnaHQ7XHJcbiIsIi8qKlxyXG4gKiBBcHAgd2luZG93IHdpZHRoIHJlc2l6ZXIgQ29uc3RydWN0b3JcclxuICogVGhpcyBpcyBhIHNtYWxsIGVsZW1lbnQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgYXBwIHdpbmRvd3MuIGl0IGNhbiBiZSBkcmFnZ2VkIGxlZnQgYW5kIHJpZ2h0IHRvIHJlc2l6ZSB0aGUgd2lkdGggb2YgYXBwIHdpbmRvd3NcclxuICogQHBhcmFtIHtvYmplY3R9IGFwcFdpbmRvdyAtIHdoYXQgd2luZG93IHRvIHJlc2l6ZVxyXG4gKi9cclxuZnVuY3Rpb24gUmVzaXplV2luZG93V2lkdGgoYXBwV2luZG93KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXhcIik7XHJcbiAgICB0aGlzLnJlc2l6ZVRoaXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuYXBwV2luZG93LmlkKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vKipcclxuICogZHJhZyBpcyBzdGFydGVkXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgbW91c2UgY2xpY2sgZXZlbnQgaGFuZGxlciBvYmplY3RcclxuICogQHJldHVybiB7W3R5cGVdfSAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG5cclxuICAgIC8vZHJhZyBmcm9tIGV4YWN0bHkgd2hlcmUgdGhlIGNsaWNrIGlzXHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0TGVmdCAtIGV2ZW50LnBhZ2VYO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHdpZHRoIHJlc2l6ZXIgaXMgZHJhZ2dlZFxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gbW91c2Vtb3ZlIGV2ZW50IG9iamVjdFxyXG4gKi9cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy5yZXNpemVUaGlzLnN0eWxlLndpZHRoID0gKGV2ZW50LnBhZ2VYIC0gdGhpcy5hcHBXaW5kb3cueCArIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd1dpZHRoO1xyXG4iLCIvKipcclxuICogQXBwIHdpbmRvdyByZXNpemVyIENvbnN0cnVjdG9yXHJcbiAqIFRoaXMgY29udHJvbHMgYm90aCB3aWR0aCBhbmQgaGVpZ2h0IHJlc2l6aW5nIG9mIGFuIGFwcCB3aW5kb3cuIGl0cyBlbGVtZW50IGlzIGEgc21hbGwgc3F1YXJlIGF0IHRoZSBib3R0b20gbGVmdCBjb3JuZXIgb2YgaXRzIGFwcCB3aW5kb3dcclxuICogQHBhcmFtIHtvYmplY3R9IGFwcFdpbmRvdyAtIHdoYXQgd2luZG93IHRvIHJlc2l6ZVxyXG4gKi9cclxuZnVuY3Rpb24gUmVzaXplV2luZG93V2lkdGhIZWlnaHQoYXBwV2luZG93KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXh5XCIpO1xyXG4gICAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiByZXNpemVyIGRyYWcgaXMgc3RhcnRlZFxyXG4gKi9cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgLy8gdGhpcyBlbGVtZW50IGhhcyBubyBvZmZzZXRUb3Agc28gaW5zdGVhZCB3ZSB1c2Ugd2luZG93LXJlc2l6ZXItaGVpZ2h0J3Mgb2Zmc2V0VG9wIHZhbHVlXHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LnRpdGxlQmFySGVpZ2h0IC0gZXZlbnQucGFnZVk7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0TGVmdCAtIGV2ZW50LnBhZ2VYO1xyXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIHRoaXMgY2xpY2sgc2hvdWxkbnQgZ28gdGhyb3VnaCB0byB0aGUgcGFyZW50IHdoaWNoIGlzIHRoZSBoZWlnaHQtcmVzaXplclxyXG59O1xyXG5cclxuLyoqIFxyXG4gKiB3aWR0aCZoZWlnaHQgcmVzaXplciBpcyBiZWluZyBkcmFnZ2VkIFxyXG4qL1xyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd0hlaWdodC5kcmFnKGUpO1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucmVzaXplV2luZG93V2lkdGguZHJhZyhlKTtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGhIZWlnaHQ7XHJcbiIsIi8qKlxyXG4gKiBjb25zdHJ1Y3RvciBmb3IgYSBkZXNrdG9wIGFwcCBzaG9ydGN1dFxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gYXBwIGNvbmZpZ1xyXG4gKiBAcGFyYW0ge29iamVjdH0gcHdkIC0gYSByZWZlcmVuY2UgdG8gdGhlIHB3ZFxyXG4gKi9cclxuZnVuY3Rpb24gU2hvcnRjdXQoY29uZmlnLCBwd2QpIHtcclxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG4gICAgdGhpcy50aXRsZSA9IGNvbmZpZy50aXRsZTtcclxuICAgIHRoaXMuZW50cnkgPSBjb25maWcuZW50cnk7XHJcbiAgICB0aGlzLnB3ZCA9IHB3ZDtcclxuXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzaG9ydGN1dFwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG5cclxuICAgIC8vIGFkZCBpY29uIGFuZCB0ZXh0XHJcbiAgICB0aGlzLmVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LmFkZChjb25maWcuaWNvbik7XHJcbiAgICB0aGlzLmVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IHRoaXMudGl0bGU7XHJcblxyXG4gICAgLy9hZGQgZXZlbnQgbGlzdGVuZXJcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wd2Quc3RhcnRBcHAodGhpcy5jb25maWcpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGN1dDtcclxuIiwidmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XHJcbnZhciBTaG9ydGN1dCA9IHJlcXVpcmUoXCIuL1Nob3J0Y3V0XCIpO1xyXG52YXIgYXBwTGlzdCA9IHJlcXVpcmUoXCIuL2FwcExpc3RcIik7XHJcblxyXG5cclxuLyoqXHJcbiAqIFBlcnNvbmFsIFdlYiBEZXNrdG9wXHJcbiAqL1xyXG52YXIgUHdkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1vdXNlID0gbmV3IE1vdXNlKCk7XHJcbiAgICB0aGlzLmluc3RhbGxlZEFwcHMgPSBbXTtcclxuICAgIHRoaXMuc3RhcnRlZEFwcHMgPSB7fTtcclxuICAgIHRoaXMubGFzdFpJbmRleCA9IDE7XHJcbiAgICB0aGlzLmxhc3RJRCA9IDE7XHJcbiAgICB0aGlzLmZ1bGxzY3JlZW5lZFdpbmRvdyA9IG51bGw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgc2hvcnRjdXRzIGZvciBhbGwgYXZhaWxhYmxlIGFwcHNcclxuICAgICAqL1xyXG4gICAgdGhpcy5pbnN0YWxsQXBwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvciAodmFyIGFwcCBpbiBhcHBMaXN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFsbGVkQXBwcy5wdXNoKG5ldyBTaG9ydGN1dChhcHBMaXN0W2FwcF0sIHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiB0aGUgdXNlciBjbGlja3MgYW4gYXBwIHNob3J0Y3V0IHRoaXMgZnVuY3Rpb24gd2lsbCBzdGFydCB0aGUgYXBwXHJcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZyAtIGNvbnRhaW5zIGFwcCBzZXR0aW5ncy4gVGhlIGNvbmZpZ3VyYXRpb24gY29tZXMgZnJvbSBhcHBMaXN0LmpzXHJcbiAgICAgKi9cclxuICAgIHRoaXMuc3RhcnRBcHAgPSBmdW5jdGlvbihjb25maWcpIHtcclxuXHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jYWxjdWxhdGVTdGFydFBvc2l0aW9uKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHZhciBuZXdBcHAgPSBuZXcgY29uZmlnLmVudHJ5KHtcclxuICAgICAgICAgICAgdGl0bGU6IGNvbmZpZy50aXRsZSxcclxuICAgICAgICAgICAgd2lkdGg6IGNvbmZpZy53aWR0aCxcclxuICAgICAgICAgICAgaGVpZ2h0OiBjb25maWcuaGVpZ2h0LFxyXG4gICAgICAgICAgICBpY29uOiBjb25maWcuaWNvbixcclxuICAgICAgICAgICAgcHdkOiB0aGlzLFxyXG4gICAgICAgICAgICBpZDogdGhpcy5sYXN0SUQsXHJcbiAgICAgICAgICAgIHg6IHBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgIHpJbmRleDogdGhpcy5sYXN0WkluZGV4XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGFydGVkQXBwc1t0aGlzLmxhc3RJRF0gPSBuZXdBcHA7XHJcbiAgICAgICAgdGhpcy5sYXN0WkluZGV4ICs9IDE7XHJcbiAgICAgICAgdGhpcy5sYXN0SUQgKz0gMTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIHdoZXJlIG5ldyBhcHBzIHNob3VsZCBhcHBlYXIgb24gdGhlIHNjcmVlblxyXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBjb25maWcgLSBjb250YWlucyB0aGUgIGFwcHMgc3RhbmRhcmQgd2lkdGggYW5kIGhlaWdodFxyXG4gICAgICovXHJcbiAgICB0aGlzLmNhbGN1bGF0ZVN0YXJ0UG9zaXRpb24gPSBmdW5jdGlvbihjb25maWcpIHtcclxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHN0YXJ0aW5nIFggWSBjb29yZGluYXRlcyBhcmUgZ29vZFxyXG5cclxuICAgICAgICB2YXIgeCA9IHRoaXMubmV3WCAtIGNvbmZpZy53aWR0aCAvIDI7XHJcbiAgICAgICAgdmFyIHkgPSB0aGlzLm5ld1kgLSBjb25maWcuaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgLy8gcmVzZXQgaWYgWCBpcyBvZmYgc2NyZWVuXHJcbiAgICAgICAgaWYgKHggPiB0aGlzLndpZHRoIC0gNDAgfHwgeSA+IHRoaXMuaGVpZ2h0IC0gNDApIHtcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFggKz0gMjA7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9yaWdpbmFsWCA+IHRoaXMud2lkdGggLSAyMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFggPSAyMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5uZXdYID0gdGhpcy5vcmlnaW5hbFg7XHJcbiAgICAgICAgICAgIHRoaXMubmV3WSA9IHRoaXMub3JpZ2luYWxZO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVzZXQgaWYgWSBpcyBvZmYgc2NyZWVuXHJcblxyXG4gICAgICAgIHRoaXMubmV3WCArPSAyMDtcclxuICAgICAgICB0aGlzLm5ld1kgKz0gMjA7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBuZXcgYXBwIGlzIGJpZ2dlciB0aGFuIHRoZSBwd2Qgd2luZG93XHJcbiAgICAgICAgaWYgKHggPCAwKSB7XHJcbiAgICAgICAgICAgIHggPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHkgPCAwKSB7XHJcbiAgICAgICAgICAgIHkgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbG9zZSBhbiBhcHBcclxuICAgICAqIEBwYXJhbSAge29iamVjdH0gYXBwXHJcbiAgICAgKi9cclxuICAgIHRoaXMuY2xvc2VBcHAgPSBmdW5jdGlvbihhcHApIHtcclxuICAgICAgICB0aGlzLnN0YXJ0ZWRBcHBzW2FwcC5pZF0uY2xvc2UoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5zdGFydGVkQXBwc1thcHAuaWRdO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJyb3dzZXIgcmVzaXplXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVzaXplID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdYID0gdGhpcy53aWR0aCAvIDI7XHJcbiAgICAgICAgdGhpcy5uZXdZID0gdGhpcy5oZWlnaHQgLyAyLjU7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFggPSB0aGlzLm5ld1g7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFkgPSB0aGlzLm5ld1k7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmZ1bGxzY3JlZW5lZFdpbmRvdykge1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5lZFdpbmRvdy5tYXhpbWl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG52YXIgcHdkID0gbmV3IFB3ZCgpO1xyXG5wd2QuaW5zdGFsbEFwcHMoKTsgLy8gY3JlYXRlIHNob3J0Y3V0cyBmb3IgYWxsIGF2YWlsYWJsZSBhcHBzXHJcbnB3ZC5yZXNpemUoKTsgLy8gcnVuIHJlc2l6ZSBvbmNlIHRvIGdldCB3aWR0aCBhbmQgY2FsY3VsYXRlIHN0YXJ0IHBvc2l0aW9uIG9mIGFwcHNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcHdkLnJlc2l6ZS5iaW5kKHB3ZCkpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIFwiQ2hhdFwiOiB7XHJcbiAgICAgICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvY2hhdC9hcHBcIiksXHJcbiAgICAgICAgdGl0bGU6IFwiQ2hhdFwiLFxyXG4gICAgICAgIHdpZHRoOiA1MDAsXHJcbiAgICAgICAgaGVpZ2h0OiA0MDAsXHJcbiAgICAgICAgaWNvbjogXCJmYS1jb21tZW50aW5nXCJcclxuICAgIH0sXHJcbiAgICBcIk1lbW9yeVwiOiB7XHJcbiAgICAgICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvbWVtb3J5L2FwcFwiKSxcclxuICAgICAgICB0aXRsZTogXCJNZW1vcnlcIixcclxuICAgICAgICB3aWR0aDogNTUwLFxyXG4gICAgICAgIGhlaWdodDogNDQwLFxyXG4gICAgICAgIGljb246IFwiZmEtY2xvbmVcIlxyXG4gICAgfVxyXG59O1xyXG5cclxuIiwidmFyIENoYW5uZWwgPSBmdW5jdGlvbihjaGF0LCBuYW1lKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5jaGF0ID0gY2hhdDtcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsc1tuYW1lXSA9IHRoaXM7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0LWNoYW5uZWxcIik7XHJcbiAgICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xyXG5cclxuICAgIHRoaXMuY2hhdERpdi5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvLyBsaXN0ZW4gZm9yIGVudGVyIGtleVxyXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAvL3NlbmQgYSBtZXNzYWdlXHJcbiAgICAgICAgICAgIHRoaXMuY2hhdC5zZW5kTWVzc2FnZSh0aGlzLm5hbWUsIGV2ZW50LnRhcmdldC52YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBlbXB0eSB0ZXh0YXJlYVxyXG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5jaGF0LmNoYXRDaGFubmVsRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmNoYXREaXYpO1xyXG5cclxuICAgIC8vY2hhbm5lbCBsaXN0IGVudHJ5XHJcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC1jaGFubmVsLWxpc3QtZW50cnlcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMuY2hhdC5qb2luQ2hhbm5lbEJ1dHRvbik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQgPSB0aGlzLmNoYXQuY2hhbm5lbExpc3RFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQucHJldmlvdXNFbGVtZW50U2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgaWYgKG5hbWUgPT09IFwiXCIpIHtcclxuICAgICAgICBuYW1lID0gXCJEZWZhdWx0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBuYW1lO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNoYXQuYWN0aXZlQ2hhbm5lbC5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwgPSB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBjbG9zZSBjaGFubmVsXHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VDaGFubmVsKCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUucHJpbnRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVwiKVswXTtcclxuICAgIHZhciBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcclxuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbChcIi5jaGF0LXRleHRcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7XHJcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1hdXRob3JcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xyXG4gICAgdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1tZXNzYWdlc1wiKVswXS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcclxuXHJcbiAgICBpZiAodGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwgIT09IHRoaXMpIHtcclxuICAgICAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImNoYXQtY2hhbm5lbC1uZXdtZXNzYWdlXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jaGF0RGl2LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtYWN0aXZlLWNoYW5uZWxcIik7XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNoYXREaXYuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY2hhdC1hY3RpdmUtY2hhbm5lbFwiKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jaGFubmVsLW5ld21lc3NhZ2VcIik7XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5jbG9zZUNoYW5uZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcmVtb3ZlIGNoYW5uZWwgbGlzdCBlbnRyeVxyXG4gICAgdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmxpc3RFbnRyeUVsZW1lbnQpO1xyXG5cclxuICAgIC8vcmVtb3ZlIGNoYXQgZGl2XHJcbiAgICB0aGlzLmNoYXQuY2hhdENoYW5uZWxFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuY2hhdERpdik7XHJcblxyXG4gICAgdGhpcy5jaGF0LmNsb3NlQ2hhbm5lbCh0aGlzKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhbm5lbDtcclxuIiwidmFyIFB3ZEFwcCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9Qd2RBcHBcIik7XHJcbnZhciBzb2NrZXRDb25maWcgPSByZXF1aXJlKFwiLi9zb2NrZXRDb25maWcuanNvblwiKTtcclxudmFyIENoYW5uZWwgPSByZXF1aXJlKFwiLi9DaGFubmVsXCIpO1xyXG5cclxuLyoqXHJcbiAqIENoYXQgY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIGFwcCBjb25maWd1cmF0aW9uIG9iamVjdFxyXG4gKi9cclxuZnVuY3Rpb24gQ2hhdChjb25maWcpIHtcclxuICAgIFB3ZEFwcC5jYWxsKHRoaXMsIGNvbmZpZyk7IC8vaW5oZXJpdCBmcm9tIHB3ZEFwcCBvYmplY3RcclxuICAgIHRoaXMuY2hhbm5lbHMgPSB7fTtcclxuICAgIHRoaXMuYWN0aXZlQ2hhbm5lbCA9IG51bGw7XHJcbiAgICB0aGlzLnNvY2tldCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5pbnB1dE5hbWUoKSAvLyBnZXQgdXNlcm5hbWVcclxuICAgIC50aGVuKGZ1bmN0aW9uKHVzZXJuYW1lKSB7XHJcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgICAgIHRoaXMuc3RhcnRDaGF0KCk7XHJcbiAgICB9LmJpbmQodGhpcykpXHJcbiAgICAudGhlbih0aGlzLmNvbm5lY3QoKSkgLy8gdGhlbiB3ZSBjb25uZWN0XHJcbiAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0aGlzLCBcIlwiKTsgLy8gdGhlbiB3ZSBjb25uZWN0IHRvIHRoZSBkZWZhdWx0IGNoYW5uZWxcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkNoYXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQd2RBcHAucHJvdG90eXBlKTtcclxuQ2hhdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGF0O1xyXG5cclxuLyoqXHJcbiAqIGVudGVyIHVzZXJuYW1lXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5pbnB1dE5hbWUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShcclxuICAgICAgICBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHNob3cgbmFtZSBpbnB1dCB0ZXh0IGFuZCBidXR0b25cclxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0LXVzZXJuYW1lLWlucHV0XCIpO1xyXG4gICAgICAgICAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcFdpbmRvdy5jb250ZW50LmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1idG4tdXNlcm5hbWVcIik7XHJcbiAgICAgICAgICAgIHZhciB0ZXh0SW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC11c2VybmFtZS1pbnB1dCBpbnB1dFt0eXBlPXRleHRdXCIpO1xyXG5cclxuICAgICAgICAgICAgdGV4dElucHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRleHRJbnB1dC52YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0ZXh0SW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGV4dElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRleHRJbnB1dC52YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGV4dElucHV0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBjcmVhdGUgY2hhdCBjaGFubmVsIGh0bWxcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnN0YXJ0Q2hhdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gY2xlYXIgd2luZG93IG9mIHByZXZpb3VzIGVsZW1lbnQgKHRoZSBpbnB1dCB1c2VybmFtZSBzY3JlZW4pXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIHRoaXMuYXBwV2luZG93LmNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcclxuICAgIHRoaXMuY2hhdENoYW5uZWxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtY2hhbm5lbHNcIik7XHJcbiAgICB0aGlzLmNoYW5uZWxMaXN0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWNoYW5uZWwtbGlzdFwiKTtcclxuXHJcbiAgICAvLyBob29rIHVwIGpvaW4gY2hhbm5lbCBidXR0b25cclxuICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiBpbnB1dFt0eXBlPWJ1dHRvblwiKTtcclxuICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWpvaW4tY2hhbm5lbFwiKTtcclxuXHJcbiAgICB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBsaXN0ZW5lclxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG5cclxuICAgICAgICAvLyBzaG93IHRoZSBqb2luIG5ldyBjaGFubmVsIGZvcm0gYW5kIHBvc2l0aW9uIGl0IG5leHQgdG8gdGhlIG1vdXNlIGN1cnNvclxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB2YXIgYnRuYm91bmRpbmdSZWN0ID0gdGhpcy5qb2luQ2hhbm5lbEJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB2YXIgaW5wdXRCb3VuZGluZ1JlY3QgPSB0aGlzLmpvaW5DaGFubmVsSW5wdXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIHZhciBsZWZ0ID0gYnRuYm91bmRpbmdSZWN0LmxlZnQgLSB0aGlzLmFwcFdpbmRvdy54ICsgYnRuYm91bmRpbmdSZWN0LndpZHRoICsgNCArIFwicHhcIjtcclxuICAgICAgICB2YXIgdG9wID0gYnRuYm91bmRpbmdSZWN0LnRvcCAtIHRoaXMuYXBwV2luZG93LnkgLSAoaW5wdXRCb3VuZGluZ1JlY3QuaGVpZ2h0IC8gMikgKyAoYnRuYm91bmRpbmdSZWN0LmhlaWdodCAvIDIpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuc3R5bGUubGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnN0eWxlLnRvcCA9IHRvcDtcclxuXHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnZhbHVlID0gXCJcIjtcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIHRoaXMgY2xpY2sgc2hvdWxkbnQgcGFzcyB0aHJvdWdoIG90aGVyd2lzZSB0aGUgaW5wdXQgd2lsbCBiZSBoaWRkZW4gYnkgdGhlIHdpbmRvd2NsaWNrbGlzdGVuZXJcclxuXHJcbiAgICAgICAgLy9oaWRlIHRoZSBqb2luIGNoYW5uZWwgZGl2IGlmIHRoZXJlcyBhIGNsaWNrIGFueXdoZXJlIG9uIHNjcmVlbiBleGNlcHQgaW4gdGhlIGpvaW4gY2hhbm5lbCBkaXZcclxuICAgICAgICB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKTtcclxuICAgICAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBqb2luIGNoYW5uZWwgYnV0dG9uIGFnYWluXHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gZG9udCBoaWRlIGlmIHRoZSBjbGljayBpcyBpbiB0aGUgam9pbiBjaGFubmVsIGRpdlxyXG4gICAgICAgIHRoaXMuY2xpY2tKb2luQ0hhbm5lbEZvcm0gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKTtcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tKb2luQ0hhbm5lbEZvcm0pO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG4gICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIC8vIGxpc3RlbiBmb3IgZW50ZXIga2V5XHJcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgIC8vIGpvaW4gY2hhbm5lbFxyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0aGlzLCBldmVudC50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0oKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoc29ja2V0Q29uZmlnLmFkZHJlc3MpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJDb3VsZCBub3QgY29ubmVjdFwiKSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY2hhbm5lbCBpbiB0aGlzLmNoYW5uZWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsc1ttZXNzYWdlLmNoYW5uZWxdLnByaW50TWVzc2FnZShtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbihjaGFubmVsLCB0ZXh0KSB7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcclxuICAgICAgICBkYXRhOiB0ZXh0LFxyXG4gICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXJuYW1lLFxyXG4gICAgICAgIGNoYW5uZWw6IGNoYW5uZWwsXHJcbiAgICAgICAga2V5OiBzb2NrZXRDb25maWcua2V5XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7XHJcbiAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZXJyb3IpO1xyXG4gICAgfSk7XHJcblxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xvc2VDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCkge1xyXG4gICAgZGVsZXRlIHRoaXMuY2hhbm5lbHNbY2hhbm5lbC5uYW1lXTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5yZW1vdmVDaGlsZCh0aGlzLmFwcFdpbmRvdy5lbGVtZW50KTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSB0YXNrYmFyXHJcbiAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZCAudGFza2JhclwiKS5yZW1vdmVDaGlsZCh0aGlzLnRhc2tiYXJBcHAuZWxlbWVudCk7XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xyXG4iLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgXCJhZGRyZXNzXCI6IFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIixcclxuICBcImtleVwiOiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcclxufVxyXG4iLCJ2YXIgSW1hZ2UgPSByZXF1aXJlKFwiLi9JbWFnZVwiKTtcclxudmFyIGtleWJvYXJkID0gcmVxdWlyZShcIi4va2V5Ym9hcmRcIik7XHJcblxyXG4vKipcclxuICogc2h1ZmZsZSB0aGUgYXJyYXkgb2YgaW1hZ2VzXHJcbiAqIEBwYXJhbSAge29iamVjdH0gYm9hcmQgLSByZWZlcmVuY2UgdG8gdGhlIGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBzaHVmZmxlKGJvYXJkKSB7XHJcbiAgICB2YXIgaTtcclxuICAgIHZhciByYW5kb21JbmRleDtcclxuICAgIHZhciBiYWNrSW5kZXg7XHJcblxyXG4gICAgLy8gbW92ZSB0aHJvdWdoIHRoZSBkZWNrIG9mIGNhcmRzIGZyb20gdGhlIGJhY2sgdG8gZnJvbnRcclxuICAgIGZvciAoaSA9IGJvYXJkLmltYWdlQXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xyXG4gICAgICAgIC8vcGljayBhIHJhbmRvbSBjYXJkIGFuZCBzd2FwIGl0IHdpdGggdGhlIGNhcmQgZnVydGhlc3QgYmFjayBvZiB0aGUgdW5zaHVmZmxlZCBjYXJkc1xyXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XHJcbiAgICAgICAgYmFja0luZGV4ID0gYm9hcmQuaW1hZ2VBcnJheVtpXTtcclxuICAgICAgICBib2FyZC5pbWFnZUFycmF5W2ldID0gYm9hcmQuaW1hZ2VBcnJheVtyYW5kb21JbmRleF07XHJcbiAgICAgICAgYm9hcmQuaW1hZ2VBcnJheVtyYW5kb21JbmRleF0gPSBiYWNrSW5kZXg7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBcclxuICogQm9hcmQgXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwd2QgLSBwd2QgcmVmZXJlbmNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5zIC0gaG93IG1hbnkgY29sdW1ucyB3aWRlIHRoZSBtZW1vcnkgZ2FtZSBzaG91bGQgbWVcclxuICogQHBhcmFtIHtudW1iZXJ9IHJvd3MgLSBob3cgbWFueSByb3dzXHJcbiAqL1xyXG5mdW5jdGlvbiBCb2FyZChwd2QsIGNvbHVtbnMsIHJvd3MpIHtcclxuICAgIHRoaXMucHdkID0gcHdkO1xyXG5cclxuICAgIC8vIFRPRE86IHZlcmlmeSB3aWR0aC9oZWlnaHRcclxuICAgIHRoaXMucm93cyA9IHJvd3M7XHJcbiAgICB0aGlzLmNvbHVtbnMgPSBjb2x1bW5zO1xyXG4gICAgdGhpcy5pbWFnZVNpemUgPSAxMTA7XHJcbiAgICB0aGlzLmF0dGVtcHRzID0gMDtcclxuICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMua2V5Ym9hcmRTZWxlY3QgPSB7XHJcbiAgICAgICAgeDogMCxcclxuICAgICAgICB5OiAwXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGNyZWF0ZSBodG1sXHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS13cmFwcGVyXCIpO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQpLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIDEpO1xyXG5cclxuICAgIC8vIG1lbnVcclxuICAgIHRoaXMubWVudUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLndpbmRvdy1tZW51XCIpO1xyXG5cclxuICAgIC8vIEF0dGVtcHRzIGh0bWxcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5LWF0dGVtcHRzXCIpO1xyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gICAgdGhpcy5hdHRlbXB0c0RpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQgKyBcIiAubWVtb3J5LWF0dGVtcHRzXCIpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1ib2FyZFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMuY29sdW1ucyAqIHRoaXMuaW1hZ2VTaXplICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLm1pbldpZHRoID0gdGhpcy5jb2x1bW5zICogdGhpcy5pbWFnZVNpemUgKyBcInB4XCI7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0aGlzLndyYXBwZXJFbGVtZW50KTtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICAvL2NyZWF0ZSBhcnJheSBvZiBpbWFnZXNcclxuICAgIHRoaXMuaW1hZ2VBcnJheSA9IFtdO1xyXG4gICAgdmFyIGRvY2ZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29sdW1ucyAqIHRoaXMucm93czsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIG5ld0ltYWdlID0gbmV3IEltYWdlKE1hdGguZmxvb3IoaSAvIDIpICsgMSwgaSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LnB1c2gobmV3SW1hZ2UpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzaHVmZmxlKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuaW1hZ2VBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XHJcbiAgICAgICAgZG9jZnJhZy5hcHBlbmRDaGlsZChpbWFnZS5lbGVtZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChkb2NmcmFnKTtcclxuXHJcbiAgICAvL2hhbmRsZSBjbGlja3NcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvL3JlbW92ZSBrZXlib2FyZCBzZWxlY3Qgb3V0bGluZVxyXG4gICAgICAgIGtleWJvYXJkLnJlbW92ZU91dGxpbmUodGhpcyk7XHJcbiAgICAgICAgdmFyIGNsaWNrZWRJZCA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChjbGlja2VkSWQgPT0gaW1hZ2UuaWQpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlLmNsaWNrKHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vaGFuZGxlIGtleWJvYXJkXHJcbiAgICBrZXlib2FyZC5oYW5kbGVJbnB1dCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLnNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0R2FtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuYXR0ZW1wdHMgPSAwO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy9mbGlwIGltYWdlc1xyXG4gICAgICAgIHRoaXMuaW1hZ2VBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XHJcbiAgICAgICAgICAgIGltYWdlLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5LzAucG5nJylcIjtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm9hcmQ7XHJcbiIsInZhciBrZXlib2FyZCA9IHJlcXVpcmUoXCIuL2tleWJvYXJkXCIpO1xyXG5cclxuLyoqXHJcbiAqIGltYWdlIGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbWFnZU51bWJlclxyXG4gKiBAcGFyYW0ge051bWJlcn0gaWRcclxuICogQHBhcmFtIHtPYmplY3R9IGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBJbWFnZShpbWFnZU51bWJlciwgaWQsIGJvYXJkKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktaW1hZ2VcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pbWFnZW51bWJlclwiLCBpbWFnZU51bWJlcik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBpZCk7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmltYWdlTnVtYmVyID0gaW1hZ2VOdW1iZXI7XHJcbiAgICB0aGlzLmJvYXJkID0gYm9hcmQ7XHJcbiAgICB0aGlzLmNsaWNrYWJsZSA9IHRydWU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBoYW5kbGUgY2xpY2tzXHJcbiAqL1xyXG5JbWFnZS5wcm90b3R5cGUuY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAodGhpcy5jbGlja2FibGUpIHtcclxuICAgICAgICB0aGlzLmNsaWNrYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvdygpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuYm9hcmQuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5zZWxlY3RlZCA9IHRoaXM7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBfc2VsZWN0ZWQgPSB0aGlzLmJvYXJkLnNlbGVjdGVkO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmF0dGVtcHRzICs9IDE7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmF0dGVtcHRzRGl2LnRleHRDb250ZW50ID0gXCJBdHRlbXB0czogXCIgKyB0aGlzLmJvYXJkLmF0dGVtcHRzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ib2FyZC5zZWxlY3RlZC5pbWFnZU51bWJlciA9PT0gdGhpcy5pbWFnZU51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgLy8gbWF0Y2hcclxuICAgICAgICAgICAgICAgIGtleWJvYXJkLnJlbW92ZU91dGxpbmUodGhpcy5ib2FyZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1ncmVlblwiKTtcclxuICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktZ3JlZW5cIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA0MDApO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIG5vdCBhIG1hdGNoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1yZWRcIik7XHJcbiAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5jbGlja2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xpY2thYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogZmxpcCBiYWNrIHRoZSBpbWFnZVxyXG4gKi9cclxuSW1hZ2UucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCgnaW1hZ2UvYXBwcy9tZW1vcnkvMC5wbmcnKVwiO1xyXG59O1xyXG5cclxuLyoqIFxyXG4gKiByZXZlYWwgaW1hZ2VcclxuICovXHJcbkltYWdlLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5L1wiICsgdGhpcy5pbWFnZU51bWJlciArIFwiLnBuZycpXCI7XHJcbn07XHJcblxyXG4vKiogXHJcbiAqIHJlbW92ZSBpbWFnZVxyXG4gKi9cclxuSW1hZ2UucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktZmFkZS1vdXRcIik7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlOyIsInZhciBQd2RBcHAgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvUHdkQXBwXCIpO1xyXG52YXIgQm9hcmQgPSByZXF1aXJlKFwiLi9Cb2FyZC5qc1wiKTtcclxudmFyIEFwcE1lbnUgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvQXBwTWVudVwiKTtcclxuXHJcbi8qKlxyXG4gKiBNZW1vcnkgYXBwIGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBhcHAgY29uZmlnIG9iamVjdFxyXG4gKi9cclxuZnVuY3Rpb24gTWVtb3J5KGNvbmZpZykge1xyXG4gICAgUHdkQXBwLmNhbGwodGhpcywgY29uZmlnKTtcclxuICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQodGhpcywgNCwzKTtcclxuICAgIFxyXG4gICAgLy8gdGhpcy5tZW51ID0gbmV3IEFwcE1lbnUodGhpcy5ib2FyZC5tZW51RWxlbWVudCwgXCJGaWxlXCIsIFtcclxuICAgIC8vICAgICB7XHJcbiAgICAvLyAgICAgICAgIG5hbWU6IFwiU2V0dGluZ3NcIixcclxuICAgIC8vICAgICAgICAgYWN0aW9uOiB0aGlzLmJvYXJkLnNldHRpbmdzXHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vICAgICB7XHJcbiAgICAvLyAgICAgICAgIG5hbWU6IFwiTmV3IGdhbWVcIixcclxuICAgIC8vICAgICAgICAgYWN0aW9uOiB0aGlzLmJvYXJkLnN0YXJ0R2FtZVxyXG4gICAgLy8gICAgIH1dXHJcbiAgICAvLyApO1xyXG4gICAgdGhpcy5ib2FyZC5zdGFydEdhbWUoKTtcclxufVxyXG5cclxuTWVtb3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHdkQXBwLnByb3RvdHlwZSk7XHJcbk1lbW9yeS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1vcnk7XHJcblxyXG4vKipcclxuICogd2hlbiB0aGUgc2V0dGluZ3MgbWVudSBpcyBjbGlja2VkXHJcbiAqL1xyXG5NZW1vcnkucHJvdG90eXBlLnNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInNob3cgc2V0dGluZ3NcIik7XHJcbn07XHJcblxyXG4vKiogXHJcbiAqIHdoZW4gdGhlIGFwcCBpcyBjbG9zaW5nXHJcbiAqL1xyXG5NZW1vcnkucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5yZW1vdmVDaGlsZCh0aGlzLmFwcFdpbmRvdy5lbGVtZW50KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5O1xyXG4iLCIvKipcclxuICogcmVtb3ZlIHRoZSBvdXRsaW5lIGZyb20gc2VsZWN0ZWQgbWVtb3J5IGltYWdlXHJcbiAqIEBwYXJhbSAge29iamVjdH0gYm9hcmQgLSBib2FyZCByZWZlcmVuY2VcclxuICovXHJcbmZ1bmN0aW9uIHJlbW92ZU91dGxpbmUoYm9hcmQpIHtcclxuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCArIFwiIC5tZW1vcnkta2V5Ym9hcmRTZWxlY3RcIikpIHtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCArIFwiIC5tZW1vcnkta2V5Ym9hcmRTZWxlY3RcIikuY2xhc3NMaXN0LnJlbW92ZShcIm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIFxyXG4gKiBzZWxlY3QgYW4gaW1hZ2VcclxuICogQHBhcmFtICB7b2JqZWN0fSBib2FyZFxyXG4gKi9cclxuZnVuY3Rpb24gc2VsZWN0KGJvYXJkKSB7XHJcbiAgICByZW1vdmVPdXRsaW5lKGJvYXJkKTtcclxuICAgIHZhciBzZWxlY3RlZCA9IGJvYXJkLmtleWJvYXJkU2VsZWN0LnggKyBib2FyZC5rZXlib2FyZFNlbGVjdC55ICogYm9hcmQuY29sdW1ucztcclxuICAgIGJvYXJkLmltYWdlQXJyYXlbc2VsZWN0ZWRdLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKTtcclxufVxyXG5cclxuLyoqIFxyXG4qIENhcHR1cmUga2V5Ym9hcmQgcHJlc3NlcyBhbmQgdXNlIGl0IHRvIHNlbGVjdCBtZW1vcnkgY2FyZHNcclxuKiBAcGFyYW0gIHtvYmplY3R9IGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVJbnB1dChib2FyZCkge1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBib2FyZC5wd2QuaWQpLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGUua2V5Q29kZSA/IGUua2V5Q29kZSA6IGUud2hpY2g7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gMzcpIHtcclxuICAgICAgICAgICAgLy9sZWZ0XHJcbiAgICAgICAgICAgIGlmIChib2FyZC5rZXlib2FyZFNlbGVjdC54ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQua2V5Ym9hcmRTZWxlY3QueCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0KGJvYXJkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNlIGlmIChrZXkgPT09IDM4KSB7XHJcbiAgICAgICAgICAgIC8vdXBcclxuICAgICAgICAgICAgaWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC55IC09IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2UgaWYgKGtleSA9PT0gMzkpIHtcclxuICAgICAgICAgICAgLy9yaWdodFxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueCA8IGJvYXJkLmNvbHVtbnMgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC54ICs9IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDQwKSB7XHJcbiAgICAgICAgICAgIC8vZG93blxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueSA8IGJvYXJkLnJvd3MgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC55ICs9IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDMyKSB7XHJcbiAgICAgICAgICAgIC8vc3BhY2VcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gYm9hcmQua2V5Ym9hcmRTZWxlY3QueCArIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgKiBib2FyZC5jb2x1bW5zO1xyXG4gICAgICAgICAgICBib2FyZC5pbWFnZUFycmF5W3NlbGVjdGVkXS5jbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sIHRydWUpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5oYW5kbGVJbnB1dCA9IGhhbmRsZUlucHV0O1xyXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmVPdXRsaW5lID0gcmVtb3ZlT3V0bGluZTtcclxuIl19
