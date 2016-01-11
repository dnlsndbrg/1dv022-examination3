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
    this.menu = new AppMenu(document.querySelector("#window-" + this.id + " .window-menu"), [
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
    
    var button = document.querySelector("#window-" + this.id + " input[type=button]");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwTWVudS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHdkQXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Jlc2l6ZVdpbmRvd1dpZHRoLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5qcyIsImNsaWVudC9zb3VyY2UvanMvU2hvcnRjdXQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwTGlzdC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9jaGF0L0NoYW5uZWwuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9zb2NrZXRDb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9tZW1vcnkvQm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L0ltYWdlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L2tleWJvYXJkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBBcHBNZW51KG1lbnVFbGVtZW50LCBtZW51cykge1xyXG5cclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LW1lbnUtY29udGFpbmVyXCIpO1xyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIG1lbnVFbGVtZW50LmFwcGVuZENoaWxkKGNsb25lKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IG1lbnVFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQubGFzdEVsZW1lbnRDaGlsZDtcclxuXHJcbiAgICBtZW51cy5mb3JFYWNoKGZ1bmN0aW9uKG1lbnUpIHtcclxuICAgICAgICAvLyBjcmVhdGUgbWVudSBoZWFkZXJcclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1tZW51LWhlYWRlclwiKTtcclxuICAgICAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBoZWFkZXIgbmFtZVxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gbWVudS5uYW1lO1xyXG5cclxuICAgICAgICAvLyBhZGQgbWVudSBpdGVtc1xyXG4gICAgICAgIHZhciBkcm9wZG93biA9IHRoaXMuZWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgbWVudS5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBtZW51IGl0ZW0gaHRtbFxyXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1tZW51LWl0ZW1cIik7XHJcbiAgICAgICAgICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGRyb3Bkb3duLmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNldCBuYW1lIGFuZCBhc3NpZ24gZXZlbnRsaXN0ZW5lclxyXG4gICAgICAgICAgICB2YXIgaXRlbUVsZW1lbnQgPSBkcm9wZG93bi5sYXN0RWxlbWVudENoaWxkLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgICAgIGl0ZW1FbGVtZW50LnRleHRDb250ZW50ID0gaXRlbS5uYW1lO1xyXG4gICAgICAgICAgICBpdGVtRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgaXRlbS5hY3Rpb24pO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcHBNZW51O1xyXG4iLCJ2YXIgUmVzaXplV2luZG93V2lkdGggPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aFwiKTtcclxudmFyIFJlc2l6ZVdpbmRvd0hlaWdodCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd0hlaWdodFwiKTtcclxudmFyIFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93V2lkdGhIZWlnaHRcIik7XHJcblxyXG4vKipcclxuICogQXBwV2luZG93IENvbnN0cnVjdG9yLiBUaGlzIG9iamVjdCBoYW5kbGVzIHRoZSBncmFwaGljcyBhbmQgYWxsIHJlbGF0ZWQgZXZlbnRzIHN1Y2ggYXMgcmVzaXppbmcsIG1heGltaXppbmcsIGNsb3NpbmcgZXRjLlxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gaXQgdGFrZXMgdGhlIGFwcCBjb25maWcgYXMgYW4gYXJndW1lbnRcclxuICovXHJcbmZ1bmN0aW9uIEFwcFdpbmRvdyhjb25maWcpIHtcclxuICAgIHRoaXMuaWQgPSBjb25maWcuaWQ7XHJcbiAgICB0aGlzLnB3ZCA9IGNvbmZpZy5wd2Q7XHJcbiAgICB0aGlzLndpZHRoID0gY29uZmlnLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0O1xyXG4gICAgdGhpcy54ID0gY29uZmlnLng7XHJcbiAgICB0aGlzLnkgPSBjb25maWcueTtcclxuICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBodG1sXHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYXBwV2luZG93XCIpLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgIC8vIGRlZmluZSB0aGlzLmVsZW1lbnRcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmxhc3RFbGVtZW50Q2hpbGQ7XHJcblxyXG4gICAgLy8gc2V0IGlkXHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJ3aW5kb3ctXCIgKyB0aGlzLmlkKTtcclxuXHJcbiAgICAvLyBkZWZpbmUgdGhpcy53cmFwcGVyRWxlbWVudFxyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG5cclxuICAgIC8vIHNldCB3aW5kb3cgYmFyIGljb25cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5mYVwiKS5jbGFzc0xpc3QuYWRkKGNvbmZpZy5pY29uKTtcclxuXHJcbiAgICAvLyBzZXQgd2luZG93IGJhciB0aXRsZVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXItdGl0bGVcIikudGV4dENvbnRlbnQgPSBjb25maWcudGl0bGU7XHJcblxyXG4gICAgLy8gc2V0IHBvc2l0aW9uIGFuZCBzaXplXHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGNvbmZpZy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IGNvbmZpZy55ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnpJbmRleCA9IGNvbmZpZy56SW5kZXg7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBjb25maWcud2lkdGggKyBcInB4XCI7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQgICsgXCJweFwiO1xyXG4gICAgdGhpcy50aXRsZUJhckhlaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLnNjcm9sbEhlaWdodDsgLy8gdXNlZCBmb3IgZHJhZyByZXppc2luZ1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dXaWR0aCA9IG5ldyBSZXNpemVXaW5kb3dXaWR0aCh0aGlzKTtcclxuICAgIHRoaXMucmVzaXplV2luZG93SGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd0hlaWdodCh0aGlzKTtcclxuICAgIHRoaXMucmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSBuZXcgUmVzaXplV2luZG93V2lkdGhIZWlnaHQodGhpcyk7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIik7XHJcblxyXG4gICAgLy8gcHV0IG9uIHRvcCBpZiBjbGlja2VkXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdmVUb1RvcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuXHJcbiAgICAvLyBkcmFnIHRoZSB3aW5kb3cgZnJvbSB0aGUgd2luZG93IGJhclxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBkb3VibGUgY2xpY2sgd2luZG93IGJhclxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIHRoaXMuZGJsY2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gY2xvc2UgZXZlbnRcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jbG9zZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gbWF4aW1pemUgZXZlbnRcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWF4aW1pemUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gcmVzdG9yZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnJlc3RvcmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gbWluaW1pemVcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5taW5pbWl6ZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWluaW1pemUuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiB1c2VyIGhhcyBoYXN0IHN0YXJ0ZWQgdG8gZHJhZyB0aGUgd2luZG93IGJhclxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gdGhlIGNsaWNrIGhhbmRsZXIgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50Lm9mZnNldFRvcCAtIGV2ZW50LnBhZ2VZO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcmFnZ2luZ1wiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiB1c2VyIGlzIGRyYWdnaW5nIGFuIGFwcCB3aW5kb3dcclxuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAtIHRoZSBtb3VzZW1vdmUgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy54ID0gZXZlbnQucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WDtcclxuICAgIHRoaXMueSA9IGV2ZW50LnBhZ2VZICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgICB0aGlzLmNoZWNrQm91bmRzKGV2ZW50KTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gIHRoaXMueCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbn07XHJcblxyXG4vKipcclxuICogY2hlY2tzIHRoYXQgYSBkcmFnZ2VkIHdpbmRvdyBpc250IGRyYWdnZWQgb2ZmIHNjcmVlblxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gdGhlIG1vdXNlbW92ZSBldmVudCBvYmplY3RcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuY2hlY2tCb3VuZHMgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYgKGV2ZW50LnBhZ2VYID4gdGhpcy5wd2Qud2lkdGgpIHtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnB3ZC53aWR0aCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChldmVudC5wYWdlWSA+IHRoaXMucHdkLmhlaWdodCkge1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMucHdkLmhlaWdodCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZXZlbnQucGFnZVkgPCAxKSB7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogdXNlciBoYXMgc3RvcHAgZHJhZ2dpbmdcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dpbmdcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogcG9zaXRpb24gdGhpcyB3aW5kb3cgaW4gZnJvbnQgb2Ygb3RoZXIgd2luZG93c1xyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5tb3ZlVG9Ub3AgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHdkLmxhc3RaSW5kZXggKz0gMTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLnB3ZC5sYXN0WkluZGV4O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGNsb3NlIHRoaXMgd2luZG93XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyAyMCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMud2lkdGggLSAxMDAgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIDUwICsgXCJweFwiO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnB3ZC5jbG9zZUFwcCh0aGlzKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBtYWtlIHRoZSB3aW5kb3cgZnVsbHNjcmVlblxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5hbmltYXRlKCk7XHJcblxyXG4gICAgLy8gc2F2ZSB0aGUgc2l6ZSBhbmQgcG9zaXRpb24gc28gd2UgY2FuIHJldHVybiB0byBpdCB3aXRoIHRoZSByZXN0b3JlIHdpbmRvdyBmdW5jdGlvblxyXG4gICAgdGhpcy5sYXN0WCA9IHRoaXMueDtcclxuICAgIHRoaXMubGFzdFkgPSB0aGlzLnk7XHJcbiAgICB0aGlzLmxhc3RXaWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmxhc3RIZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICAvLyB0ZWxsIHB3ZCB0aGlzIHdpbmRvdyBpcyBpbiBmdWxsc2NyZWVuIChpbiBjYXNlIG9mIGJyb3dzZXIgcmVzaXppbmcpXHJcbiAgICB0aGlzLnB3ZC5mdWxsc2NyZWVuZWRXaW5kb3cgPSB0aGlzO1xyXG5cclxuICAgIC8vIG1ha2UgdGhlIHdpbmRvdyBmdWxsc2NyZWVuXHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMucHdkLndpZHRoICsgXCJweFwiO1xyXG4gICAgdmFyIGhlaWdodCA9IHRoaXMucHdkLmhlaWdodCAtIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcblxyXG4gICAgLy8gaGlkZS9zaG93IHRoZSBtYXhpbWl6ZSBhbmQgcmVzdG9yZSB3aW5kb3diYXIgYnV0dG9uc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1heGltaXplLXdpbmRvd1wiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgLy8gaWYgaXQgaXMgbWF4aW1pemVkIGZyb20gYSBtaW5pbWl6ZWQgc3RhdGVcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGJyaW5nIHRoZSB3aW5kb3cgZnJvbSBmdWxsc2NyZWVuIGJhY2sgdG8gcHJldmlvdXMgc2l6ZVxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICB0aGlzLnggPSB0aGlzLmxhc3RYO1xyXG4gICAgdGhpcy55ID0gdGhpcy5sYXN0WTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMubGFzdFdpZHRoICsgXCJweFwiO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmxhc3RIZWlnaHQgKyBcInB4XCI7XHJcblxyXG4gICAgLy90ZWxsIHB3ZCB0aGlzIHdpbmRvdyBpcyBubyBsb25nZXIgaW4gZnVsbHNjcmVlbiAoaW4gY2FzZSBvZiBicm93c2VyIHJlc2l6aW5nKVxyXG4gICAgdGhpcy5wd2QuZnVsbHNjcmVlbmVkV2luZG93ID0gbnVsbDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuXHJcbiAgICAvLyBpZiBpdCBpcyByZXN0b3JlZCBmcm9tIGEgbWluaW1pemVkIHN0YXRlXHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBtaW5pbWl6ZSB0aGlzIHdpbmRvd1xyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIXRoaXMubWluaW1pemVkKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICAgICAgdGhpcy5sYXN0WCA9IHRoaXMueDtcclxuICAgICAgICB0aGlzLmxhc3RZID0gdGhpcy55O1xyXG4gICAgICAgIHRoaXMubGFzdFdpZHRoID0gdGhpcy53aWR0aDtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBcIjIwMHB4XCI7XHJcbiAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgICAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMubGFzdFg7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5sYXN0WTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLmxhc3RXaWR0aCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBoYW5kbGUgZG91YmxlIGNsaWNrcyBvbiB0aGUgd2luZG93IGJhclxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5kYmxjbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMubWluaW1pemVkKSB7XHJcbiAgICAgICAgdGhpcy5taW5pbWl6ZSgpO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLm1heGltaXplZCkge1xyXG4gICAgICAgIHRoaXMucmVzdG9yZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1heGltaXplKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogYWRkIGNzcyBhbmltYXRpb25zIGZvciAxMDBtcyBhbmQgdGhlbiByZW1vdmUgaXQgc28gaXQgd29udCBpbnRlcmZlciB3aXRoIGRyYWdnaW5nIGJlaGF2aW91clxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5hbmltYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBhZGQgYW5pbWF0aW9uIGNsYXNzXHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIndpbmRvdy1hbmltYXRlZFwiKTtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJ3aW5kb3ctYW5pbWF0ZWRcIik7XHJcbiAgICB9LmJpbmQodGhpcyksIDEwMCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFdpbmRvdztcclxuIiwiLyoqXHJcbiAqIE1vdXNlXHJcbiAqL1xyXG5mdW5jdGlvbiBNb3VzZSgpe1xyXG4gICAgdGhpcy5kcmFnZ2VkT2JqZWN0ID0gbnVsbDtcclxuICAgIHRoaXMuZHJhZ09mZnNldFggPSAwO1xyXG4gICAgdGhpcy5kcmFnT2Zmc2V0WSA9IDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAqIG9uIG1vdXNldXAgZXZlbnQgY2hlY2sgaWYgYSB3aW5kb3cgaXMgYmVpbmcgZHJhZ2dlZFxyXG4gICAgKiBAcGFyYW0gIHtbdHlwZV19IGUgLSBtb3VzZXVwIGV2ZW50IG9iamVjdFxyXG4gICAgKi9cclxuICAgIHRoaXMubW91c2V1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dlZE9iamVjdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWRPYmplY3Quc3RvcERyYWcoZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWRPYmplY3QgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGVuZXZlciBtb3VzZSBpcyBtb3ZlZFxyXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAtIG1vdXNlbW92ZSBldmVudCBvYmplY3RuXVxyXG4gICAgICovXHJcbiAgICB0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dlZE9iamVjdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWRPYmplY3QuZHJhZyhldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlO1xyXG4iLCJ2YXIgQXBwV2luZG93ID0gcmVxdWlyZShcIi4vQXBwV2luZG93XCIpO1xyXG52YXIgQXBwTWVudSA9IHJlcXVpcmUoXCIuL0FwcE1lbnVcIik7XHJcblxyXG5mdW5jdGlvbiBQd2RBcHAoY29uZmlnKSB7XHJcbiAgICB0aGlzLnRpdGxlID0gY29uZmlnLnRpdGxlO1xyXG4gICAgdGhpcy53aWR0aCA9IGNvbmZpZy53aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gY29uZmlnLmhlaWdodDtcclxuICAgIHRoaXMuaWQgPSBjb25maWcuaWQ7XHJcbiAgICBjb25maWcud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgY29uZmlnLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgY29uZmlnLnRpdGxlID0gdGhpcy50aXRsZTtcclxuICAgIHRoaXMuYXBwV2luZG93ID0gbmV3IEFwcFdpbmRvdyhjb25maWcpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFB3ZEFwcDtcclxuIiwiLyoqXHJcbiAqIEFwcCB3aW5kb3cgcmVzaXplciBDb25zdHJ1Y3RvclxyXG4gKiBUaGlzIGlzIGEgc21hbGwgZWxlbWVudCBvbiB0aGUgYm90dG9tIG9mIGFwcCB3aW5kb3dzLiBpdCBjYW4gYmUgZHJhZ2dlZCB1cCBhbmQgZG93biB0byByZXNpemUgdGhlIGhlaWdodCBvZiBhcHAgd2luZG93c1xyXG4gKiBAcGFyYW0ge29iamVjdH0gYXBwV2luZG93IC0gd2hhdCB3aW5kb3cgdG8gcmVzaXplXHJcbiAqL1xyXG5mdW5jdGlvbiBSZXNpemVXaW5kb3dIZWlnaHQoYXBwV2luZG93KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdyA9IGFwcFdpbmRvdztcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIik7XHJcbiAgICB0aGlzLnJlc2l6ZVRoaXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHJlc2l6ZXIgZHJhZyBpcyBzdGFydGVkXHJcbiAqL1xyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cudGl0bGVCYXJIZWlnaHQgLSBldmVudC5wYWdlWTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiByZXNpemVyIGlzIGRyYWdnZWRcclxuICogQHBhcmFtICB7W3R5cGVdfSBldmVudCAtIG1vdXNlbW92ZSBldmVudCBvYmplY3RcclxuICovXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnJlc2l6ZVRoaXMuc3R5bGUuaGVpZ2h0ID0gKGV2ZW50LnBhZ2VZIC0gdGhpcy5hcHBXaW5kb3cueSAtIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSkgKyBcInB4XCI7XHJcbn07XHJcblxyXG4vKipcclxuICogcmVzaXplciBkcmFnIHN0b3BwZWRcclxuKi9cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93SGVpZ2h0O1xyXG4iLCIvKipcclxuICogQXBwIHdpbmRvdyB3aWR0aCByZXNpemVyIENvbnN0cnVjdG9yXHJcbiAqIFRoaXMgaXMgYSBzbWFsbCBlbGVtZW50IG9uIHRoZSByaWdodCBzaWRlIG9mIGFwcCB3aW5kb3dzLiBpdCBjYW4gYmUgZHJhZ2dlZCBsZWZ0IGFuZCByaWdodCB0byByZXNpemUgdGhlIHdpZHRoIG9mIGFwcCB3aW5kb3dzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcHBXaW5kb3cgLSB3aGF0IHdpbmRvdyB0byByZXNpemVcclxuICovXHJcbmZ1bmN0aW9uIFJlc2l6ZVdpbmRvd1dpZHRoKGFwcFdpbmRvdykge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci14XCIpO1xyXG4gICAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCk7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGRyYWcgaXMgc3RhcnRlZFxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IG1vdXNlIGNsaWNrIGV2ZW50IGhhbmRsZXIgb2JqZWN0XHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuXHJcbiAgICAvL2RyYWcgZnJvbSBleGFjdGx5IHdoZXJlIHRoZSBjbGljayBpc1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiB3aWR0aCByZXNpemVyIGlzIGRyYWdnZWRcclxuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAtIG1vdXNlbW92ZSBldmVudCBvYmplY3RcclxuICovXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMucmVzaXplVGhpcy5zdHlsZS53aWR0aCA9IChldmVudC5wYWdlWCAtIHRoaXMuYXBwV2luZG93LnggKyB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFgpICsgXCJweFwiO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dXaWR0aDtcclxuIiwiLyoqXHJcbiAqIEFwcCB3aW5kb3cgcmVzaXplciBDb25zdHJ1Y3RvclxyXG4gKiBUaGlzIGNvbnRyb2xzIGJvdGggd2lkdGggYW5kIGhlaWdodCByZXNpemluZyBvZiBhbiBhcHAgd2luZG93LiBpdHMgZWxlbWVudCBpcyBhIHNtYWxsIHNxdWFyZSBhdCB0aGUgYm90dG9tIGxlZnQgY29ybmVyIG9mIGl0cyBhcHAgd2luZG93XHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcHBXaW5kb3cgLSB3aGF0IHdpbmRvdyB0byByZXNpemVcclxuICovXHJcbmZ1bmN0aW9uIFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0KGFwcFdpbmRvdykge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci14eVwiKTtcclxuICAgIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vKipcclxuICogcmVzaXplciBkcmFnIGlzIHN0YXJ0ZWRcclxuICovXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG5cclxuICAgIC8vIHRoaXMgZWxlbWVudCBoYXMgbm8gb2Zmc2V0VG9wIHNvIGluc3RlYWQgd2UgdXNlIHdpbmRvdy1yZXNpemVyLWhlaWdodCdzIG9mZnNldFRvcCB2YWx1ZVxyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy50aXRsZUJhckhlaWdodCAtIGV2ZW50LnBhZ2VZO1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvLyB0aGlzIGNsaWNrIHNob3VsZG50IGdvIHRocm91Z2ggdG8gdGhlIHBhcmVudCB3aGljaCBpcyB0aGUgaGVpZ2h0LXJlc2l6ZXJcclxufTtcclxuXHJcbi8qKiBcclxuICogd2lkdGgmaGVpZ2h0IHJlc2l6ZXIgaXMgYmVpbmcgZHJhZ2dlZCBcclxuKi9cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5yZXNpemVXaW5kb3dIZWlnaHQuZHJhZyhlKTtcclxuICAgIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd1dpZHRoLmRyYWcoZSk7XHJcbn07XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0O1xyXG4iLCIvKipcclxuICogY29uc3RydWN0b3IgZm9yIGEgZGVza3RvcCBhcHAgc2hvcnRjdXRcclxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIGFwcCBjb25maWdcclxuICogQHBhcmFtIHtvYmplY3R9IHB3ZCAtIGEgcmVmZXJlbmNlIHRvIHRoZSBwd2RcclxuICovXHJcbmZ1bmN0aW9uIFNob3J0Y3V0KGNvbmZpZywgcHdkKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuICAgIHRoaXMudGl0bGUgPSBjb25maWcudGl0bGU7XHJcbiAgICB0aGlzLmVudHJ5ID0gY29uZmlnLmVudHJ5O1xyXG4gICAgdGhpcy5wd2QgPSBwd2Q7XHJcblxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvcnRjdXRcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuXHJcbiAgICAvLyBhZGQgaWNvbiBhbmQgdGV4dFxyXG4gICAgdGhpcy5lbGVtZW50LmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQoY29uZmlnLmljb24pO1xyXG4gICAgdGhpcy5lbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSB0aGlzLnRpdGxlO1xyXG5cclxuICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHdkLnN0YXJ0QXBwKHRoaXMuY29uZmlnKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hvcnRjdXQ7XHJcbiIsInZhciBNb3VzZSA9IHJlcXVpcmUoXCIuL01vdXNlXCIpO1xyXG52YXIgU2hvcnRjdXQgPSByZXF1aXJlKFwiLi9TaG9ydGN1dFwiKTtcclxudmFyIGFwcExpc3QgPSByZXF1aXJlKFwiLi9hcHBMaXN0XCIpO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBQZXJzb25hbCBXZWIgRGVza3RvcFxyXG4gKi9cclxudmFyIFB3ZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tb3VzZSA9IG5ldyBNb3VzZSgpO1xyXG4gICAgdGhpcy5pbnN0YWxsZWRBcHBzID0gW107XHJcbiAgICB0aGlzLnN0YXJ0ZWRBcHBzID0ge307XHJcbiAgICB0aGlzLmxhc3RaSW5kZXggPSAxO1xyXG4gICAgdGhpcy5sYXN0SUQgPSAxO1xyXG4gICAgdGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIHNob3J0Y3V0cyBmb3IgYWxsIGF2YWlsYWJsZSBhcHBzXHJcbiAgICAgKi9cclxuICAgIHRoaXMuaW5zdGFsbEFwcHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IgKHZhciBhcHAgaW4gYXBwTGlzdCkge1xyXG4gICAgICAgICAgICB0aGlzLmluc3RhbGxlZEFwcHMucHVzaChuZXcgU2hvcnRjdXQoYXBwTGlzdFthcHBdLCB0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gdGhlIHVzZXIgY2xpY2tzIGFuIGFwcCBzaG9ydGN1dCB0aGlzIGZ1bmN0aW9uIHdpbGwgc3RhcnQgdGhlIGFwcFxyXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBjb25maWcgLSBjb250YWlucyBhcHAgc2V0dGluZ3MuIFRoZSBjb25maWd1cmF0aW9uIGNvbWVzIGZyb20gYXBwTGlzdC5qc1xyXG4gICAgICovXHJcbiAgICB0aGlzLnN0YXJ0QXBwID0gZnVuY3Rpb24oY29uZmlnKSB7XHJcblxyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuY2FsY3VsYXRlU3RhcnRQb3NpdGlvbihjb25maWcpO1xyXG5cclxuICAgICAgICB2YXIgbmV3QXBwID0gbmV3IGNvbmZpZy5lbnRyeSh7XHJcbiAgICAgICAgICAgIHRpdGxlOiBjb25maWcudGl0bGUsXHJcbiAgICAgICAgICAgIHdpZHRoOiBjb25maWcud2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodDogY29uZmlnLmhlaWdodCxcclxuICAgICAgICAgICAgaWNvbjogY29uZmlnLmljb24sXHJcbiAgICAgICAgICAgIHB3ZDogdGhpcyxcclxuICAgICAgICAgICAgaWQ6IHRoaXMubGFzdElELFxyXG4gICAgICAgICAgICB4OiBwb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB5OiBwb3NpdGlvbi55LFxyXG4gICAgICAgICAgICB6SW5kZXg6IHRoaXMubGFzdFpJbmRleFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRlZEFwcHNbdGhpcy5sYXN0SURdID0gbmV3QXBwO1xyXG4gICAgICAgIHRoaXMubGFzdFpJbmRleCArPSAxO1xyXG4gICAgICAgIHRoaXMubGFzdElEICs9IDE7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSB3aGVyZSBuZXcgYXBwcyBzaG91bGQgYXBwZWFyIG9uIHRoZSBzY3JlZW5cclxuICAgICAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnIC0gY29udGFpbnMgdGhlICBhcHBzIHN0YW5kYXJkIHdpZHRoIGFuZCBoZWlnaHRcclxuICAgICAqL1xyXG4gICAgdGhpcy5jYWxjdWxhdGVTdGFydFBvc2l0aW9uID0gZnVuY3Rpb24oY29uZmlnKSB7XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBzdGFydGluZyBYIFkgY29vcmRpbmF0ZXMgYXJlIGdvb2RcclxuXHJcbiAgICAgICAgdmFyIHggPSB0aGlzLm5ld1ggLSBjb25maWcud2lkdGggLyAyO1xyXG4gICAgICAgIHZhciB5ID0gdGhpcy5uZXdZIC0gY29uZmlnLmhlaWdodCAvIDI7XHJcblxyXG4gICAgICAgIC8vIHJlc2V0IGlmIFggaXMgb2ZmIHNjcmVlblxyXG4gICAgICAgIGlmICh4ID4gdGhpcy53aWR0aCAtIDQwIHx8IHkgPiB0aGlzLmhlaWdodCAtIDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxYICs9IDIwO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcmlnaW5hbFggPiB0aGlzLndpZHRoIC0gMjApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxYID0gMjA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMubmV3WCA9IHRoaXMub3JpZ2luYWxYO1xyXG4gICAgICAgICAgICB0aGlzLm5ld1kgPSB0aGlzLm9yaWdpbmFsWTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlc2V0IGlmIFkgaXMgb2ZmIHNjcmVlblxyXG5cclxuICAgICAgICB0aGlzLm5ld1ggKz0gMjA7XHJcbiAgICAgICAgdGhpcy5uZXdZICs9IDIwO1xyXG5cclxuICAgICAgICAvLyBjaGVjayBpZiB0aGUgbmV3IGFwcCBpcyBiaWdnZXIgdGhhbiB0aGUgcHdkIHdpbmRvd1xyXG4gICAgICAgIGlmICh4IDwgMCkge1xyXG4gICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh5IDwgMCkge1xyXG4gICAgICAgICAgICB5ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7eDogeCwgeTogeX07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xvc2UgYW4gYXBwXHJcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGFwcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmNsb3NlQXBwID0gZnVuY3Rpb24oYXBwKSB7XHJcbiAgICAgICAgdGhpcy5zdGFydGVkQXBwc1thcHAuaWRdLmNsb3NlKCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhcnRlZEFwcHNbYXBwLmlkXTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCcm93c2VyIHJlc2l6ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMubmV3WCA9IHRoaXMud2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMubmV3WSA9IHRoaXMuaGVpZ2h0IC8gMi41O1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxYID0gdGhpcy5uZXdYO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxZID0gdGhpcy5uZXdZO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cpIHtcclxuICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cubWF4aW1pemUoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxudmFyIHB3ZCA9IG5ldyBQd2QoKTtcclxucHdkLmluc3RhbGxBcHBzKCk7IC8vIGNyZWF0ZSBzaG9ydGN1dHMgZm9yIGFsbCBhdmFpbGFibGUgYXBwc1xyXG5wd2QucmVzaXplKCk7IC8vIHJ1biByZXNpemUgb25jZSB0byBnZXQgd2lkdGggYW5kIGNhbGN1bGF0ZSBzdGFydCBwb3NpdGlvbiBvZiBhcHBzXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHB3ZC5yZXNpemUuYmluZChwd2QpKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBcIkNoYXRcIjoge1xyXG4gICAgICAgIGVudHJ5OiByZXF1aXJlKFwiLi9hcHBzL2NoYXQvYXBwXCIpLFxyXG4gICAgICAgIHRpdGxlOiBcIkNoYXRcIixcclxuICAgICAgICB3aWR0aDogNTAwLFxyXG4gICAgICAgIGhlaWdodDogNDAwLFxyXG4gICAgICAgIGljb246IFwiZmEtY29tbWVudGluZ1wiXHJcbiAgICB9LFxyXG4gICAgXCJNZW1vcnlcIjoge1xyXG4gICAgICAgIGVudHJ5OiByZXF1aXJlKFwiLi9hcHBzL21lbW9yeS9hcHBcIiksXHJcbiAgICAgICAgdGl0bGU6IFwiTWVtb3J5XCIsXHJcbiAgICAgICAgd2lkdGg6IDU1MCxcclxuICAgICAgICBoZWlnaHQ6IDQ0MCxcclxuICAgICAgICBpY29uOiBcImZhLWNsb25lXCJcclxuICAgIH1cclxufTtcclxuXHJcbiIsInZhciBDaGFubmVsID0gZnVuY3Rpb24oY2hhdCwgbmFtZSkge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuY2hhdCA9IGNoYXQ7XHJcbiAgICB0aGlzLmNoYXQuY2hhbm5lbHNbbmFtZV0gPSB0aGlzO1xyXG5cclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC1jaGFubmVsXCIpO1xyXG4gICAgdGhpcy5jaGF0RGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcclxuXHJcbiAgICB0aGlzLmNoYXREaXYuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgLy8gbGlzdGVuIGZvciBlbnRlciBrZXlcclxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgLy9zZW5kIGEgbWVzc2FnZVxyXG4gICAgICAgICAgICB0aGlzLmNoYXQuc2VuZE1lc3NhZ2UodGhpcy5uYW1lLCBldmVudC50YXJnZXQudmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgLy8gZW1wdHkgdGV4dGFyZWFcclxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuY2hhdC5jaGF0Q2hhbm5lbEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5jaGF0RGl2KTtcclxuXHJcbiAgICAvL2NoYW5uZWwgbGlzdCBlbnRyeVxyXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXQtY2hhbm5lbC1saXN0LWVudHJ5XCIpO1xyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsTGlzdEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLmNoYXQuam9pbkNoYW5uZWxCdXR0b24pO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50ID0gdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLnByZXZpb3VzRWxlbWVudFNpYmxpbmcucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgIGlmIChuYW1lID09PSBcIlwiKSB7XHJcbiAgICAgICAgbmFtZSA9IFwiRGVmYXVsdFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gbmFtZTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuY2hhdC5hY3RpdmVDaGFubmVsID0gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gY2xvc2UgY2hhbm5lbFxyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNsb3NlQ2hhbm5lbCgpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYW5uZWwucHJvdG90eXBlLnByaW50TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVcIilbMF07XHJcbiAgICB2YXIgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XHJcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC10ZXh0XCIpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS5kYXRhO1xyXG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtYXV0aG9yXCIpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS51c2VybmFtZTtcclxuICAgIHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtbWVzc2FnZXNcIilbMF0uYXBwZW5kQ2hpbGQobWVzc2FnZURpdik7XHJcblxyXG4gICAgaWYgKHRoaXMuY2hhdC5hY3RpdmVDaGFubmVsICE9PSB0aGlzKSB7XHJcbiAgICAgICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjaGF0LWNoYW5uZWwtbmV3bWVzc2FnZVwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYW5uZWwucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY2hhdERpdi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LWFjdGl2ZS1jaGFubmVsXCIpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jaGF0RGl2LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImNoYXQtYWN0aXZlLWNoYW5uZWxcIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtY2hhbm5lbC1uZXdtZXNzYWdlXCIpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuY2xvc2VDaGFubmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3JlbW92ZSBjaGFubmVsIGxpc3QgZW50cnlcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsTGlzdEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5saXN0RW50cnlFbGVtZW50KTtcclxuXHJcbiAgICAvL3JlbW92ZSBjaGF0IGRpdlxyXG4gICAgdGhpcy5jaGF0LmNoYXRDaGFubmVsRWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmNoYXREaXYpO1xyXG5cclxuICAgIHRoaXMuY2hhdC5jbG9zZUNoYW5uZWwodGhpcyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYW5uZWw7XHJcbiIsInZhciBQd2RBcHAgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvUHdkQXBwXCIpO1xyXG52YXIgc29ja2V0Q29uZmlnID0gcmVxdWlyZShcIi4vc29ja2V0Q29uZmlnLmpzb25cIik7XHJcbnZhciBDaGFubmVsID0gcmVxdWlyZShcIi4vQ2hhbm5lbFwiKTtcclxuXHJcbi8qKlxyXG4gKiBDaGF0IGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBhcHAgY29uZmlndXJhdGlvbiBvYmplY3RcclxuICovXHJcbmZ1bmN0aW9uIENoYXQoY29uZmlnKSB7XHJcbiAgICBQd2RBcHAuY2FsbCh0aGlzLCBjb25maWcpOyAvL2luaGVyaXQgZnJvbSBwd2RBcHAgb2JqZWN0XHJcbiAgICB0aGlzLmNoYW5uZWxzID0ge307XHJcbiAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBudWxsO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuaW5wdXROYW1lKCkgLy8gZ2V0IHVzZXJuYW1lXHJcbiAgICAudGhlbihmdW5jdGlvbih1c2VybmFtZSkge1xyXG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSB1c2VybmFtZTtcclxuICAgICAgICB0aGlzLnN0YXJ0Q2hhdCgpO1xyXG4gICAgfS5iaW5kKHRoaXMpKVxyXG4gICAgLnRoZW4odGhpcy5jb25uZWN0KCkpIC8vIHRoZW4gd2UgY29ubmVjdFxyXG4gICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVDaGFubmVsID0gbmV3IENoYW5uZWwodGhpcywgXCJcIik7IC8vIHRoZW4gd2UgY29ubmVjdCB0byB0aGUgZGVmYXVsdCBjaGFubmVsXHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5DaGF0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHdkQXBwLnByb3RvdHlwZSk7XHJcbkNoYXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2hhdDtcclxuXHJcbi8qKlxyXG4gKiBlbnRlciB1c2VybmFtZVxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUuaW5wdXROYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoXHJcbiAgICAgICAgZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBzaG93IG5hbWUgaW5wdXQgdGV4dCBhbmQgYnV0dG9uXHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC11c2VybmFtZS1pbnB1dFwiKTtcclxuICAgICAgICAgICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHBXaW5kb3cuY29udGVudC5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtYnRuLXVzZXJuYW1lXCIpO1xyXG4gICAgICAgICAgICB2YXIgdGV4dElucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtdXNlcm5hbWUtaW5wdXQgaW5wdXRbdHlwZT10ZXh0XVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRleHRJbnB1dC5mb2N1cygpO1xyXG5cclxuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXQudmFsdWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGV4dElucHV0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIHRleHRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXQudmFsdWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRleHRJbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICk7XHJcbn07XHJcblxyXG4vKipcclxuICogY3JlYXRlIGNoYXQgY2hhbm5lbCBodG1sXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5zdGFydENoYXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGNsZWFyIHdpbmRvdyBvZiBwcmV2aW91cyBlbGVtZW50ICh0aGUgaW5wdXQgdXNlcm5hbWUgc2NyZWVuKVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLnRleHRDb250ZW50ID0gXCJcIjtcclxuICAgIFxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFwiKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5jb250ZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XHJcbiAgICB0aGlzLmNoYXRDaGFubmVsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWNoYW5uZWxzXCIpO1xyXG4gICAgdGhpcy5jaGFubmVsTGlzdEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1jaGFubmVsLWxpc3RcIik7XHJcblxyXG4gICAgLy8gaG9vayB1cCBqb2luIGNoYW5uZWwgYnV0dG9uXHJcbiAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgaW5wdXRbdHlwZT1idXR0b25cIik7XHJcbiAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1qb2luLWNoYW5uZWxcIik7XHJcblxyXG4gICAgdGhpcy5zaG93Sm9pbkNoYW5uZWxJbnB1dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0KTtcclxuXHJcbiAgICAgICAgLy8gc2hvdyB0aGUgam9pbiBuZXcgY2hhbm5lbCBmb3JtIGFuZCBwb3NpdGlvbiBpdCBuZXh0IHRvIHRoZSBtb3VzZSBjdXJzb3JcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdmFyIGJ0bmJvdW5kaW5nUmVjdCA9IHRoaXMuam9pbkNoYW5uZWxCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgdmFyIGlucHV0Qm91bmRpbmdSZWN0ID0gdGhpcy5qb2luQ2hhbm5lbElucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICB2YXIgbGVmdCA9IGJ0bmJvdW5kaW5nUmVjdC5sZWZ0IC0gdGhpcy5hcHBXaW5kb3cueCArIGJ0bmJvdW5kaW5nUmVjdC53aWR0aCArIDQgKyBcInB4XCI7XHJcbiAgICAgICAgdmFyIHRvcCA9IGJ0bmJvdW5kaW5nUmVjdC50b3AgLSB0aGlzLmFwcFdpbmRvdy55IC0gKGlucHV0Qm91bmRpbmdSZWN0LmhlaWdodCAvIDIpICsgKGJ0bmJvdW5kaW5nUmVjdC5oZWlnaHQgLyAyKSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnN0eWxlLmxlZnQgPSBsZWZ0O1xyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5zdHlsZS50b3AgPSB0b3A7XHJcblxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC52YWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvLyB0aGlzIGNsaWNrIHNob3VsZG50IHBhc3MgdGhyb3VnaCBvdGhlcndpc2UgdGhlIGlucHV0IHdpbGwgYmUgaGlkZGVuIGJ5IHRoZSB3aW5kb3djbGlja2xpc3RlbmVyXHJcblxyXG4gICAgICAgIC8vaGlkZSB0aGUgam9pbiBjaGFubmVsIGRpdiBpZiB0aGVyZXMgYSBjbGljayBhbnl3aGVyZSBvbiBzY3JlZW4gZXhjZXB0IGluIHRoZSBqb2luIGNoYW5uZWwgZGl2XHJcbiAgICAgICAgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuaGlkZUpvaW5DaGFubmVsRm9ybSk7XHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0pvaW5DSGFubmVsRm9ybSk7XHJcblxyXG4gICAgICAgICAgICAvLyBhY3RpdmF0ZSB0aGUgam9pbiBjaGFubmVsIGJ1dHRvbiBhZ2FpblxyXG4gICAgICAgICAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0KTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIC8vIGRvbnQgaGlkZSBpZiB0aGUgY2xpY2sgaXMgaW4gdGhlIGpvaW4gY2hhbm5lbCBkaXZcclxuICAgICAgICB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuaGlkZUpvaW5DaGFubmVsRm9ybSk7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtKTtcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0KTtcclxuICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvLyBsaXN0ZW4gZm9yIGVudGVyIGtleVxyXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAvLyBqb2luIGNoYW5uZWxcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVDaGFubmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVDaGFubmVsID0gbmV3IENoYW5uZWwodGhpcywgZXZlbnQudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KHNvY2tldENvbmZpZy5hZGRyZXNzKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiQ291bGQgbm90IGNvbm5lY3RcIikpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLmNoYW5uZWwgaW4gdGhpcy5jaGFubmVscykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbHNbbWVzc2FnZS5jaGFubmVsXS5wcmludE1lc3NhZ2UobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24oY2hhbm5lbCwgdGV4dCkge1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXHJcbiAgICAgICAgZGF0YTogdGV4dCxcclxuICAgICAgICB1c2VybmFtZTogdGhpcy51c2VybmFtZSxcclxuICAgICAgICBjaGFubmVsOiBjaGFubmVsLFxyXG4gICAgICAgIGtleTogc29ja2V0Q29uZmlnLmtleVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKHNvY2tldCkge1xyXG4gICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIsIGVycm9yKTtcclxuICAgIH0pO1xyXG5cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNsb3NlQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpIHtcclxuICAgIGRlbGV0ZSB0aGlzLmNoYW5uZWxzW2NoYW5uZWwubmFtZV07XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gcmVtb3ZlIHRoZSBncmFwaGljc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikucmVtb3ZlQ2hpbGQodGhpcy5hcHBXaW5kb3cuZWxlbWVudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gdGFza2JhclxyXG4gICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2QgLnRhc2tiYXJcIikucmVtb3ZlQ2hpbGQodGhpcy50YXNrYmFyQXBwLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhdDtcclxuIiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gIFwiYWRkcmVzc1wiOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXHJcbiAgXCJrZXlcIjogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXHJcbn1cclxuIiwidmFyIEltYWdlID0gcmVxdWlyZShcIi4vSW1hZ2VcIik7XHJcbnZhciBrZXlib2FyZCA9IHJlcXVpcmUoXCIuL2tleWJvYXJkXCIpO1xyXG5cclxuLyoqXHJcbiAqIHNodWZmbGUgdGhlIGFycmF5IG9mIGltYWdlc1xyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGJvYXJkIC0gcmVmZXJlbmNlIHRvIHRoZSBib2FyZFxyXG4gKi9cclxuZnVuY3Rpb24gc2h1ZmZsZShib2FyZCkge1xyXG4gICAgdmFyIGk7XHJcbiAgICB2YXIgcmFuZG9tSW5kZXg7XHJcbiAgICB2YXIgYmFja0luZGV4O1xyXG5cclxuICAgIC8vIG1vdmUgdGhyb3VnaCB0aGUgZGVjayBvZiBjYXJkcyBmcm9tIHRoZSBiYWNrIHRvIGZyb250XHJcbiAgICBmb3IgKGkgPSBib2FyZC5pbWFnZUFycmF5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpIC09IDEpIHtcclxuICAgICAgICAvL3BpY2sgYSByYW5kb20gY2FyZCBhbmQgc3dhcCBpdCB3aXRoIHRoZSBjYXJkIGZ1cnRoZXN0IGJhY2sgb2YgdGhlIHVuc2h1ZmZsZWQgY2FyZHNcclxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xyXG4gICAgICAgIGJhY2tJbmRleCA9IGJvYXJkLmltYWdlQXJyYXlbaV07XHJcbiAgICAgICAgYm9hcmQuaW1hZ2VBcnJheVtpXSA9IGJvYXJkLmltYWdlQXJyYXlbcmFuZG9tSW5kZXhdO1xyXG4gICAgICAgIGJvYXJkLmltYWdlQXJyYXlbcmFuZG9tSW5kZXhdID0gYmFja0luZGV4O1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQm9hcmRcclxuICogQHBhcmFtIHtvYmplY3R9IHB3ZCAtIHB3ZCByZWZlcmVuY2VcclxuICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbnMgLSBob3cgbWFueSBjb2x1bW5zIHdpZGUgdGhlIG1lbW9yeSBnYW1lIHNob3VsZCBtZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcm93cyAtIGhvdyBtYW55IHJvd3NcclxuICovXHJcbmZ1bmN0aW9uIEJvYXJkKHB3ZCwgY29sdW1ucywgcm93cykge1xyXG4gICAgdGhpcy5wd2QgPSBwd2Q7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS50ZXh0Q29udGVudCA9IFwiXCI7XHJcblxyXG4gICAgLy8gVE9ETzogdmVyaWZ5IHdpZHRoL2hlaWdodFxyXG4gICAgdGhpcy5yb3dzID0gcm93cztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnM7XHJcbiAgICB0aGlzLmltYWdlU2l6ZSA9IDExMDtcclxuICAgIHRoaXMuYXR0ZW1wdHMgPSAwO1xyXG4gICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5rZXlib2FyZFNlbGVjdCA9IHtcclxuICAgICAgICB4OiAwLFxyXG4gICAgICAgIHk6IDBcclxuICAgIH07XHJcblxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXdyYXBwZXJcIik7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCkuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgMSk7XHJcblxyXG4gICAgLy8gQXR0ZW1wdHMgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnktYXR0ZW1wdHNcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICB0aGlzLmF0dGVtcHRzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC5tZW1vcnktYXR0ZW1wdHNcIik7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWJvYXJkXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5jb2x1bW5zICogdGhpcy5pbWFnZVNpemUgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubWluV2lkdGggPSB0aGlzLmNvbHVtbnMgKiB0aGlzLmltYWdlU2l6ZSArIFwicHhcIjtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRoaXMud3JhcHBlckVsZW1lbnQpO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG5cclxuICAgIC8vY3JlYXRlIGFycmF5IG9mIGltYWdlc1xyXG4gICAgdGhpcy5pbWFnZUFycmF5ID0gW107XHJcbiAgICB2YXIgZG9jZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb2x1bW5zICogdGhpcy5yb3dzOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgbmV3SW1hZ2UgPSBuZXcgSW1hZ2UoTWF0aC5mbG9vcihpIC8gMikgKyAxLCBpLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmltYWdlQXJyYXkucHVzaChuZXdJbWFnZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNodWZmbGUodGhpcyk7XHJcblxyXG4gICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICBkb2NmcmFnLmFwcGVuZENoaWxkKGltYWdlLmVsZW1lbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY2ZyYWcpO1xyXG5cclxuICAgIC8vaGFuZGxlIGNsaWNrc1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIC8vcmVtb3ZlIGtleWJvYXJkIHNlbGVjdCBvdXRsaW5lXHJcbiAgICAgICAga2V5Ym9hcmQucmVtb3ZlT3V0bGluZSh0aGlzKTtcclxuICAgICAgICB2YXIgY2xpY2tlZElkID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtaWRcIik7XHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICAgICAgaWYgKGNsaWNrZWRJZCA9PSBpbWFnZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UuY2xpY2sodGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy9oYW5kbGUga2V5Ym9hcmRcclxuICAgIGtleWJvYXJkLmhhbmRsZUlucHV0KHRoaXMpO1xyXG5cclxuICAgIHRoaXMuc2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc3RhcnRHYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5hdHRlbXB0cyA9IDA7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL2ZsaXAgaW1hZ2VzXHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICAgICAgaW1hZ2UuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCgnaW1hZ2UvYXBwcy9tZW1vcnkvMC5wbmcnKVwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb2FyZDtcclxuIiwidmFyIGtleWJvYXJkID0gcmVxdWlyZShcIi4va2V5Ym9hcmRcIik7XHJcblxyXG4vKipcclxuICogaW1hZ2UgY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IGltYWdlTnVtYmVyXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZFxyXG4gKiBAcGFyYW0ge09iamVjdH0gYm9hcmRcclxuICovXHJcbmZ1bmN0aW9uIEltYWdlKGltYWdlTnVtYmVyLCBpZCwgYm9hcmQpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1pbWFnZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWltYWdlbnVtYmVyXCIsIGltYWdlTnVtYmVyKTtcclxuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIGlkKTtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuaW1hZ2VOdW1iZXIgPSBpbWFnZU51bWJlcjtcclxuICAgIHRoaXMuYm9hcmQgPSBib2FyZDtcclxuICAgIHRoaXMuY2xpY2thYmxlID0gdHJ1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGhhbmRsZSBjbGlja3NcclxuICovXHJcbkltYWdlLnByb3RvdHlwZS5jbGljayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmICh0aGlzLmNsaWNrYWJsZSkge1xyXG4gICAgICAgIHRoaXMuY2xpY2thYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93KCk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5ib2FyZC5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnNlbGVjdGVkID0gdGhpcztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIF9zZWxlY3RlZCA9IHRoaXMuYm9hcmQuc2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuYXR0ZW1wdHMgKz0gMTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuYXR0ZW1wdHNEaXYudGV4dENvbnRlbnQgPSBcIkF0dGVtcHRzOiBcIiArIHRoaXMuYm9hcmQuYXR0ZW1wdHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLnNlbGVjdGVkLmltYWdlTnVtYmVyID09PSB0aGlzLmltYWdlTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBtYXRjaFxyXG4gICAgICAgICAgICAgICAga2V5Ym9hcmQucmVtb3ZlT3V0bGluZSh0aGlzLmJvYXJkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWdyZWVuXCIpO1xyXG4gICAgICAgICAgICAgICAgX3NlbGVjdGVkLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1ncmVlblwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbm90IGEgbWF0Y2hcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLmNsaWNrYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGlja2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBmbGlwIGJhY2sgdGhlIGltYWdlXHJcbiAqL1xyXG5JbWFnZS5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKCdpbWFnZS9hcHBzL21lbW9yeS8wLnBuZycpXCI7XHJcbn07XHJcblxyXG4vKiogXHJcbiAqIHJldmVhbCBpbWFnZVxyXG4gKi9cclxuSW1hZ2UucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCgnaW1hZ2UvYXBwcy9tZW1vcnkvXCIgKyB0aGlzLmltYWdlTnVtYmVyICsgXCIucG5nJylcIjtcclxufTtcclxuXHJcbi8qKiBcclxuICogcmVtb3ZlIGltYWdlXHJcbiAqL1xyXG5JbWFnZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1mYWRlLW91dFwiKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2U7IiwidmFyIFB3ZEFwcCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9Qd2RBcHBcIik7XHJcbnZhciBCb2FyZCA9IHJlcXVpcmUoXCIuL0JvYXJkLmpzXCIpO1xyXG52YXIgQXBwTWVudSA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9BcHBNZW51XCIpO1xyXG5cclxuLyoqXHJcbiAqIE1lbW9yeSBhcHAgY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIGFwcCBjb25maWcgb2JqZWN0XHJcbiAqL1xyXG5mdW5jdGlvbiBNZW1vcnkoY29uZmlnKSB7XHJcbiAgICBQd2RBcHAuY2FsbCh0aGlzLCBjb25maWcpO1xyXG5cclxuICAgIC8vIGFkZCBhIGRyb3Bkb3duIG1lbnUgdG8gdGhlIHdpbmRvd1xyXG4gICAgdGhpcy5tZW51ID0gbmV3IEFwcE1lbnUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1tZW51XCIpLCBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcIkZpbGVcIixcclxuICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk5ldyBnYW1lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLm5ld0dhbWUuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlF1aXRcIixcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYXBwV2luZG93LmNsb3NlLmJpbmQodGhpcy5hcHBXaW5kb3cpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKHRoaXMsIDQsMyk7XHJcbiAgICB0aGlzLmJvYXJkLnN0YXJ0R2FtZSgpO1xyXG59XHJcblxyXG5NZW1vcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQd2RBcHAucHJvdG90eXBlKTtcclxuTWVtb3J5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbW9yeTtcclxuXHJcbk1lbW9yeS5wcm90b3R5cGUubmV3R2FtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvbnRlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpO1xyXG4gICAgY29udGVudEVsZW1lbnQudGV4dENvbnRlbnQgPSBcIlwiO1xyXG5cclxuICAgIC8vIGlucHV0IHJvd3MvY29scyBodG1sXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeS1zZXR1cFwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBjb250ZW50RWxlbWVudC5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICBcclxuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiBpbnB1dFt0eXBlPWJ1dHRvbl1cIik7XHJcbiAgICB2YXIgcm93c0lucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1lbW9yeS1yb3dzLWlucHV0XCIpO1xyXG4gICAgdmFyIGNvbHNJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tZW1vcnktY29scy1pbnB1dFwiKTtcclxuXHJcbiAgICByb3dzSW5wdXQudmFsdWUgPSB0aGlzLmJvYXJkLnJvd3M7XHJcbiAgICBjb2xzSW5wdXQudmFsdWUgPSB0aGlzLmJvYXJkLmNvbHVtbnM7XHJcblxyXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKHRoaXMsIGNvbHNJbnB1dC52YWx1ZSxyb3dzSW5wdXQudmFsdWUpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3RhcnRHYW1lKCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHdoZW4gdGhlIGFwcCBpcyBjbG9zaW5nXHJcbiAqL1xyXG5NZW1vcnkucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5yZW1vdmVDaGlsZCh0aGlzLmFwcFdpbmRvdy5lbGVtZW50KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5O1xyXG4iLCIvKipcclxuICogcmVtb3ZlIHRoZSBvdXRsaW5lIGZyb20gc2VsZWN0ZWQgbWVtb3J5IGltYWdlXHJcbiAqIEBwYXJhbSAge29iamVjdH0gYm9hcmQgLSBib2FyZCByZWZlcmVuY2VcclxuICovXHJcbmZ1bmN0aW9uIHJlbW92ZU91dGxpbmUoYm9hcmQpIHtcclxuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCArIFwiIC5tZW1vcnkta2V5Ym9hcmRTZWxlY3RcIikpIHtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCArIFwiIC5tZW1vcnkta2V5Ym9hcmRTZWxlY3RcIikuY2xhc3NMaXN0LnJlbW92ZShcIm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIFxyXG4gKiBzZWxlY3QgYW4gaW1hZ2VcclxuICogQHBhcmFtICB7b2JqZWN0fSBib2FyZFxyXG4gKi9cclxuZnVuY3Rpb24gc2VsZWN0KGJvYXJkKSB7XHJcbiAgICByZW1vdmVPdXRsaW5lKGJvYXJkKTtcclxuICAgIHZhciBzZWxlY3RlZCA9IGJvYXJkLmtleWJvYXJkU2VsZWN0LnggKyBib2FyZC5rZXlib2FyZFNlbGVjdC55ICogYm9hcmQuY29sdW1ucztcclxuICAgIGJvYXJkLmltYWdlQXJyYXlbc2VsZWN0ZWRdLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKTtcclxufVxyXG5cclxuLyoqIFxyXG4qIENhcHR1cmUga2V5Ym9hcmQgcHJlc3NlcyBhbmQgdXNlIGl0IHRvIHNlbGVjdCBtZW1vcnkgY2FyZHNcclxuKiBAcGFyYW0gIHtvYmplY3R9IGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVJbnB1dChib2FyZCkge1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBib2FyZC5wd2QuaWQpLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGUua2V5Q29kZSA/IGUua2V5Q29kZSA6IGUud2hpY2g7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gMzcpIHtcclxuICAgICAgICAgICAgLy9sZWZ0XHJcbiAgICAgICAgICAgIGlmIChib2FyZC5rZXlib2FyZFNlbGVjdC54ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQua2V5Ym9hcmRTZWxlY3QueCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0KGJvYXJkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNlIGlmIChrZXkgPT09IDM4KSB7XHJcbiAgICAgICAgICAgIC8vdXBcclxuICAgICAgICAgICAgaWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC55IC09IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2UgaWYgKGtleSA9PT0gMzkpIHtcclxuICAgICAgICAgICAgLy9yaWdodFxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueCA8IGJvYXJkLmNvbHVtbnMgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC54ICs9IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDQwKSB7XHJcbiAgICAgICAgICAgIC8vZG93blxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueSA8IGJvYXJkLnJvd3MgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC55ICs9IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDMyKSB7XHJcbiAgICAgICAgICAgIC8vc3BhY2VcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gYm9hcmQua2V5Ym9hcmRTZWxlY3QueCArIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgKiBib2FyZC5jb2x1bW5zO1xyXG4gICAgICAgICAgICBib2FyZC5pbWFnZUFycmF5W3NlbGVjdGVkXS5jbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sIHRydWUpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5oYW5kbGVJbnB1dCA9IGhhbmRsZUlucHV0O1xyXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmVPdXRsaW5lID0gcmVtb3ZlT3V0bGluZTtcclxuIl19
