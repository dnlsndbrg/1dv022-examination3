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
 * Called whenever the app window has been resized
 */
AppWindow.prototype.resized = function() {
    
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
    this.appWindow.resized();
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
	this.appWindow.resized();
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
    this.appWindow.resized();
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
    },
    Runner: {
        entry: require("./apps/breakout/app"),
        title: "Breakout",
        width: 480,
        height: 324,
        icon: "fa-rocket"
    }
};


},{"./apps/breakout/app":15,"./apps/chat/app":17,"./apps/memory/app":21}],11:[function(require,module,exports){
function Ball(game) {
    this.game = game;
    this.x = this.game.canvas.width / 2;
    this.y = this.game.canvas.height - 30;
    this.dx = 200;
    this.dy = -200;
    this.radius = 10;
}

Ball.prototype.update = function(dt) {

    // collision detection with outer walls
    var dy = (this.dy * dt) / 1000;
    var dx = (this.dx * dt) / 1000;

    // bounce against side walls
    if (this.x + dx > this.game.canvas.width - this.radius || this.x + dx < this.radius) {
        this.dx = -this.dx;
    }

    // bounce against the roof
    if (this.y + dy < this.radius) {
        this.dy = -this.dy;

    // ball has hit the bottom
    } else if (this.y + dy > this.game.canvas.height - this.radius) {

        // check if it hits the paddle
        if (this.x > this.game.paddle.x && this.x < this.game.paddle.x + this.game.paddle.width) {
            this.dy = -this.dy;
        }
        else {
            // game over
            this.game.gameOver();
        }
    }

    // collision detection with bricks
    for (var y = 0; y < this.game.brickRowCount; y += 1) {
        for (var x = 0; x < this.game.brickColumnCount; x += 1) {
            var brick = this.game.bricks[y][x];
            if(brick.active) {
                if (this.x > brick.x && this.x < brick.x + this.game.brickWidth && this.y > brick.y && this.y < brick.y + this.game.brickHeight) {
                    this.dy = -this.dy;
                    brick.active = false;
                    this.game.score += 1;

                    if (this.game.score === this.game.brickRowCount * this.game.brickColumnCount) {
                        this.game.gameWon();
                    }
                }
            }
        }
    }

    // update position
    this.x += (this.dx * dt) / 1000;
    this.y += (this.dy * dt) / 1000;
};

Ball.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#d26b30";
    ctx.fill();
    ctx.closePath();
};

module.exports = Ball;

},{}],12:[function(require,module,exports){
function Brick(game, x, y, color) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.color = "rgb(" + color + "," + color + "," + color + ")";
    this.active = true;
}

Brick.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.game.brickWidth, this.game.brickHeight);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
};

module.exports = Brick;

},{}],13:[function(require,module,exports){
var Ball = require("./Ball");
var Paddle = require("./Paddle");
var Brick = require("./Brick");

function Game(pwd) {
    this.pwd = pwd;
    this.canvas = document.querySelector("#window-" + this.pwd.id + " .window-content").lastElementChild;
    this.ctx = this.canvas.getContext("2d");

    this.brickRowCount = 3;
    this.brickColumnCount = 5;
    this.brickWidth = 75;
    this.brickHeight = 20;
    this.brickPadding = 10;
    this.brickOffsetTop = 30;
    this.brickOffsetLeft = 30;

    this.pwd.appWindow.element.addEventListener("keydown", this.keyDownHandler.bind(this), false);
    this.pwd.appWindow.element.addEventListener("keyup", this.keyUpHandler.bind(this), false);
}

Game.prototype.newGame = function() {

    this.pwd.appWindow.element.focus();

    this.ball = new Ball(this);
    this.paddle = new Paddle(this);
    this.lastTime = new Date().getTime();

    // generate bricks
    this.bricks = [];
    for (var y = 0; y < this.brickRowCount; y += 1) {
        this.bricks[y] = [];
        for (var x = 0; x < this.brickColumnCount; x += 1) {
            var brickX = (x * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
            var brickY = (y * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
            var color = 120 + y * 30;
            this.bricks[y][x] = new Brick(this, brickX, brickY, color);
        }
    }

    this.score = 0;

    this.rightPressed = false;
    this.leftPressed = false;
    this.running = true;
    this.loop();
};

Game.prototype.drawScore = function() {
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#363636";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Score: " + this.score, 8, 20);
};

Game.prototype.gameOver = function() {
    this.running = false;
    this.ctx.font = "46px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#d26b30";
    this.ctx.fillText("Game Over!", this.canvas.width / 2, this.canvas.height / 2);
};

Game.prototype.gameWon = function() {
    this.running = false;
    this.ctx.font = "46px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#7eb364";
    this.ctx.fillText("Win!", this.canvas.width / 2, this.canvas.height / 2);
};

Game.prototype.keyDownHandler = function(e) {
    if (e.keyCode == 39) {
        this.rightPressed = true;
    }
    else if (e.keyCode == 37) {
        this.leftPressed = true;
    }
};

Game.prototype.keyUpHandler = function(e) {
    if (e.keyCode == 39) {
        this.rightPressed = false;
    }
    else if (e.keyCode == 37) {
        this.leftPressed = false;
    }
};

Game.prototype.loop = function() {
    // clear screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // calculate time
    var currentTime = new Date().getTime();
    var dt = (currentTime - this.lastTime);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    // loop
    if (this.running) {
        requestAnimationFrame(this.loop.bind(this));
    }
};

Game.prototype.update = function(dt) {
    this.ball.update(dt);
    this.paddle.update(dt);
};

Game.prototype.draw = function() {
    // draw bricks
    this.bricks.forEach(function(brickRow) {
        brickRow.forEach(function(brick) {
            if (brick.active) {
                brick.draw(this.ctx);
            }
        }.bind(this));
    }.bind(this));

    this.ball.draw(this.ctx);
    this.paddle.draw(this.ctx);

    this.drawScore();
};

module.exports = Game;

},{"./Ball":11,"./Brick":12,"./Paddle":14}],14:[function(require,module,exports){
function Paddle(game) {
    this.game = game;
    this.height = 10;
    this.width = 75;
    this.speed = 200; // pixels per second
    this.x = (this.game.canvas.width - this.width) / 2;
}

Paddle.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.game.canvas.height - this.height, this.width, this.height);
    ctx.fillStyle = "#243342";
    ctx.fill();
    ctx.closePath();
};

Paddle.prototype.update = function(dt) {
    if (this.game.rightPressed && this.x < this.game.canvas.width - this.width) {
        this.x += (this.speed * dt) / 1000;
    }
    else if (this.game.leftPressed && this.x > 0) {
        this.x -= (this.speed * dt) / 1000;
    }
};

module.exports = Paddle;

},{}],15:[function(require,module,exports){
var PwdApp = require("../../../js/PwdApp");
var Game = require("./Game");
var AppMenu = require("../../../js/AppMenu");

// Created from this tutorial https://developer.mozilla.org/en-US/docs/Games/Workflows/2D_Breakout_game_pure_JavaScript

/**
 * Breakout app constructor
 * @param {object} config - app config object
 */
function Breakout(config) {
    PwdApp.call(this, config);

    // create HTML
    var template = document.querySelector("#breakout");
    var clone = document.importNode(template.content, true);
    document.querySelector("#window-" + this.id + " .window-content").appendChild(clone);

    this.game = new Game(this);

    // add a dropdown menu to the window
    this.menu = new AppMenu(this.appWindow.menuElement, [
        {
            name: "File",
            items: [
                {
                    name: "New game",
                    action: this.game.newGame.bind(this.game)
                },
                {
                    name: "Quit",
                    action: this.appWindow.close.bind(this.appWindow)
                }
            ]
        }
        ]
    );

    this.appWindow.resized = this.resized.bind(this);

    this.game.newGame();
}

Breakout.prototype = Object.create(PwdApp.prototype);
Breakout.prototype.constructor = Breakout;

/**
 * We overwrite appwindow resize to match the canvas width with the window width
 * http://www.html5rocks.com/en/tutorials/casestudies/gopherwoord-studios-resizing-html5-games/
 */
Breakout.prototype.resized = function() {
    this.appWindow.element.classList.remove("dragging");

    var widthToHeight = 480 / 320;
    var newWidth = this.appWindow.element.offsetWidth;
    var newHeight = this.appWindow.element.offsetheight;
    var newWidthToHeight = newWidth / newHeight;

    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        this.game.canvas.style.height = newHeight + "px";
        this.game.canvas.style.width = newWidth + "px";
    } else {
        newHeight = newWidth / widthToHeight;
        this.game.canvas.style.width = newWidth + "px";
        this.game.canvas.style.height = newHeight + "px";
    }
};

/**
 * when the app is closing
 */
Breakout.prototype.close = function() {
    this.game.running = false;

    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);
};

