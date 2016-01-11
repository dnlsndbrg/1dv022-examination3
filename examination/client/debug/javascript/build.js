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
    console.log(this.score)
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#363636";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Score: " + this.score, 8, 20);
};

Game.prototype.gameOver = function() {
    console.log("a")
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

    //this.game.canvas.style.marginTop = (-newHeight / 2) + "px";
    //this.game.canvas.style.marginLeft = (-newWidth / 2) + "px";

    //var gameCanvas = document.getElementById('gameCanvas');
    //gameCanvas.width = newWidth;
    //gameCanvas.height = newHeight;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwTWVudS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHdkQXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Jlc2l6ZVdpbmRvd1dpZHRoLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5qcyIsImNsaWVudC9zb3VyY2UvanMvU2hvcnRjdXQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwTGlzdC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9icmVha291dC9CYWxsLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2JyZWFrb3V0L0JyaWNrLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2JyZWFrb3V0L0dhbWUuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvYnJlYWtvdXQvUGFkZGxlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2JyZWFrb3V0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9jaGF0L0NoYW5uZWwuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9zb2NrZXRDb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9tZW1vcnkvQm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L0ltYWdlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L2tleWJvYXJkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIEFwcE1lbnUobWVudUVsZW1lbnQsIG1lbnVzKSB7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctbWVudS1jb250YWluZXJcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgbWVudUVsZW1lbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gbWVudUVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5sYXN0RWxlbWVudENoaWxkO1xyXG5cclxuICAgIG1lbnVzLmZvckVhY2goZnVuY3Rpb24obWVudSkge1xyXG4gICAgICAgIC8vIGNyZWF0ZSBtZW51IGhlYWRlclxyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LW1lbnUtaGVhZGVyXCIpO1xyXG4gICAgICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGhlYWRlciBuYW1lXHJcbiAgICAgICAgdGhpcy5lbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBtZW51Lm5hbWU7XHJcblxyXG4gICAgICAgIC8vIGFkZCBtZW51IGl0ZW1zXHJcbiAgICAgICAgdmFyIGRyb3Bkb3duID0gdGhpcy5lbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQubGFzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICBtZW51Lml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG5cclxuICAgICAgICAgICAgLy8gY3JlYXRlIG1lbnUgaXRlbSBodG1sXHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LW1lbnUtaXRlbVwiKTtcclxuICAgICAgICAgICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgICAgICAgICAgZHJvcGRvd24uYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgICAgICAgICAgLy8gc2V0IG5hbWUgYW5kIGFzc2lnbiBldmVudGxpc3RlbmVyXHJcbiAgICAgICAgICAgIHZhciBpdGVtRWxlbWVudCA9IGRyb3Bkb3duLmxhc3RFbGVtZW50Q2hpbGQubGFzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICAgICAgaXRlbUVsZW1lbnQudGV4dENvbnRlbnQgPSBpdGVtLm5hbWU7XHJcbiAgICAgICAgICAgIGl0ZW1FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBpdGVtLmFjdGlvbik7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwcE1lbnU7XHJcbiIsInZhciBSZXNpemVXaW5kb3dXaWR0aCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd1dpZHRoXCIpO1xyXG52YXIgUmVzaXplV2luZG93SGVpZ2h0ID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93SGVpZ2h0XCIpO1xyXG52YXIgUmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dXaWR0aEhlaWdodFwiKTtcclxuXHJcbi8qKlxyXG4gKiBBcHBXaW5kb3cgQ29uc3RydWN0b3IuIFRoaXMgb2JqZWN0IGhhbmRsZXMgdGhlIGdyYXBoaWNzIGFuZCBhbGwgcmVsYXRlZCBldmVudHMgc3VjaCBhcyByZXNpemluZywgbWF4aW1pemluZywgY2xvc2luZyBldGMuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBpdCB0YWtlcyB0aGUgYXBwIGNvbmZpZyBhcyBhbiBhcmd1bWVudFxyXG4gKi9cclxuZnVuY3Rpb24gQXBwV2luZG93KGNvbmZpZykge1xyXG4gICAgdGhpcy5pZCA9IGNvbmZpZy5pZDtcclxuICAgIHRoaXMucHdkID0gY29uZmlnLnB3ZDtcclxuICAgIHRoaXMud2lkdGggPSBjb25maWcud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQ7XHJcbiAgICB0aGlzLnggPSBjb25maWcueDtcclxuICAgIHRoaXMueSA9IGNvbmZpZy55O1xyXG4gICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMubWF4aW1pemVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBXaW5kb3dcIikuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgLy8gZGVmaW5lIHRoaXMuZWxlbWVudFxyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuXHJcbiAgICAvLyBzZXQgaWRcclxuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcIndpbmRvdy1cIiArIHRoaXMuaWQpO1xyXG5cclxuICAgIC8vIGRlZmluZSB0aGlzLndyYXBwZXJFbGVtZW50XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcblxyXG4gICAgLy8gZGVmaW5lIG1lbnVFbGVtZW50XHJcbiAgICB0aGlzLm1lbnVFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1tZW51XCIpO1xyXG5cclxuICAgIC8vIHNldCB3aW5kb3cgYmFyIGljb25cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5mYVwiKS5jbGFzc0xpc3QuYWRkKGNvbmZpZy5pY29uKTtcclxuXHJcbiAgICAvLyBzZXQgd2luZG93IGJhciB0aXRsZVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXItdGl0bGVcIikudGV4dENvbnRlbnQgPSBjb25maWcudGl0bGU7XHJcblxyXG4gICAgLy8gc2V0IHBvc2l0aW9uIGFuZCBzaXplXHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGNvbmZpZy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IGNvbmZpZy55ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnpJbmRleCA9IGNvbmZpZy56SW5kZXg7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBjb25maWcud2lkdGggKyBcInB4XCI7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQgICsgXCJweFwiO1xyXG4gICAgdGhpcy50aXRsZUJhckhlaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLnNjcm9sbEhlaWdodDsgLy8gdXNlZCBmb3IgZHJhZyByZXppc2luZ1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dXaWR0aCA9IG5ldyBSZXNpemVXaW5kb3dXaWR0aCh0aGlzKTtcclxuICAgIHRoaXMucmVzaXplV2luZG93SGVpZ2h0ID0gbmV3IFJlc2l6ZVdpbmRvd0hlaWdodCh0aGlzKTtcclxuICAgIHRoaXMucmVzaXplV2luZG93V2lkdGhIZWlnaHQgPSBuZXcgUmVzaXplV2luZG93V2lkdGhIZWlnaHQodGhpcyk7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIik7XHJcblxyXG4gICAgLy8gcHV0IG9uIHRvcCBpZiBjbGlja2VkXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdmVUb1RvcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuXHJcbiAgICAvLyBkcmFnIHRoZSB3aW5kb3cgZnJvbSB0aGUgd2luZG93IGJhclxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBkb3VibGUgY2xpY2sgd2luZG93IGJhclxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIHRoaXMuZGJsY2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gY2xvc2UgZXZlbnRcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jbG9zZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gbWF4aW1pemUgZXZlbnRcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWF4aW1pemUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gcmVzdG9yZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnJlc3RvcmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gbWluaW1pemVcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5taW5pbWl6ZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWluaW1pemUuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiB1c2VyIGhhcyBoYXN0IHN0YXJ0ZWQgdG8gZHJhZyB0aGUgd2luZG93IGJhclxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gdGhlIGNsaWNrIGhhbmRsZXIgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgLSBldmVudC5wYWdlWDtcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZID0gdGhpcy5lbGVtZW50Lm9mZnNldFRvcCAtIGV2ZW50LnBhZ2VZO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcmFnZ2luZ1wiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiB1c2VyIGlzIGRyYWdnaW5nIGFuIGFwcCB3aW5kb3dcclxuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCAtIHRoZSBtb3VzZW1vdmUgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy54ID0gZXZlbnQucGFnZVggKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WDtcclxuICAgIHRoaXMueSA9IGV2ZW50LnBhZ2VZICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgICB0aGlzLmNoZWNrQm91bmRzKGV2ZW50KTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gIHRoaXMueCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbn07XHJcblxyXG4vKipcclxuICogY2hlY2tzIHRoYXQgYSBkcmFnZ2VkIHdpbmRvdyBpc250IGRyYWdnZWQgb2ZmIHNjcmVlblxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gdGhlIG1vdXNlbW92ZSBldmVudCBvYmplY3RcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuY2hlY2tCb3VuZHMgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYgKGV2ZW50LnBhZ2VYID4gdGhpcy5wd2Qud2lkdGgpIHtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnB3ZC53aWR0aCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChldmVudC5wYWdlWSA+IHRoaXMucHdkLmhlaWdodCkge1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMucHdkLmhlaWdodCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRZO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZXZlbnQucGFnZVkgPCAxKSB7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogdXNlciBoYXMgc3RvcHAgZHJhZ2dpbmdcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dpbmdcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsbGVkIHdoZW5ldmVyIHRoZSBhcHAgd2luZG93IGhhcyBiZWVuIHJlc2l6ZWRcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUucmVzaXplZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgXHJcbn07XHJcblxyXG4vKipcclxuICogcG9zaXRpb24gdGhpcyB3aW5kb3cgaW4gZnJvbnQgb2Ygb3RoZXIgd2luZG93c1xyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5tb3ZlVG9Ub3AgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHdkLmxhc3RaSW5kZXggKz0gMTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLnB3ZC5sYXN0WkluZGV4O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGNsb3NlIHRoaXMgd2luZG93XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyAyMCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMud2lkdGggLSAxMDAgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIDUwICsgXCJweFwiO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnB3ZC5jbG9zZUFwcCh0aGlzKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBtYWtlIHRoZSB3aW5kb3cgZnVsbHNjcmVlblxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5hbmltYXRlKCk7XHJcblxyXG4gICAgLy8gc2F2ZSB0aGUgc2l6ZSBhbmQgcG9zaXRpb24gc28gd2UgY2FuIHJldHVybiB0byBpdCB3aXRoIHRoZSByZXN0b3JlIHdpbmRvdyBmdW5jdGlvblxyXG4gICAgdGhpcy5sYXN0WCA9IHRoaXMueDtcclxuICAgIHRoaXMubGFzdFkgPSB0aGlzLnk7XHJcbiAgICB0aGlzLmxhc3RXaWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmxhc3RIZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICAvLyB0ZWxsIHB3ZCB0aGlzIHdpbmRvdyBpcyBpbiBmdWxsc2NyZWVuIChpbiBjYXNlIG9mIGJyb3dzZXIgcmVzaXppbmcpXHJcbiAgICB0aGlzLnB3ZC5mdWxsc2NyZWVuZWRXaW5kb3cgPSB0aGlzO1xyXG5cclxuICAgIC8vIG1ha2UgdGhlIHdpbmRvdyBmdWxsc2NyZWVuXHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMucHdkLndpZHRoICsgXCJweFwiO1xyXG4gICAgdmFyIGhlaWdodCA9IHRoaXMucHdkLmhlaWdodCAtIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctYmFyXCIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcblxyXG4gICAgLy8gaGlkZS9zaG93IHRoZSBtYXhpbWl6ZSBhbmQgcmVzdG9yZSB3aW5kb3diYXIgYnV0dG9uc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1heGltaXplLXdpbmRvd1wiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLnJlc3RvcmUtd2luZG93XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgLy8gaWYgaXQgaXMgbWF4aW1pemVkIGZyb20gYSBtaW5pbWl6ZWQgc3RhdGVcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubWVudUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGJyaW5nIHRoZSB3aW5kb3cgZnJvbSBmdWxsc2NyZWVuIGJhY2sgdG8gcHJldmlvdXMgc2l6ZVxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICB0aGlzLnggPSB0aGlzLmxhc3RYO1xyXG4gICAgdGhpcy55ID0gdGhpcy5sYXN0WTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMubGFzdFdpZHRoICsgXCJweFwiO1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmxhc3RIZWlnaHQgKyBcInB4XCI7XHJcblxyXG4gICAgLy90ZWxsIHB3ZCB0aGlzIHdpbmRvdyBpcyBubyBsb25nZXIgaW4gZnVsbHNjcmVlbiAoaW4gY2FzZSBvZiBicm93c2VyIHJlc2l6aW5nKVxyXG4gICAgdGhpcy5wd2QuZnVsbHNjcmVlbmVkV2luZG93ID0gbnVsbDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuXHJcbiAgICAvLyBpZiBpdCBpcyByZXN0b3JlZCBmcm9tIGEgbWluaW1pemVkIHN0YXRlXHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLm1lbnVFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBtaW5pbWl6ZSB0aGlzIHdpbmRvd1xyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIXRoaXMubWluaW1pemVkKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICAgICAgdGhpcy5sYXN0WCA9IHRoaXMueDtcclxuICAgICAgICB0aGlzLmxhc3RZID0gdGhpcy55O1xyXG4gICAgICAgIHRoaXMubGFzdFdpZHRoID0gdGhpcy53aWR0aDtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMubWVudUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gXCIyMDBweFwiO1xyXG4gICAgICAgIHRoaXMubWluaW1pemVkID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRlKCk7XHJcbiAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLmxhc3RYO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMubGFzdFk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5sYXN0V2lkdGggKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMubWVudUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGhhbmRsZSBkb3VibGUgY2xpY2tzIG9uIHRoZSB3aW5kb3cgYmFyXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmRibGNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5taW5pbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLm1pbmltaXplKCk7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMubWF4aW1pemVkKSB7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubWF4aW1pemUoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBhZGQgY3NzIGFuaW1hdGlvbnMgZm9yIDEwMG1zIGFuZCB0aGVuIHJlbW92ZSBpdCBzbyBpdCB3b250IGludGVyZmVyIHdpdGggZHJhZ2dpbmcgYmVoYXZpb3VyXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGFkZCBhbmltYXRpb24gY2xhc3NcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2luZG93LWFuaW1hdGVkXCIpO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIndpbmRvdy1hbmltYXRlZFwiKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBwV2luZG93O1xyXG4iLCIvKipcclxuICogTW91c2VcclxuICovXHJcbmZ1bmN0aW9uIE1vdXNlKCl7XHJcbiAgICB0aGlzLmRyYWdnZWRPYmplY3QgPSBudWxsO1xyXG4gICAgdGhpcy5kcmFnT2Zmc2V0WCA9IDA7XHJcbiAgICB0aGlzLmRyYWdPZmZzZXRZID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICogb24gbW91c2V1cCBldmVudCBjaGVjayBpZiBhIHdpbmRvdyBpcyBiZWluZyBkcmFnZ2VkXHJcbiAgICAqIEBwYXJhbSAge1t0eXBlXX0gZSAtIG1vdXNldXAgZXZlbnQgb2JqZWN0XHJcbiAgICAqL1xyXG4gICAgdGhpcy5tb3VzZXVwID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5zdG9wRHJhZyhldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHdoZW5ldmVyIG1vdXNlIGlzIG1vdmVkXHJcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gbW91c2Vtb3ZlIGV2ZW50IG9iamVjdG5dXHJcbiAgICAgKi9cclxuICAgIHRoaXMubW91c2Vtb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2VkT2JqZWN0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZE9iamVjdC5kcmFnKGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW91c2U7XHJcbiIsInZhciBBcHBXaW5kb3cgPSByZXF1aXJlKFwiLi9BcHBXaW5kb3dcIik7XHJcbnZhciBBcHBNZW51ID0gcmVxdWlyZShcIi4vQXBwTWVudVwiKTtcclxuXHJcbmZ1bmN0aW9uIFB3ZEFwcChjb25maWcpIHtcclxuICAgIHRoaXMudGl0bGUgPSBjb25maWcudGl0bGU7XHJcbiAgICB0aGlzLndpZHRoID0gY29uZmlnLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0O1xyXG4gICAgdGhpcy5pZCA9IGNvbmZpZy5pZDtcclxuICAgIGNvbmZpZy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICBjb25maWcuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICBjb25maWcudGl0bGUgPSB0aGlzLnRpdGxlO1xyXG4gICAgdGhpcy5hcHBXaW5kb3cgPSBuZXcgQXBwV2luZG93KGNvbmZpZyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHdkQXBwO1xyXG4iLCIvKipcclxuICogQXBwIHdpbmRvdyByZXNpemVyIENvbnN0cnVjdG9yXHJcbiAqIFRoaXMgaXMgYSBzbWFsbCBlbGVtZW50IG9uIHRoZSBib3R0b20gb2YgYXBwIHdpbmRvd3MuIGl0IGNhbiBiZSBkcmFnZ2VkIHVwIGFuZCBkb3duIHRvIHJlc2l6ZSB0aGUgaGVpZ2h0IG9mIGFwcCB3aW5kb3dzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcHBXaW5kb3cgLSB3aGF0IHdpbmRvdyB0byByZXNpemVcclxuICovXHJcbmZ1bmN0aW9uIFJlc2l6ZVdpbmRvd0hlaWdodChhcHBXaW5kb3cpIHtcclxuICAgIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteVwiKTtcclxuICAgIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vKipcclxuICogcmVzaXplciBkcmFnIGlzIHN0YXJ0ZWRcclxuICovXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy50aXRsZUJhckhlaWdodCAtIGV2ZW50LnBhZ2VZO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHJlc2l6ZXIgaXMgZHJhZ2dlZFxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IGV2ZW50IC0gbW91c2Vtb3ZlIGV2ZW50IG9iamVjdFxyXG4gKi9cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMucmVzaXplVGhpcy5zdHlsZS5oZWlnaHQgPSAoZXZlbnQucGFnZVkgLSB0aGlzLmFwcFdpbmRvdy55IC0gdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRZKSArIFwicHhcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiByZXNpemVyIGRyYWcgc3RvcHBlZFxyXG4qL1xyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5yZXNpemVkKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd0hlaWdodDtcclxuIiwiLyoqXHJcbiAqIEFwcCB3aW5kb3cgd2lkdGggcmVzaXplciBDb25zdHJ1Y3RvclxyXG4gKiBUaGlzIGlzIGEgc21hbGwgZWxlbWVudCBvbiB0aGUgcmlnaHQgc2lkZSBvZiBhcHAgd2luZG93cy4gaXQgY2FuIGJlIGRyYWdnZWQgbGVmdCBhbmQgcmlnaHQgdG8gcmVzaXplIHRoZSB3aWR0aCBvZiBhcHAgd2luZG93c1xyXG4gKiBAcGFyYW0ge29iamVjdH0gYXBwV2luZG93IC0gd2hhdCB3aW5kb3cgdG8gcmVzaXplXHJcbiAqL1xyXG5mdW5jdGlvbiBSZXNpemVXaW5kb3dXaWR0aChhcHBXaW5kb3cpIHtcclxuICAgIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteFwiKTtcclxuICAgIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBkcmFnIGlzIHN0YXJ0ZWRcclxuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCBtb3VzZSBjbGljayBldmVudCBoYW5kbGVyIG9iamVjdFxyXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgLy9kcmFnIGZyb20gZXhhY3RseSB3aGVyZSB0aGUgY2xpY2sgaXNcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0ICsgdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRMZWZ0IC0gZXZlbnQucGFnZVg7XHJcbn07XHJcblxyXG4vKipcclxuICogd2lkdGggcmVzaXplciBpcyBkcmFnZ2VkXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSBtb3VzZW1vdmUgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnJlc2l6ZVRoaXMuc3R5bGUud2lkdGggPSAoZXZlbnQucGFnZVggLSB0aGlzLmFwcFdpbmRvdy54ICsgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYKSArIFwicHhcIjtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cdHRoaXMuYXBwV2luZG93LnJlc2l6ZWQoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGg7XHJcbiIsIi8qKlxyXG4gKiBBcHAgd2luZG93IHJlc2l6ZXIgQ29uc3RydWN0b3JcclxuICogVGhpcyBjb250cm9scyBib3RoIHdpZHRoIGFuZCBoZWlnaHQgcmVzaXppbmcgb2YgYW4gYXBwIHdpbmRvdy4gaXRzIGVsZW1lbnQgaXMgYSBzbWFsbCBzcXVhcmUgYXQgdGhlIGJvdHRvbSBsZWZ0IGNvcm5lciBvZiBpdHMgYXBwIHdpbmRvd1xyXG4gKiBAcGFyYW0ge29iamVjdH0gYXBwV2luZG93IC0gd2hhdCB3aW5kb3cgdG8gcmVzaXplXHJcbiAqL1xyXG5mdW5jdGlvbiBSZXNpemVXaW5kb3dXaWR0aEhlaWdodChhcHBXaW5kb3cpIHtcclxuICAgIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteHlcIik7XHJcbiAgICB0aGlzLnJlc2l6ZVRoaXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHJlc2l6ZXIgZHJhZyBpcyBzdGFydGVkXHJcbiAqL1xyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuXHJcbiAgICAvLyB0aGlzIGVsZW1lbnQgaGFzIG5vIG9mZnNldFRvcCBzbyBpbnN0ZWFkIHdlIHVzZSB3aW5kb3ctcmVzaXplci1oZWlnaHQncyBvZmZzZXRUb3AgdmFsdWVcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cudGl0bGVCYXJIZWlnaHQgLSBldmVudC5wYWdlWTtcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0ICsgdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRMZWZ0IC0gZXZlbnQucGFnZVg7XHJcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgLy8gdGhpcyBjbGljayBzaG91bGRudCBnbyB0aHJvdWdoIHRvIHRoZSBwYXJlbnQgd2hpY2ggaXMgdGhlIGhlaWdodC1yZXNpemVyXHJcbn07XHJcblxyXG4vKiogXHJcbiAqIHdpZHRoJmhlaWdodCByZXNpemVyIGlzIGJlaW5nIGRyYWdnZWQgXHJcbiovXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucmVzaXplV2luZG93SGVpZ2h0LmRyYWcoZSk7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5yZXNpemVXaW5kb3dXaWR0aC5kcmFnKGUpO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5yZXNpemVkKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0O1xyXG4iLCIvKipcclxuICogY29uc3RydWN0b3IgZm9yIGEgZGVza3RvcCBhcHAgc2hvcnRjdXRcclxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIGFwcCBjb25maWdcclxuICogQHBhcmFtIHtvYmplY3R9IHB3ZCAtIGEgcmVmZXJlbmNlIHRvIHRoZSBwd2RcclxuICovXHJcbmZ1bmN0aW9uIFNob3J0Y3V0KGNvbmZpZywgcHdkKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuICAgIHRoaXMudGl0bGUgPSBjb25maWcudGl0bGU7XHJcbiAgICB0aGlzLmVudHJ5ID0gY29uZmlnLmVudHJ5O1xyXG4gICAgdGhpcy5wd2QgPSBwd2Q7XHJcblxyXG4gICAgLy8gY3JlYXRlIGh0bWxcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvcnRjdXRcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuXHJcbiAgICAvLyBhZGQgaWNvbiBhbmQgdGV4dFxyXG4gICAgdGhpcy5lbGVtZW50LmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQoY29uZmlnLmljb24pO1xyXG4gICAgdGhpcy5lbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSB0aGlzLnRpdGxlO1xyXG5cclxuICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHdkLnN0YXJ0QXBwKHRoaXMuY29uZmlnKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hvcnRjdXQ7XHJcbiIsInZhciBNb3VzZSA9IHJlcXVpcmUoXCIuL01vdXNlXCIpO1xyXG52YXIgU2hvcnRjdXQgPSByZXF1aXJlKFwiLi9TaG9ydGN1dFwiKTtcclxudmFyIGFwcExpc3QgPSByZXF1aXJlKFwiLi9hcHBMaXN0XCIpO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBQZXJzb25hbCBXZWIgRGVza3RvcFxyXG4gKi9cclxudmFyIFB3ZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tb3VzZSA9IG5ldyBNb3VzZSgpO1xyXG4gICAgdGhpcy5pbnN0YWxsZWRBcHBzID0gW107XHJcbiAgICB0aGlzLnN0YXJ0ZWRBcHBzID0ge307XHJcbiAgICB0aGlzLmxhc3RaSW5kZXggPSAxO1xyXG4gICAgdGhpcy5sYXN0SUQgPSAxO1xyXG4gICAgdGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIHNob3J0Y3V0cyBmb3IgYWxsIGF2YWlsYWJsZSBhcHBzXHJcbiAgICAgKi9cclxuICAgIHRoaXMuaW5zdGFsbEFwcHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IgKHZhciBhcHAgaW4gYXBwTGlzdCkge1xyXG4gICAgICAgICAgICB0aGlzLmluc3RhbGxlZEFwcHMucHVzaChuZXcgU2hvcnRjdXQoYXBwTGlzdFthcHBdLCB0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gdGhlIHVzZXIgY2xpY2tzIGFuIGFwcCBzaG9ydGN1dCB0aGlzIGZ1bmN0aW9uIHdpbGwgc3RhcnQgdGhlIGFwcFxyXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBjb25maWcgLSBjb250YWlucyBhcHAgc2V0dGluZ3MuIFRoZSBjb25maWd1cmF0aW9uIGNvbWVzIGZyb20gYXBwTGlzdC5qc1xyXG4gICAgICovXHJcbiAgICB0aGlzLnN0YXJ0QXBwID0gZnVuY3Rpb24oY29uZmlnKSB7XHJcblxyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuY2FsY3VsYXRlU3RhcnRQb3NpdGlvbihjb25maWcpO1xyXG5cclxuICAgICAgICB2YXIgbmV3QXBwID0gbmV3IGNvbmZpZy5lbnRyeSh7XHJcbiAgICAgICAgICAgIHRpdGxlOiBjb25maWcudGl0bGUsXHJcbiAgICAgICAgICAgIHdpZHRoOiBjb25maWcud2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodDogY29uZmlnLmhlaWdodCxcclxuICAgICAgICAgICAgaWNvbjogY29uZmlnLmljb24sXHJcbiAgICAgICAgICAgIHB3ZDogdGhpcyxcclxuICAgICAgICAgICAgaWQ6IHRoaXMubGFzdElELFxyXG4gICAgICAgICAgICB4OiBwb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB5OiBwb3NpdGlvbi55LFxyXG4gICAgICAgICAgICB6SW5kZXg6IHRoaXMubGFzdFpJbmRleFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRlZEFwcHNbdGhpcy5sYXN0SURdID0gbmV3QXBwO1xyXG4gICAgICAgIHRoaXMubGFzdFpJbmRleCArPSAxO1xyXG4gICAgICAgIHRoaXMubGFzdElEICs9IDE7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSB3aGVyZSBuZXcgYXBwcyBzaG91bGQgYXBwZWFyIG9uIHRoZSBzY3JlZW5cclxuICAgICAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnIC0gY29udGFpbnMgdGhlICBhcHBzIHN0YW5kYXJkIHdpZHRoIGFuZCBoZWlnaHRcclxuICAgICAqL1xyXG4gICAgdGhpcy5jYWxjdWxhdGVTdGFydFBvc2l0aW9uID0gZnVuY3Rpb24oY29uZmlnKSB7XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBzdGFydGluZyBYIFkgY29vcmRpbmF0ZXMgYXJlIGdvb2RcclxuXHJcbiAgICAgICAgdmFyIHggPSB0aGlzLm5ld1ggLSBjb25maWcud2lkdGggLyAyO1xyXG4gICAgICAgIHZhciB5ID0gdGhpcy5uZXdZIC0gY29uZmlnLmhlaWdodCAvIDI7XHJcblxyXG4gICAgICAgIC8vIHJlc2V0IGlmIFggaXMgb2ZmIHNjcmVlblxyXG4gICAgICAgIGlmICh4ID4gdGhpcy53aWR0aCAtIDQwIHx8IHkgPiB0aGlzLmhlaWdodCAtIDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxYICs9IDIwO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcmlnaW5hbFggPiB0aGlzLndpZHRoIC0gMjApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxYID0gMjA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMubmV3WCA9IHRoaXMub3JpZ2luYWxYO1xyXG4gICAgICAgICAgICB0aGlzLm5ld1kgPSB0aGlzLm9yaWdpbmFsWTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlc2V0IGlmIFkgaXMgb2ZmIHNjcmVlblxyXG5cclxuICAgICAgICB0aGlzLm5ld1ggKz0gMjA7XHJcbiAgICAgICAgdGhpcy5uZXdZICs9IDIwO1xyXG5cclxuICAgICAgICAvLyBjaGVjayBpZiB0aGUgbmV3IGFwcCBpcyBiaWdnZXIgdGhhbiB0aGUgcHdkIHdpbmRvd1xyXG4gICAgICAgIGlmICh4IDwgMCkge1xyXG4gICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh5IDwgMCkge1xyXG4gICAgICAgICAgICB5ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7eDogeCwgeTogeX07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xvc2UgYW4gYXBwXHJcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGFwcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmNsb3NlQXBwID0gZnVuY3Rpb24oYXBwKSB7XHJcbiAgICAgICAgdGhpcy5zdGFydGVkQXBwc1thcHAuaWRdLmNsb3NlKCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhcnRlZEFwcHNbYXBwLmlkXTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCcm93c2VyIHJlc2l6ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMubmV3WCA9IHRoaXMud2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMubmV3WSA9IHRoaXMuaGVpZ2h0IC8gMi41O1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxYID0gdGhpcy5uZXdYO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxZID0gdGhpcy5uZXdZO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cpIHtcclxuICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuZWRXaW5kb3cubWF4aW1pemUoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxudmFyIHB3ZCA9IG5ldyBQd2QoKTtcclxucHdkLmluc3RhbGxBcHBzKCk7IC8vIGNyZWF0ZSBzaG9ydGN1dHMgZm9yIGFsbCBhdmFpbGFibGUgYXBwc1xyXG5wd2QucmVzaXplKCk7IC8vIHJ1biByZXNpemUgb25jZSB0byBnZXQgd2lkdGggYW5kIGNhbGN1bGF0ZSBzdGFydCBwb3NpdGlvbiBvZiBhcHBzXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHB3ZC5yZXNpemUuYmluZChwd2QpKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBcIkNoYXRcIjoge1xyXG4gICAgICAgIGVudHJ5OiByZXF1aXJlKFwiLi9hcHBzL2NoYXQvYXBwXCIpLFxyXG4gICAgICAgIHRpdGxlOiBcIkNoYXRcIixcclxuICAgICAgICB3aWR0aDogNTAwLFxyXG4gICAgICAgIGhlaWdodDogNDAwLFxyXG4gICAgICAgIGljb246IFwiZmEtY29tbWVudGluZ1wiXHJcbiAgICB9LFxyXG4gICAgXCJNZW1vcnlcIjoge1xyXG4gICAgICAgIGVudHJ5OiByZXF1aXJlKFwiLi9hcHBzL21lbW9yeS9hcHBcIiksXHJcbiAgICAgICAgdGl0bGU6IFwiTWVtb3J5XCIsXHJcbiAgICAgICAgd2lkdGg6IDU1MCxcclxuICAgICAgICBoZWlnaHQ6IDQ0MCxcclxuICAgICAgICBpY29uOiBcImZhLWNsb25lXCJcclxuICAgIH0sXHJcbiAgICBSdW5uZXI6IHtcclxuICAgICAgICBlbnRyeTogcmVxdWlyZShcIi4vYXBwcy9icmVha291dC9hcHBcIiksXHJcbiAgICAgICAgdGl0bGU6IFwiQnJlYWtvdXRcIixcclxuICAgICAgICB3aWR0aDogNDgwLFxyXG4gICAgICAgIGhlaWdodDogMzI0LFxyXG4gICAgICAgIGljb246IFwiZmEtcm9ja2V0XCJcclxuICAgIH1cclxufTtcclxuXHJcbiIsImZ1bmN0aW9uIEJhbGwoZ2FtZSkge1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuICAgIHRoaXMueCA9IHRoaXMuZ2FtZS5jYW52YXMud2lkdGggLyAyO1xyXG4gICAgdGhpcy55ID0gdGhpcy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzMDtcclxuICAgIHRoaXMuZHggPSAyMDA7XHJcbiAgICB0aGlzLmR5ID0gLTIwMDtcclxuICAgIHRoaXMucmFkaXVzID0gMTA7XHJcbn1cclxuXHJcbkJhbGwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcblxyXG4gICAgLy8gY29sbGlzaW9uIGRldGVjdGlvbiB3aXRoIG91dGVyIHdhbGxzXHJcbiAgICB2YXIgZHkgPSAodGhpcy5keSAqIGR0KSAvIDEwMDA7XHJcbiAgICB2YXIgZHggPSAodGhpcy5keCAqIGR0KSAvIDEwMDA7XHJcblxyXG4gICAgLy8gYm91bmNlIGFnYWluc3Qgc2lkZSB3YWxsc1xyXG4gICAgaWYgKHRoaXMueCArIGR4ID4gdGhpcy5nYW1lLmNhbnZhcy53aWR0aCAtIHRoaXMucmFkaXVzIHx8IHRoaXMueCArIGR4IDwgdGhpcy5yYWRpdXMpIHtcclxuICAgICAgICB0aGlzLmR4ID0gLXRoaXMuZHg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYm91bmNlIGFnYWluc3QgdGhlIHJvb2ZcclxuICAgIGlmICh0aGlzLnkgKyBkeSA8IHRoaXMucmFkaXVzKSB7XHJcbiAgICAgICAgdGhpcy5keSA9IC10aGlzLmR5O1xyXG5cclxuICAgIC8vIGJhbGwgaGFzIGhpdCB0aGUgYm90dG9tXHJcbiAgICB9IGVsc2UgaWYgKHRoaXMueSArIGR5ID4gdGhpcy5nYW1lLmNhbnZhcy5oZWlnaHQgLSB0aGlzLnJhZGl1cykge1xyXG5cclxuICAgICAgICAvLyBjaGVjayBpZiBpdCBoaXRzIHRoZSBwYWRkbGVcclxuICAgICAgICBpZiAodGhpcy54ID4gdGhpcy5nYW1lLnBhZGRsZS54ICYmIHRoaXMueCA8IHRoaXMuZ2FtZS5wYWRkbGUueCArIHRoaXMuZ2FtZS5wYWRkbGUud2lkdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5keSA9IC10aGlzLmR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZ2FtZSBvdmVyXHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5nYW1lT3ZlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjb2xsaXNpb24gZGV0ZWN0aW9uIHdpdGggYnJpY2tzXHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuZ2FtZS5icmlja1Jvd0NvdW50OyB5ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuZ2FtZS5icmlja0NvbHVtbkNvdW50OyB4ICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIGJyaWNrID0gdGhpcy5nYW1lLmJyaWNrc1t5XVt4XTtcclxuICAgICAgICAgICAgaWYoYnJpY2suYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy54ID4gYnJpY2sueCAmJiB0aGlzLnggPCBicmljay54ICsgdGhpcy5nYW1lLmJyaWNrV2lkdGggJiYgdGhpcy55ID4gYnJpY2sueSAmJiB0aGlzLnkgPCBicmljay55ICsgdGhpcy5nYW1lLmJyaWNrSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5keSA9IC10aGlzLmR5O1xyXG4gICAgICAgICAgICAgICAgICAgIGJyaWNrLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5zY29yZSArPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5nYW1lLnNjb3JlID09PSB0aGlzLmdhbWUuYnJpY2tSb3dDb3VudCAqIHRoaXMuZ2FtZS5icmlja0NvbHVtbkNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5nYW1lV29uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVwZGF0ZSBwb3NpdGlvblxyXG4gICAgdGhpcy54ICs9ICh0aGlzLmR4ICogZHQpIC8gMTAwMDtcclxuICAgIHRoaXMueSArPSAodGhpcy5keSAqIGR0KSAvIDEwMDA7XHJcbn07XHJcblxyXG5CYWxsLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiI2QyNmIzMFwiO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFsbDtcclxuIiwiZnVuY3Rpb24gQnJpY2soZ2FtZSwgeCwgeSwgY29sb3IpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMuY29sb3IgPSBcInJnYihcIiArIGNvbG9yICsgXCIsXCIgKyBjb2xvciArIFwiLFwiICsgY29sb3IgKyBcIilcIjtcclxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxufVxyXG5cclxuQnJpY2sucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5yZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLmdhbWUuYnJpY2tXaWR0aCwgdGhpcy5nYW1lLmJyaWNrSGVpZ2h0KTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnJpY2s7XHJcbiIsInZhciBCYWxsID0gcmVxdWlyZShcIi4vQmFsbFwiKTtcclxudmFyIFBhZGRsZSA9IHJlcXVpcmUoXCIuL1BhZGRsZVwiKTtcclxudmFyIEJyaWNrID0gcmVxdWlyZShcIi4vQnJpY2tcIik7XHJcblxyXG5mdW5jdGlvbiBHYW1lKHB3ZCkge1xyXG4gICAgdGhpcy5wd2QgPSBwd2Q7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikubGFzdEVsZW1lbnRDaGlsZDtcclxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgIHRoaXMuYnJpY2tSb3dDb3VudCA9IDM7XHJcbiAgICB0aGlzLmJyaWNrQ29sdW1uQ291bnQgPSA1O1xyXG4gICAgdGhpcy5icmlja1dpZHRoID0gNzU7XHJcbiAgICB0aGlzLmJyaWNrSGVpZ2h0ID0gMjA7XHJcbiAgICB0aGlzLmJyaWNrUGFkZGluZyA9IDEwO1xyXG4gICAgdGhpcy5icmlja09mZnNldFRvcCA9IDMwO1xyXG4gICAgdGhpcy5icmlja09mZnNldExlZnQgPSAzMDtcclxuXHJcbiAgICB0aGlzLnB3ZC5hcHBXaW5kb3cuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleURvd25IYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHRoaXMucHdkLmFwcFdpbmRvdy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCB0aGlzLmtleVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbn1cclxuXHJcbkdhbWUucHJvdG90eXBlLm5ld0dhbWUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB0aGlzLnB3ZC5hcHBXaW5kb3cuZWxlbWVudC5mb2N1cygpO1xyXG5cclxuICAgIHRoaXMuYmFsbCA9IG5ldyBCYWxsKHRoaXMpO1xyXG4gICAgdGhpcy5wYWRkbGUgPSBuZXcgUGFkZGxlKHRoaXMpO1xyXG4gICAgdGhpcy5sYXN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgIC8vIGdlbmVyYXRlIGJyaWNrc1xyXG4gICAgdGhpcy5icmlja3MgPSBbXTtcclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5icmlja1Jvd0NvdW50OyB5ICs9IDEpIHtcclxuICAgICAgICB0aGlzLmJyaWNrc1t5XSA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5icmlja0NvbHVtbkNvdW50OyB4ICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIGJyaWNrWCA9ICh4ICogKHRoaXMuYnJpY2tXaWR0aCArIHRoaXMuYnJpY2tQYWRkaW5nKSkgKyB0aGlzLmJyaWNrT2Zmc2V0TGVmdDtcclxuICAgICAgICAgICAgdmFyIGJyaWNrWSA9ICh5ICogKHRoaXMuYnJpY2tIZWlnaHQgKyB0aGlzLmJyaWNrUGFkZGluZykpICsgdGhpcy5icmlja09mZnNldFRvcDtcclxuICAgICAgICAgICAgdmFyIGNvbG9yID0gMTIwICsgeSAqIDMwO1xyXG4gICAgICAgICAgICB0aGlzLmJyaWNrc1t5XVt4XSA9IG5ldyBCcmljayh0aGlzLCBicmlja1gsIGJyaWNrWSwgY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNjb3JlID0gMDtcclxuXHJcbiAgICB0aGlzLnJpZ2h0UHJlc3NlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5sZWZ0UHJlc3NlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMubG9vcCgpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZHJhd1Njb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLnNjb3JlKVxyXG4gICAgdGhpcy5jdHguZm9udCA9IFwiMTZweCBBcmlhbFwiO1xyXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCIjMzYzNjM2XCI7XHJcbiAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcclxuICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiU2NvcmU6IFwiICsgdGhpcy5zY29yZSwgOCwgMjApO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiYVwiKVxyXG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmN0eC5mb250ID0gXCI0NnB4IEFyaWFsXCI7XHJcbiAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCIjZDI2YjMwXCI7XHJcbiAgICB0aGlzLmN0eC5maWxsVGV4dChcIkdhbWUgT3ZlciFcIiwgdGhpcy5jYW52YXMud2lkdGggLyAyLCB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdhbWVXb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5jdHguZm9udCA9IFwiNDZweCBBcmlhbFwiO1xyXG4gICAgIHRoaXMuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiM3ZWIzNjRcIjtcclxuICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiV2luIVwiLCB0aGlzLmNhbnZhcy53aWR0aCAvIDIsIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUua2V5RG93bkhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XHJcbiAgICBpZiAoZS5rZXlDb2RlID09IDM5KSB7XHJcbiAgICAgICAgdGhpcy5yaWdodFByZXNzZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZS5rZXlDb2RlID09IDM3KSB7XHJcbiAgICAgICAgdGhpcy5sZWZ0UHJlc3NlZCA9IHRydWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5rZXlVcEhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XHJcbiAgICBpZiAoZS5rZXlDb2RlID09IDM5KSB7XHJcbiAgICAgICAgdGhpcy5yaWdodFByZXNzZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAzNykge1xyXG4gICAgICAgIHRoaXMubGVmdFByZXNzZWQgPSBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBjbGVhciBzY3JlZW5cclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aW1lXHJcbiAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgdmFyIGR0ID0gKGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZSk7XHJcbiAgICAgICAgdGhpcy5sYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICAgICAgdGhpcy5kcmF3KCk7XHJcblxyXG4gICAgLy8gbG9vcFxyXG4gICAgaWYgKHRoaXMucnVubmluZykge1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3AuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCkge1xyXG4gICAgdGhpcy5iYWxsLnVwZGF0ZShkdCk7XHJcbiAgICB0aGlzLnBhZGRsZS51cGRhdGUoZHQpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gZHJhdyBicmlja3NcclxuICAgIHRoaXMuYnJpY2tzLmZvckVhY2goZnVuY3Rpb24oYnJpY2tSb3cpIHtcclxuICAgICAgICBicmlja1Jvdy5mb3JFYWNoKGZ1bmN0aW9uKGJyaWNrKSB7XHJcbiAgICAgICAgICAgIGlmIChicmljay5hY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIGJyaWNrLmRyYXcodGhpcy5jdHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5iYWxsLmRyYXcodGhpcy5jdHgpO1xyXG4gICAgdGhpcy5wYWRkbGUuZHJhdyh0aGlzLmN0eCk7XHJcblxyXG4gICAgdGhpcy5kcmF3U2NvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwiZnVuY3Rpb24gUGFkZGxlKGdhbWUpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICB0aGlzLmhlaWdodCA9IDEwO1xyXG4gICAgdGhpcy53aWR0aCA9IDc1O1xyXG4gICAgdGhpcy5zcGVlZCA9IDIwMDsgLy8gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgIHRoaXMueCA9ICh0aGlzLmdhbWUuY2FudmFzLndpZHRoIC0gdGhpcy53aWR0aCkgLyAyO1xyXG59XHJcblxyXG5QYWRkbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5yZWN0KHRoaXMueCwgdGhpcy5nYW1lLmNhbnZhcy5oZWlnaHQgLSB0aGlzLmhlaWdodCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiIzI0MzM0MlwiO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxufTtcclxuXHJcblBhZGRsZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuICAgIGlmICh0aGlzLmdhbWUucmlnaHRQcmVzc2VkICYmIHRoaXMueCA8IHRoaXMuZ2FtZS5jYW52YXMud2lkdGggLSB0aGlzLndpZHRoKSB7XHJcbiAgICAgICAgdGhpcy54ICs9ICh0aGlzLnNwZWVkICogZHQpIC8gMTAwMDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMuZ2FtZS5sZWZ0UHJlc3NlZCAmJiB0aGlzLnggPiAwKSB7XHJcbiAgICAgICAgdGhpcy54IC09ICh0aGlzLnNwZWVkICogZHQpIC8gMTAwMDtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFkZGxlO1xyXG4iLCJ2YXIgUHdkQXBwID0gcmVxdWlyZShcIi4uLy4uLy4uL2pzL1B3ZEFwcFwiKTtcclxudmFyIEdhbWUgPSByZXF1aXJlKFwiLi9HYW1lXCIpO1xyXG52YXIgQXBwTWVudSA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9BcHBNZW51XCIpO1xyXG5cclxuLy8gQ3JlYXRlZCBmcm9tIHRoaXMgdHV0b3JpYWwgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HYW1lcy9Xb3JrZmxvd3MvMkRfQnJlYWtvdXRfZ2FtZV9wdXJlX0phdmFTY3JpcHRcclxuXHJcbi8qKlxyXG4gKiBCcmVha291dCBhcHAgY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIGFwcCBjb25maWcgb2JqZWN0XHJcbiAqL1xyXG5mdW5jdGlvbiBCcmVha291dChjb25maWcpIHtcclxuICAgIFB3ZEFwcC5jYWxsKHRoaXMsIGNvbmZpZyk7XHJcblxyXG4gICAgLy8gY3JlYXRlIEhUTUxcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYnJlYWtvdXRcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSh0aGlzKTtcclxuXHJcbiAgICAvLyBhZGQgYSBkcm9wZG93biBtZW51IHRvIHRoZSB3aW5kb3dcclxuICAgIHRoaXMubWVudSA9IG5ldyBBcHBNZW51KHRoaXMuYXBwV2luZG93Lm1lbnVFbGVtZW50LCBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcIkZpbGVcIixcclxuICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk5ldyBnYW1lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmdhbWUubmV3R2FtZS5iaW5kKHRoaXMuZ2FtZSlcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJRdWl0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFwcFdpbmRvdy5jbG9zZS5iaW5kKHRoaXMuYXBwV2luZG93KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5hcHBXaW5kb3cucmVzaXplZCA9IHRoaXMucmVzaXplZC5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuZ2FtZS5uZXdHYW1lKCk7XHJcbn1cclxuXHJcbkJyZWFrb3V0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHdkQXBwLnByb3RvdHlwZSk7XHJcbkJyZWFrb3V0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJyZWFrb3V0O1xyXG5cclxuLyoqXHJcbiAqIFdlIG92ZXJ3cml0ZSBhcHB3aW5kb3cgcmVzaXplIHRvIG1hdGNoIHRoZSBjYW52YXMgd2lkdGggd2l0aCB0aGUgd2luZG93IHdpZHRoXHJcbiAqIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2Nhc2VzdHVkaWVzL2dvcGhlcndvb3JkLXN0dWRpb3MtcmVzaXppbmctaHRtbDUtZ2FtZXMvXHJcbiAqL1xyXG5CcmVha291dC5wcm90b3R5cGUucmVzaXplZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dpbmdcIik7XHJcblxyXG4gICAgdmFyIHdpZHRoVG9IZWlnaHQgPSA0ODAgLyAzMjA7XHJcbiAgICB2YXIgbmV3V2lkdGggPSB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldFdpZHRoO1xyXG4gICAgdmFyIG5ld0hlaWdodCA9IHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0aGVpZ2h0O1xyXG4gICAgdmFyIG5ld1dpZHRoVG9IZWlnaHQgPSBuZXdXaWR0aCAvIG5ld0hlaWdodDtcclxuXHJcbiAgICBpZiAobmV3V2lkdGhUb0hlaWdodCA+IHdpZHRoVG9IZWlnaHQpIHtcclxuICAgICAgICBuZXdXaWR0aCA9IG5ld0hlaWdodCAqIHdpZHRoVG9IZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5nYW1lLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQgKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy5nYW1lLmNhbnZhcy5zdHlsZS53aWR0aCA9IG5ld1dpZHRoICsgXCJweFwiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBuZXdIZWlnaHQgPSBuZXdXaWR0aCAvIHdpZHRoVG9IZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5nYW1lLmNhbnZhcy5zdHlsZS53aWR0aCA9IG5ld1dpZHRoICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMuZ2FtZS5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gbmV3SGVpZ2h0ICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vdGhpcy5nYW1lLmNhbnZhcy5zdHlsZS5tYXJnaW5Ub3AgPSAoLW5ld0hlaWdodCAvIDIpICsgXCJweFwiO1xyXG4gICAgLy90aGlzLmdhbWUuY2FudmFzLnN0eWxlLm1hcmdpbkxlZnQgPSAoLW5ld1dpZHRoIC8gMikgKyBcInB4XCI7XHJcblxyXG4gICAgLy92YXIgZ2FtZUNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lQ2FudmFzJyk7XHJcbiAgICAvL2dhbWVDYW52YXMud2lkdGggPSBuZXdXaWR0aDtcclxuICAgIC8vZ2FtZUNhbnZhcy5oZWlnaHQgPSBuZXdIZWlnaHQ7XHJcbn07XHJcblxyXG4vKipcclxuICogd2hlbiB0aGUgYXBwIGlzIGNsb3NpbmdcclxuICovXHJcbkJyZWFrb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5nYW1lLnJ1bm5pbmcgPSBmYWxzZTtcclxuICAgIC8vIHJlbW92ZSB0aGUgZ3JhcGhpY3NcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLnJlbW92ZUNoaWxkKHRoaXMuYXBwV2luZG93LmVsZW1lbnQpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCcmVha291dDtcclxuIiwidmFyIENoYW5uZWwgPSBmdW5jdGlvbihjaGF0LCBuYW1lKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5jaGF0ID0gY2hhdDtcclxuICAgIHRoaXMuY2hhdC5jaGFubmVsc1tuYW1lXSA9IHRoaXM7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0LWNoYW5uZWxcIik7XHJcbiAgICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xyXG5cclxuICAgIHRoaXMuY2hhdERpdi5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvLyBsaXN0ZW4gZm9yIGVudGVyIGtleVxyXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAvL3NlbmQgYSBtZXNzYWdlXHJcbiAgICAgICAgICAgIHRoaXMuY2hhdC5zZW5kTWVzc2FnZSh0aGlzLm5hbWUsIGV2ZW50LnRhcmdldC52YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBlbXB0eSB0ZXh0YXJlYVxyXG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5jaGF0LmNoYXRDaGFubmVsRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmNoYXREaXYpO1xyXG5cclxuICAgIC8vY2hhbm5lbCBsaXN0IGVudHJ5XHJcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdC1jaGFubmVsLWxpc3QtZW50cnlcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMuY2hhdC5qb2luQ2hhbm5lbEJ1dHRvbik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQgPSB0aGlzLmNoYXQuY2hhbm5lbExpc3RFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQucHJldmlvdXNFbGVtZW50U2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgaWYgKG5hbWUgPT09IFwiXCIpIHtcclxuICAgICAgICBuYW1lID0gXCJEZWZhdWx0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBuYW1lO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNoYXQuYWN0aXZlQ2hhbm5lbC5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwgPSB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBjbG9zZSBjaGFubmVsXHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VDaGFubmVsKCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUucHJpbnRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVwiKVswXTtcclxuICAgIHZhciBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcclxuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbChcIi5jaGF0LXRleHRcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7XHJcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1hdXRob3JcIilbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xyXG4gICAgdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2hhdC1tZXNzYWdlc1wiKVswXS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcclxuXHJcbiAgICBpZiAodGhpcy5jaGF0LmFjdGl2ZUNoYW5uZWwgIT09IHRoaXMpIHtcclxuICAgICAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImNoYXQtY2hhbm5lbC1uZXdtZXNzYWdlXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhbm5lbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jaGF0RGl2LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtYWN0aXZlLWNoYW5uZWxcIik7XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNoYXREaXYuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY2hhdC1hY3RpdmUtY2hhbm5lbFwiKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jaGFubmVsLW5ld21lc3NhZ2VcIik7XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5jbG9zZUNoYW5uZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcmVtb3ZlIGNoYW5uZWwgbGlzdCBlbnRyeVxyXG4gICAgdGhpcy5jaGF0LmNoYW5uZWxMaXN0RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmxpc3RFbnRyeUVsZW1lbnQpO1xyXG5cclxuICAgIC8vcmVtb3ZlIGNoYXQgZGl2XHJcbiAgICB0aGlzLmNoYXQuY2hhdENoYW5uZWxFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuY2hhdERpdik7XHJcblxyXG4gICAgdGhpcy5jaGF0LmNsb3NlQ2hhbm5lbCh0aGlzKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhbm5lbDtcclxuIiwidmFyIFB3ZEFwcCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9Qd2RBcHBcIik7XHJcbnZhciBzb2NrZXRDb25maWcgPSByZXF1aXJlKFwiLi9zb2NrZXRDb25maWcuanNvblwiKTtcclxudmFyIENoYW5uZWwgPSByZXF1aXJlKFwiLi9DaGFubmVsXCIpO1xyXG5cclxuLyoqXHJcbiAqIENoYXQgY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIGFwcCBjb25maWd1cmF0aW9uIG9iamVjdFxyXG4gKi9cclxuZnVuY3Rpb24gQ2hhdChjb25maWcpIHtcclxuICAgIFB3ZEFwcC5jYWxsKHRoaXMsIGNvbmZpZyk7IC8vaW5oZXJpdCBmcm9tIHB3ZEFwcCBvYmplY3RcclxuICAgIHRoaXMuY2hhbm5lbHMgPSB7fTtcclxuICAgIHRoaXMuYWN0aXZlQ2hhbm5lbCA9IG51bGw7XHJcbiAgICB0aGlzLnNvY2tldCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5pbnB1dE5hbWUoKSAvLyBnZXQgdXNlcm5hbWVcclxuICAgIC50aGVuKGZ1bmN0aW9uKHVzZXJuYW1lKSB7XHJcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgICAgIHRoaXMuc3RhcnRDaGF0KCk7XHJcbiAgICB9LmJpbmQodGhpcykpXHJcbiAgICAudGhlbih0aGlzLmNvbm5lY3QoKSkgLy8gdGhlbiB3ZSBjb25uZWN0XHJcbiAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0aGlzLCBcIlwiKTsgLy8gdGhlbiB3ZSBjb25uZWN0IHRvIHRoZSBkZWZhdWx0IGNoYW5uZWxcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkNoYXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQd2RBcHAucHJvdG90eXBlKTtcclxuQ2hhdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGF0O1xyXG5cclxuLyoqXHJcbiAqIGVudGVyIHVzZXJuYW1lXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5pbnB1dE5hbWUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShcclxuICAgICAgICBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHNob3cgbmFtZSBpbnB1dCB0ZXh0IGFuZCBidXR0b25cclxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0LXVzZXJuYW1lLWlucHV0XCIpO1xyXG4gICAgICAgICAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcFdpbmRvdy5jb250ZW50LmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1idG4tdXNlcm5hbWVcIik7XHJcbiAgICAgICAgICAgIHZhciB0ZXh0SW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC11c2VybmFtZS1pbnB1dCBpbnB1dFt0eXBlPXRleHRdXCIpO1xyXG5cclxuICAgICAgICAgICAgdGV4dElucHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRleHRJbnB1dC52YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0ZXh0SW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGV4dElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRleHRJbnB1dC52YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGV4dElucHV0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBjcmVhdGUgY2hhdCBjaGFubmVsIGh0bWxcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnN0YXJ0Q2hhdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gY2xlYXIgd2luZG93IG9mIHByZXZpb3VzIGVsZW1lbnQgKHRoZSBpbnB1dCB1c2VybmFtZSBzY3JlZW4pXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIHRoaXMuYXBwV2luZG93LmNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcclxuICAgIHRoaXMuY2hhdENoYW5uZWxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtY2hhbm5lbHNcIik7XHJcbiAgICB0aGlzLmNoYW5uZWxMaXN0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWNoYW5uZWwtbGlzdFwiKTtcclxuXHJcbiAgICAvLyBob29rIHVwIGpvaW4gY2hhbm5lbCBidXR0b25cclxuICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiBpbnB1dFt0eXBlPWJ1dHRvblwiKTtcclxuICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWpvaW4tY2hhbm5lbFwiKTtcclxuXHJcbiAgICB0aGlzLnNob3dKb2luQ2hhbm5lbElucHV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBsaXN0ZW5lclxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG5cclxuICAgICAgICAvLyBzaG93IHRoZSBqb2luIG5ldyBjaGFubmVsIGZvcm0gYW5kIHBvc2l0aW9uIGl0IG5leHQgdG8gdGhlIG1vdXNlIGN1cnNvclxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB2YXIgYnRuYm91bmRpbmdSZWN0ID0gdGhpcy5qb2luQ2hhbm5lbEJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB2YXIgaW5wdXRCb3VuZGluZ1JlY3QgPSB0aGlzLmpvaW5DaGFubmVsSW5wdXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIHZhciBsZWZ0ID0gYnRuYm91bmRpbmdSZWN0LmxlZnQgLSB0aGlzLmFwcFdpbmRvdy54ICsgYnRuYm91bmRpbmdSZWN0LndpZHRoICsgNCArIFwicHhcIjtcclxuICAgICAgICB2YXIgdG9wID0gYnRuYm91bmRpbmdSZWN0LnRvcCAtIHRoaXMuYXBwV2luZG93LnkgLSAoaW5wdXRCb3VuZGluZ1JlY3QuaGVpZ2h0IC8gMikgKyAoYnRuYm91bmRpbmdSZWN0LmhlaWdodCAvIDIpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuc3R5bGUubGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnN0eWxlLnRvcCA9IHRvcDtcclxuXHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnZhbHVlID0gXCJcIjtcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIHRoaXMgY2xpY2sgc2hvdWxkbnQgcGFzcyB0aHJvdWdoIG90aGVyd2lzZSB0aGUgaW5wdXQgd2lsbCBiZSBoaWRkZW4gYnkgdGhlIHdpbmRvd2NsaWNrbGlzdGVuZXJcclxuXHJcbiAgICAgICAgLy9oaWRlIHRoZSBqb2luIGNoYW5uZWwgZGl2IGlmIHRoZXJlcyBhIGNsaWNrIGFueXdoZXJlIG9uIHNjcmVlbiBleGNlcHQgaW4gdGhlIGpvaW4gY2hhbm5lbCBkaXZcclxuICAgICAgICB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKTtcclxuICAgICAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrSm9pbkNIYW5uZWxGb3JtKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBqb2luIGNoYW5uZWwgYnV0dG9uIGFnYWluXHJcbiAgICAgICAgICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gZG9udCBoaWRlIGlmIHRoZSBjbGljayBpcyBpbiB0aGUgam9pbiBjaGFubmVsIGRpdlxyXG4gICAgICAgIHRoaXMuY2xpY2tKb2luQ0hhbm5lbEZvcm0gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oaWRlSm9pbkNoYW5uZWxGb3JtKTtcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tKb2luQ0hhbm5lbEZvcm0pO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuam9pbkNoYW5uZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQpO1xyXG4gICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIC8vIGxpc3RlbiBmb3IgZW50ZXIga2V5XHJcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgIC8vIGpvaW4gY2hhbm5lbFxyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0aGlzLCBldmVudC50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0oKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoc29ja2V0Q29uZmlnLmFkZHJlc3MpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJDb3VsZCBub3QgY29ubmVjdFwiKSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY2hhbm5lbCBpbiB0aGlzLmNoYW5uZWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsc1ttZXNzYWdlLmNoYW5uZWxdLnByaW50TWVzc2FnZShtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbihjaGFubmVsLCB0ZXh0KSB7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcclxuICAgICAgICBkYXRhOiB0ZXh0LFxyXG4gICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXJuYW1lLFxyXG4gICAgICAgIGNoYW5uZWw6IGNoYW5uZWwsXHJcbiAgICAgICAga2V5OiBzb2NrZXRDb25maWcua2V5XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7XHJcbiAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiwgZXJyb3IpO1xyXG4gICAgfSk7XHJcblxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xvc2VDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCkge1xyXG4gICAgZGVsZXRlIHRoaXMuY2hhbm5lbHNbY2hhbm5lbC5uYW1lXTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5yZW1vdmVDaGlsZCh0aGlzLmFwcFdpbmRvdy5lbGVtZW50KTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSB0YXNrYmFyXHJcbiAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZCAudGFza2JhclwiKS5yZW1vdmVDaGlsZCh0aGlzLnRhc2tiYXJBcHAuZWxlbWVudCk7XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xyXG4iLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgXCJhZGRyZXNzXCI6IFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIixcclxuICBcImtleVwiOiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcclxufVxyXG4iLCJ2YXIgSW1hZ2UgPSByZXF1aXJlKFwiLi9JbWFnZVwiKTtcclxudmFyIGtleWJvYXJkID0gcmVxdWlyZShcIi4va2V5Ym9hcmRcIik7XHJcblxyXG4vKipcclxuICogc2h1ZmZsZSB0aGUgYXJyYXkgb2YgaW1hZ2VzXHJcbiAqIEBwYXJhbSAge29iamVjdH0gYm9hcmQgLSByZWZlcmVuY2UgdG8gdGhlIGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBzaHVmZmxlKGJvYXJkKSB7XHJcbiAgICB2YXIgaTtcclxuICAgIHZhciByYW5kb21JbmRleDtcclxuICAgIHZhciBiYWNrSW5kZXg7XHJcblxyXG4gICAgLy8gbW92ZSB0aHJvdWdoIHRoZSBkZWNrIG9mIGNhcmRzIGZyb20gdGhlIGJhY2sgdG8gZnJvbnRcclxuICAgIGZvciAoaSA9IGJvYXJkLmltYWdlQXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xyXG4gICAgICAgIC8vcGljayBhIHJhbmRvbSBjYXJkIGFuZCBzd2FwIGl0IHdpdGggdGhlIGNhcmQgZnVydGhlc3QgYmFjayBvZiB0aGUgdW5zaHVmZmxlZCBjYXJkc1xyXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XHJcbiAgICAgICAgYmFja0luZGV4ID0gYm9hcmQuaW1hZ2VBcnJheVtpXTtcclxuICAgICAgICBib2FyZC5pbWFnZUFycmF5W2ldID0gYm9hcmQuaW1hZ2VBcnJheVtyYW5kb21JbmRleF07XHJcbiAgICAgICAgYm9hcmQuaW1hZ2VBcnJheVtyYW5kb21JbmRleF0gPSBiYWNrSW5kZXg7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCb2FyZFxyXG4gKiBAcGFyYW0ge29iamVjdH0gcHdkIC0gcHdkIHJlZmVyZW5jZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gY29sdW1ucyAtIGhvdyBtYW55IGNvbHVtbnMgd2lkZSB0aGUgbWVtb3J5IGdhbWUgc2hvdWxkIG1lXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByb3dzIC0gaG93IG1hbnkgcm93c1xyXG4gKi9cclxuZnVuY3Rpb24gQm9hcmQocHdkLCBjb2x1bW5zLCByb3dzKSB7XHJcbiAgICB0aGlzLnB3ZCA9IHB3ZDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLnRleHRDb250ZW50ID0gXCJcIjtcclxuXHJcbiAgICAvLyBUT0RPOiB2ZXJpZnkgd2lkdGgvaGVpZ2h0XHJcbiAgICB0aGlzLnJvd3MgPSByb3dzO1xyXG4gICAgdGhpcy5jb2x1bW5zID0gY29sdW1ucztcclxuICAgIHRoaXMuaW1hZ2VTaXplID0gMTEwO1xyXG4gICAgdGhpcy5hdHRlbXB0cyA9IDA7XHJcbiAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmtleWJvYXJkU2VsZWN0ID0ge1xyXG4gICAgICAgIHg6IDAsXHJcbiAgICAgICAgeTogMFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktd3JhcHBlclwiKTtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkKS5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCAxKTtcclxuXHJcbiAgICAvLyBBdHRlbXB0cyBodG1sXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeS1hdHRlbXB0c1wiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuICAgIHRoaXMuYXR0ZW1wdHNEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLm1lbW9yeS1hdHRlbXB0c1wiKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktYm9hcmRcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLmNvbHVtbnMgKiB0aGlzLmltYWdlU2l6ZSArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5taW5XaWR0aCA9IHRoaXMuY29sdW1ucyAqIHRoaXMuaW1hZ2VTaXplICsgXCJweFwiO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGhpcy53cmFwcGVyRWxlbWVudCk7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XHJcblxyXG4gICAgLy9jcmVhdGUgYXJyYXkgb2YgaW1hZ2VzXHJcbiAgICB0aGlzLmltYWdlQXJyYXkgPSBbXTtcclxuICAgIHZhciBkb2NmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbHVtbnMgKiB0aGlzLnJvd3M7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBuZXdJbWFnZSA9IG5ldyBJbWFnZShNYXRoLmZsb29yKGkgLyAyKSArIDEsIGksIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VBcnJheS5wdXNoKG5ld0ltYWdlKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2h1ZmZsZSh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmltYWdlQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xyXG4gICAgICAgIGRvY2ZyYWcuYXBwZW5kQ2hpbGQoaW1hZ2UuZWxlbWVudCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jZnJhZyk7XHJcblxyXG4gICAgLy9oYW5kbGUgY2xpY2tzXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgLy9yZW1vdmUga2V5Ym9hcmQgc2VsZWN0IG91dGxpbmVcclxuICAgICAgICBrZXlib2FyZC5yZW1vdmVPdXRsaW5lKHRoaXMpO1xyXG4gICAgICAgIHZhciBjbGlja2VkSWQgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiKTtcclxuICAgICAgICB0aGlzLmltYWdlQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xyXG4gICAgICAgICAgICBpZiAoY2xpY2tlZElkID09IGltYWdlLmlkKSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZS5jbGljayh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvL2hhbmRsZSBrZXlib2FyZFxyXG4gICAga2V5Ym9hcmQuaGFuZGxlSW5wdXQodGhpcyk7XHJcblxyXG4gICAgdGhpcy5zZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zdGFydEdhbWUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmF0dGVtcHRzID0gMDtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vZmxpcCBpbWFnZXNcclxuICAgICAgICB0aGlzLmltYWdlQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xyXG4gICAgICAgICAgICBpbWFnZS5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKCdpbWFnZS9hcHBzL21lbW9yeS8wLnBuZycpXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJvYXJkO1xyXG4iLCJ2YXIga2V5Ym9hcmQgPSByZXF1aXJlKFwiLi9rZXlib2FyZFwiKTtcclxuXHJcbi8qKlxyXG4gKiBpbWFnZSBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge051bWJlcn0gaW1hZ2VOdW1iZXJcclxuICogQHBhcmFtIHtOdW1iZXJ9IGlkXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBib2FyZFxyXG4gKi9cclxuZnVuY3Rpb24gSW1hZ2UoaW1hZ2VOdW1iZXIsIGlkLCBib2FyZCkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWltYWdlXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaW1hZ2VudW1iZXJcIiwgaW1hZ2VOdW1iZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgaWQpO1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5pbWFnZU51bWJlciA9IGltYWdlTnVtYmVyO1xyXG4gICAgdGhpcy5ib2FyZCA9IGJvYXJkO1xyXG4gICAgdGhpcy5jbGlja2FibGUgPSB0cnVlO1xyXG59XHJcblxyXG4vKipcclxuICogaGFuZGxlIGNsaWNrc1xyXG4gKi9cclxuSW1hZ2UucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuY2xpY2thYmxlKSB7XHJcbiAgICAgICAgdGhpcy5jbGlja2FibGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNob3coKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmJvYXJkLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuc2VsZWN0ZWQgPSB0aGlzO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgX3NlbGVjdGVkID0gdGhpcy5ib2FyZC5zZWxlY3RlZDtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5hdHRlbXB0cyArPSAxO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5hdHRlbXB0c0Rpdi50ZXh0Q29udGVudCA9IFwiQXR0ZW1wdHM6IFwiICsgdGhpcy5ib2FyZC5hdHRlbXB0cztcclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQuc2VsZWN0ZWQuaW1hZ2VOdW1iZXIgPT09IHRoaXMuaW1hZ2VOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIG1hdGNoXHJcbiAgICAgICAgICAgICAgICBrZXlib2FyZC5yZW1vdmVPdXRsaW5lKHRoaXMuYm9hcmQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktZ3JlZW5cIik7XHJcbiAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWdyZWVuXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBfc2VsZWN0ZWQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNDAwKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3QgYSBtYXRjaFxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktcmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgX3NlbGVjdGVkLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1yZWRcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIm1lbW9yeS1yZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIm1lbW9yeS1yZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuY2xpY2thYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsaWNrYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGZsaXAgYmFjayB0aGUgaW1hZ2VcclxuICovXHJcbkltYWdlLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5LzAucG5nJylcIjtcclxufTtcclxuXHJcbi8qKiBcclxuICogcmV2ZWFsIGltYWdlXHJcbiAqL1xyXG5JbWFnZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKCdpbWFnZS9hcHBzL21lbW9yeS9cIiArIHRoaXMuaW1hZ2VOdW1iZXIgKyBcIi5wbmcnKVwiO1xyXG59O1xyXG5cclxuLyoqIFxyXG4gKiByZW1vdmUgaW1hZ2VcclxuICovXHJcbkltYWdlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWZhZGUtb3V0XCIpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZTsiLCJ2YXIgUHdkQXBwID0gcmVxdWlyZShcIi4uLy4uLy4uL2pzL1B3ZEFwcFwiKTtcclxudmFyIEJvYXJkID0gcmVxdWlyZShcIi4vQm9hcmQuanNcIik7XHJcbnZhciBBcHBNZW51ID0gcmVxdWlyZShcIi4uLy4uLy4uL2pzL0FwcE1lbnVcIik7XHJcblxyXG4vKipcclxuICogTWVtb3J5IGFwcCBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gYXBwIGNvbmZpZyBvYmplY3RcclxuICovXHJcbmZ1bmN0aW9uIE1lbW9yeShjb25maWcpIHtcclxuICAgIFB3ZEFwcC5jYWxsKHRoaXMsIGNvbmZpZyk7XHJcblxyXG4gICAgLy8gYWRkIGEgZHJvcGRvd24gbWVudSB0byB0aGUgd2luZG93XHJcbiAgICB0aGlzLm1lbnUgPSBuZXcgQXBwTWVudSh0aGlzLmFwcFdpbmRvdy5tZW51RWxlbWVudCwgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJGaWxlXCIsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJOZXcgZ2FtZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5uZXdHYW1lLmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJRdWl0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFwcFdpbmRvdy5jbG9zZS5iaW5kKHRoaXMuYXBwV2luZG93KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCh0aGlzLCA0LDMpO1xyXG4gICAgdGhpcy5ib2FyZC5zdGFydEdhbWUoKTtcclxufVxyXG5cclxuTWVtb3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHdkQXBwLnByb3RvdHlwZSk7XHJcbk1lbW9yeS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1vcnk7XHJcblxyXG5NZW1vcnkucHJvdG90eXBlLm5ld0dhbWUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb250ZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKTtcclxuICAgIGNvbnRlbnRFbGVtZW50LnRleHRDb250ZW50ID0gXCJcIjtcclxuXHJcbiAgICAvLyBpbnB1dCByb3dzL2NvbHMgaHRtbFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnktc2V0dXBcIik7XHJcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgY29udGVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuYnRuXCIpO1xyXG4gICAgdmFyIHJvd3NJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tZW1vcnktcm93cy1pbnB1dFwiKTtcclxuICAgIHZhciBjb2xzSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWVtb3J5LWNvbHMtaW5wdXRcIik7XHJcblxyXG4gICAgcm93c0lucHV0LnZhbHVlID0gdGhpcy5ib2FyZC5yb3dzO1xyXG4gICAgY29sc0lucHV0LnZhbHVlID0gdGhpcy5ib2FyZC5jb2x1bW5zO1xyXG5cclxuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCh0aGlzLCBjb2xzSW5wdXQudmFsdWUscm93c0lucHV0LnZhbHVlKTtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0YXJ0R2FtZSgpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiB3aGVuIHRoZSBhcHAgaXMgY2xvc2luZ1xyXG4gKi9cclxuTWVtb3J5LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gcmVtb3ZlIHRoZSBncmFwaGljc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikucmVtb3ZlQ2hpbGQodGhpcy5hcHBXaW5kb3cuZWxlbWVudCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeTtcclxuIiwiLyoqXHJcbiAqIHJlbW92ZSB0aGUgb3V0bGluZSBmcm9tIHNlbGVjdGVkIG1lbW9yeSBpbWFnZVxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGJvYXJkIC0gYm9hcmQgcmVmZXJlbmNlXHJcbiAqL1xyXG5mdW5jdGlvbiByZW1vdmVPdXRsaW5lKGJvYXJkKSB7XHJcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBib2FyZC5wd2QuaWQgKyBcIiAubWVtb3J5LWtleWJvYXJkU2VsZWN0XCIpKSB7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBib2FyZC5wd2QuaWQgKyBcIiAubWVtb3J5LWtleWJvYXJkU2VsZWN0XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJtZW1vcnkta2V5Ym9hcmRTZWxlY3RcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBcclxuICogc2VsZWN0IGFuIGltYWdlXHJcbiAqIEBwYXJhbSAge29iamVjdH0gYm9hcmRcclxuICovXHJcbmZ1bmN0aW9uIHNlbGVjdChib2FyZCkge1xyXG4gICAgcmVtb3ZlT3V0bGluZShib2FyZCk7XHJcbiAgICB2YXIgc2VsZWN0ZWQgPSBib2FyZC5rZXlib2FyZFNlbGVjdC54ICsgYm9hcmQua2V5Ym9hcmRTZWxlY3QueSAqIGJvYXJkLmNvbHVtbnM7XHJcbiAgICBib2FyZC5pbWFnZUFycmF5W3NlbGVjdGVkXS5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnkta2V5Ym9hcmRTZWxlY3RcIik7XHJcbn1cclxuXHJcbi8qKiBcclxuKiBDYXB0dXJlIGtleWJvYXJkIHByZXNzZXMgYW5kIHVzZSBpdCB0byBzZWxlY3QgbWVtb3J5IGNhcmRzXHJcbiogQHBhcmFtICB7b2JqZWN0fSBib2FyZFxyXG4gKi9cclxuZnVuY3Rpb24gaGFuZGxlSW5wdXQoYm9hcmQpIHtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgYm9hcmQucHdkLmlkKS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBrZXkgPSBlLmtleUNvZGUgPyBlLmtleUNvZGUgOiBlLndoaWNoO1xyXG4gICAgICAgIGlmIChrZXkgPT09IDM3KSB7XHJcbiAgICAgICAgICAgIC8vbGVmdFxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJvYXJkLmtleWJvYXJkU2VsZWN0LnggLT0gMTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdChib2FyZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZSBpZiAoa2V5ID09PSAzOCkge1xyXG4gICAgICAgICAgICAvL3VwXHJcbiAgICAgICAgICAgIGlmIChib2FyZC5rZXlib2FyZFNlbGVjdC55ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQua2V5Ym9hcmRTZWxlY3QueSAtPSAxO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0KGJvYXJkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNlIGlmIChrZXkgPT09IDM5KSB7XHJcbiAgICAgICAgICAgIC8vcmlnaHRcclxuICAgICAgICAgICAgaWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnggPCBib2FyZC5jb2x1bW5zIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQua2V5Ym9hcmRTZWxlY3QueCArPSAxO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0KGJvYXJkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSA0MCkge1xyXG4gICAgICAgICAgICAvL2Rvd25cclxuICAgICAgICAgICAgaWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgPCBib2FyZC5yb3dzIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQua2V5Ym9hcmRTZWxlY3QueSArPSAxO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0KGJvYXJkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAzMikge1xyXG4gICAgICAgICAgICAvL3NwYWNlXHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IGJvYXJkLmtleWJvYXJkU2VsZWN0LnggKyBib2FyZC5rZXlib2FyZFNlbGVjdC55ICogYm9hcmQuY29sdW1ucztcclxuICAgICAgICAgICAgYm9hcmQuaW1hZ2VBcnJheVtzZWxlY3RlZF0uY2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9LCB0cnVlKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuaGFuZGxlSW5wdXQgPSBoYW5kbGVJbnB1dDtcclxubW9kdWxlLmV4cG9ydHMucmVtb3ZlT3V0bGluZSA9IHJlbW92ZU91dGxpbmU7XHJcbiJdfQ==
