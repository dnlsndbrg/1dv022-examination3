(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function AppMenu(menuElement, menus) {

    var template = document.querySelector("#window-menu-container");
    var clone = document.importNode(template.content, true);
    menuElement.appendChild(clone);
    this.element = menuElement.lastElementChild.lastElementChild;

    menus.forEach(function(menu) {
        // create menu header
        var template = document.querySelector("#window-menu-header");
        var clone = document.importNode(template.content, true);
        this.element.appendChild(clone);

        // add header name
        this.element.lastElementChild.firstElementChild.textContent = menu.name;

        // add menu items
        var dropdown = this.element.lastElementChild.lastElementChild;
        menu.items.forEach(function(item) {

            // create menu item html
            var template = document.querySelector("#window-menu-item");
            var clone = document.importNode(template.content, true);
            dropdown.appendChild(clone);

            // set name and assign eventlistener
            var itemElement = dropdown.lastElementChild.lastElementChild;
            itemElement.textContent = item.name;
            itemElement.addEventListener("click", item.action);

        }.bind(this));
    }.bind(this));
}

module.exports = AppMenu;

},{}],2:[function(require,module,exports){
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

    // define menuElement
    this.menuElement = document.querySelector("#window-" + this.id + " .window-menu");

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
    this.menuElement.classList.remove("hidden");
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
    this.menuElement.classList.remove("hidden");
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
        this.menuElement.classList.add("hidden");
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
        this.menuElement.classList.remove("hidden");
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

},{"./ResizeWindowHeight":5,"./ResizeWindowWidth":6,"./ResizeWindowWidthHeight":7}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{"./AppMenu":1,"./AppWindow":2}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./Mouse":3,"./Shortcut":8,"./appList":10}],10:[function(require,module,exports){
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

},{"../../../js/PwdApp":4,"./Channel":11,"./socketConfig.json":13}],13:[function(require,module,exports){
module.exports={
  "address": "ws://vhost3.lnu.se:20080/socket/",
  "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}],14:[function(require,module,exports){
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

    document.querySelector("#window-" + this.pwd.id + " .window-content").textContent = "";

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

},{"./Image":15,"./keyboard":17}],15:[function(require,module,exports){
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
},{"./keyboard":17}],16:[function(require,module,exports){
var PwdApp = require("../../../js/PwdApp");
var Board = require("./Board.js");
var AppMenu = require("../../../js/AppMenu");

/**
 * Memory app constructor
 * @param {object} config - app config object
 */
function Memory(config) {
    PwdApp.call(this, config);

    // add a dropdown menu to the window
    this.menu = new AppMenu(this.appWindow.menuElement, [
        {
            name: "File",
            items: [
                {
                    name: "New game",
                    action: this.newGame.bind(this)
                },
                {
                    name: "Quit",
                    action: this.appWindow.close.bind(this.appWindow)
                }
            ]
        }
        ]
    );

    this.board = new Board(this, 4,3);
    this.board.startGame();
}

Memory.prototype = Object.create(PwdApp.prototype);
Memory.prototype.constructor = Memory;

Memory.prototype.newGame = function() {
    var contentElement = document.querySelector("#window-" + this.id + " .window-content");
    contentElement.textContent = "";

    // input rows/cols html
    var template = document.querySelector("#memory-setup");
    var clone = document.importNode(template.content, true);
    contentElement.appendChild(clone);
    
    var button = document.querySelector("#window-" + this.id + " .btn");
    var rowsInput = document.querySelector("#window-" + this.id + " .memory-rows-input");
    var colsInput = document.querySelector("#window-" + this.id + " .memory-cols-input");

    rowsInput.value = this.board.rows;
    colsInput.value = this.board.columns;

    button.addEventListener("click", function() {
        this.board = new Board(this, colsInput.value,rowsInput.value);
        this.board.startGame();
    }.bind(this));
};

/**
 * when the app is closing
 */
Memory.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);
};

module.exports = Memory;

},{"../../../js/AppMenu":1,"../../../js/PwdApp":4,"./Board.js":14}],17:[function(require,module,exports){
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

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwTWVudS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHdkQXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Jlc2l6ZVdpbmRvd1dpZHRoLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5qcyIsImNsaWVudC9zb3VyY2UvanMvU2hvcnRjdXQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwTGlzdC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9jaGF0L0NoYW5uZWwuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9zb2NrZXRDb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9tZW1vcnkvQm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L0ltYWdlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L2tleWJvYXJkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIEFwcE1lbnUobWVudUVsZW1lbnQsIG1lbnVzKSB7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctbWVudS1jb250YWluZXJcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgbWVudUVsZW1lbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gbWVudUVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5sYXN0RWxlbWVudENoaWxkO1xyXG5cclxuICAgIG1lbnVzLmZvckVhY2goZnVuY3Rpb24obWVudSkge1xyXG4gICAgICAgIC8vIGNyZWF0ZSBtZW51IGhlYWRlclxyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LW1lbnUtaGVhZGVyXCIpO1xyXG4gICAgICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGhlYWRlciBuYW1lXHJcbiAgICAgICAgdGhpcy5lbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBtZW51Lm5hbWU7XHJcblxyXG4gICAgICAgIC8vIGFkZCBtZW51IGl0ZW1zXHJcbiAgICAgICAgdmFyIGRyb3Bkb3duID0gdGhpcy5lbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQubGFzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICBtZW51Lml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG5cclxuICAgICAgICAgICAgLy8gY3JlYXRlIG1lbnUgaXRlbSBodG1sXHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LW1lbnUtaXRlbVwiKTtcclxuICAgICAgICAgICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgICAgICAgICAgZHJvcGRvd24uYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgICAgICAgICAgLy8gc2V0IG5hbWUgYW5kIGFzc2lnbiBldmVudGxpc3RlbmVyXHJcbiAgICAgICAgICAgIHZhciBpdGVtRWxlbWVudCA9IGRyb3Bkb3duLmxhc3RFbGVtZW50Q2hpbGQubGFzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICAgICAgaXRlbUVsZW1lbnQudGV4dENvbnRlbnQgPSBpdGVtLm5hbWU7XHJcbiAgICAgICAgICAgIGl0ZW1FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBpdGVtLmFjdGlvbik7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwcE1lbnU7XHJcbiIsInZhciBSZXNpemVXaW5kb3dXaWR0aCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd1dpZHRoXCIpO1xyXG52YXIgUmVzaXplV2luZG93SGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93SGVpZ2h0XCIpO1xyXG52YXIgUmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aEhlaWdodFwiKTtcclxuXHJcbi8qKlxyXG4gKiBBcHBXaW5kb3cgQ29uc3RydWN0b3IuIFRoaXMgb2JqZWN0IGhhbmRsZXMgdGhlIGdyYXBoaWNzIGFuZCBhbGwgcmVsYXRlZCBldmVudHMgc3VjaCBhcyByZXNpemluZywgbWF4aW1pemluZywgY2xvc2luZyBldGMuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBpdCB0YWtlcyB0aGUgYXBwIGNvbmZpZyBhcyBhbiBhcmd1bWVudFxyXG4gKi9cclxuZnVuY3Rpb24gQXBwV2luZG93KGNvbmZpZykge1xyXG4gICAgdGhpcy5pZCA9IGNvbmZpZy5pZDtcclxuICAgIHRoaXMucHdkID0gY29uZmlnLnB3ZDtcclxuICAgIHRoaXMud2lkdGggPSBjb25maWcud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQ7XHJcbiAgICB0aGlzLnggPSBjb25maWcueDtcclxuICAgIHRoaXMueSA9IGNvbmZpZy55O1xyXG4gICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMubWF4aW1pemVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBXaW5kb3dcIikuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgLy8gZGVmaW5lIHRoaXMuZWxlbWVudFxyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuXHJcbiAgICAvLyBzZXQgaWRcclxuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcIndpbmRvdy1cIiArIHRoaXMuaWQpO1xyXG5cclxuICAgIC8vIGRlZmluZSB0aGlzLndyYXBwZXJFbGVtZW50XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcblxyXG4gICAgLy8gZGVmaW5lIG1lbnVFbGVtZW50XHJcbiAgICB0aGlzLm1lbnVFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1tZW51XCIpO1xyXG5cclxuICAgIC8vIHNldCB3aW5kb3cgYmFyIGljb25cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5mYVwiKS5jbGFzc0xpc3QuYWRkKGNvbmZpZy5pY29uKTtcclxuXHJcbiAgICAvLyBzZXQgd2luZG93IGJhciB0aXRsZVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXItdGl0bGVcIikudGV4dENvbnRlbnQgPSBjb25maWcudGl0bGU7XHJcblxyXG4gICAgLy8gc2V0IHBvc2l0aW9uIGFuZCBzaXplXHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGNvbmZpZy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IGNvbmZpZy55ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnpJbmRleCA9IGNvbmZpZy56SW5kZXg7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBjb25maWcud2lkdGggKyBcInB4XCI7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQgICsgXCJweFwiO1xyXG4gICAgdGhpcy50aXRsZUJhckhlaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLnNjcm9sbEhlaWdodDsgLy8gdXNlZCBmb3IgZHJhZyByZXppc2luZ1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dXaWR0aCA9IG5ldyBSZXNpemVXaW5kb3dXaWR0aCh0aGlzKTtcclxuICAgIHRoaXMucmVzaXplV2luZG93SGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd0hlaWdodCh0aGlzKTtcclxuICAgIHRoaXMucmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSBuZXcgUmVzaXplV2luZG93V2lkdGhIZWlnaHQodGhpcyk7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIik7XHJcblxyXG4gICAgLy8gcHV0IG9uIHRvcCBpZiBjbGlja2VkXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdmVUb1RvcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuXHJcbiAgICAvLyBkcmFnIHRoZSB3aW5kb3cgZnJvbSB0aGUgd2luZG93IGJhclxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBkb3VibGUgY2xpY2sgd2luZG93IGJhclxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIHRoaXMuZGJsY2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gY2xvc2UgZXZlbnRcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jbG9zZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gbWF4aW1pemUgZXZlbnRcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWF4aW1pemUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gcmVzdG9yZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnJlc3RvcmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gbWluaW1pemVcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5taW5pbWl6ZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWluaW1pemUuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiB1c2VyIGhhcyBoYXN0IHN0YXJ0ZWQgdG8gZHJhZyB0aGUgd2luZG93IGJhclxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gdGhlIGNsaWNrIGhhbmRsZXIgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50Lm9mZnNldFRvcCAtIGV2ZW50LnBhZ2VZO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcmFnZ2luZ1wiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiB1c2VyIGlzIGRyYWdnaW5nIGFuIGFwcCB3aW5kb3dcclxuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAtIHRoZSBtb3VzZW1vdmUgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy54ID0gZXZlbnQucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WDtcclxuICAgIHRoaXMueSA9IGV2ZW50LnBhZ2VZICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgICB0aGlzLmNoZWNrQm91bmRzKGV2ZW50KTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gIHRoaXMueCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbn07XHJcblxyXG4vKipcclxuICogY2hlY2tzIHRoYXQgYSBkcmFnZ2VkIHdpbmRvdyBpc250IGRyYWdnZWQgb2ZmIHNjcmVlblxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gdGhlIG1vdXNlbW92ZSBldmVudCBvYmplY3RcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuY2hlY2tCb3VuZHMgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYgKGV2ZW50LnBhZ2VYID4gdGhpcy5wd2Qud2lkdGgpIHtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnB3ZC53aWR0aCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChldmVudC5wYWdlWSA+IHRoaXMucHdkLmhlaWdodCkge1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMucHdkLmhlaWdodCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZXZlbnQucGFnZVkgPCAxKSB7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogdXNlciBoYXMgc3RvcHAgZHJhZ2dpbmdcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dpbmdcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogcG9zaXRpb24gdGhpcyB3aW5kb3cgaW4gZnJvbnQgb2Ygb3RoZXIgd2luZG93c1xyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5tb3ZlVG9Ub3AgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHdkLmxhc3RaSW5kZXggKz0gMTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLnB3ZC5sYXN0WkluZGV4O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGNsb3NlIHRoaXMgd2luZG93XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyAyMCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMud2lkdGggLSAxMDAgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIDUwICsgXCJweFwiO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnB3ZC5jbG9zZUFwcCh0aGlzKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBtYWtlIHRoZSB3aW5kb3cgZnVsbHNjcmVlblxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5hbmltYXRlKCk7XHJcblxyXG4gICAgLy8gc2F2ZSB0aGUgc2l6ZSBhbmQgcG9zaXRpb24gc28gd2UgY2FuIHJldHVybiB0byBpdCB3aXRoIHRoZSByZXN0b3JlIHdpbmRvdyBmdW5jdGlvblxyXG4gICAgdGhpcy5sYXN0WCA9IHRoaXMueDtcclxuICAgIHRoaXMubGFzdFkgPSB0aGlzLnk7XHJcbiAgICB0aGlzLmxhc3RXaWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmxhc3RIZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICAvLyB0ZWxsIHB3ZCB0aGlzIHdpbmRvdyBpcyBpbiBmdWxsc2NyZWVuIChpbiBjYXNlIG9mIGJyb3dzZXIgcmVzaXppbmcpXHJcbiAgICB0aGlzLnB3ZC5mdWxsc2NyZWVuZWRXaW5kb3cgPSB0aGlzO1xyXG5cclxuICAgIC8vIG1ha2UgdGhlIHdpbmRvdyBmdWxsc2NyZWVuXHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMucHdkLndpZHRoICsgXCJweFwiO1xyXG4gICAgdmFyIGhlaWdodCA9IHRoaXMucHdkLmhlaWdodCAtIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcblxyXG4gICAgLy8gaGlkZS9zaG93IHRoZSBtYXhpbWl6ZSBhbmQgcmVzdG9yZSB3aW5kb3diYXIgYnV0dG9uc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1heGltaXplLXdpbmRvd1wiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgLy8gaWYgaXQgaXMgbWF4aW1pemVkIGZyb20gYSBtaW5pbWl6ZWQgc3RhdGVcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubWVudUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGJyaW5nIHRoZSB3aW5kb3cgZnJvbSBmdWxsc2NyZWVuIGJhY2sgdG8gcHJldmlvdXMgc2l6ZVxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICB0aGlzLnggPSB0aGlzLmxhc3RYO1xyXG4gICAgdGhpcy55ID0gdGhpcy5sYXN0WTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMubGFzdFdpZHRoICsgXCJweFwiO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmxhc3RIZWlnaHQgKyBcInB4XCI7XHJcblxyXG4gICAgLy90ZWxsIHB3ZCB0aGlzIHdpbmRvdyBpcyBubyBsb25nZXIgaW4gZnVsbHNjcmVlbiAoaW4gY2FzZSBvZiBicm93c2VyIHJlc2l6aW5nKVxyXG4gICAgdGhpcy5wd2QuZnVsbHNjcmVlbmVkV2luZG93ID0gbnVsbDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuXHJcbiAgICAvLyBpZiBpdCBpcyByZXN0b3JlZCBmcm9tIGEgbWluaW1pemVkIHN0YXRlXHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLm1lbnVFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBtaW5pbWl6ZSB0aGlzIHdpbmRvd1xyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIXRoaXMubWluaW1pemVkKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICAgICAgdGhpcy5sYXN0WCA9IHRoaXMueDtcclxuICAgICAgICB0aGlzLmxhc3RZID0gdGhpcy55O1xyXG4gICAgICAgIHRoaXMubGFzdFdpZHRoID0gdGhpcy53aWR0aDtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMubWVudUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gXCIyMDBweFwiO1xyXG4gICAgICAgIHRoaXMubWluaW1pemVkID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLmxhc3RYO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMubGFzdFk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5sYXN0V2lkdGggKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMubWVudUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGhhbmRsZSBkb3VibGUgY2xpY2tzIG9uIHRoZSB3aW5kb3cgYmFyXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmRibGNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5taW5pbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLm1pbmltaXplKCk7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMubWF4aW1pemVkKSB7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubWF4aW1pemUoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBhZGQgY3NzIGFuaW1hdGlvbnMgZm9yIDEwMG1zIGFuZCB0aGVuIHJlbW92ZSBpdCBzbyBpdCB3b250IGludGVyZmVyIHdpdGggZHJhZ2dpbmcgYmVoYXZpb3VyXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGFkZCBhbmltYXRpb24gY2xhc3NcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2luZG93LWFuaW1hdGVkXCIpO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIndpbmRvdy1hbmltYXRlZFwiKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBwV2luZG93O1xyXG4iLCIvKipcclxuICogTW91c2VcclxuICovXHJcbmZ1bmN0aW9uIE1vdXNlKCl7XHJcbiAgICB0aGlzLmRyYWdnZWRPYmplY3QgPSBudWxsO1xyXG4gICAgdGhpcy5kcmFnT2Zmc2V0WCA9IDA7XHJcbiAgICB0aGlzLmRyYWdPZmZzZXRZID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICogb24gbW91c2V1cCBldmVudCBjaGVjayBpZiBhIHdpbmRvdyBpcyBiZWluZyBkcmFnZ2VkXHJcbiAgICAqIEBwYXJhbSAge1t0eXBlXX0gZSAtIG1vdXNldXAgZXZlbnQgb2JqZWN0XHJcbiAgICAqL1xyXG4gICAgdGhpcy5tb3VzZXVwID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5zdG9wRHJhZyhldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHdoZW5ldmVyIG1vdXNlIGlzIG1vdmVkXHJcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gbW91c2Vtb3ZlIGV2ZW50IG9iamVjdG5dXHJcbiAgICAgKi9cclxuICAgIHRoaXMubW91c2Vtb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5kcmFnKGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW91c2U7XHJcbiIsInZhciBBcHBXaW5kb3cgPSByZXF1aXJlKFwiLi9BcHBXaW5kb3dcIik7XHJcbnZhciBBcHBNZW51ID0gcmVxdWlyZShcIi4vQXBwTWVudVwiKTtcclxuXHJcbmZ1bmN0aW9uIFB3ZEFwcChjb25maWcpIHtcclxuICAgIHRoaXMudGl0bGUgPSBjb25maWcudGl0bGU7XHJcbiAgICB0aGlzLndpZHRoID0gY29uZmlnLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0O1xyXG4gICAgdGhpcy5pZCA9IGNvbmZpZy5pZDtcclxuICAgIGNvbmZpZy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICBjb25maWcuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICBjb25maWcudGl0bGUgPSB0aGlzLnRpdGxlO1xyXG4gICAgdGhpcy5hcHBXaW5kb3cgPSBuZXcgQXBwV2luZG93KGNvbmZpZyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHdkQXBwO1xyXG4iLCIvKipcclxuICogQXBwIHdpbmRvdyByZXNpemVyIENvbnN0cnVjdG9yXHJcbiAqIFRoaXMgaXMgYSBzbWFsbCBlbGVtZW50IG9uIHRoZSBib3R0b20gb2YgYXBwIHdpbmRvd3MuIGl0IGNhbiBiZSBkcmFnZ2VkIHVwIGFuZCBkb3duIHRvIHJlc2l6ZSB0aGUgaGVpZ2h0IG9mIGFwcCB3aW5kb3dzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcHBXaW5kb3cgLSB3aGF0IHdpbmRvdyB0byByZXNpemVcclxuICovXHJcbmZ1bmN0aW9uIFJlc2l6ZVdpbmRvd0hlaWdodChhcHBXaW5kb3cpIHtcclxuICAgIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKTtcclxuICAgIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vKipcclxuICogcmVzaXplciBkcmFnIGlzIHN0YXJ0ZWRcclxuICovXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy50aXRsZUJhckhlaWdodCAtIGV2ZW50LnBhZ2VZO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHJlc2l6ZXIgaXMgZHJhZ2dlZFxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IGV2ZW50IC0gbW91c2Vtb3ZlIGV2ZW50IG9iamVjdFxyXG4gKi9cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMucmVzaXplVGhpcy5zdHlsZS5oZWlnaHQgPSAoZXZlbnQucGFnZVkgLSB0aGlzLmFwcFdpbmRvdy55IC0gdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZKSArIFwicHhcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiByZXNpemVyIGRyYWcgc3RvcHBlZFxyXG4qL1xyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dIZWlnaHQ7XHJcbiIsIi8qKlxyXG4gKiBBcHAgd2luZG93IHdpZHRoIHJlc2l6ZXIgQ29uc3RydWN0b3JcclxuICogVGhpcyBpcyBhIHNtYWxsIGVsZW1lbnQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgYXBwIHdpbmRvd3MuIGl0IGNhbiBiZSBkcmFnZ2VkIGxlZnQgYW5kIHJpZ2h0IHRvIHJlc2l6ZSB0aGUgd2lkdGggb2YgYXBwIHdpbmRvd3NcclxuICogQHBhcmFtIHtvYmplY3R9IGFwcFdpbmRvdyAtIHdoYXQgd2luZG93IHRvIHJlc2l6ZVxyXG4gKi9cclxuZnVuY3Rpb24gUmVzaXplV2luZG93V2lkdGgoYXBwV2luZG93KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXhcIik7XHJcbiAgICB0aGlzLnJlc2l6ZVRoaXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuYXBwV2luZG93LmlkKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vKipcclxuICogZHJhZyBpcyBzdGFydGVkXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgbW91c2UgY2xpY2sgZXZlbnQgaGFuZGxlciBvYmplY3RcclxuICogQHJldHVybiB7W3R5cGVdfSAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG5cclxuICAgIC8vZHJhZyBmcm9tIGV4YWN0bHkgd2hlcmUgdGhlIGNsaWNrIGlzXHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0TGVmdCAtIGV2ZW50LnBhZ2VYO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHdpZHRoIHJlc2l6ZXIgaXMgZHJhZ2dlZFxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gbW91c2Vtb3ZlIGV2ZW50IG9iamVjdFxyXG4gKi9cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy5yZXNpemVUaGlzLnN0eWxlLndpZHRoID0gKGV2ZW50LnBhZ2VYIC0gdGhpcy5hcHBXaW5kb3cueCArIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd1dpZHRoO1xyXG4iLCIvKipcclxuICogQXBwIHdpbmRvdyByZXNpemVyIENvbnN0cnVjdG9yXHJcbiAqIFRoaXMgY29udHJvbHMgYm90aCB3aWR0aCBhbmQgaGVpZ2h0IHJlc2l6aW5nIG9mIGFuIGFwcCB3aW5kb3cuIGl0cyBlbGVtZW50IGlzIGEgc21hbGwgc3F1YXJlIGF0IHRoZSBib3R0b20gbGVmdCBjb3JuZXIgb2YgaXRzIGFwcCB3aW5kb3dcclxuICogQHBhcmFtIHtvYmplY3R9IGFwcFdpbmRvdyAtIHdoYXQgd2luZG93IHRvIHJlc2l6ZVxyXG4gKi9cclxuZnVuY3Rpb24gUmVzaXplV2luZG93V2lkdGhIZWlnaHQoYXBwV2luZG93KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXh5XCIpO1xyXG4gICAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiByZXNpemVyIGRyYWcgaXMgc3RhcnRlZFxyXG4gKi9cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgLy8gdGhpcyBlbGVtZW50IGhhcyBubyBvZmZzZXRUb3Agc28gaW5zdGVhZCB3ZSB1c2Ugd2luZG93LXJlc2l6ZXItaGVpZ2h0J3Mgb2Zmc2V0VG9wIHZhbHVlXHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LnRpdGxlQmFySGVpZ2h0IC0gZXZlbnQucGFnZVk7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0TGVmdCAtIGV2ZW50LnBhZ2VYO1xyXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIHRoaXMgY2xpY2sgc2hvdWxkbnQgZ28gdGhyb3VnaCB0byB0aGUgcGFyZW50IHdoaWNoIGlzIHRoZSBoZWlnaHQtcmVzaXplclxyXG59O1xyXG5cclxuLyoqIFxyXG4gKiB3aWR0aCZoZWlnaHQgcmVzaXplciBpcyBiZWluZyBkcmFnZ2VkIFxyXG4qL1xyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd0hlaWdodC5kcmFnKGUpO1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucmVzaXplV2luZG93V2lkdGguZHJhZyhlKTtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGhIZWlnaHQ7XHJcbiIsIi8qKlxyXG4gKiBjb25zdHJ1Y3RvciBmb3IgYSBkZXNrdG9wIGFwcCBzaG9ydGN1dFxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gYXBwIGNvbmZpZ1xyXG4gKiBAcGFyYW0ge29iamVjdH0gcHdkIC0gYSByZWZlcmVuY2UgdG8gdGhlIHB3ZFxyXG4gKi9cclxuZnVuY3Rpb24gU2hvcnRjdXQoY29uZmlnLCBwd2QpIHtcclxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG4gICAgdGhpcy50aXRsZSA9IGNvbmZpZy50aXRsZTtcclxuICAgIHRoaXMuZW50cnkgPSBjb25maWcuZW50cnk7XHJcbiAgICB0aGlzLnB3ZCA9IHB3ZDtcclxuXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzaG9ydGN1dFwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG5cclxuICAgIC8vIGFkZCBpY29uIGFuZCB0ZXh0XHJcbiAgICB0aGlzLmVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LmFkZChjb25maWcuaWNvbik7XHJcbiAgICB0aGlzLmVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IHRoaXMudGl0bGU7XHJcblxyXG4gICAgLy9hZGQgZXZlbnQgbGlzdGVuZXJcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wd2Quc3RhcnRBcHAodGhpcy5jb25maWcpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGN1dDtcclxuIiwidmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XHJcbnZhciBTaG9ydGN1dCA9IHJlcXVpcmUoXCIuL1Nob3J0Y3V0XCIpO1xyXG52YXIgYXBwTGlzdCA9IHJlcXVpcmUoXCIuL2FwcExpc3RcIik7XHJcblxyXG5cclxuLyoqXHJcbiAqIFBlcnNvbmFsIFdlYiBEZXNrdG9wXHJcbiAqL1xyXG52YXIgUHdkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1vdXNlID0gbmV3IE1vdXNlKCk7XHJcbiAgICB0aGlzLmluc3RhbGxlZEFwcHMgPSBbXTtcclxuICAgIHRoaXMuc3RhcnRlZEFwcHMgPSB7fTtcclxuICAgIHRoaXMubGFzdFpJbmRleCA9IDE7XHJcbiAgICB0aGlzLmxhc3RJRCA9IDE7XHJcbiAgICB0aGlzLmZ1bGxzY3JlZW5lZFdpbmRvdyA9IG51bGw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgc2hvcnRjdXRzIGZvciBhbGwgYXZhaWxhYmxlIGFwcHNcclxuICAgICAqL1xyXG4gICAgdGhpcy5pbnN0YWxsQXBwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvciAodmFyIGFwcCBpbiBhcHBMaXN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFsbGVkQXBwcy5wdXNoKG5ldyBTaG9ydGN1dChhcHBMaXN0W2FwcF0sIHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiB0aGUgdXNlciBjbGlja3MgYW4gYXBwIHNob3J0Y3V0IHRoaXMgZnVuY3Rpb24gd2lsbCBzdGFydCB0aGUgYXBwXHJcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZyAtIGNvbnRhaW5zIGFwcCBzZXR0aW5ncy4gVGhlIGNvbmZpZ3VyYXRpb24gY29tZXMgZnJvbSBhcHBMaXN0LmpzXHJcbiAgICAgKi9cclxuICAgIHRoaXMuc3RhcnRBcHAgPSBmdW5jdGlvbihjb25maWcpIHtcclxuXHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jYWxjdWxhdGVTdGFydFBvc2l0aW9uKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHZhciBuZXdBcHAgPSBuZXcgY29uZmlnLmVudHJ5KHtcclxuICAgICAgICAgICAgdGl0bGU6IGNvbmZpZy50aXRsZSxcclxuICAgICAgICAgICAgd2lkdGg6IGNvbmZpZy53aWR0aCxcclxuICAgICAgICAgICAgaGVpZ2h0OiBjb25maWcuaGVpZ2h0LFxyXG4gICAgICAgICAgICBpY29uOiBjb25maWcuaWNvbixcclxuICAgICAgICAgICAgcHdkOiB0aGlzLFxyXG4gICAgICAgICAgICBpZDogdGhpcy5sYXN0SUQsXHJcbiAgICAgICAgICAgIHg6IHBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgIHpJbmRleDogdGhpcy5sYXN0WkluZGV4XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGFydGVkQXBwc1t0aGlzLmxhc3RJRF0gPSBuZXdBcHA7XHJcbiAgICAgICAgdGhpcy5sYXN0WkluZGV4ICs9IDE7XHJcbiAgICAgICAgdGhpcy5sYXN0SUQgKz0gMTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIHdoZXJlIG5ldyBhcHBzIHNob3VsZCBhcHBlYXIgb24gdGhlIHNjcmVlblxyXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBjb25maWcgLSBjb250YWlucyB0aGUgIGFwcHMgc3RhbmRhcmQgd2lkdGggYW5kIGhlaWdodFxyXG4gICAgICovXHJcbiAgICB0aGlzLmNhbGN1bGF0ZVN0YXJ0UG9zaXRpb24gPSBmdW5jdGlvbihjb25maWcpIHtcclxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHN0YXJ0aW5nIFggWSBjb29yZGluYXRlcyBhcmUgZ29vZFxyXG5cclxuICAgICAgICB2YXIgeCA9IHRoaXMubmV3WCAtIGNvbmZpZy53aWR0aCAvIDI7XHJcbiAgICAgICAgdmFyIHkgPSB0aGlzLm5ld1kgLSBjb25maWcuaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgLy8gcmVzZXQgaWYgWCBpcyBvZmYgc2NyZWVuXHJcbiAgICAgICAgaWYgKHggPiB0aGlzLndpZHRoIC0gNDAgfHwgeSA+IHRoaXMuaGVpZ2h0IC0gNDApIHtcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFggKz0gMjA7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9yaWdpbmFsWCA+IHRoaXMud2lkdGggLSAyMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFggPSAyMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5uZXdYID0gdGhpcy5vcmlnaW5hbFg7XHJcbiAgICAgICAgICAgIHRoaXMubmV3WSA9IHRoaXMub3JpZ2luYWxZO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVzZXQgaWYgWSBpcyBvZmYgc2NyZWVuXHJcblxyXG4gICAgICAgIHRoaXMubmV3WCArPSAyMDtcclxuICAgICAgICB0aGlzLm5ld1kgKz0gMjA7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBuZXcgYXBwIGlzIGJpZ2dlciB0aGFuIHRoZSBwd2Qgd2luZG93XHJcbiAgICAgICAgaWYgKHggPCAwKSB7XHJcbiAgICAgICAgICAgIHggPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHkgPCAwKSB7XHJcbiAgICAgICAgICAgIHkgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbG9zZSBhbiBhcHBcclxuICAgICAqIEBwYXJhbSAge29iamVjdH0gYXBwXHJcbiAgICAgKi9cclxuICAgIHRoaXMuY2xvc2VBcHAgPSBmdW5jdGlvbihhcHApIHtcclxuICAgICAgICB0aGlzLnN0YXJ0ZWRBcHBzW2FwcC5pZF0uY2xvc2UoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5zdGFydGVkQXBwc1thcHAuaWRdO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJyb3dzZXIgcmVzaXplXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVzaXplID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdYID0gdGhpcy53aWR0aCAvIDI7XHJcbiAgICAgICAgdGhpcy5uZXdZID0gdGhpcy5oZWlnaHQgLyAyLjU7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFggPSB0aGlzLm5ld1g7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFkgPSB0aGlzLm5ld1k7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmZ1bGxzY3JlZW5lZFdpbmRvdykge1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5lZFdpbmRvdy5tYXhpbWl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG52YXIgcHdkID0gbmV3IFB3ZCgpO1xyXG5wd2QuaW5zdGFsbEFwcHMoKTsgLy8gY3JlYXRlIHNob3J0Y3V0cyBmb3IgYWxsIGF2YWlsYWJsZSBhcHBzXHJcbnB3ZC5yZXNpemUoKTsgLy8gcnVuIHJlc2l6ZSBvbmNlIHRvIGdldCB3aWR0aCBhbmQgY2FsY3VsYXRlIHN0YXJ0IHBvc2l0aW9uIG9mIGFwcHNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcHdkLnJlc2l6ZS5iaW5kKHB3ZCkpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIFwiQ2hhdFwiOiB7XHJcbiAgICAgICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvY2hhdC9hcHBcIiksXHJcbiAgICAgICAgdGl0bGU6IFwiQ2hhdFwiLFxyXG4gICAgICAgIHdpZHRoOiA1MDAsXHJcbiAgICAgICAgaGVpZ2h0OiA0MDAsXHJcbiAgICAgICAgaWNvbjogXCJmYS1jb21tZW50aW5nXCJcclxuICAgIH0sXHJcbiAgICBcIk1lbW9yeVwiOiB7XHJcbiAgICAgICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvbWVtb3J5L2FwcFwiKSxcclxuICAgICAgICB0aXRsZTogXCJNZW1vcnlcIixcclxuICAgICAgICB3aWR0aDogNTUwLFxyXG4gICAgICAgIGhlaWdodDogNDQwLFxyXG4gICAgICAgIGljb246IFwiZmEtY2xvbmVcIlxyXG4gICAgfVxyXG59O1xyXG5cclxuIiwidmFyIENoYW5uZWwgPSBmdW5jdGlvbihjaGF0LCBuYW1lKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5jaGF0ID0gY2hhdDtcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsc1tuYW1lXSA9IHRoaXM7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0LWNoYW5uZWxcIik7XHJcbiAgICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xyXG5cclxuICAgIHRoaXMuY2hhdERpdi5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvLyBsaXN0ZW4gZm9yIGVudGVyIGtleVxyXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAvL3NlbmQgYSBtZXNzYWdlXHJcbiAgICAgICAgICAgIHRoaXMuY2hhdC5zZW5kTWVzc2FnZSh0aGlzLm5hbWUsIGV2ZW50LnRhcmdldC52YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBlbXB0eSB0ZXh0YXJlYVxyXG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5jaGF0LmNoYXRDaGFubmVsRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmNoYXREaXYpO1xyXG5cclxuICAgIC8vY2hhbm5lbCBsaXN0IGVudHJ5XHJcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC1jaGFubmVsLWxpc3QtZW50cnlcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMuY2hhdC5qb2luQ2hhbm5lbEJ1dHRvbik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQgPSB0aGlzLmNoYXQuY2hhbm5lbExpc3RFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQucHJldmlvdXNFbGVtZW50U2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgaWYgKG5hbWUgPT09IFwiXCIpIHtcclxuICAgICAgICBuYW1lID0gXCJEZWZhdWx0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBuYW1lO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNoYXQuYWN0aXZlQ2hhbm5lbC5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwgPSB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBjbG9zZSBjaGFubmVsXHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VDaGFubmVsKCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUucHJpbnRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVwiKVswXTtcclxuICAgIHZhciBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcclxuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbChcIi5jaGF0LXRleHRcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7XHJcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1hdXRob3JcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xyXG4gICAgdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1tZXNzYWdlc1wiKVswXS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcclxuXHJcbiAgICBpZiAodGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwgIT09IHRoaXMpIHtcclxuICAgICAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImNoYXQtY2hhbm5lbC1uZXdtZXNzYWdlXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jaGF0RGl2LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtYWN0aXZlLWNoYW5uZWxcIik7XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNoYXREaXYuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY2hhdC1hY3RpdmUtY2hhbm5lbFwiKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jaGFubmVsLW5ld21lc3NhZ2VcIik7XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5jbG9zZUNoYW5uZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcmVtb3ZlIGNoYW5uZWwgbGlzdCBlbnRyeVxyXG4gICAgdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmxpc3RFbnRyeUVsZW1lbnQpO1xyXG5cclxuICAgIC8vcmVtb3ZlIGNoYXQgZGl2XHJcbiAgICB0aGlzLmNoYXQuY2hhdENoYW5uZWxFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuY2hhdERpdik7XHJcblxyXG4gICAgdGhpcy5jaGF0LmNsb3NlQ2hhbm5lbCh0aGlzKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhbm5lbDtcclxuIiwidmFyIFB3ZEFwcCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9Qd2RBcHBcIik7XHJcbnZhciBzb2NrZXRDb25maWcgPSByZXF1aXJlKFwiLi9zb2NrZXRDb25maWcuanNvblwiKTtcclxudmFyIENoYW5uZWwgPSByZXF1aXJlKFwiLi9DaGFubmVsXCIpO1xyXG5cclxuLyoqXHJcbiAqIENoYXQgY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIGFwcCBjb25maWd1cmF0aW9uIG9iamVjdFxyXG4gKi9cclxuZnVuY3Rpb24gQ2hhdChjb25maWcpIHtcclxuICAgIFB3ZEFwcC5jYWxsKHRoaXMsIGNvbmZpZyk7IC8vaW5oZXJpdCBmcm9tIHB3ZEFwcCBvYmplY3RcclxuICAgIHRoaXMuY2hhbm5lbHMgPSB7fTtcclxuICAgIHRoaXMuYWN0aXZlQ2hhbm5lbCA9IG51bGw7XHJcbiAgICB0aGlzLnNvY2tldCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5pbnB1dE5hbWUoKSAvLyBnZXQgdXNlcm5hbWVcclxuICAgIC50aGVuKGZ1bmN0aW9uKHVzZXJuYW1lKSB7XHJcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgICAgIHRoaXMuc3RhcnRDaGF0KCk7XHJcbiAgICB9LmJpbmQodGhpcykpXHJcbiAgICAudGhlbih0aGlzLmNvbm5lY3QoKSkgLy8gdGhlbiB3ZSBjb25uZWN0XHJcbiAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0aGlzLCBcIlwiKTsgLy8gdGhlbiB3ZSBjb25uZWN0IHRvIHRoZSBkZWZhdWx0IGNoYW5uZWxcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkNoYXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQd2RBcHAucHJvdG90eXBlKTtcclxuQ2hhdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGF0O1xyXG5cclxuLyoqXHJcbiAqIGVudGVyIHVzZXJuYW1lXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5pbnB1dE5hbWUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShcclxuICAgICAgICBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHNob3cgbmFtZSBpbnB1dCB0ZXh0IGFuZCBidXR0b25cclxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0LXVzZXJuYW1lLWlucHV0XCIpO1xyXG4gICAgICAgICAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcFdpbmRvdy5jb250ZW50LmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1idG4tdXNlcm5hbWVcIik7XHJcbiAgICAgICAgICAgIHZhciB0ZXh0SW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC11c2VybmFtZS1pbnB1dCBpbnB1dFt0eXBlPXRleHRdXCIpO1xyXG5cclxuICAgICAgICAgICAgdGV4dElucHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRleHRJbnB1dC52YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0ZXh0SW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGV4dElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRleHRJbnB1dC52YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGV4dElucHV0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBjcmVhdGUgY2hhdCBjaGFubmVsIGh0bWxcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnN0YXJ0Q2hhdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gY2xlYXIgd2luZG93IG9mIHByZXZpb3VzIGVsZW1lbnQgKHRoZSBpbnB1dCB1c2VybmFtZSBzY3JlZW4pXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIHRoaXMuYXBwV2luZG93LmNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcclxuICAgIHRoaXMuY2hhdENoYW5uZWxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtY2hhbm5lbHNcIik7XHJcbiAgICB0aGlzLmNoYW5uZWxMaXN0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWNoYW5uZWwtbGlzdFwiKTtcclxuXHJcbiAgICAvLyBob29rIHVwIGpvaW4gY2hhbm5lbCBidXR0b25cclxuICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiBpbnB1dFt0eXBlPWJ1dHRvblwiKTtcclxuICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWpvaW4tY2hhbm5lbFwiKTtcclxuXHJcbiAgICB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBsaXN0ZW5lclxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG5cclxuICAgICAgICAvLyBzaG93IHRoZSBqb2luIG5ldyBjaGFubmVsIGZvcm0gYW5kIHBvc2l0aW9uIGl0IG5leHQgdG8gdGhlIG1vdXNlIGN1cnNvclxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB2YXIgYnRuYm91bmRpbmdSZWN0ID0gdGhpcy5qb2luQ2hhbm5lbEJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB2YXIgaW5wdXRCb3VuZGluZ1JlY3QgPSB0aGlzLmpvaW5DaGFubmVsSW5wdXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIHZhciBsZWZ0ID0gYnRuYm91bmRpbmdSZWN0LmxlZnQgLSB0aGlzLmFwcFdpbmRvdy54ICsgYnRuYm91bmRpbmdSZWN0LndpZHRoICsgNCArIFwicHhcIjtcclxuICAgICAgICB2YXIgdG9wID0gYnRuYm91bmRpbmdSZWN0LnRvcCAtIHRoaXMuYXBwV2luZG93LnkgLSAoaW5wdXRCb3VuZGluZ1JlY3QuaGVpZ2h0IC8gMikgKyAoYnRuYm91bmRpbmdSZWN0LmhlaWdodCAvIDIpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuc3R5bGUubGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnN0eWxlLnRvcCA9IHRvcDtcclxuXHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnZhbHVlID0gXCJcIjtcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIHRoaXMgY2xpY2sgc2hvdWxkbnQgcGFzcyB0aHJvdWdoIG90aGVyd2lzZSB0aGUgaW5wdXQgd2lsbCBiZSBoaWRkZW4gYnkgdGhlIHdpbmRvd2NsaWNrbGlzdGVuZXJcclxuXHJcbiAgICAgICAgLy9oaWRlIHRoZSBqb2luIGNoYW5uZWwgZGl2IGlmIHRoZXJlcyBhIGNsaWNrIGFueXdoZXJlIG9uIHNjcmVlbiBleGNlcHQgaW4gdGhlIGpvaW4gY2hhbm5lbCBkaXZcclxuICAgICAgICB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKTtcclxuICAgICAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBqb2luIGNoYW5uZWwgYnV0dG9uIGFnYWluXHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gZG9udCBoaWRlIGlmIHRoZSBjbGljayBpcyBpbiB0aGUgam9pbiBjaGFubmVsIGRpdlxyXG4gICAgICAgIHRoaXMuY2xpY2tKb2luQ0hhbm5lbEZvcm0gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKTtcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tKb2luQ0hhbm5lbEZvcm0pO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG4gICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIC8vIGxpc3RlbiBmb3IgZW50ZXIga2V5XHJcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgIC8vIGpvaW4gY2hhbm5lbFxyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0aGlzLCBldmVudC50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0oKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoc29ja2V0Q29uZmlnLmFkZHJlc3MpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJDb3VsZCBub3QgY29ubmVjdFwiKSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY2hhbm5lbCBpbiB0aGlzLmNoYW5uZWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsc1ttZXNzYWdlLmNoYW5uZWxdLnByaW50TWVzc2FnZShtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbihjaGFubmVsLCB0ZXh0KSB7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcclxuICAgICAgICBkYXRhOiB0ZXh0LFxyXG4gICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXJuYW1lLFxyXG4gICAgICAgIGNoYW5uZWw6IGNoYW5uZWwsXHJcbiAgICAgICAga2V5OiBzb2NrZXRDb25maWcua2V5XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7XHJcbiAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZXJyb3IpO1xyXG4gICAgfSk7XHJcblxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xvc2VDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCkge1xyXG4gICAgZGVsZXRlIHRoaXMuY2hhbm5lbHNbY2hhbm5lbC5uYW1lXTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5yZW1vdmVDaGlsZCh0aGlzLmFwcFdpbmRvdy5lbGVtZW50KTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSB0YXNrYmFyXHJcbiAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZCAudGFza2JhclwiKS5yZW1vdmVDaGlsZCh0aGlzLnRhc2tiYXJBcHAuZWxlbWVudCk7XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xyXG4iLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgXCJhZGRyZXNzXCI6IFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIixcclxuICBcImtleVwiOiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcclxufVxyXG4iLCJ2YXIgSW1hZ2UgPSByZXF1aXJlKFwiLi9JbWFnZVwiKTtcclxudmFyIGtleWJvYXJkID0gcmVxdWlyZShcIi4va2V5Ym9hcmRcIik7XHJcblxyXG4vKipcclxuICogc2h1ZmZsZSB0aGUgYXJyYXkgb2YgaW1hZ2VzXHJcbiAqIEBwYXJhbSAge29iamVjdH0gYm9hcmQgLSByZWZlcmVuY2UgdG8gdGhlIGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBzaHVmZmxlKGJvYXJkKSB7XHJcbiAgICB2YXIgaTtcclxuICAgIHZhciByYW5kb21JbmRleDtcclxuICAgIHZhciBiYWNrSW5kZXg7XHJcblxyXG4gICAgLy8gbW92ZSB0aHJvdWdoIHRoZSBkZWNrIG9mIGNhcmRzIGZyb20gdGhlIGJhY2sgdG8gZnJvbnRcclxuICAgIGZvciAoaSA9IGJvYXJkLmltYWdlQXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xyXG4gICAgICAgIC8vcGljayBhIHJhbmRvbSBjYXJkIGFuZCBzd2FwIGl0IHdpdGggdGhlIGNhcmQgZnVydGhlc3QgYmFjayBvZiB0aGUgdW5zaHVmZmxlZCBjYXJkc1xyXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XHJcbiAgICAgICAgYmFja0luZGV4ID0gYm9hcmQuaW1hZ2VBcnJheVtpXTtcclxuICAgICAgICBib2FyZC5pbWFnZUFycmF5W2ldID0gYm9hcmQuaW1hZ2VBcnJheVtyYW5kb21JbmRleF07XHJcbiAgICAgICAgYm9hcmQuaW1hZ2VBcnJheVtyYW5kb21JbmRleF0gPSBiYWNrSW5kZXg7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCb2FyZFxyXG4gKiBAcGFyYW0ge29iamVjdH0gcHdkIC0gcHdkIHJlZmVyZW5jZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gY29sdW1ucyAtIGhvdyBtYW55IGNvbHVtbnMgd2lkZSB0aGUgbWVtb3J5IGdhbWUgc2hvdWxkIG1lXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByb3dzIC0gaG93IG1hbnkgcm93c1xyXG4gKi9cclxuZnVuY3Rpb24gQm9hcmQocHdkLCBjb2x1bW5zLCByb3dzKSB7XHJcbiAgICB0aGlzLnB3ZCA9IHB3ZDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLnRleHRDb250ZW50ID0gXCJcIjtcclxuXHJcbiAgICAvLyBUT0RPOiB2ZXJpZnkgd2lkdGgvaGVpZ2h0XHJcbiAgICB0aGlzLnJvd3MgPSByb3dzO1xyXG4gICAgdGhpcy5jb2x1bW5zID0gY29sdW1ucztcclxuICAgIHRoaXMuaW1hZ2VTaXplID0gMTEwO1xyXG4gICAgdGhpcy5hdHRlbXB0cyA9IDA7XHJcbiAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmtleWJvYXJkU2VsZWN0ID0ge1xyXG4gICAgICAgIHg6IDAsXHJcbiAgICAgICAgeTogMFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktd3JhcHBlclwiKTtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkKS5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCAxKTtcclxuXHJcbiAgICAvLyBBdHRlbXB0cyBodG1sXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeS1hdHRlbXB0c1wiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuICAgIHRoaXMuYXR0ZW1wdHNEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLm1lbW9yeS1hdHRlbXB0c1wiKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktYm9hcmRcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLmNvbHVtbnMgKiB0aGlzLmltYWdlU2l6ZSArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5taW5XaWR0aCA9IHRoaXMuY29sdW1ucyAqIHRoaXMuaW1hZ2VTaXplICsgXCJweFwiO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGhpcy53cmFwcGVyRWxlbWVudCk7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XHJcblxyXG4gICAgLy9jcmVhdGUgYXJyYXkgb2YgaW1hZ2VzXHJcbiAgICB0aGlzLmltYWdlQXJyYXkgPSBbXTtcclxuICAgIHZhciBkb2NmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbHVtbnMgKiB0aGlzLnJvd3M7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBuZXdJbWFnZSA9IG5ldyBJbWFnZShNYXRoLmZsb29yKGkgLyAyKSArIDEsIGksIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VBcnJheS5wdXNoKG5ld0ltYWdlKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2h1ZmZsZSh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmltYWdlQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xyXG4gICAgICAgIGRvY2ZyYWcuYXBwZW5kQ2hpbGQoaW1hZ2UuZWxlbWVudCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jZnJhZyk7XHJcblxyXG4gICAgLy9oYW5kbGUgY2xpY2tzXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgLy9yZW1vdmUga2V5Ym9hcmQgc2VsZWN0IG91dGxpbmVcclxuICAgICAgICBrZXlib2FyZC5yZW1vdmVPdXRsaW5lKHRoaXMpO1xyXG4gICAgICAgIHZhciBjbGlja2VkSWQgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiKTtcclxuICAgICAgICB0aGlzLmltYWdlQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xyXG4gICAgICAgICAgICBpZiAoY2xpY2tlZElkID09IGltYWdlLmlkKSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZS5jbGljayh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvL2hhbmRsZSBrZXlib2FyZFxyXG4gICAga2V5Ym9hcmQuaGFuZGxlSW5wdXQodGhpcyk7XHJcblxyXG4gICAgdGhpcy5zZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zdGFydEdhbWUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmF0dGVtcHRzID0gMDtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vZmxpcCBpbWFnZXNcclxuICAgICAgICB0aGlzLmltYWdlQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xyXG4gICAgICAgICAgICBpbWFnZS5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKCdpbWFnZS9hcHBzL21lbW9yeS8wLnBuZycpXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJvYXJkO1xyXG4iLCJ2YXIga2V5Ym9hcmQgPSByZXF1aXJlKFwiLi9rZXlib2FyZFwiKTtcclxuXHJcbi8qKlxyXG4gKiBpbWFnZSBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge051bWJlcn0gaW1hZ2VOdW1iZXJcclxuICogQHBhcmFtIHtOdW1iZXJ9IGlkXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBib2FyZFxyXG4gKi9cclxuZnVuY3Rpb24gSW1hZ2UoaW1hZ2VOdW1iZXIsIGlkLCBib2FyZCkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWltYWdlXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaW1hZ2VudW1iZXJcIiwgaW1hZ2VOdW1iZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgaWQpO1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5pbWFnZU51bWJlciA9IGltYWdlTnVtYmVyO1xyXG4gICAgdGhpcy5ib2FyZCA9IGJvYXJkO1xyXG4gICAgdGhpcy5jbGlja2FibGUgPSB0cnVlO1xyXG59XHJcblxyXG4vKipcclxuICogaGFuZGxlIGNsaWNrc1xyXG4gKi9cclxuSW1hZ2UucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuY2xpY2thYmxlKSB7XHJcbiAgICAgICAgdGhpcy5jbGlja2FibGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNob3coKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmJvYXJkLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuc2VsZWN0ZWQgPSB0aGlzO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgX3NlbGVjdGVkID0gdGhpcy5ib2FyZC5zZWxlY3RlZDtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5hdHRlbXB0cyArPSAxO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5hdHRlbXB0c0Rpdi50ZXh0Q29udGVudCA9IFwiQXR0ZW1wdHM6IFwiICsgdGhpcy5ib2FyZC5hdHRlbXB0cztcclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQuc2VsZWN0ZWQuaW1hZ2VOdW1iZXIgPT09IHRoaXMuaW1hZ2VOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIG1hdGNoXHJcbiAgICAgICAgICAgICAgICBrZXlib2FyZC5yZW1vdmVPdXRsaW5lKHRoaXMuYm9hcmQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktZ3JlZW5cIik7XHJcbiAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWdyZWVuXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBfc2VsZWN0ZWQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNDAwKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3QgYSBtYXRjaFxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgX3NlbGVjdGVkLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1yZWRcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIm1lbW9yeS1yZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIm1lbW9yeS1yZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuY2xpY2thYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsaWNrYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGZsaXAgYmFjayB0aGUgaW1hZ2VcclxuICovXHJcbkltYWdlLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5LzAucG5nJylcIjtcclxufTtcclxuXHJcbi8qKiBcclxuICogcmV2ZWFsIGltYWdlXHJcbiAqL1xyXG5JbWFnZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKCdpbWFnZS9hcHBzL21lbW9yeS9cIiArIHRoaXMuaW1hZ2VOdW1iZXIgKyBcIi5wbmcnKVwiO1xyXG59O1xyXG5cclxuLyoqIFxyXG4gKiByZW1vdmUgaW1hZ2VcclxuICovXHJcbkltYWdlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWZhZGUtb3V0XCIpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZTsiLCJ2YXIgUHdkQXBwID0gcmVxdWlyZShcIi4uLy4uLy4uL2pzL1B3ZEFwcFwiKTtcclxudmFyIEJvYXJkID0gcmVxdWlyZShcIi4vQm9hcmQuanNcIik7XHJcbnZhciBBcHBNZW51ID0gcmVxdWlyZShcIi4uLy4uLy4uL2pzL0FwcE1lbnVcIik7XHJcblxyXG4vKipcclxuICogTWVtb3J5IGFwcCBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gYXBwIGNvbmZpZyBvYmplY3RcclxuICovXHJcbmZ1bmN0aW9uIE1lbW9yeShjb25maWcpIHtcclxuICAgIFB3ZEFwcC5jYWxsKHRoaXMsIGNvbmZpZyk7XHJcblxyXG4gICAgLy8gYWRkIGEgZHJvcGRvd24gbWVudSB0byB0aGUgd2luZG93XHJcbiAgICB0aGlzLm1lbnUgPSBuZXcgQXBwTWVudSh0aGlzLmFwcFdpbmRvdy5tZW51RWxlbWVudCwgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJGaWxlXCIsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJOZXcgZ2FtZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5uZXdHYW1lLmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJRdWl0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFwcFdpbmRvdy5jbG9zZS5iaW5kKHRoaXMuYXBwV2luZG93KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCh0aGlzLCA0LDMpO1xyXG4gICAgdGhpcy5ib2FyZC5zdGFydEdhbWUoKTtcclxufVxyXG5cclxuTWVtb3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHdkQXBwLnByb3RvdHlwZSk7XHJcbk1lbW9yeS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1vcnk7XHJcblxyXG5NZW1vcnkucHJvdG90eXBlLm5ld0dhbWUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb250ZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKTtcclxuICAgIGNvbnRlbnRFbGVtZW50LnRleHRDb250ZW50ID0gXCJcIjtcclxuXHJcbiAgICAvLyBpbnB1dCByb3dzL2NvbHMgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnktc2V0dXBcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgY29udGVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gICAgXHJcbiAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmJ0blwiKTtcclxuICAgIHZhciByb3dzSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWVtb3J5LXJvd3MtaW5wdXRcIik7XHJcbiAgICB2YXIgY29sc0lucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1lbW9yeS1jb2xzLWlucHV0XCIpO1xyXG5cclxuICAgIHJvd3NJbnB1dC52YWx1ZSA9IHRoaXMuYm9hcmQucm93cztcclxuICAgIGNvbHNJbnB1dC52YWx1ZSA9IHRoaXMuYm9hcmQuY29sdW1ucztcclxuXHJcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQodGhpcywgY29sc0lucHV0LnZhbHVlLHJvd3NJbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5zdGFydEdhbWUoKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogd2hlbiB0aGUgYXBwIGlzIGNsb3NpbmdcclxuICovXHJcbk1lbW9yeS5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHJlbW92ZSB0aGUgZ3JhcGhpY3NcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLnJlbW92ZUNoaWxkKHRoaXMuYXBwV2luZG93LmVsZW1lbnQpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnk7XHJcbiIsIi8qKlxyXG4gKiByZW1vdmUgdGhlIG91dGxpbmUgZnJvbSBzZWxlY3RlZCBtZW1vcnkgaW1hZ2VcclxuICogQHBhcmFtICB7b2JqZWN0fSBib2FyZCAtIGJvYXJkIHJlZmVyZW5jZVxyXG4gKi9cclxuZnVuY3Rpb24gcmVtb3ZlT3V0bGluZShib2FyZCkge1xyXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYm9hcmQucHdkLmlkICsgXCIgLm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKSkge1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYm9hcmQucHdkLmlkICsgXCIgLm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwibWVtb3J5LWtleWJvYXJkU2VsZWN0XCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogXHJcbiAqIHNlbGVjdCBhbiBpbWFnZVxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBzZWxlY3QoYm9hcmQpIHtcclxuICAgIHJlbW92ZU91dGxpbmUoYm9hcmQpO1xyXG4gICAgdmFyIHNlbGVjdGVkID0gYm9hcmQua2V5Ym9hcmRTZWxlY3QueCArIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgKiBib2FyZC5jb2x1bW5zO1xyXG4gICAgYm9hcmQuaW1hZ2VBcnJheVtzZWxlY3RlZF0uZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWtleWJvYXJkU2VsZWN0XCIpO1xyXG59XHJcblxyXG4vKiogXHJcbiogQ2FwdHVyZSBrZXlib2FyZCBwcmVzc2VzIGFuZCB1c2UgaXQgdG8gc2VsZWN0IG1lbW9yeSBjYXJkc1xyXG4qIEBwYXJhbSAge29iamVjdH0gYm9hcmRcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUlucHV0KGJvYXJkKSB7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCkuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIga2V5ID0gZS5rZXlDb2RlID8gZS5rZXlDb2RlIDogZS53aGljaDtcclxuICAgICAgICBpZiAoa2V5ID09PSAzNykge1xyXG4gICAgICAgICAgICAvL2xlZnRcclxuICAgICAgICAgICAgaWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC54IC09IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2UgaWYgKGtleSA9PT0gMzgpIHtcclxuICAgICAgICAgICAgLy91cFxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgLT0gMTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZSBpZiAoa2V5ID09PSAzOSkge1xyXG4gICAgICAgICAgICAvL3JpZ2h0XHJcbiAgICAgICAgICAgIGlmIChib2FyZC5rZXlib2FyZFNlbGVjdC54IDwgYm9hcmQuY29sdW1ucyAtIDEpIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmtleWJvYXJkU2VsZWN0LnggKz0gMTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gNDApIHtcclxuICAgICAgICAgICAgLy9kb3duXHJcbiAgICAgICAgICAgIGlmIChib2FyZC5rZXlib2FyZFNlbGVjdC55IDwgYm9hcmQucm93cyAtIDEpIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgKz0gMTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gMzIpIHtcclxuICAgICAgICAgICAgLy9zcGFjZVxyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBib2FyZC5rZXlib2FyZFNlbGVjdC54ICsgYm9hcmQua2V5Ym9hcmRTZWxlY3QueSAqIGJvYXJkLmNvbHVtbnM7XHJcbiAgICAgICAgICAgIGJvYXJkLmltYWdlQXJyYXlbc2VsZWN0ZWRdLmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgdHJ1ZSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLmhhbmRsZUlucHV0ID0gaGFuZGxlSW5wdXQ7XHJcbm1vZHVsZS5leHBvcnRzLnJlbW92ZU91dGxpbmUgPSByZW1vdmVPdXRsaW5lO1xyXG4iXX0=