module.exports = Breakout;

},{"../../../js/AppMenu":1,"../../../js/PwdApp":4,"./Game":13}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"../../../js/PwdApp":4,"./Channel":16,"./socketConfig.json":18}],18:[function(require,module,exports){
module.exports={
  "address": "ws://vhost3.lnu.se:20080/socket/",
  "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}],19:[function(require,module,exports){
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

},{"./Image":20,"./keyboard":22}],20:[function(require,module,exports){
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
},{"./keyboard":22}],21:[function(require,module,exports){
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

},{"../../../js/AppMenu":1,"../../../js/PwdApp":4,"./Board.js":19}],22:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwTWVudS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHdkQXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Jlc2l6ZVdpbmRvd1dpZHRoLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5qcyIsImNsaWVudC9zb3VyY2UvanMvU2hvcnRjdXQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwTGlzdC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9icmVha291dC9CYWxsLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2JyZWFrb3V0L0JyaWNrLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2JyZWFrb3V0L0dhbWUuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvYnJlYWtvdXQvUGFkZGxlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2JyZWFrb3V0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9jaGF0L0NoYW5uZWwuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9zb2NrZXRDb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9tZW1vcnkvQm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L0ltYWdlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L2tleWJvYXJkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gQXBwTWVudShtZW51RWxlbWVudCwgbWVudXMpIHtcclxuXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1tZW51LWNvbnRhaW5lclwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBtZW51RWxlbWVudC5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBtZW51RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmxhc3RFbGVtZW50Q2hpbGQ7XHJcblxyXG4gICAgbWVudXMuZm9yRWFjaChmdW5jdGlvbihtZW51KSB7XHJcbiAgICAgICAgLy8gY3JlYXRlIG1lbnUgaGVhZGVyXHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctbWVudS1oZWFkZXJcIik7XHJcbiAgICAgICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgICAgICAvLyBhZGQgaGVhZGVyIG5hbWVcclxuICAgICAgICB0aGlzLmVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IG1lbnUubmFtZTtcclxuXHJcbiAgICAgICAgLy8gYWRkIG1lbnUgaXRlbXNcclxuICAgICAgICB2YXIgZHJvcGRvd24gPSB0aGlzLmVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5sYXN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgIG1lbnUuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBjcmVhdGUgbWVudSBpdGVtIGh0bWxcclxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctbWVudS1pdGVtXCIpO1xyXG4gICAgICAgICAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgICAgICAgICBkcm9wZG93bi5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgbmFtZSBhbmQgYXNzaWduIGV2ZW50bGlzdGVuZXJcclxuICAgICAgICAgICAgdmFyIGl0ZW1FbGVtZW50ID0gZHJvcGRvd24ubGFzdEVsZW1lbnRDaGlsZC5sYXN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgICAgICBpdGVtRWxlbWVudC50ZXh0Q29udGVudCA9IGl0ZW0ubmFtZTtcclxuICAgICAgICAgICAgaXRlbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGl0ZW0uYWN0aW9uKTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBwTWVudTtcclxuIiwidmFyIFJlc2l6ZVdpbmRvd1dpZHRoID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93V2lkdGhcIik7XHJcbnZhciBSZXNpemVXaW5kb3dIZWlnaHQgPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dIZWlnaHRcIik7XHJcbnZhciBSZXNpemVXaW5kb3dXaWR0aEhlaWdodCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0XCIpO1xyXG5cclxuLyoqXHJcbiAqIEFwcFdpbmRvdyBDb25zdHJ1Y3Rvci4gVGhpcyBvYmplY3QgaGFuZGxlcyB0aGUgZ3JhcGhpY3MgYW5kIGFsbCByZWxhdGVkIGV2ZW50cyBzdWNoIGFzIHJlc2l6aW5nLCBtYXhpbWl6aW5nLCBjbG9zaW5nIGV0Yy5cclxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIGl0IHRha2VzIHRoZSBhcHAgY29uZmlnIGFzIGFuIGFyZ3VtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBBcHBXaW5kb3coY29uZmlnKSB7XHJcbiAgICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gICAgdGhpcy5wd2QgPSBjb25maWcucHdkO1xyXG4gICAgdGhpcy53aWR0aCA9IGNvbmZpZy53aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gY29uZmlnLmhlaWdodDtcclxuICAgIHRoaXMueCA9IGNvbmZpZy54O1xyXG4gICAgdGhpcy55ID0gY29uZmlnLnk7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FwcFdpbmRvd1wiKS5jb250ZW50LCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAvLyBkZWZpbmUgdGhpcy5lbGVtZW50XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG5cclxuICAgIC8vIHNldCBpZFxyXG4gICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwid2luZG93LVwiICsgdGhpcy5pZCk7XHJcblxyXG4gICAgLy8gZGVmaW5lIHRoaXMud3JhcHBlckVsZW1lbnRcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuXHJcbiAgICAvLyBkZWZpbmUgbWVudUVsZW1lbnRcclxuICAgIHRoaXMubWVudUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LW1lbnVcIik7XHJcblxyXG4gICAgLy8gc2V0IHdpbmRvdyBiYXIgaWNvblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmZhXCIpLmNsYXNzTGlzdC5hZGQoY29uZmlnLmljb24pO1xyXG5cclxuICAgIC8vIHNldCB3aW5kb3cgYmFyIHRpdGxlXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhci10aXRsZVwiKS50ZXh0Q29udGVudCA9IGNvbmZpZy50aXRsZTtcclxuXHJcbiAgICAvLyBzZXQgcG9zaXRpb24gYW5kIHNpemVcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gY29uZmlnLnggKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gY29uZmlnLnkgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gY29uZmlnLnpJbmRleDtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IGNvbmZpZy53aWR0aCArIFwicHhcIjtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gY29uZmlnLmhlaWdodCAgKyBcInB4XCI7XHJcbiAgICB0aGlzLnRpdGxlQmFySGVpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuc2Nyb2xsSGVpZ2h0OyAvLyB1c2VkIGZvciBkcmFnIHJlemlzaW5nXHJcbiAgICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoKHRoaXMpO1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dIZWlnaHQgPSBuZXcgUmVzaXplV2luZG93SGVpZ2h0KHRoaXMpO1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dXaWR0aEhlaWdodCA9IG5ldyBSZXNpemVXaW5kb3dXaWR0aEhlaWdodCh0aGlzKTtcclxuICAgIHRoaXMuY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKTtcclxuXHJcbiAgICAvLyBwdXQgb24gdG9wIGlmIGNsaWNrZWRcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW92ZVRvVG9wLmJpbmQodGhpcyksIHRydWUpO1xyXG5cclxuICAgIC8vIGRyYWcgdGhlIHdpbmRvdyBmcm9tIHRoZSB3aW5kb3cgYmFyXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIGRvdWJsZSBjbGljayB3aW5kb3cgYmFyXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgdGhpcy5kYmxjbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBjbG9zZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNsb3NlLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBtYXhpbWl6ZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1heGltaXplLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tYXhpbWl6ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyByZXN0b3JlIGV2ZW50XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMucmVzdG9yZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBtaW5pbWl6ZVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1pbmltaXplLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5taW5pbWl6ZS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHVzZXIgaGFzIGhhc3Qgc3RhcnRlZCB0byBkcmFnIHRoZSB3aW5kb3cgYmFyXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSB0aGUgY2xpY2sgaGFuZGxlciBldmVudCBvYmplY3RcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gICAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCAtIGV2ZW50LnBhZ2VYO1xyXG4gICAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wIC0gZXZlbnQucGFnZVk7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyYWdnaW5nXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHVzZXIgaXMgZHJhZ2dpbmcgYW4gYXBwIHdpbmRvd1xyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gdGhlIG1vdXNlbW92ZSBldmVudCBvYmplY3RcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnggPSBldmVudC5wYWdlWCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gICAgdGhpcy55ID0gZXZlbnQucGFnZVkgKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICAgIHRoaXMuY2hlY2tCb3VuZHMoZXZlbnQpO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSAgdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBjaGVja3MgdGhhdCBhIGRyYWdnZWQgd2luZG93IGlzbnQgZHJhZ2dlZCBvZmYgc2NyZWVuXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSB0aGUgbW91c2Vtb3ZlIGV2ZW50IG9iamVjdFxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5jaGVja0JvdW5kcyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQucGFnZVggPiB0aGlzLnB3ZC53aWR0aCkge1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMucHdkLndpZHRoICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFg7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGV2ZW50LnBhZ2VZID4gdGhpcy5wd2QuaGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wd2QuaGVpZ2h0ICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChldmVudC5wYWdlWSA8IDEpIHtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiB1c2VyIGhhcyBzdG9wcCBkcmFnZ2luZ1xyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2luZ1wiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxsZWQgd2hlbmV2ZXIgdGhlIGFwcCB3aW5kb3cgaGFzIGJlZW4gcmVzaXplZFxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5yZXNpemVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICBcclxufTtcclxuXHJcbi8qKlxyXG4gKiBwb3NpdGlvbiB0aGlzIHdpbmRvdyBpbiBmcm9udCBvZiBvdGhlciB3aW5kb3dzXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1vdmVUb1RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wd2QubGFzdFpJbmRleCArPSAxO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMucHdkLmxhc3RaSW5kZXg7XHJcbn07XHJcblxyXG4vKipcclxuICogY2xvc2UgdGhpcyB3aW5kb3dcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYW5pbWF0ZSgpO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAwO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIDIwICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy53aWR0aCAtIDEwMCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgNTAgKyBcInB4XCI7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHdkLmNsb3NlQXBwKHRoaXMpO1xyXG4gICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIG1ha2UgdGhlIHdpbmRvdyBmdWxsc2NyZWVuXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1heGltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IHRydWU7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuXHJcbiAgICAvLyBzYXZlIHRoZSBzaXplIGFuZCBwb3NpdGlvbiBzbyB3ZSBjYW4gcmV0dXJuIHRvIGl0IHdpdGggdGhlIHJlc3RvcmUgd2luZG93IGZ1bmN0aW9uXHJcbiAgICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gICAgdGhpcy5sYXN0WSA9IHRoaXMueTtcclxuICAgIHRoaXMubGFzdFdpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMubGFzdEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIC8vIHRlbGwgcHdkIHRoaXMgd2luZG93IGlzIGluIGZ1bGxzY3JlZW4gKGluIGNhc2Ugb2YgYnJvd3NlciByZXNpemluZylcclxuICAgIHRoaXMucHdkLmZ1bGxzY3JlZW5lZFdpbmRvdyA9IHRoaXM7XHJcblxyXG4gICAgLy8gbWFrZSB0aGUgd2luZG93IGZ1bGxzY3JlZW5cclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5wd2Qud2lkdGggKyBcInB4XCI7XHJcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5wd2QuaGVpZ2h0IC0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XHJcbiAgICB0aGlzLnggPSAwO1xyXG4gICAgdGhpcy55ID0gMDtcclxuXHJcbiAgICAvLyBoaWRlL3Nob3cgdGhlIG1heGltaXplIGFuZCByZXN0b3JlIHdpbmRvd2JhciBidXR0b25zXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAvLyBpZiBpdCBpcyBtYXhpbWl6ZWQgZnJvbSBhIG1pbmltaXplZCBzdGF0ZVxyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5tZW51RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogYnJpbmcgdGhlIHdpbmRvdyBmcm9tIGZ1bGxzY3JlZW4gYmFjayB0byBwcmV2aW91cyBzaXplXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubWF4aW1pemVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgIHRoaXMueCA9IHRoaXMubGFzdFg7XHJcbiAgICB0aGlzLnkgPSB0aGlzLmxhc3RZO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5sYXN0V2lkdGggKyBcInB4XCI7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMubGFzdEhlaWdodCArIFwicHhcIjtcclxuXHJcbiAgICAvL3RlbGwgcHdkIHRoaXMgd2luZG93IGlzIG5vIGxvbmdlciBpbiBmdWxsc2NyZWVuIChpbiBjYXNlIG9mIGJyb3dzZXIgcmVzaXppbmcpXHJcbiAgICB0aGlzLnB3ZC5mdWxsc2NyZWVuZWRXaW5kb3cgPSBudWxsO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5yZXN0b3JlLXdpbmRvd1wiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgIC8vIGlmIGl0IGlzIHJlc3RvcmVkIGZyb20gYSBtaW5pbWl6ZWQgc3RhdGVcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubWVudUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIG1pbmltaXplIHRoaXMgd2luZG93XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1pbmltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICghdGhpcy5taW5pbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgICAgICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gICAgICAgIHRoaXMubGFzdFkgPSB0aGlzLnk7XHJcbiAgICAgICAgdGhpcy5sYXN0V2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5tZW51RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBcIjIwMHB4XCI7XHJcbiAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgICAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMubGFzdFg7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5sYXN0WTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLmxhc3RXaWR0aCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5tZW51RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogaGFuZGxlIGRvdWJsZSBjbGlja3Mgb24gdGhlIHdpbmRvdyBiYXJcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuZGJsY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLm1pbmltaXplZCkge1xyXG4gICAgICAgIHRoaXMubWluaW1pemUoKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5tYXhpbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLnJlc3RvcmUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tYXhpbWl6ZSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGFkZCBjc3MgYW5pbWF0aW9ucyBmb3IgMTAwbXMgYW5kIHRoZW4gcmVtb3ZlIGl0IHNvIGl0IHdvbnQgaW50ZXJmZXIgd2l0aCBkcmFnZ2luZyBiZWhhdmlvdXJcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuYW5pbWF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gYWRkIGFuaW1hdGlvbiBjbGFzc1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ3aW5kb3ctYW5pbWF0ZWRcIik7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwid2luZG93LWFuaW1hdGVkXCIpO1xyXG4gICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcHBXaW5kb3c7XHJcbiIsIi8qKlxyXG4gKiBNb3VzZVxyXG4gKi9cclxuZnVuY3Rpb24gTW91c2UoKXtcclxuICAgIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcbiAgICB0aGlzLmRyYWdPZmZzZXRYID0gMDtcclxuICAgIHRoaXMuZHJhZ09mZnNldFkgPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgKiBvbiBtb3VzZXVwIGV2ZW50IGNoZWNrIGlmIGEgd2luZG93IGlzIGJlaW5nIGRyYWdnZWRcclxuICAgICogQHBhcmFtICB7W3R5cGVdfSBlIC0gbW91c2V1cCBldmVudCBvYmplY3RcclxuICAgICovXHJcbiAgICB0aGlzLm1vdXNldXAgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnZWRPYmplY3QgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0LnN0b3BEcmFnKGV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hlbmV2ZXIgbW91c2UgaXMgbW92ZWRcclxuICAgICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSBtb3VzZW1vdmUgZXZlbnQgb2JqZWN0bl1cclxuICAgICAqL1xyXG4gICAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnZWRPYmplY3QgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0LmRyYWcoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcclxuIiwidmFyIEFwcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0FwcFdpbmRvd1wiKTtcclxudmFyIEFwcE1lbnUgPSByZXF1aXJlKFwiLi9BcHBNZW51XCIpO1xyXG5cclxuZnVuY3Rpb24gUHdkQXBwKGNvbmZpZykge1xyXG4gICAgdGhpcy50aXRsZSA9IGNvbmZpZy50aXRsZTtcclxuICAgIHRoaXMud2lkdGggPSBjb25maWcud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQ7XHJcbiAgICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gICAgY29uZmlnLndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIGNvbmZpZy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgIGNvbmZpZy50aXRsZSA9IHRoaXMudGl0bGU7XHJcbiAgICB0aGlzLmFwcFdpbmRvdyA9IG5ldyBBcHBXaW5kb3coY29uZmlnKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQd2RBcHA7XHJcbiIsIi8qKlxyXG4gKiBBcHAgd2luZG93IHJlc2l6ZXIgQ29uc3RydWN0b3JcclxuICogVGhpcyBpcyBhIHNtYWxsIGVsZW1lbnQgb24gdGhlIGJvdHRvbSBvZiBhcHAgd2luZG93cy4gaXQgY2FuIGJlIGRyYWdnZWQgdXAgYW5kIGRvd24gdG8gcmVzaXplIHRoZSBoZWlnaHQgb2YgYXBwIHdpbmRvd3NcclxuICogQHBhcmFtIHtvYmplY3R9IGFwcFdpbmRvdyAtIHdoYXQgd2luZG93IHRvIHJlc2l6ZVxyXG4gKi9cclxuZnVuY3Rpb24gUmVzaXplV2luZG93SGVpZ2h0KGFwcFdpbmRvdykge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpO1xyXG4gICAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiByZXNpemVyIGRyYWcgaXMgc3RhcnRlZFxyXG4gKi9cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LnRpdGxlQmFySGVpZ2h0IC0gZXZlbnQucGFnZVk7XHJcbn07XHJcblxyXG4vKipcclxuICogcmVzaXplciBpcyBkcmFnZ2VkXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gZXZlbnQgLSBtb3VzZW1vdmUgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy5yZXNpemVUaGlzLnN0eWxlLmhlaWdodCA9IChldmVudC5wYWdlWSAtIHRoaXMuYXBwV2luZG93LnkgLSB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkpICsgXCJweFwiO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHJlc2l6ZXIgZHJhZyBzdG9wcGVkXHJcbiovXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnJlc2l6ZWQoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93SGVpZ2h0O1xyXG4iLCIvKipcclxuICogQXBwIHdpbmRvdyB3aWR0aCByZXNpemVyIENvbnN0cnVjdG9yXHJcbiAqIFRoaXMgaXMgYSBzbWFsbCBlbGVtZW50IG9uIHRoZSByaWdodCBzaWRlIG9mIGFwcCB3aW5kb3dzLiBpdCBjYW4gYmUgZHJhZ2dlZCBsZWZ0IGFuZCByaWdodCB0byByZXNpemUgdGhlIHdpZHRoIG9mIGFwcCB3aW5kb3dzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcHBXaW5kb3cgLSB3aGF0IHdpbmRvdyB0byByZXNpemVcclxuICovXHJcbmZ1bmN0aW9uIFJlc2l6ZVdpbmRvd1dpZHRoKGFwcFdpbmRvdykge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci14XCIpO1xyXG4gICAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCk7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGRyYWcgaXMgc3RhcnRlZFxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IG1vdXNlIGNsaWNrIGV2ZW50IGhhbmRsZXIgb2JqZWN0XHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuXHJcbiAgICAvL2RyYWcgZnJvbSBleGFjdGx5IHdoZXJlIHRoZSBjbGljayBpc1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiB3aWR0aCByZXNpemVyIGlzIGRyYWdnZWRcclxuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAtIG1vdXNlbW92ZSBldmVudCBvYmplY3RcclxuICovXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMucmVzaXplVGhpcy5zdHlsZS53aWR0aCA9IChldmVudC5wYWdlWCAtIHRoaXMuYXBwV2luZG93LnggKyB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFgpICsgXCJweFwiO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblx0dGhpcy5hcHBXaW5kb3cucmVzaXplZCgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dXaWR0aDtcclxuIiwiLyoqXHJcbiAqIEFwcCB3aW5kb3cgcmVzaXplciBDb25zdHJ1Y3RvclxyXG4gKiBUaGlzIGNvbnRyb2xzIGJvdGggd2lkdGggYW5kIGhlaWdodCByZXNpemluZyBvZiBhbiBhcHAgd2luZG93LiBpdHMgZWxlbWVudCBpcyBhIHNtYWxsIHNxdWFyZSBhdCB0aGUgYm90dG9tIGxlZnQgY29ybmVyIG9mIGl0cyBhcHAgd2luZG93XHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcHBXaW5kb3cgLSB3aGF0IHdpbmRvdyB0byByZXNpemVcclxuICovXHJcbmZ1bmN0aW9uIFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0KGFwcFdpbmRvdykge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci14eVwiKTtcclxuICAgIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vKipcclxuICogcmVzaXplciBkcmFnIGlzIHN0YXJ0ZWRcclxuICovXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG5cclxuICAgIC8vIHRoaXMgZWxlbWVudCBoYXMgbm8gb2Zmc2V0VG9wIHNvIGluc3RlYWQgd2UgdXNlIHdpbmRvdy1yZXNpemVyLWhlaWdodCdzIG9mZnNldFRvcCB2YWx1ZVxyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy50aXRsZUJhckhlaWdodCAtIGV2ZW50LnBhZ2VZO1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvLyB0aGlzIGNsaWNrIHNob3VsZG50IGdvIHRocm91Z2ggdG8gdGhlIHBhcmVudCB3aGljaCBpcyB0aGUgaGVpZ2h0LXJlc2l6ZXJcclxufTtcclxuXHJcbi8qKiBcclxuICogd2lkdGgmaGVpZ2h0IHJlc2l6ZXIgaXMgYmVpbmcgZHJhZ2dlZCBcclxuKi9cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlKSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5yZXNpemVXaW5kb3dIZWlnaHQuZHJhZyhlKTtcclxuICAgIHRoaXMuYXBwV2luZG93LnJlc2l6ZVdpbmRvd1dpZHRoLmRyYWcoZSk7XHJcbn07XHJcblxyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnJlc2l6ZWQoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGhIZWlnaHQ7XHJcbiIsIi8qKlxyXG4gKiBjb25zdHJ1Y3RvciBmb3IgYSBkZXNrdG9wIGFwcCBzaG9ydGN1dFxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gYXBwIGNvbmZpZ1xyXG4gKiBAcGFyYW0ge29iamVjdH0gcHdkIC0gYSByZWZlcmVuY2UgdG8gdGhlIHB3ZFxyXG4gKi9cclxuZnVuY3Rpb24gU2hvcnRjdXQoY29uZmlnLCBwd2QpIHtcclxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG4gICAgdGhpcy50aXRsZSA9IGNvbmZpZy50aXRsZTtcclxuICAgIHRoaXMuZW50cnkgPSBjb25maWcuZW50cnk7XHJcbiAgICB0aGlzLnB3ZCA9IHB3ZDtcclxuXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzaG9ydGN1dFwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG5cclxuICAgIC8vIGFkZCBpY29uIGFuZCB0ZXh0XHJcbiAgICB0aGlzLmVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LmFkZChjb25maWcuaWNvbik7XHJcbiAgICB0aGlzLmVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IHRoaXMudGl0bGU7XHJcblxyXG4gICAgLy9hZGQgZXZlbnQgbGlzdGVuZXJcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wd2Quc3RhcnRBcHAodGhpcy5jb25maWcpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaG9ydGN1dDtcclxuIiwidmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XHJcbnZhciBTaG9ydGN1dCA9IHJlcXVpcmUoXCIuL1Nob3J0Y3V0XCIpO1xyXG52YXIgYXBwTGlzdCA9IHJlcXVpcmUoXCIuL2FwcExpc3RcIik7XHJcblxyXG5cclxuLyoqXHJcbiAqIFBlcnNvbmFsIFdlYiBEZXNrdG9wXHJcbiAqL1xyXG52YXIgUHdkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1vdXNlID0gbmV3IE1vdXNlKCk7XHJcbiAgICB0aGlzLmluc3RhbGxlZEFwcHMgPSBbXTtcclxuICAgIHRoaXMuc3RhcnRlZEFwcHMgPSB7fTtcclxuICAgIHRoaXMubGFzdFpJbmRleCA9IDE7XHJcbiAgICB0aGlzLmxhc3RJRCA9IDE7XHJcbiAgICB0aGlzLmZ1bGxzY3JlZW5lZFdpbmRvdyA9IG51bGw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgc2hvcnRjdXRzIGZvciBhbGwgYXZhaWxhYmxlIGFwcHNcclxuICAgICAqL1xyXG4gICAgdGhpcy5pbnN0YWxsQXBwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvciAodmFyIGFwcCBpbiBhcHBMaXN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFsbGVkQXBwcy5wdXNoKG5ldyBTaG9ydGN1dChhcHBMaXN0W2FwcF0sIHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiB0aGUgdXNlciBjbGlja3MgYW4gYXBwIHNob3J0Y3V0IHRoaXMgZnVuY3Rpb24gd2lsbCBzdGFydCB0aGUgYXBwXHJcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZyAtIGNvbnRhaW5zIGFwcCBzZXR0aW5ncy4gVGhlIGNvbmZpZ3VyYXRpb24gY29tZXMgZnJvbSBhcHBMaXN0LmpzXHJcbiAgICAgKi9cclxuICAgIHRoaXMuc3RhcnRBcHAgPSBmdW5jdGlvbihjb25maWcpIHtcclxuXHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jYWxjdWxhdGVTdGFydFBvc2l0aW9uKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHZhciBuZXdBcHAgPSBuZXcgY29uZmlnLmVudHJ5KHtcclxuICAgICAgICAgICAgdGl0bGU6IGNvbmZpZy50aXRsZSxcclxuICAgICAgICAgICAgd2lkdGg6IGNvbmZpZy53aWR0aCxcclxuICAgICAgICAgICAgaGVpZ2h0OiBjb25maWcuaGVpZ2h0LFxyXG4gICAgICAgICAgICBpY29uOiBjb25maWcuaWNvbixcclxuICAgICAgICAgICAgcHdkOiB0aGlzLFxyXG4gICAgICAgICAgICBpZDogdGhpcy5sYXN0SUQsXHJcbiAgICAgICAgICAgIHg6IHBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgIHpJbmRleDogdGhpcy5sYXN0WkluZGV4XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGFydGVkQXBwc1t0aGlzLmxhc3RJRF0gPSBuZXdBcHA7XHJcbiAgICAgICAgdGhpcy5sYXN0WkluZGV4ICs9IDE7XHJcbiAgICAgICAgdGhpcy5sYXN0SUQgKz0gMTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIHdoZXJlIG5ldyBhcHBzIHNob3VsZCBhcHBlYXIgb24gdGhlIHNjcmVlblxyXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBjb25maWcgLSBjb250YWlucyB0aGUgIGFwcHMgc3RhbmRhcmQgd2lkdGggYW5kIGhlaWdodFxyXG4gICAgICovXHJcbiAgICB0aGlzLmNhbGN1bGF0ZVN0YXJ0UG9zaXRpb24gPSBmdW5jdGlvbihjb25maWcpIHtcclxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHN0YXJ0aW5nIFggWSBjb29yZGluYXRlcyBhcmUgZ29vZFxyXG5cclxuICAgICAgICB2YXIgeCA9IHRoaXMubmV3WCAtIGNvbmZpZy53aWR0aCAvIDI7XHJcbiAgICAgICAgdmFyIHkgPSB0aGlzLm5ld1kgLSBjb25maWcuaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgLy8gcmVzZXQgaWYgWCBpcyBvZmYgc2NyZWVuXHJcbiAgICAgICAgaWYgKHggPiB0aGlzLndpZHRoIC0gNDAgfHwgeSA+IHRoaXMuaGVpZ2h0IC0gNDApIHtcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFggKz0gMjA7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9yaWdpbmFsWCA+IHRoaXMud2lkdGggLSAyMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFggPSAyMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5uZXdYID0gdGhpcy5vcmlnaW5hbFg7XHJcbiAgICAgICAgICAgIHRoaXMubmV3WSA9IHRoaXMub3JpZ2luYWxZO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVzZXQgaWYgWSBpcyBvZmYgc2NyZWVuXHJcblxyXG4gICAgICAgIHRoaXMubmV3WCArPSAyMDtcclxuICAgICAgICB0aGlzLm5ld1kgKz0gMjA7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBuZXcgYXBwIGlzIGJpZ2dlciB0aGFuIHRoZSBwd2Qgd2luZG93XHJcbiAgICAgICAgaWYgKHggPCAwKSB7XHJcbiAgICAgICAgICAgIHggPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHkgPCAwKSB7XHJcbiAgICAgICAgICAgIHkgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbG9zZSBhbiBhcHBcclxuICAgICAqIEBwYXJhbSAge29iamVjdH0gYXBwXHJcbiAgICAgKi9cclxuICAgIHRoaXMuY2xvc2VBcHAgPSBmdW5jdGlvbihhcHApIHtcclxuICAgICAgICB0aGlzLnN0YXJ0ZWRBcHBzW2FwcC5pZF0uY2xvc2UoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5zdGFydGVkQXBwc1thcHAuaWRdO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJyb3dzZXIgcmVzaXplXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVzaXplID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdYID0gdGhpcy53aWR0aCAvIDI7XHJcbiAgICAgICAgdGhpcy5uZXdZID0gdGhpcy5oZWlnaHQgLyAyLjU7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFggPSB0aGlzLm5ld1g7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFkgPSB0aGlzLm5ld1k7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmZ1bGxzY3JlZW5lZFdpbmRvdykge1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5lZFdpbmRvdy5tYXhpbWl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG52YXIgcHdkID0gbmV3IFB3ZCgpO1xyXG5wd2QuaW5zdGFsbEFwcHMoKTsgLy8gY3JlYXRlIHNob3J0Y3V0cyBmb3IgYWxsIGF2YWlsYWJsZSBhcHBzXHJcbnB3ZC5yZXNpemUoKTsgLy8gcnVuIHJlc2l6ZSBvbmNlIHRvIGdldCB3aWR0aCBhbmQgY2FsY3VsYXRlIHN0YXJ0IHBvc2l0aW9uIG9mIGFwcHNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcHdkLnJlc2l6ZS5iaW5kKHB3ZCkpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIFwiQ2hhdFwiOiB7XHJcbiAgICAgICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvY2hhdC9hcHBcIiksXHJcbiAgICAgICAgdGl0bGU6IFwiQ2hhdFwiLFxyXG4gICAgICAgIHdpZHRoOiA1MDAsXHJcbiAgICAgICAgaGVpZ2h0OiA0MDAsXHJcbiAgICAgICAgaWNvbjogXCJmYS1jb21tZW50aW5nXCJcclxuICAgIH0sXHJcbiAgICBcIk1lbW9yeVwiOiB7XHJcbiAgICAgICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvbWVtb3J5L2FwcFwiKSxcclxuICAgICAgICB0aXRsZTogXCJNZW1vcnlcIixcclxuICAgICAgICB3aWR0aDogNTUwLFxyXG4gICAgICAgIGhlaWdodDogNDQwLFxyXG4gICAgICAgIGljb246IFwiZmEtY2xvbmVcIlxyXG4gICAgfSxcclxuICAgIFJ1bm5lcjoge1xyXG4gICAgICAgIGVudHJ5OiByZXF1aXJlKFwiLi9hcHBzL2JyZWFrb3V0L2FwcFwiKSxcclxuICAgICAgICB0aXRsZTogXCJCcmVha291dFwiLFxyXG4gICAgICAgIHdpZHRoOiA0ODAsXHJcbiAgICAgICAgaGVpZ2h0OiAzMjQsXHJcbiAgICAgICAgaWNvbjogXCJmYS1yb2NrZXRcIlxyXG4gICAgfVxyXG59O1xyXG5cclxuIiwiZnVuY3Rpb24gQmFsbChnYW1lKSB7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4gICAgdGhpcy54ID0gdGhpcy5nYW1lLmNhbnZhcy53aWR0aCAvIDI7XHJcbiAgICB0aGlzLnkgPSB0aGlzLmdhbWUuY2FudmFzLmhlaWdodCAtIDMwO1xyXG4gICAgdGhpcy5keCA9IDIwMDtcclxuICAgIHRoaXMuZHkgPSAtMjAwO1xyXG4gICAgdGhpcy5yYWRpdXMgPSAxMDtcclxufVxyXG5cclxuQmFsbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuXHJcbiAgICAvLyBjb2xsaXNpb24gZGV0ZWN0aW9uIHdpdGggb3V0ZXIgd2FsbHNcclxuICAgIHZhciBkeSA9ICh0aGlzLmR5ICogZHQpIC8gMTAwMDtcclxuICAgIHZhciBkeCA9ICh0aGlzLmR4ICogZHQpIC8gMTAwMDtcclxuXHJcbiAgICAvLyBib3VuY2UgYWdhaW5zdCBzaWRlIHdhbGxzXHJcbiAgICBpZiAodGhpcy54ICsgZHggPiB0aGlzLmdhbWUuY2FudmFzLndpZHRoIC0gdGhpcy5yYWRpdXMgfHwgdGhpcy54ICsgZHggPCB0aGlzLnJhZGl1cykge1xyXG4gICAgICAgIHRoaXMuZHggPSAtdGhpcy5keDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBib3VuY2UgYWdhaW5zdCB0aGUgcm9vZlxyXG4gICAgaWYgKHRoaXMueSArIGR5IDwgdGhpcy5yYWRpdXMpIHtcclxuICAgICAgICB0aGlzLmR5ID0gLXRoaXMuZHk7XHJcblxyXG4gICAgLy8gYmFsbCBoYXMgaGl0IHRoZSBib3R0b21cclxuICAgIH0gZWxzZSBpZiAodGhpcy55ICsgZHkgPiB0aGlzLmdhbWUuY2FudmFzLmhlaWdodCAtIHRoaXMucmFkaXVzKSB7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIGl0IGhpdHMgdGhlIHBhZGRsZVxyXG4gICAgICAgIGlmICh0aGlzLnggPiB0aGlzLmdhbWUucGFkZGxlLnggJiYgdGhpcy54IDwgdGhpcy5nYW1lLnBhZGRsZS54ICsgdGhpcy5nYW1lLnBhZGRsZS53aWR0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmR5ID0gLXRoaXMuZHk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBnYW1lIG92ZXJcclxuICAgICAgICAgICAgdGhpcy5nYW1lLmdhbWVPdmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbGxpc2lvbiBkZXRlY3Rpb24gd2l0aCBicmlja3NcclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5nYW1lLmJyaWNrUm93Q291bnQ7IHkgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5nYW1lLmJyaWNrQ29sdW1uQ291bnQ7IHggKz0gMSkge1xyXG4gICAgICAgICAgICB2YXIgYnJpY2sgPSB0aGlzLmdhbWUuYnJpY2tzW3ldW3hdO1xyXG4gICAgICAgICAgICBpZihicmljay5hY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnggPiBicmljay54ICYmIHRoaXMueCA8IGJyaWNrLnggKyB0aGlzLmdhbWUuYnJpY2tXaWR0aCAmJiB0aGlzLnkgPiBicmljay55ICYmIHRoaXMueSA8IGJyaWNrLnkgKyB0aGlzLmdhbWUuYnJpY2tIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmR5ID0gLXRoaXMuZHk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJpY2suYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLnNjb3JlICs9IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmdhbWUuc2NvcmUgPT09IHRoaXMuZ2FtZS5icmlja1Jvd0NvdW50ICogdGhpcy5nYW1lLmJyaWNrQ29sdW1uQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLmdhbWVXb24oKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXBkYXRlIHBvc2l0aW9uXHJcbiAgICB0aGlzLnggKz0gKHRoaXMuZHggKiBkdCkgLyAxMDAwO1xyXG4gICAgdGhpcy55ICs9ICh0aGlzLmR5ICogZHQpIC8gMTAwMDtcclxufTtcclxuXHJcbkJhbGwucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJICogMik7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCIjZDI2YjMwXCI7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYWxsO1xyXG4iLCJmdW5jdGlvbiBCcmljayhnYW1lLCB4LCB5LCBjb2xvcikge1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy5jb2xvciA9IFwicmdiKFwiICsgY29sb3IgKyBcIixcIiArIGNvbG9yICsgXCIsXCIgKyBjb2xvciArIFwiKVwiO1xyXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xyXG59XHJcblxyXG5Ccmljay5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMuZ2FtZS5icmlja1dpZHRoLCB0aGlzLmdhbWUuYnJpY2tIZWlnaHQpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCcmljaztcclxuIiwidmFyIEJhbGwgPSByZXF1aXJlKFwiLi9CYWxsXCIpO1xyXG52YXIgUGFkZGxlID0gcmVxdWlyZShcIi4vUGFkZGxlXCIpO1xyXG52YXIgQnJpY2sgPSByZXF1aXJlKFwiLi9Ccmlja1wiKTtcclxuXHJcbmZ1bmN0aW9uIEdhbWUocHdkKSB7XHJcbiAgICB0aGlzLnB3ZCA9IHB3ZDtcclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgdGhpcy5icmlja1Jvd0NvdW50ID0gMztcclxuICAgIHRoaXMuYnJpY2tDb2x1bW5Db3VudCA9IDU7XHJcbiAgICB0aGlzLmJyaWNrV2lkdGggPSA3NTtcclxuICAgIHRoaXMuYnJpY2tIZWlnaHQgPSAyMDtcclxuICAgIHRoaXMuYnJpY2tQYWRkaW5nID0gMTA7XHJcbiAgICB0aGlzLmJyaWNrT2Zmc2V0VG9wID0gMzA7XHJcbiAgICB0aGlzLmJyaWNrT2Zmc2V0TGVmdCA9IDMwO1xyXG5cclxuICAgIHRoaXMucHdkLmFwcFdpbmRvdy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5RG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgdGhpcy5wd2QuYXBwV2luZG93LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIHRoaXMua2V5VXBIYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcclxufVxyXG5cclxuR2FtZS5wcm90b3R5cGUubmV3R2FtZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHRoaXMucHdkLmFwcFdpbmRvdy5lbGVtZW50LmZvY3VzKCk7XHJcblxyXG4gICAgdGhpcy5iYWxsID0gbmV3IEJhbGwodGhpcyk7XHJcbiAgICB0aGlzLnBhZGRsZSA9IG5ldyBQYWRkbGUodGhpcyk7XHJcbiAgICB0aGlzLmxhc3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgYnJpY2tzXHJcbiAgICB0aGlzLmJyaWNrcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmJyaWNrUm93Q291bnQ7IHkgKz0gMSkge1xyXG4gICAgICAgIHRoaXMuYnJpY2tzW3ldID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmJyaWNrQ29sdW1uQ291bnQ7IHggKz0gMSkge1xyXG4gICAgICAgICAgICB2YXIgYnJpY2tYID0gKHggKiAodGhpcy5icmlja1dpZHRoICsgdGhpcy5icmlja1BhZGRpbmcpKSArIHRoaXMuYnJpY2tPZmZzZXRMZWZ0O1xyXG4gICAgICAgICAgICB2YXIgYnJpY2tZID0gKHkgKiAodGhpcy5icmlja0hlaWdodCArIHRoaXMuYnJpY2tQYWRkaW5nKSkgKyB0aGlzLmJyaWNrT2Zmc2V0VG9wO1xyXG4gICAgICAgICAgICB2YXIgY29sb3IgPSAxMjAgKyB5ICogMzA7XHJcbiAgICAgICAgICAgIHRoaXMuYnJpY2tzW3ldW3hdID0gbmV3IEJyaWNrKHRoaXMsIGJyaWNrWCwgYnJpY2tZLCBjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2NvcmUgPSAwO1xyXG5cclxuICAgIHRoaXMucmlnaHRQcmVzc2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLmxlZnRQcmVzc2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5sb29wKCk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5kcmF3U2NvcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjE2cHggQXJpYWxcIjtcclxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiIzM2MzYzNlwiO1xyXG4gICAgdGhpcy5jdHgudGV4dEFsaWduID0gXCJsZWZ0XCI7XHJcbiAgICB0aGlzLmN0eC5maWxsVGV4dChcIlNjb3JlOiBcIiArIHRoaXMuc2NvcmUsIDgsIDIwKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjQ2cHggQXJpYWxcIjtcclxuICAgIHRoaXMuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiNkMjZiMzBcIjtcclxuICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiR2FtZSBPdmVyIVwiLCB0aGlzLmNhbnZhcy53aWR0aCAvIDIsIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2FtZVdvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmN0eC5mb250ID0gXCI0NnB4IEFyaWFsXCI7XHJcbiAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCIjN2ViMzY0XCI7XHJcbiAgICB0aGlzLmN0eC5maWxsVGV4dChcIldpbiFcIiwgdGhpcy5jYW52YXMud2lkdGggLyAyLCB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmtleURvd25IYW5kbGVyID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKGUua2V5Q29kZSA9PSAzOSkge1xyXG4gICAgICAgIHRoaXMucmlnaHRQcmVzc2VkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAzNykge1xyXG4gICAgICAgIHRoaXMubGVmdFByZXNzZWQgPSB0cnVlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKGUua2V5Q29kZSA9PSAzOSkge1xyXG4gICAgICAgIHRoaXMucmlnaHRQcmVzc2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gMzcpIHtcclxuICAgICAgICB0aGlzLmxlZnRQcmVzc2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBjbGVhciBzY3JlZW5cclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICAvLyBjYWxjdWxhdGUgdGltZVxyXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICB2YXIgZHQgPSAoY3VycmVudFRpbWUgLSB0aGlzLmxhc3RUaW1lKTtcclxuICAgIHRoaXMubGFzdFRpbWUgPSBjdXJyZW50VGltZTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICB0aGlzLmRyYXcoKTtcclxuXHJcbiAgICAvLyBsb29wXHJcbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcC5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICB0aGlzLmJhbGwudXBkYXRlKGR0KTtcclxuICAgIHRoaXMucGFkZGxlLnVwZGF0ZShkdCk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBkcmF3IGJyaWNrc1xyXG4gICAgdGhpcy5icmlja3MuZm9yRWFjaChmdW5jdGlvbihicmlja1Jvdykge1xyXG4gICAgICAgIGJyaWNrUm93LmZvckVhY2goZnVuY3Rpb24oYnJpY2spIHtcclxuICAgICAgICAgICAgaWYgKGJyaWNrLmFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgYnJpY2suZHJhdyh0aGlzLmN0eCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLmJhbGwuZHJhdyh0aGlzLmN0eCk7XHJcbiAgICB0aGlzLnBhZGRsZS5kcmF3KHRoaXMuY3R4KTtcclxuXHJcbiAgICB0aGlzLmRyYXdTY29yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xyXG4iLCJmdW5jdGlvbiBQYWRkbGUoZ2FtZSkge1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMTA7XHJcbiAgICB0aGlzLndpZHRoID0gNzU7XHJcbiAgICB0aGlzLnNwZWVkID0gMjAwOyAvLyBwaXhlbHMgcGVyIHNlY29uZFxyXG4gICAgdGhpcy54ID0gKHRoaXMuZ2FtZS5jYW52YXMud2lkdGggLSB0aGlzLndpZHRoKSAvIDI7XHJcbn1cclxuXHJcblBhZGRsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnJlY3QodGhpcy54LCB0aGlzLmdhbWUuY2FudmFzLmhlaWdodCAtIHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCIjMjQzMzQyXCI7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG59O1xyXG5cclxuUGFkZGxlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCkge1xyXG4gICAgaWYgKHRoaXMuZ2FtZS5yaWdodFByZXNzZWQgJiYgdGhpcy54IDwgdGhpcy5nYW1lLmNhbnZhcy53aWR0aCAtIHRoaXMud2lkdGgpIHtcclxuICAgICAgICB0aGlzLnggKz0gKHRoaXMuc3BlZWQgKiBkdCkgLyAxMDAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGhpcy5nYW1lLmxlZnRQcmVzc2VkICYmIHRoaXMueCA+IDApIHtcclxuICAgICAgICB0aGlzLnggLT0gKHRoaXMuc3BlZWQgKiBkdCkgLyAxMDAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYWRkbGU7XHJcbiIsInZhciBQd2RBcHAgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvUHdkQXBwXCIpO1xyXG52YXIgR2FtZSA9IHJlcXVpcmUoXCIuL0dhbWVcIik7XHJcbnZhciBBcHBNZW51ID0gcmVxdWlyZShcIi4uLy4uLy4uL2pzL0FwcE1lbnVcIik7XHJcblxyXG4vLyBDcmVhdGVkIGZyb20gdGhpcyB0dXRvcmlhbCBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dhbWVzL1dvcmtmbG93cy8yRF9CcmVha291dF9nYW1lX3B1cmVfSmF2YVNjcmlwdFxyXG5cclxuLyoqXHJcbiAqIEJyZWFrb3V0IGFwcCBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gYXBwIGNvbmZpZyBvYmplY3RcclxuICovXHJcbmZ1bmN0aW9uIEJyZWFrb3V0KGNvbmZpZykge1xyXG4gICAgUHdkQXBwLmNhbGwodGhpcywgY29uZmlnKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgSFRNTFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNicmVha291dFwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKHRoaXMpO1xyXG5cclxuICAgIC8vIGFkZCBhIGRyb3Bkb3duIG1lbnUgdG8gdGhlIHdpbmRvd1xyXG4gICAgdGhpcy5tZW51ID0gbmV3IEFwcE1lbnUodGhpcy5hcHBXaW5kb3cubWVudUVsZW1lbnQsIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwiRmlsZVwiLFxyXG4gICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTmV3IGdhbWVcIixcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuZ2FtZS5uZXdHYW1lLmJpbmQodGhpcy5nYW1lKVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlF1aXRcIixcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYXBwV2luZG93LmNsb3NlLmJpbmQodGhpcy5hcHBXaW5kb3cpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmFwcFdpbmRvdy5yZXNpemVkID0gdGhpcy5yZXNpemVkLmJpbmQodGhpcyk7XHJcblxyXG4gICAgdGhpcy5nYW1lLm5ld0dhbWUoKTtcclxufVxyXG5cclxuQnJlYWtvdXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQd2RBcHAucHJvdG90eXBlKTtcclxuQnJlYWtvdXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnJlYWtvdXQ7XHJcblxyXG4vKipcclxuICogV2Ugb3ZlcndyaXRlIGFwcHdpbmRvdyByZXNpemUgdG8gbWF0Y2ggdGhlIGNhbnZhcyB3aWR0aCB3aXRoIHRoZSB3aW5kb3cgd2lkdGhcclxuICogaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvY2FzZXN0dWRpZXMvZ29waGVyd29vcmQtc3R1ZGlvcy1yZXNpemluZy1odG1sNS1nYW1lcy9cclxuICovXHJcbkJyZWFrb3V0LnByb3RvdHlwZS5yZXNpemVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2luZ1wiKTtcclxuXHJcbiAgICB2YXIgd2lkdGhUb0hlaWdodCA9IDQ4MCAvIDMyMDtcclxuICAgIHZhciBuZXdXaWR0aCA9IHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0V2lkdGg7XHJcbiAgICB2YXIgbmV3SGVpZ2h0ID0gdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRoZWlnaHQ7XHJcbiAgICB2YXIgbmV3V2lkdGhUb0hlaWdodCA9IG5ld1dpZHRoIC8gbmV3SGVpZ2h0O1xyXG5cclxuICAgIGlmIChuZXdXaWR0aFRvSGVpZ2h0ID4gd2lkdGhUb0hlaWdodCkge1xyXG4gICAgICAgIG5ld1dpZHRoID0gbmV3SGVpZ2h0ICogd2lkdGhUb0hlaWdodDtcclxuICAgICAgICB0aGlzLmdhbWUuY2FudmFzLnN0eWxlLmhlaWdodCA9IG5ld0hlaWdodCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmdhbWUuY2FudmFzLnN0eWxlLndpZHRoID0gbmV3V2lkdGggKyBcInB4XCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5ld0hlaWdodCA9IG5ld1dpZHRoIC8gd2lkdGhUb0hlaWdodDtcclxuICAgICAgICB0aGlzLmdhbWUuY2FudmFzLnN0eWxlLndpZHRoID0gbmV3V2lkdGggKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy5nYW1lLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQgKyBcInB4XCI7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogd2hlbiB0aGUgYXBwIGlzIGNsb3NpbmdcclxuICovXHJcbkJyZWFrb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5nYW1lLnJ1bm5pbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5yZW1vdmVDaGlsZCh0aGlzLmFwcFdpbmRvdy5lbGVtZW50KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnJlYWtvdXQ7XHJcbiIsInZhciBDaGFubmVsID0gZnVuY3Rpb24oY2hhdCwgbmFtZSkge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuY2hhdCA9IGNoYXQ7XHJcbiAgICB0aGlzLmNoYXQuY2hhbm5lbHNbbmFtZV0gPSB0aGlzO1xyXG5cclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC1jaGFubmVsXCIpO1xyXG4gICAgdGhpcy5jaGF0RGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcclxuXHJcbiAgICB0aGlzLmNoYXREaXYuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgLy8gbGlzdGVuIGZvciBlbnRlciBrZXlcclxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgLy9zZW5kIGEgbWVzc2FnZVxyXG4gICAgICAgICAgICB0aGlzLmNoYXQuc2VuZE1lc3NhZ2UodGhpcy5uYW1lLCBldmVudC50YXJnZXQudmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgLy8gZW1wdHkgdGV4dGFyZWFcclxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuY2hhdC5jaGF0Q2hhbm5lbEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5jaGF0RGl2KTtcclxuXHJcbiAgICAvL2NoYW5uZWwgbGlzdCBlbnRyeVxyXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXQtY2hhbm5lbC1saXN0LWVudHJ5XCIpO1xyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsTGlzdEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLmNoYXQuam9pbkNoYW5uZWxCdXR0b24pO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50ID0gdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLnByZXZpb3VzRWxlbWVudFNpYmxpbmcucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgIGlmIChuYW1lID09PSBcIlwiKSB7XHJcbiAgICAgICAgbmFtZSA9IFwiRGVmYXVsdFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gbmFtZTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuY2hhdC5hY3RpdmVDaGFubmVsID0gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gY2xvc2UgY2hhbm5lbFxyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNsb3NlQ2hhbm5lbCgpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYW5uZWwucHJvdG90eXBlLnByaW50TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVcIilbMF07XHJcbiAgICB2YXIgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XHJcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC10ZXh0XCIpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS5kYXRhO1xyXG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtYXV0aG9yXCIpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS51c2VybmFtZTtcclxuICAgIHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtbWVzc2FnZXNcIilbMF0uYXBwZW5kQ2hpbGQobWVzc2FnZURpdik7XHJcblxyXG4gICAgaWYgKHRoaXMuY2hhdC5hY3RpdmVDaGFubmVsICE9PSB0aGlzKSB7XHJcbiAgICAgICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjaGF0LWNoYW5uZWwtbmV3bWVzc2FnZVwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYW5uZWwucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY2hhdERpdi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LWFjdGl2ZS1jaGFubmVsXCIpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jaGF0RGl2LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImNoYXQtYWN0aXZlLWNoYW5uZWxcIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtY2hhbm5lbC1uZXdtZXNzYWdlXCIpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuY2xvc2VDaGFubmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3JlbW92ZSBjaGFubmVsIGxpc3QgZW50cnlcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsTGlzdEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5saXN0RW50cnlFbGVtZW50KTtcclxuXHJcbiAgICAvL3JlbW92ZSBjaGF0IGRpdlxyXG4gICAgdGhpcy5jaGF0LmNoYXRDaGFubmVsRWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmNoYXREaXYpO1xyXG5cclxuICAgIHRoaXMuY2hhdC5jbG9zZUNoYW5uZWwodGhpcyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYW5uZWw7XHJcbiIsInZhciBQd2RBcHAgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvUHdkQXBwXCIpO1xyXG52YXIgc29ja2V0Q29uZmlnID0gcmVxdWlyZShcIi4vc29ja2V0Q29uZmlnLmpzb25cIik7XHJcbnZhciBDaGFubmVsID0gcmVxdWlyZShcIi4vQ2hhbm5lbFwiKTtcclxuXHJcbi8qKlxyXG4gKiBDaGF0IGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBhcHAgY29uZmlndXJhdGlvbiBvYmplY3RcclxuICovXHJcbmZ1bmN0aW9uIENoYXQoY29uZmlnKSB7XHJcbiAgICBQd2RBcHAuY2FsbCh0aGlzLCBjb25maWcpOyAvL2luaGVyaXQgZnJvbSBwd2RBcHAgb2JqZWN0XHJcbiAgICB0aGlzLmNoYW5uZWxzID0ge307XHJcbiAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBudWxsO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuaW5wdXROYW1lKCkgLy8gZ2V0IHVzZXJuYW1lXHJcbiAgICAudGhlbihmdW5jdGlvbih1c2VybmFtZSkge1xyXG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSB1c2VybmFtZTtcclxuICAgICAgICB0aGlzLnN0YXJ0Q2hhdCgpO1xyXG4gICAgfS5iaW5kKHRoaXMpKVxyXG4gICAgLnRoZW4odGhpcy5jb25uZWN0KCkpIC8vIHRoZW4gd2UgY29ubmVjdFxyXG4gICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVDaGFubmVsID0gbmV3IENoYW5uZWwodGhpcywgXCJcIik7IC8vIHRoZW4gd2UgY29ubmVjdCB0byB0aGUgZGVmYXVsdCBjaGFubmVsXHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5DaGF0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHdkQXBwLnByb3RvdHlwZSk7XHJcbkNoYXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2hhdDtcclxuXHJcbi8qKlxyXG4gKiBlbnRlciB1c2VybmFtZVxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUuaW5wdXROYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoXHJcbiAgICAgICAgZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBzaG93IG5hbWUgaW5wdXQgdGV4dCBhbmQgYnV0dG9uXHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC11c2VybmFtZS1pbnB1dFwiKTtcclxuICAgICAgICAgICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHBXaW5kb3cuY29udGVudC5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtYnRuLXVzZXJuYW1lXCIpO1xyXG4gICAgICAgICAgICB2YXIgdGV4dElucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtdXNlcm5hbWUtaW5wdXQgaW5wdXRbdHlwZT10ZXh0XVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRleHRJbnB1dC5mb2N1cygpO1xyXG5cclxuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXQudmFsdWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGV4dElucHV0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIHRleHRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXQudmFsdWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRleHRJbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICk7XHJcbn07XHJcblxyXG4vKipcclxuICogY3JlYXRlIGNoYXQgY2hhbm5lbCBodG1sXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5zdGFydENoYXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGNsZWFyIHdpbmRvdyBvZiBwcmV2aW91cyBlbGVtZW50ICh0aGUgaW5wdXQgdXNlcm5hbWUgc2NyZWVuKVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLnRleHRDb250ZW50ID0gXCJcIjtcclxuICAgIFxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFwiKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5jb250ZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XHJcbiAgICB0aGlzLmNoYXRDaGFubmVsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWNoYW5uZWxzXCIpO1xyXG4gICAgdGhpcy5jaGFubmVsTGlzdEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1jaGFubmVsLWxpc3RcIik7XHJcblxyXG4gICAgLy8gaG9vayB1cCBqb2luIGNoYW5uZWwgYnV0dG9uXHJcbiAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgaW5wdXRbdHlwZT1idXR0b25cIik7XHJcbiAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1qb2luLWNoYW5uZWxcIik7XHJcblxyXG4gICAgdGhpcy5zaG93Sm9pbkNoYW5uZWxJbnB1dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0KTtcclxuXHJcbiAgICAgICAgLy8gc2hvdyB0aGUgam9pbiBuZXcgY2hhbm5lbCBmb3JtIGFuZCBwb3NpdGlvbiBpdCBuZXh0IHRvIHRoZSBtb3VzZSBjdXJzb3JcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdmFyIGJ0bmJvdW5kaW5nUmVjdCA9IHRoaXMuam9pbkNoYW5uZWxCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgdmFyIGlucHV0Qm91bmRpbmdSZWN0ID0gdGhpcy5qb2luQ2hhbm5lbElucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICB2YXIgbGVmdCA9IGJ0bmJvdW5kaW5nUmVjdC5sZWZ0IC0gdGhpcy5hcHBXaW5kb3cueCArIGJ0bmJvdW5kaW5nUmVjdC53aWR0aCArIDQgKyBcInB4XCI7XHJcbiAgICAgICAgdmFyIHRvcCA9IGJ0bmJvdW5kaW5nUmVjdC50b3AgLSB0aGlzLmFwcFdpbmRvdy55IC0gKGlucHV0Qm91bmRpbmdSZWN0LmhlaWdodCAvIDIpICsgKGJ0bmJvdW5kaW5nUmVjdC5oZWlnaHQgLyAyKSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnN0eWxlLmxlZnQgPSBsZWZ0O1xyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5zdHlsZS50b3AgPSB0b3A7XHJcblxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC52YWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyAvLyB0aGlzIGNsaWNrIHNob3VsZG50IHBhc3MgdGhyb3VnaCBvdGhlcndpc2UgdGhlIGlucHV0IHdpbGwgYmUgaGlkZGVuIGJ5IHRoZSB3aW5kb3djbGlja2xpc3RlbmVyXHJcblxyXG4gICAgICAgIC8vaGlkZSB0aGUgam9pbiBjaGFubmVsIGRpdiBpZiB0aGVyZXMgYSBjbGljayBhbnl3aGVyZSBvbiBzY3JlZW4gZXhjZXB0IGluIHRoZSBqb2luIGNoYW5uZWwgZGl2XHJcbiAgICAgICAgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuaGlkZUpvaW5DaGFubmVsRm9ybSk7XHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0pvaW5DSGFubmVsRm9ybSk7XHJcblxyXG4gICAgICAgICAgICAvLyBhY3RpdmF0ZSB0aGUgam9pbiBjaGFubmVsIGJ1dHRvbiBhZ2FpblxyXG4gICAgICAgICAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0KTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIC8vIGRvbnQgaGlkZSBpZiB0aGUgY2xpY2sgaXMgaW4gdGhlIGpvaW4gY2hhbm5lbCBkaXZcclxuICAgICAgICB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuaGlkZUpvaW5DaGFubmVsRm9ybSk7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtKTtcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0KTtcclxuICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvLyBsaXN0ZW4gZm9yIGVudGVyIGtleVxyXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAvLyBqb2luIGNoYW5uZWxcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVDaGFubmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVDaGFubmVsID0gbmV3IENoYW5uZWwodGhpcywgZXZlbnQudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KHNvY2tldENvbmZpZy5hZGRyZXNzKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiQ291bGQgbm90IGNvbm5lY3RcIikpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLmNoYW5uZWwgaW4gdGhpcy5jaGFubmVscykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbHNbbWVzc2FnZS5jaGFubmVsXS5wcmludE1lc3NhZ2UobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24oY2hhbm5lbCwgdGV4dCkge1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXHJcbiAgICAgICAgZGF0YTogdGV4dCxcclxuICAgICAgICB1c2VybmFtZTogdGhpcy51c2VybmFtZSxcclxuICAgICAgICBjaGFubmVsOiBjaGFubmVsLFxyXG4gICAgICAgIGtleTogc29ja2V0Q29uZmlnLmtleVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKHNvY2tldCkge1xyXG4gICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIsIGVycm9yKTtcclxuICAgIH0pO1xyXG5cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNsb3NlQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpIHtcclxuICAgIGRlbGV0ZSB0aGlzLmNoYW5uZWxzW2NoYW5uZWwubmFtZV07XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gcmVtb3ZlIHRoZSBncmFwaGljc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikucmVtb3ZlQ2hpbGQodGhpcy5hcHBXaW5kb3cuZWxlbWVudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gdGFza2JhclxyXG4gICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2QgLnRhc2tiYXJcIikucmVtb3ZlQ2hpbGQodGhpcy50YXNrYmFyQXBwLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhdDtcclxuIiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gIFwiYWRkcmVzc1wiOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXHJcbiAgXCJrZXlcIjogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXHJcbn1cclxuIiwidmFyIEltYWdlID0gcmVxdWlyZShcIi4vSW1hZ2VcIik7XHJcbnZhciBrZXlib2FyZCA9IHJlcXVpcmUoXCIuL2tleWJvYXJkXCIpO1xyXG5cclxuLyoqXHJcbiAqIHNodWZmbGUgdGhlIGFycmF5IG9mIGltYWdlc1xyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGJvYXJkIC0gcmVmZXJlbmNlIHRvIHRoZSBib2FyZFxyXG4gKi9cclxuZnVuY3Rpb24gc2h1ZmZsZShib2FyZCkge1xyXG4gICAgdmFyIGk7XHJcbiAgICB2YXIgcmFuZG9tSW5kZXg7XHJcbiAgICB2YXIgYmFja0luZGV4O1xyXG5cclxuICAgIC8vIG1vdmUgdGhyb3VnaCB0aGUgZGVjayBvZiBjYXJkcyBmcm9tIHRoZSBiYWNrIHRvIGZyb250XHJcbiAgICBmb3IgKGkgPSBib2FyZC5pbWFnZUFycmF5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpIC09IDEpIHtcclxuICAgICAgICAvL3BpY2sgYSByYW5kb20gY2FyZCBhbmQgc3dhcCBpdCB3aXRoIHRoZSBjYXJkIGZ1cnRoZXN0IGJhY2sgb2YgdGhlIHVuc2h1ZmZsZWQgY2FyZHNcclxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xyXG4gICAgICAgIGJhY2tJbmRleCA9IGJvYXJkLmltYWdlQXJyYXlbaV07XHJcbiAgICAgICAgYm9hcmQuaW1hZ2VBcnJheVtpXSA9IGJvYXJkLmltYWdlQXJyYXlbcmFuZG9tSW5kZXhdO1xyXG4gICAgICAgIGJvYXJkLmltYWdlQXJyYXlbcmFuZG9tSW5kZXhdID0gYmFja0luZGV4O1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQm9hcmRcclxuICogQHBhcmFtIHtvYmplY3R9IHB3ZCAtIHB3ZCByZWZlcmVuY2VcclxuICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbnMgLSBob3cgbWFueSBjb2x1bW5zIHdpZGUgdGhlIG1lbW9yeSBnYW1lIHNob3VsZCBtZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcm93cyAtIGhvdyBtYW55IHJvd3NcclxuICovXHJcbmZ1bmN0aW9uIEJvYXJkKHB3ZCwgY29sdW1ucywgcm93cykge1xyXG4gICAgdGhpcy5wd2QgPSBwd2Q7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS50ZXh0Q29udGVudCA9IFwiXCI7XHJcblxyXG4gICAgLy8gVE9ETzogdmVyaWZ5IHdpZHRoL2hlaWdodFxyXG4gICAgdGhpcy5yb3dzID0gcm93cztcclxuICAgIHRoaXMuY29sdW1ucyA9IGNvbHVtbnM7XHJcbiAgICB0aGlzLmltYWdlU2l6ZSA9IDExMDtcclxuICAgIHRoaXMuYXR0ZW1wdHMgPSAwO1xyXG4gICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5rZXlib2FyZFNlbGVjdCA9IHtcclxuICAgICAgICB4OiAwLFxyXG4gICAgICAgIHk6IDBcclxuICAgIH07XHJcblxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXdyYXBwZXJcIik7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCkuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgMSk7XHJcblxyXG4gICAgLy8gQXR0ZW1wdHMgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnktYXR0ZW1wdHNcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICB0aGlzLmF0dGVtcHRzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC5tZW1vcnktYXR0ZW1wdHNcIik7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWJvYXJkXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5jb2x1bW5zICogdGhpcy5pbWFnZVNpemUgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubWluV2lkdGggPSB0aGlzLmNvbHVtbnMgKiB0aGlzLmltYWdlU2l6ZSArIFwicHhcIjtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRoaXMud3JhcHBlckVsZW1lbnQpO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG5cclxuICAgIC8vY3JlYXRlIGFycmF5IG9mIGltYWdlc1xyXG4gICAgdGhpcy5pbWFnZUFycmF5ID0gW107XHJcbiAgICB2YXIgZG9jZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb2x1bW5zICogdGhpcy5yb3dzOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgbmV3SW1hZ2UgPSBuZXcgSW1hZ2UoTWF0aC5mbG9vcihpIC8gMikgKyAxLCBpLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmltYWdlQXJyYXkucHVzaChuZXdJbWFnZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNodWZmbGUodGhpcyk7XHJcblxyXG4gICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICBkb2NmcmFnLmFwcGVuZENoaWxkKGltYWdlLmVsZW1lbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY2ZyYWcpO1xyXG5cclxuICAgIC8vaGFuZGxlIGNsaWNrc1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIC8vcmVtb3ZlIGtleWJvYXJkIHNlbGVjdCBvdXRsaW5lXHJcbiAgICAgICAga2V5Ym9hcmQucmVtb3ZlT3V0bGluZSh0aGlzKTtcclxuICAgICAgICB2YXIgY2xpY2tlZElkID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtaWRcIik7XHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICAgICAgaWYgKGNsaWNrZWRJZCA9PSBpbWFnZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UuY2xpY2sodGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy9oYW5kbGUga2V5Ym9hcmRcclxuICAgIGtleWJvYXJkLmhhbmRsZUlucHV0KHRoaXMpO1xyXG5cclxuICAgIHRoaXMuc2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc3RhcnRHYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5hdHRlbXB0cyA9IDA7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL2ZsaXAgaW1hZ2VzXHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcclxuICAgICAgICAgICAgaW1hZ2UuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCgnaW1hZ2UvYXBwcy9tZW1vcnkvMC5wbmcnKVwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb2FyZDtcclxuIiwidmFyIGtleWJvYXJkID0gcmVxdWlyZShcIi4va2V5Ym9hcmRcIik7XHJcblxyXG4vKipcclxuICogaW1hZ2UgY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IGltYWdlTnVtYmVyXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZFxyXG4gKiBAcGFyYW0ge09iamVjdH0gYm9hcmRcclxuICovXHJcbmZ1bmN0aW9uIEltYWdlKGltYWdlTnVtYmVyLCBpZCwgYm9hcmQpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1pbWFnZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWltYWdlbnVtYmVyXCIsIGltYWdlTnVtYmVyKTtcclxuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIsIGlkKTtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuaW1hZ2VOdW1iZXIgPSBpbWFnZU51bWJlcjtcclxuICAgIHRoaXMuYm9hcmQgPSBib2FyZDtcclxuICAgIHRoaXMuY2xpY2thYmxlID0gdHJ1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGhhbmRsZSBjbGlja3NcclxuICovXHJcbkltYWdlLnByb3RvdHlwZS5jbGljayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmICh0aGlzLmNsaWNrYWJsZSkge1xyXG4gICAgICAgIHRoaXMuY2xpY2thYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93KCk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5ib2FyZC5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnNlbGVjdGVkID0gdGhpcztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIF9zZWxlY3RlZCA9IHRoaXMuYm9hcmQuc2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuYXR0ZW1wdHMgKz0gMTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuYXR0ZW1wdHNEaXYudGV4dENvbnRlbnQgPSBcIkF0dGVtcHRzOiBcIiArIHRoaXMuYm9hcmQuYXR0ZW1wdHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLnNlbGVjdGVkLmltYWdlTnVtYmVyID09PSB0aGlzLmltYWdlTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBtYXRjaFxyXG4gICAgICAgICAgICAgICAga2V5Ym9hcmQucmVtb3ZlT3V0bGluZSh0aGlzLmJvYXJkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWdyZWVuXCIpO1xyXG4gICAgICAgICAgICAgICAgX3NlbGVjdGVkLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1ncmVlblwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbm90IGEgbWF0Y2hcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLmNsaWNrYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGlja2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBmbGlwIGJhY2sgdGhlIGltYWdlXHJcbiAqL1xyXG5JbWFnZS5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKCdpbWFnZS9hcHBzL21lbW9yeS8wLnBuZycpXCI7XHJcbn07XHJcblxyXG4vKiogXHJcbiAqIHJldmVhbCBpbWFnZVxyXG4gKi9cclxuSW1hZ2UucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCgnaW1hZ2UvYXBwcy9tZW1vcnkvXCIgKyB0aGlzLmltYWdlTnVtYmVyICsgXCIucG5nJylcIjtcclxufTtcclxuXHJcbi8qKiBcclxuICogcmVtb3ZlIGltYWdlXHJcbiAqL1xyXG5JbWFnZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1mYWRlLW91dFwiKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2U7IiwidmFyIFB3ZEFwcCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9Qd2RBcHBcIik7XHJcbnZhciBCb2FyZCA9IHJlcXVpcmUoXCIuL0JvYXJkLmpzXCIpO1xyXG52YXIgQXBwTWVudSA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9BcHBNZW51XCIpO1xyXG5cclxuLyoqXHJcbiAqIE1lbW9yeSBhcHAgY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIGFwcCBjb25maWcgb2JqZWN0XHJcbiAqL1xyXG5mdW5jdGlvbiBNZW1vcnkoY29uZmlnKSB7XHJcbiAgICBQd2RBcHAuY2FsbCh0aGlzLCBjb25maWcpO1xyXG5cclxuICAgIC8vIGFkZCBhIGRyb3Bkb3duIG1lbnUgdG8gdGhlIHdpbmRvd1xyXG4gICAgdGhpcy5tZW51ID0gbmV3IEFwcE1lbnUodGhpcy5hcHBXaW5kb3cubWVudUVsZW1lbnQsIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwiRmlsZVwiLFxyXG4gICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiTmV3IGdhbWVcIixcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMubmV3R2FtZS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiUXVpdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hcHBXaW5kb3cuY2xvc2UuYmluZCh0aGlzLmFwcFdpbmRvdylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQodGhpcywgNCwzKTtcclxuICAgIHRoaXMuYm9hcmQuc3RhcnRHYW1lKCk7XHJcbn1cclxuXHJcbk1lbW9yeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFB3ZEFwcC5wcm90b3R5cGUpO1xyXG5NZW1vcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtb3J5O1xyXG5cclxuTWVtb3J5LnByb3RvdHlwZS5uZXdHYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY29udGVudEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIik7XHJcbiAgICBjb250ZW50RWxlbWVudC50ZXh0Q29udGVudCA9IFwiXCI7XHJcblxyXG4gICAgLy8gaW5wdXQgcm93cy9jb2xzIGh0bWxcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5LXNldHVwXCIpO1xyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIGNvbnRlbnRFbGVtZW50LmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmJ0blwiKTtcclxuICAgIHZhciByb3dzSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWVtb3J5LXJvd3MtaW5wdXRcIik7XHJcbiAgICB2YXIgY29sc0lucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1lbW9yeS1jb2xzLWlucHV0XCIpO1xyXG5cclxuICAgIHJvd3NJbnB1dC52YWx1ZSA9IHRoaXMuYm9hcmQucm93cztcclxuICAgIGNvbHNJbnB1dC52YWx1ZSA9IHRoaXMuYm9hcmQuY29sdW1ucztcclxuXHJcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQodGhpcywgY29sc0lucHV0LnZhbHVlLHJvd3NJbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5zdGFydEdhbWUoKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogd2hlbiB0aGUgYXBwIGlzIGNsb3NpbmdcclxuICovXHJcbk1lbW9yeS5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHJlbW92ZSB0aGUgZ3JhcGhpY3NcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLnJlbW92ZUNoaWxkKHRoaXMuYXBwV2luZG93LmVsZW1lbnQpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnk7XHJcbiIsIi8qKlxyXG4gKiByZW1vdmUgdGhlIG91dGxpbmUgZnJvbSBzZWxlY3RlZCBtZW1vcnkgaW1hZ2VcclxuICogQHBhcmFtICB7b2JqZWN0fSBib2FyZCAtIGJvYXJkIHJlZmVyZW5jZVxyXG4gKi9cclxuZnVuY3Rpb24gcmVtb3ZlT3V0bGluZShib2FyZCkge1xyXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYm9hcmQucHdkLmlkICsgXCIgLm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKSkge1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYm9hcmQucHdkLmlkICsgXCIgLm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwibWVtb3J5LWtleWJvYXJkU2VsZWN0XCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogXHJcbiAqIHNlbGVjdCBhbiBpbWFnZVxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBzZWxlY3QoYm9hcmQpIHtcclxuICAgIHJlbW92ZU91dGxpbmUoYm9hcmQpO1xyXG4gICAgdmFyIHNlbGVjdGVkID0gYm9hcmQua2V5Ym9hcmRTZWxlY3QueCArIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgKiBib2FyZC5jb2x1bW5zO1xyXG4gICAgYm9hcmQuaW1hZ2VBcnJheVtzZWxlY3RlZF0uZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWtleWJvYXJkU2VsZWN0XCIpO1xyXG59XHJcblxyXG4vKiogXHJcbiogQ2FwdHVyZSBrZXlib2FyZCBwcmVzc2VzIGFuZCB1c2UgaXQgdG8gc2VsZWN0IG1lbW9yeSBjYXJkc1xyXG4qIEBwYXJhbSAge29iamVjdH0gYm9hcmRcclxuICovXHJcbmZ1bmN0aW9uIGhhbmRsZUlucHV0KGJvYXJkKSB7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCkuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIga2V5ID0gZS5rZXlDb2RlID8gZS5rZXlDb2RlIDogZS53aGljaDtcclxuICAgICAgICBpZiAoa2V5ID09PSAzNykge1xyXG4gICAgICAgICAgICAvL2xlZnRcclxuICAgICAgICAgICAgaWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC54IC09IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2UgaWYgKGtleSA9PT0gMzgpIHtcclxuICAgICAgICAgICAgLy91cFxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgLT0gMTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZSBpZiAoa2V5ID09PSAzOSkge1xyXG4gICAgICAgICAgICAvL3JpZ2h0XHJcbiAgICAgICAgICAgIGlmIChib2FyZC5rZXlib2FyZFNlbGVjdC54IDwgYm9hcmQuY29sdW1ucyAtIDEpIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmtleWJvYXJkU2VsZWN0LnggKz0gMTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gNDApIHtcclxuICAgICAgICAgICAgLy9kb3duXHJcbiAgICAgICAgICAgIGlmIChib2FyZC5rZXlib2FyZFNlbGVjdC55IDwgYm9hcmQucm93cyAtIDEpIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgKz0gMTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gMzIpIHtcclxuICAgICAgICAgICAgLy9zcGFjZVxyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBib2FyZC5rZXlib2FyZFNlbGVjdC54ICsgYm9hcmQua2V5Ym9hcmRTZWxlY3QueSAqIGJvYXJkLmNvbHVtbnM7XHJcbiAgICAgICAgICAgIGJvYXJkLmltYWdlQXJyYXlbc2VsZWN0ZWRdLmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgdHJ1ZSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLmhhbmRsZUlucHV0ID0gaGFuZGxlSW5wdXQ7XHJcbm1vZHVsZS5leHBvcnRzLnJlbW92ZU91dGxpbmUgPSByZW1vdmVPdXRsaW5lO1xyXG4iXX0=
