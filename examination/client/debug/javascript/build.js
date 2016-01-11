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

    this.game.newGame();


}

Breakout.prototype = Object.create(PwdApp.prototype);
Breakout.prototype.constructor = Breakout;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwTWVudS5qcyIsImNsaWVudC9zb3VyY2UvanMvQXBwV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9Nb3VzZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHdkQXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dIZWlnaHQuanMiLCJjbGllbnQvc291cmNlL2pzL1Jlc2l6ZVdpbmRvd1dpZHRoLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5qcyIsImNsaWVudC9zb3VyY2UvanMvU2hvcnRjdXQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwTGlzdC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9icmVha291dC9CYWxsLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2JyZWFrb3V0L0JyaWNrLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2JyZWFrb3V0L0dhbWUuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvYnJlYWtvdXQvUGFkZGxlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL2JyZWFrb3V0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9jaGF0L0NoYW5uZWwuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvY2hhdC9zb2NrZXRDb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvYXBwcy9tZW1vcnkvQm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L0ltYWdlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBzL21lbW9yeS9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcHMvbWVtb3J5L2tleWJvYXJkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gQXBwTWVudShtZW51RWxlbWVudCwgbWVudXMpIHtcclxuXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1tZW51LWNvbnRhaW5lclwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBtZW51RWxlbWVudC5hcHBlbmRDaGlsZChjbG9uZSk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBtZW51RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmxhc3RFbGVtZW50Q2hpbGQ7XHJcblxyXG4gICAgbWVudXMuZm9yRWFjaChmdW5jdGlvbihtZW51KSB7XHJcbiAgICAgICAgLy8gY3JlYXRlIG1lbnUgaGVhZGVyXHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctbWVudS1oZWFkZXJcIik7XHJcbiAgICAgICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgICAgICAvLyBhZGQgaGVhZGVyIG5hbWVcclxuICAgICAgICB0aGlzLmVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IG1lbnUubmFtZTtcclxuXHJcbiAgICAgICAgLy8gYWRkIG1lbnUgaXRlbXNcclxuICAgICAgICB2YXIgZHJvcGRvd24gPSB0aGlzLmVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5sYXN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgIG1lbnUuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBjcmVhdGUgbWVudSBpdGVtIGh0bWxcclxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctbWVudS1pdGVtXCIpO1xyXG4gICAgICAgICAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgICAgICAgICBkcm9wZG93bi5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgbmFtZSBhbmQgYXNzaWduIGV2ZW50bGlzdGVuZXJcclxuICAgICAgICAgICAgdmFyIGl0ZW1FbGVtZW50ID0gZHJvcGRvd24ubGFzdEVsZW1lbnRDaGlsZC5sYXN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgICAgICBpdGVtRWxlbWVudC50ZXh0Q29udGVudCA9IGl0ZW0ubmFtZTtcclxuICAgICAgICAgICAgaXRlbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGl0ZW0uYWN0aW9uKTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBwTWVudTtcclxuIiwidmFyIFJlc2l6ZVdpbmRvd1dpZHRoID0gcmVxdWlyZShcIi4vUmVzaXplV2luZG93V2lkdGhcIik7XHJcbnZhciBSZXNpemVXaW5kb3dIZWlnaHQgPSByZXF1aXJlKFwiLi9SZXNpemVXaW5kb3dIZWlnaHRcIik7XHJcbnZhciBSZXNpemVXaW5kb3dXaWR0aEhlaWdodCA9IHJlcXVpcmUoXCIuL1Jlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0XCIpO1xyXG5cclxuLyoqXHJcbiAqIEFwcFdpbmRvdyBDb25zdHJ1Y3Rvci4gVGhpcyBvYmplY3QgaGFuZGxlcyB0aGUgZ3JhcGhpY3MgYW5kIGFsbCByZWxhdGVkIGV2ZW50cyBzdWNoIGFzIHJlc2l6aW5nLCBtYXhpbWl6aW5nLCBjbG9zaW5nIGV0Yy5cclxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIGl0IHRha2VzIHRoZSBhcHAgY29uZmlnIGFzIGFuIGFyZ3VtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBBcHBXaW5kb3coY29uZmlnKSB7XHJcbiAgICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gICAgdGhpcy5wd2QgPSBjb25maWcucHdkO1xyXG4gICAgdGhpcy53aWR0aCA9IGNvbmZpZy53aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gY29uZmlnLmhlaWdodDtcclxuICAgIHRoaXMueCA9IGNvbmZpZy54O1xyXG4gICAgdGhpcy55ID0gY29uZmlnLnk7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5tYXhpbWl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBjcmVhdGUgaHRtbFxyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FwcFdpbmRvd1wiKS5jb250ZW50LCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAvLyBkZWZpbmUgdGhpcy5lbGVtZW50XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5sYXN0RWxlbWVudENoaWxkO1xyXG5cclxuICAgIC8vIHNldCBpZFxyXG4gICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwid2luZG93LVwiICsgdGhpcy5pZCk7XHJcblxyXG4gICAgLy8gZGVmaW5lIHRoaXMud3JhcHBlckVsZW1lbnRcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWNvbnRlbnQtd3JhcHBlclwiKTtcclxuXHJcbiAgICAvLyBkZWZpbmUgbWVudUVsZW1lbnRcclxuICAgIHRoaXMubWVudUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LW1lbnVcIik7XHJcblxyXG4gICAgLy8gc2V0IHdpbmRvdyBiYXIgaWNvblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmZhXCIpLmNsYXNzTGlzdC5hZGQoY29uZmlnLmljb24pO1xyXG5cclxuICAgIC8vIHNldCB3aW5kb3cgYmFyIHRpdGxlXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhci10aXRsZVwiKS50ZXh0Q29udGVudCA9IGNvbmZpZy50aXRsZTtcclxuXHJcbiAgICAvLyBzZXQgcG9zaXRpb24gYW5kIHNpemVcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gY29uZmlnLnggKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gY29uZmlnLnkgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gY29uZmlnLnpJbmRleDtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IGNvbmZpZy53aWR0aCArIFwicHhcIjtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gY29uZmlnLmhlaWdodCAgKyBcInB4XCI7XHJcbiAgICB0aGlzLnRpdGxlQmFySGVpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuc2Nyb2xsSGVpZ2h0OyAvLyB1c2VkIGZvciBkcmFnIHJlemlzaW5nXHJcbiAgICB0aGlzLnJlc2l6ZVdpbmRvd1dpZHRoID0gbmV3IFJlc2l6ZVdpbmRvd1dpZHRoKHRoaXMpO1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dIZWlnaHQgPSBuZXcgUmVzaXplV2luZG93SGVpZ2h0KHRoaXMpO1xyXG4gICAgdGhpcy5yZXNpemVXaW5kb3dXaWR0aEhlaWdodCA9IG5ldyBSZXNpemVXaW5kb3dXaWR0aEhlaWdodCh0aGlzKTtcclxuICAgIHRoaXMuY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKTtcclxuXHJcbiAgICAvLyBwdXQgb24gdG9wIGlmIGNsaWNrZWRcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW92ZVRvVG9wLmJpbmQodGhpcyksIHRydWUpO1xyXG5cclxuICAgIC8vIGRyYWcgdGhlIHdpbmRvdyBmcm9tIHRoZSB3aW5kb3cgYmFyXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuc3RhcnREcmFnLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIGRvdWJsZSBjbGljayB3aW5kb3cgYmFyXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAud2luZG93LWJhclwiKS5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgdGhpcy5kYmxjbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBjbG9zZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNsb3NlLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBtYXhpbWl6ZSBldmVudFxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1heGltaXplLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tYXhpbWl6ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyByZXN0b3JlIGV2ZW50XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMucmVzdG9yZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBtaW5pbWl6ZVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1pbmltaXplLXdpbmRvd1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5taW5pbWl6ZS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHVzZXIgaGFzIGhhc3Qgc3RhcnRlZCB0byBkcmFnIHRoZSB3aW5kb3cgYmFyXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSB0aGUgY2xpY2sgaGFuZGxlciBldmVudCBvYmplY3RcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMucHdkLm1vdXNlLmRyYWdnZWRPYmplY3QgPSB0aGlzO1xyXG4gICAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFggPSB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCAtIGV2ZW50LnBhZ2VYO1xyXG4gICAgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFkgPSB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wIC0gZXZlbnQucGFnZVk7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyYWdnaW5nXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHVzZXIgaXMgZHJhZ2dpbmcgYW4gYXBwIHdpbmRvd1xyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IC0gdGhlIG1vdXNlbW92ZSBldmVudCBvYmplY3RcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnggPSBldmVudC5wYWdlWCArIHRoaXMucHdkLm1vdXNlLmRyYWdPZmZzZXRYO1xyXG4gICAgdGhpcy55ID0gZXZlbnQucGFnZVkgKyB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICAgIHRoaXMuY2hlY2tCb3VuZHMoZXZlbnQpO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSAgdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBjaGVja3MgdGhhdCBhIGRyYWdnZWQgd2luZG93IGlzbnQgZHJhZ2dlZCBvZmYgc2NyZWVuXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSB0aGUgbW91c2Vtb3ZlIGV2ZW50IG9iamVjdFxyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5jaGVja0JvdW5kcyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQucGFnZVggPiB0aGlzLnB3ZC53aWR0aCkge1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMucHdkLndpZHRoICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFg7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGV2ZW50LnBhZ2VZID4gdGhpcy5wd2QuaGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wd2QuaGVpZ2h0ICsgdGhpcy5wd2QubW91c2UuZHJhZ09mZnNldFk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChldmVudC5wYWdlWSA8IDEpIHtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiB1c2VyIGhhcyBzdG9wcCBkcmFnZ2luZ1xyXG4gKi9cclxuQXBwV2luZG93LnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2luZ1wiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBwb3NpdGlvbiB0aGlzIHdpbmRvdyBpbiBmcm9udCBvZiBvdGhlciB3aW5kb3dzXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1vdmVUb1RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wd2QubGFzdFpJbmRleCArPSAxO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMucHdkLmxhc3RaSW5kZXg7XHJcbn07XHJcblxyXG4vKipcclxuICogY2xvc2UgdGhpcyB3aW5kb3dcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYW5pbWF0ZSgpO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAwO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIDIwICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy53aWR0aCAtIDEwMCArIFwicHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgNTAgKyBcInB4XCI7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHdkLmNsb3NlQXBwKHRoaXMpO1xyXG4gICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIG1ha2UgdGhlIHdpbmRvdyBmdWxsc2NyZWVuXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1heGltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IHRydWU7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuXHJcbiAgICAvLyBzYXZlIHRoZSBzaXplIGFuZCBwb3NpdGlvbiBzbyB3ZSBjYW4gcmV0dXJuIHRvIGl0IHdpdGggdGhlIHJlc3RvcmUgd2luZG93IGZ1bmN0aW9uXHJcbiAgICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gICAgdGhpcy5sYXN0WSA9IHRoaXMueTtcclxuICAgIHRoaXMubGFzdFdpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMubGFzdEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIC8vIHRlbGwgcHdkIHRoaXMgd2luZG93IGlzIGluIGZ1bGxzY3JlZW4gKGluIGNhc2Ugb2YgYnJvd3NlciByZXNpemluZylcclxuICAgIHRoaXMucHdkLmZ1bGxzY3JlZW5lZFdpbmRvdyA9IHRoaXM7XHJcblxyXG4gICAgLy8gbWFrZSB0aGUgd2luZG93IGZ1bGxzY3JlZW5cclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5wd2Qud2lkdGggKyBcInB4XCI7XHJcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5wd2QuaGVpZ2h0IC0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1iYXJcIikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XHJcbiAgICB0aGlzLnggPSAwO1xyXG4gICAgdGhpcy55ID0gMDtcclxuXHJcbiAgICAvLyBoaWRlL3Nob3cgdGhlIG1heGltaXplIGFuZCByZXN0b3JlIHdpbmRvd2JhciBidXR0b25zXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAubWF4aW1pemUtd2luZG93XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAucmVzdG9yZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAvLyBpZiBpdCBpcyBtYXhpbWl6ZWQgZnJvbSBhIG1pbmltaXplZCBzdGF0ZVxyXG4gICAgdGhpcy53cmFwcGVyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5tZW51RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1yZXNpemVyLXlcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogYnJpbmcgdGhlIHdpbmRvdyBmcm9tIGZ1bGxzY3JlZW4gYmFjayB0byBwcmV2aW91cyBzaXplXHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubWF4aW1pemVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgIHRoaXMueCA9IHRoaXMubGFzdFg7XHJcbiAgICB0aGlzLnkgPSB0aGlzLmxhc3RZO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5sYXN0V2lkdGggKyBcInB4XCI7XHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMubGFzdEhlaWdodCArIFwicHhcIjtcclxuXHJcbiAgICAvL3RlbGwgcHdkIHRoaXMgd2luZG93IGlzIG5vIGxvbmdlciBpbiBmdWxsc2NyZWVuIChpbiBjYXNlIG9mIGJyb3dzZXIgcmVzaXppbmcpXHJcbiAgICB0aGlzLnB3ZC5mdWxsc2NyZWVuZWRXaW5kb3cgPSBudWxsO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tYXhpbWl6ZS13aW5kb3dcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5yZXN0b3JlLXdpbmRvd1wiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgIC8vIGlmIGl0IGlzIHJlc3RvcmVkIGZyb20gYSBtaW5pbWl6ZWQgc3RhdGVcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIHRoaXMubWVudUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIG1pbmltaXplIHRoaXMgd2luZG93XHJcbiAqL1xyXG5BcHBXaW5kb3cucHJvdG90eXBlLm1pbmltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1heGltaXplZCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICghdGhpcy5taW5pbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgICAgICB0aGlzLmxhc3RYID0gdGhpcy54O1xyXG4gICAgICAgIHRoaXMubGFzdFkgPSB0aGlzLnk7XHJcbiAgICAgICAgdGhpcy5sYXN0V2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5tZW51RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBcIjIwMHB4XCI7XHJcbiAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcclxuICAgICAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMubGFzdFg7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy5sYXN0WTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLmxhc3RXaWR0aCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLndyYXBwZXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5tZW51RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogaGFuZGxlIGRvdWJsZSBjbGlja3Mgb24gdGhlIHdpbmRvdyBiYXJcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuZGJsY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLm1pbmltaXplZCkge1xyXG4gICAgICAgIHRoaXMubWluaW1pemUoKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5tYXhpbWl6ZWQpIHtcclxuICAgICAgICB0aGlzLnJlc3RvcmUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tYXhpbWl6ZSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGFkZCBjc3MgYW5pbWF0aW9ucyBmb3IgMTAwbXMgYW5kIHRoZW4gcmVtb3ZlIGl0IHNvIGl0IHdvbnQgaW50ZXJmZXIgd2l0aCBkcmFnZ2luZyBiZWhhdmlvdXJcclxuICovXHJcbkFwcFdpbmRvdy5wcm90b3R5cGUuYW5pbWF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gYWRkIGFuaW1hdGlvbiBjbGFzc1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ3aW5kb3ctYW5pbWF0ZWRcIik7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwid2luZG93LWFuaW1hdGVkXCIpO1xyXG4gICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcHBXaW5kb3c7XHJcbiIsIi8qKlxyXG4gKiBNb3VzZVxyXG4gKi9cclxuZnVuY3Rpb24gTW91c2UoKXtcclxuICAgIHRoaXMuZHJhZ2dlZE9iamVjdCA9IG51bGw7XHJcbiAgICB0aGlzLmRyYWdPZmZzZXRYID0gMDtcclxuICAgIHRoaXMuZHJhZ09mZnNldFkgPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgKiBvbiBtb3VzZXVwIGV2ZW50IGNoZWNrIGlmIGEgd2luZG93IGlzIGJlaW5nIGRyYWdnZWRcclxuICAgICogQHBhcmFtICB7W3R5cGVdfSBlIC0gbW91c2V1cCBldmVudCBvYmplY3RcclxuICAgICovXHJcbiAgICB0aGlzLm1vdXNldXAgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnZWRPYmplY3QgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0LnN0b3BEcmFnKGV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hlbmV2ZXIgbW91c2UgaXMgbW92ZWRcclxuICAgICAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSBtb3VzZW1vdmUgZXZlbnQgb2JqZWN0bl1cclxuICAgICAqL1xyXG4gICAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnZWRPYmplY3QgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkT2JqZWN0LmRyYWcoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcclxuIiwidmFyIEFwcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0FwcFdpbmRvd1wiKTtcclxudmFyIEFwcE1lbnUgPSByZXF1aXJlKFwiLi9BcHBNZW51XCIpO1xyXG5cclxuZnVuY3Rpb24gUHdkQXBwKGNvbmZpZykge1xyXG4gICAgdGhpcy50aXRsZSA9IGNvbmZpZy50aXRsZTtcclxuICAgIHRoaXMud2lkdGggPSBjb25maWcud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGNvbmZpZy5oZWlnaHQ7XHJcbiAgICB0aGlzLmlkID0gY29uZmlnLmlkO1xyXG4gICAgY29uZmlnLndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIGNvbmZpZy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgIGNvbmZpZy50aXRsZSA9IHRoaXMudGl0bGU7XHJcbiAgICB0aGlzLmFwcFdpbmRvdyA9IG5ldyBBcHBXaW5kb3coY29uZmlnKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQd2RBcHA7XHJcbiIsIi8qKlxyXG4gKiBBcHAgd2luZG93IHJlc2l6ZXIgQ29uc3RydWN0b3JcclxuICogVGhpcyBpcyBhIHNtYWxsIGVsZW1lbnQgb24gdGhlIGJvdHRvbSBvZiBhcHAgd2luZG93cy4gaXQgY2FuIGJlIGRyYWdnZWQgdXAgYW5kIGRvd24gdG8gcmVzaXplIHRoZSBoZWlnaHQgb2YgYXBwIHdpbmRvd3NcclxuICogQHBhcmFtIHtvYmplY3R9IGFwcFdpbmRvdyAtIHdoYXQgd2luZG93IHRvIHJlc2l6ZVxyXG4gKi9cclxuZnVuY3Rpb24gUmVzaXplV2luZG93SGVpZ2h0KGFwcFdpbmRvdykge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cgPSBhcHBXaW5kb3c7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctcmVzaXplci15XCIpO1xyXG4gICAgdGhpcy5yZXNpemVUaGlzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmFwcFdpbmRvdy5pZCArIFwiIC53aW5kb3ctY29udGVudC13cmFwcGVyXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiByZXNpemVyIGRyYWcgaXMgc3RhcnRlZFxyXG4gKi9cclxuUmVzaXplV2luZG93SGVpZ2h0LnByb3RvdHlwZS5zdGFydERyYWcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmFwcFdpbmRvdy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LnRpdGxlQmFySGVpZ2h0IC0gZXZlbnQucGFnZVk7XHJcbn07XHJcblxyXG4vKipcclxuICogcmVzaXplciBpcyBkcmFnZ2VkXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gZXZlbnQgLSBtb3VzZW1vdmUgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5SZXNpemVXaW5kb3dIZWlnaHQucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy5yZXNpemVUaGlzLnN0eWxlLmhlaWdodCA9IChldmVudC5wYWdlWSAtIHRoaXMuYXBwV2luZG93LnkgLSB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ09mZnNldFkpICsgXCJweFwiO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHJlc2l6ZXIgZHJhZyBzdG9wcGVkXHJcbiovXHJcblJlc2l6ZVdpbmRvd0hlaWdodC5wcm90b3R5cGUuc3RvcERyYWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZVdpbmRvd0hlaWdodDtcclxuIiwiLyoqXHJcbiAqIEFwcCB3aW5kb3cgd2lkdGggcmVzaXplciBDb25zdHJ1Y3RvclxyXG4gKiBUaGlzIGlzIGEgc21hbGwgZWxlbWVudCBvbiB0aGUgcmlnaHQgc2lkZSBvZiBhcHAgd2luZG93cy4gaXQgY2FuIGJlIGRyYWdnZWQgbGVmdCBhbmQgcmlnaHQgdG8gcmVzaXplIHRoZSB3aWR0aCBvZiBhcHAgd2luZG93c1xyXG4gKiBAcGFyYW0ge29iamVjdH0gYXBwV2luZG93IC0gd2hhdCB3aW5kb3cgdG8gcmVzaXplXHJcbiAqL1xyXG5mdW5jdGlvbiBSZXNpemVXaW5kb3dXaWR0aChhcHBXaW5kb3cpIHtcclxuICAgIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteFwiKTtcclxuICAgIHRoaXMucmVzaXplVGhpcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5hcHBXaW5kb3cuaWQpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5zdGFydERyYWcuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBkcmFnIGlzIHN0YXJ0ZWRcclxuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCBtb3VzZSBjbGljayBldmVudCBoYW5kbGVyIG9iamVjdFxyXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuUmVzaXplV2luZG93V2lkdGgucHJvdG90eXBlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5wd2QubW91c2UuZHJhZ2dlZE9iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgLy9kcmFnIGZyb20gZXhhY3RseSB3aGVyZSB0aGUgY2xpY2sgaXNcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0ICsgdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRMZWZ0IC0gZXZlbnQucGFnZVg7XHJcbn07XHJcblxyXG4vKipcclxuICogd2lkdGggcmVzaXplciBpcyBkcmFnZ2VkXHJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgLSBtb3VzZW1vdmUgZXZlbnQgb2JqZWN0XHJcbiAqL1xyXG5SZXNpemVXaW5kb3dXaWR0aC5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnJlc2l6ZVRoaXMuc3R5bGUud2lkdGggPSAoZXZlbnQucGFnZVggLSB0aGlzLmFwcFdpbmRvdy54ICsgdGhpcy5hcHBXaW5kb3cucHdkLm1vdXNlLmRyYWdPZmZzZXRYKSArIFwicHhcIjtcclxufTtcclxuXHJcblJlc2l6ZVdpbmRvd1dpZHRoLnByb3RvdHlwZS5zdG9wRHJhZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplV2luZG93V2lkdGg7XHJcbiIsIi8qKlxyXG4gKiBBcHAgd2luZG93IHJlc2l6ZXIgQ29uc3RydWN0b3JcclxuICogVGhpcyBjb250cm9scyBib3RoIHdpZHRoIGFuZCBoZWlnaHQgcmVzaXppbmcgb2YgYW4gYXBwIHdpbmRvdy4gaXRzIGVsZW1lbnQgaXMgYSBzbWFsbCBzcXVhcmUgYXQgdGhlIGJvdHRvbSBsZWZ0IGNvcm5lciBvZiBpdHMgYXBwIHdpbmRvd1xyXG4gKiBAcGFyYW0ge29iamVjdH0gYXBwV2luZG93IC0gd2hhdCB3aW5kb3cgdG8gcmVzaXplXHJcbiAqL1xyXG5mdW5jdGlvbiBSZXNpemVXaW5kb3dXaWR0aEhlaWdodChhcHBXaW5kb3cpIHtcclxuICAgIHRoaXMuYXBwV2luZG93ID0gYXBwV2luZG93O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBhcHBXaW5kb3cuaWQgKyBcIiAud2luZG93LXJlc2l6ZXIteHlcIik7XHJcbiAgICB0aGlzLnJlc2l6ZVRoaXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuYXBwV2luZG93LmlkICsgXCIgLndpbmRvdy1jb250ZW50LXdyYXBwZXJcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLnN0YXJ0RHJhZy5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHJlc2l6ZXIgZHJhZyBpcyBzdGFydGVkXHJcbiAqL1xyXG5SZXNpemVXaW5kb3dXaWR0aEhlaWdodC5wcm90b3R5cGUuc3RhcnREcmFnID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnZ2VkT2JqZWN0ID0gdGhpcztcclxuXHJcbiAgICAvLyB0aGlzIGVsZW1lbnQgaGFzIG5vIG9mZnNldFRvcCBzbyBpbnN0ZWFkIHdlIHVzZSB3aW5kb3ctcmVzaXplci1oZWlnaHQncyBvZmZzZXRUb3AgdmFsdWVcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WSA9IHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuYXBwV2luZG93LmVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5hcHBXaW5kb3cudGl0bGVCYXJIZWlnaHQgLSBldmVudC5wYWdlWTtcclxuICAgIHRoaXMuYXBwV2luZG93LnB3ZC5tb3VzZS5kcmFnT2Zmc2V0WCA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0ICsgdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoICsgdGhpcy5hcHBXaW5kb3cuZWxlbWVudC5vZmZzZXRMZWZ0IC0gZXZlbnQucGFnZVg7XHJcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgLy8gdGhpcyBjbGljayBzaG91bGRudCBnbyB0aHJvdWdoIHRvIHRoZSBwYXJlbnQgd2hpY2ggaXMgdGhlIGhlaWdodC1yZXNpemVyXHJcbn07XHJcblxyXG4vKiogXHJcbiAqIHdpZHRoJmhlaWdodCByZXNpemVyIGlzIGJlaW5nIGRyYWdnZWQgXHJcbiovXHJcblJlc2l6ZVdpbmRvd1dpZHRoSGVpZ2h0LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZSkge1xyXG4gICAgdGhpcy5hcHBXaW5kb3cucmVzaXplV2luZG93SGVpZ2h0LmRyYWcoZSk7XHJcbiAgICB0aGlzLmFwcFdpbmRvdy5yZXNpemVXaW5kb3dXaWR0aC5kcmFnKGUpO1xyXG59O1xyXG5cclxuUmVzaXplV2luZG93V2lkdGhIZWlnaHQucHJvdG90eXBlLnN0b3BEcmFnID0gZnVuY3Rpb24oKSB7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVXaW5kb3dXaWR0aEhlaWdodDtcclxuIiwiLyoqXHJcbiAqIGNvbnN0cnVjdG9yIGZvciBhIGRlc2t0b3AgYXBwIHNob3J0Y3V0XHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBhcHAgY29uZmlnXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwd2QgLSBhIHJlZmVyZW5jZSB0byB0aGUgcHdkXHJcbiAqL1xyXG5mdW5jdGlvbiBTaG9ydGN1dChjb25maWcsIHB3ZCkge1xyXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XHJcbiAgICB0aGlzLnRpdGxlID0gY29uZmlnLnRpdGxlO1xyXG4gICAgdGhpcy5lbnRyeSA9IGNvbmZpZy5lbnRyeTtcclxuICAgIHRoaXMucHdkID0gcHdkO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBodG1sXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3J0Y3V0XCIpO1xyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmFwcGVuZENoaWxkKGNsb25lKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLmxhc3RFbGVtZW50Q2hpbGQ7XHJcblxyXG4gICAgLy8gYWRkIGljb24gYW5kIHRleHRcclxuICAgIHRoaXMuZWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKGNvbmZpZy5pY29uKTtcclxuICAgIHRoaXMuZWxlbWVudC5sYXN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gdGhpcy50aXRsZTtcclxuXHJcbiAgICAvL2FkZCBldmVudCBsaXN0ZW5lclxyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnB3ZC5zdGFydEFwcCh0aGlzLmNvbmZpZyk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNob3J0Y3V0O1xyXG4iLCJ2YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcclxudmFyIFNob3J0Y3V0ID0gcmVxdWlyZShcIi4vU2hvcnRjdXRcIik7XHJcbnZhciBhcHBMaXN0ID0gcmVxdWlyZShcIi4vYXBwTGlzdFwiKTtcclxuXHJcblxyXG4vKipcclxuICogUGVyc29uYWwgV2ViIERlc2t0b3BcclxuICovXHJcbnZhciBQd2QgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubW91c2UgPSBuZXcgTW91c2UoKTtcclxuICAgIHRoaXMuaW5zdGFsbGVkQXBwcyA9IFtdO1xyXG4gICAgdGhpcy5zdGFydGVkQXBwcyA9IHt9O1xyXG4gICAgdGhpcy5sYXN0WkluZGV4ID0gMTtcclxuICAgIHRoaXMubGFzdElEID0gMTtcclxuICAgIHRoaXMuZnVsbHNjcmVlbmVkV2luZG93ID0gbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBzaG9ydGN1dHMgZm9yIGFsbCBhdmFpbGFibGUgYXBwc1xyXG4gICAgICovXHJcbiAgICB0aGlzLmluc3RhbGxBcHBzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yICh2YXIgYXBwIGluIGFwcExpc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnN0YWxsZWRBcHBzLnB1c2gobmV3IFNob3J0Y3V0KGFwcExpc3RbYXBwXSwgdGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVuIHRoZSB1c2VyIGNsaWNrcyBhbiBhcHAgc2hvcnRjdXQgdGhpcyBmdW5jdGlvbiB3aWxsIHN0YXJ0IHRoZSBhcHBcclxuICAgICAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnIC0gY29udGFpbnMgYXBwIHNldHRpbmdzLiBUaGUgY29uZmlndXJhdGlvbiBjb21lcyBmcm9tIGFwcExpc3QuanNcclxuICAgICAqL1xyXG4gICAgdGhpcy5zdGFydEFwcCA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG5cclxuICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmNhbGN1bGF0ZVN0YXJ0UG9zaXRpb24oY29uZmlnKTtcclxuXHJcbiAgICAgICAgdmFyIG5ld0FwcCA9IG5ldyBjb25maWcuZW50cnkoe1xyXG4gICAgICAgICAgICB0aXRsZTogY29uZmlnLnRpdGxlLFxyXG4gICAgICAgICAgICB3aWR0aDogY29uZmlnLndpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IGNvbmZpZy5oZWlnaHQsXHJcbiAgICAgICAgICAgIGljb246IGNvbmZpZy5pY29uLFxyXG4gICAgICAgICAgICBwd2Q6IHRoaXMsXHJcbiAgICAgICAgICAgIGlkOiB0aGlzLmxhc3RJRCxcclxuICAgICAgICAgICAgeDogcG9zaXRpb24ueCxcclxuICAgICAgICAgICAgeTogcG9zaXRpb24ueSxcclxuICAgICAgICAgICAgekluZGV4OiB0aGlzLmxhc3RaSW5kZXhcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnN0YXJ0ZWRBcHBzW3RoaXMubGFzdElEXSA9IG5ld0FwcDtcclxuICAgICAgICB0aGlzLmxhc3RaSW5kZXggKz0gMTtcclxuICAgICAgICB0aGlzLmxhc3RJRCArPSAxO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgd2hlcmUgbmV3IGFwcHMgc2hvdWxkIGFwcGVhciBvbiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZyAtIGNvbnRhaW5zIHRoZSAgYXBwcyBzdGFuZGFyZCB3aWR0aCBhbmQgaGVpZ2h0XHJcbiAgICAgKi9cclxuICAgIHRoaXMuY2FsY3VsYXRlU3RhcnRQb3NpdGlvbiA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgc3RhcnRpbmcgWCBZIGNvb3JkaW5hdGVzIGFyZSBnb29kXHJcblxyXG4gICAgICAgIHZhciB4ID0gdGhpcy5uZXdYIC0gY29uZmlnLndpZHRoIC8gMjtcclxuICAgICAgICB2YXIgeSA9IHRoaXMubmV3WSAtIGNvbmZpZy5oZWlnaHQgLyAyO1xyXG5cclxuICAgICAgICAvLyByZXNldCBpZiBYIGlzIG9mZiBzY3JlZW5cclxuICAgICAgICBpZiAoeCA+IHRoaXMud2lkdGggLSA0MCB8fCB5ID4gdGhpcy5oZWlnaHQgLSA0MCkge1xyXG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsWCArPSAyMDtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxYID4gdGhpcy53aWR0aCAtIDIwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsWCA9IDIwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5ld1ggPSB0aGlzLm9yaWdpbmFsWDtcclxuICAgICAgICAgICAgdGhpcy5uZXdZID0gdGhpcy5vcmlnaW5hbFk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZXNldCBpZiBZIGlzIG9mZiBzY3JlZW5cclxuXHJcbiAgICAgICAgdGhpcy5uZXdYICs9IDIwO1xyXG4gICAgICAgIHRoaXMubmV3WSArPSAyMDtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG5ldyBhcHAgaXMgYmlnZ2VyIHRoYW4gdGhlIHB3ZCB3aW5kb3dcclxuICAgICAgICBpZiAoeCA8IDApIHtcclxuICAgICAgICAgICAgeCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoeSA8IDApIHtcclxuICAgICAgICAgICAgeSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge3g6IHgsIHk6IHl9O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENsb3NlIGFuIGFwcFxyXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBhcHBcclxuICAgICAqL1xyXG4gICAgdGhpcy5jbG9zZUFwcCA9IGZ1bmN0aW9uKGFwcCkge1xyXG4gICAgICAgIHRoaXMuc3RhcnRlZEFwcHNbYXBwLmlkXS5jbG9zZSgpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnN0YXJ0ZWRBcHBzW2FwcC5pZF07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQnJvd3NlciByZXNpemVcclxuICAgICAqL1xyXG4gICAgdGhpcy5yZXNpemUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLm5ld1ggPSB0aGlzLndpZHRoIC8gMjtcclxuICAgICAgICB0aGlzLm5ld1kgPSB0aGlzLmhlaWdodCAvIDIuNTtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsWCA9IHRoaXMubmV3WDtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsWSA9IHRoaXMubmV3WTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZnVsbHNjcmVlbmVkV2luZG93KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnVsbHNjcmVlbmVkV2luZG93Lm1heGltaXplKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbnZhciBwd2QgPSBuZXcgUHdkKCk7XHJcbnB3ZC5pbnN0YWxsQXBwcygpOyAvLyBjcmVhdGUgc2hvcnRjdXRzIGZvciBhbGwgYXZhaWxhYmxlIGFwcHNcclxucHdkLnJlc2l6ZSgpOyAvLyBydW4gcmVzaXplIG9uY2UgdG8gZ2V0IHdpZHRoIGFuZCBjYWxjdWxhdGUgc3RhcnQgcG9zaXRpb24gb2YgYXBwc1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBwd2QucmVzaXplLmJpbmQocHdkKSk7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgXCJDaGF0XCI6IHtcclxuICAgICAgICBlbnRyeTogcmVxdWlyZShcIi4vYXBwcy9jaGF0L2FwcFwiKSxcclxuICAgICAgICB0aXRsZTogXCJDaGF0XCIsXHJcbiAgICAgICAgd2lkdGg6IDUwMCxcclxuICAgICAgICBoZWlnaHQ6IDQwMCxcclxuICAgICAgICBpY29uOiBcImZhLWNvbW1lbnRpbmdcIlxyXG4gICAgfSxcclxuICAgIFwiTWVtb3J5XCI6IHtcclxuICAgICAgICBlbnRyeTogcmVxdWlyZShcIi4vYXBwcy9tZW1vcnkvYXBwXCIpLFxyXG4gICAgICAgIHRpdGxlOiBcIk1lbW9yeVwiLFxyXG4gICAgICAgIHdpZHRoOiA1NTAsXHJcbiAgICAgICAgaGVpZ2h0OiA0NDAsXHJcbiAgICAgICAgaWNvbjogXCJmYS1jbG9uZVwiXHJcbiAgICB9LFxyXG4gICAgUnVubmVyOiB7XHJcbiAgICAgICAgZW50cnk6IHJlcXVpcmUoXCIuL2FwcHMvYnJlYWtvdXQvYXBwXCIpLFxyXG4gICAgICAgIHRpdGxlOiBcIkJyZWFrb3V0XCIsXHJcbiAgICAgICAgd2lkdGg6IDQ4MCxcclxuICAgICAgICBoZWlnaHQ6IDMyNCxcclxuICAgICAgICBpY29uOiBcImZhLXJvY2tldFwiXHJcbiAgICB9XHJcbn07XHJcblxyXG4iLCJmdW5jdGlvbiBCYWxsKGdhbWUpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICB0aGlzLnggPSB0aGlzLmdhbWUuY2FudmFzLndpZHRoIC8gMjtcclxuICAgIHRoaXMueSA9IHRoaXMuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzA7XHJcbiAgICB0aGlzLmR4ID0gMjAwO1xyXG4gICAgdGhpcy5keSA9IC0yMDA7XHJcbiAgICB0aGlzLnJhZGl1cyA9IDEwO1xyXG59XHJcblxyXG5CYWxsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCkge1xyXG5cclxuICAgIC8vIGNvbGxpc2lvbiBkZXRlY3Rpb24gd2l0aCBvdXRlciB3YWxsc1xyXG4gICAgdmFyIGR5ID0gKHRoaXMuZHkgKiBkdCkgLyAxMDAwO1xyXG4gICAgdmFyIGR4ID0gKHRoaXMuZHggKiBkdCkgLyAxMDAwO1xyXG5cclxuICAgIC8vIGJvdW5jZSBhZ2FpbnN0IHNpZGUgd2FsbHNcclxuICAgIGlmICh0aGlzLnggKyBkeCA+IHRoaXMuZ2FtZS5jYW52YXMud2lkdGggLSB0aGlzLnJhZGl1cyB8fCB0aGlzLnggKyBkeCA8IHRoaXMucmFkaXVzKSB7XHJcbiAgICAgICAgdGhpcy5keCA9IC10aGlzLmR4O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGJvdW5jZSBhZ2FpbnN0IHRoZSByb29mXHJcbiAgICBpZiAodGhpcy55ICsgZHkgPCB0aGlzLnJhZGl1cykge1xyXG4gICAgICAgIHRoaXMuZHkgPSAtdGhpcy5keTtcclxuXHJcbiAgICAvLyBiYWxsIGhhcyBoaXQgdGhlIGJvdHRvbVxyXG4gICAgfSBlbHNlIGlmICh0aGlzLnkgKyBkeSA+IHRoaXMuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gdGhpcy5yYWRpdXMpIHtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgaWYgaXQgaGl0cyB0aGUgcGFkZGxlXHJcbiAgICAgICAgaWYgKHRoaXMueCA+IHRoaXMuZ2FtZS5wYWRkbGUueCAmJiB0aGlzLnggPCB0aGlzLmdhbWUucGFkZGxlLnggKyB0aGlzLmdhbWUucGFkZGxlLndpZHRoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHkgPSAtdGhpcy5keTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGdhbWUgb3ZlclxyXG4gICAgICAgICAgICB0aGlzLmdhbWUuZ2FtZU92ZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29sbGlzaW9uIGRldGVjdGlvbiB3aXRoIGJyaWNrc1xyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmdhbWUuYnJpY2tSb3dDb3VudDsgeSArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmdhbWUuYnJpY2tDb2x1bW5Db3VudDsgeCArPSAxKSB7XHJcbiAgICAgICAgICAgIHZhciBicmljayA9IHRoaXMuZ2FtZS5icmlja3NbeV1beF07XHJcbiAgICAgICAgICAgIGlmKGJyaWNrLmFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMueCA+IGJyaWNrLnggJiYgdGhpcy54IDwgYnJpY2sueCArIHRoaXMuZ2FtZS5icmlja1dpZHRoICYmIHRoaXMueSA+IGJyaWNrLnkgJiYgdGhpcy55IDwgYnJpY2sueSArIHRoaXMuZ2FtZS5icmlja0hlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHkgPSAtdGhpcy5keTtcclxuICAgICAgICAgICAgICAgICAgICBicmljay5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUuc2NvcmUgKz0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2FtZS5zY29yZSA9PT0gdGhpcy5nYW1lLmJyaWNrUm93Q291bnQgKiB0aGlzLmdhbWUuYnJpY2tDb2x1bW5Db3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUuZ2FtZVdvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgcG9zaXRpb25cclxuICAgIHRoaXMueCArPSAodGhpcy5keCAqIGR0KSAvIDEwMDA7XHJcbiAgICB0aGlzLnkgKz0gKHRoaXMuZHkgKiBkdCkgLyAxMDAwO1xyXG59O1xyXG5cclxuQmFsbC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgKiAyKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBcIiNkMjZiMzBcIjtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhbGw7XHJcbiIsImZ1bmN0aW9uIEJyaWNrKGdhbWUsIHgsIHksIGNvbG9yKSB7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLmNvbG9yID0gXCJyZ2IoXCIgKyBjb2xvciArIFwiLFwiICsgY29sb3IgKyBcIixcIiArIGNvbG9yICsgXCIpXCI7XHJcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XHJcbn1cclxuXHJcbkJyaWNrLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgucmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy5nYW1lLmJyaWNrV2lkdGgsIHRoaXMuZ2FtZS5icmlja0hlaWdodCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJyaWNrO1xyXG4iLCJ2YXIgQmFsbCA9IHJlcXVpcmUoXCIuL0JhbGxcIik7XHJcbnZhciBQYWRkbGUgPSByZXF1aXJlKFwiLi9QYWRkbGVcIik7XHJcbnZhciBCcmljayA9IHJlcXVpcmUoXCIuL0JyaWNrXCIpO1xyXG5cclxuZnVuY3Rpb24gR2FtZShwd2QpIHtcclxuICAgIHRoaXMucHdkID0gcHdkO1xyXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMucHdkLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICB0aGlzLmJyaWNrUm93Q291bnQgPSAzO1xyXG4gICAgdGhpcy5icmlja0NvbHVtbkNvdW50ID0gNTtcclxuICAgIHRoaXMuYnJpY2tXaWR0aCA9IDc1O1xyXG4gICAgdGhpcy5icmlja0hlaWdodCA9IDIwO1xyXG4gICAgdGhpcy5icmlja1BhZGRpbmcgPSAxMDtcclxuICAgIHRoaXMuYnJpY2tPZmZzZXRUb3AgPSAzMDtcclxuICAgIHRoaXMuYnJpY2tPZmZzZXRMZWZ0ID0gMzA7XHJcblxyXG4gICAgdGhpcy5wd2QuYXBwV2luZG93LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlEb3duSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICB0aGlzLnB3ZC5hcHBXaW5kb3cuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgdGhpcy5rZXlVcEhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG59XHJcblxyXG5HYW1lLnByb3RvdHlwZS5uZXdHYW1lID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdGhpcy5wd2QuYXBwV2luZG93LmVsZW1lbnQuZm9jdXMoKTtcclxuXHJcbiAgICB0aGlzLmJhbGwgPSBuZXcgQmFsbCh0aGlzKTtcclxuICAgIHRoaXMucGFkZGxlID0gbmV3IFBhZGRsZSh0aGlzKTtcclxuICAgIHRoaXMubGFzdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBicmlja3NcclxuICAgIHRoaXMuYnJpY2tzID0gW107XHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuYnJpY2tSb3dDb3VudDsgeSArPSAxKSB7XHJcbiAgICAgICAgdGhpcy5icmlja3NbeV0gPSBbXTtcclxuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuYnJpY2tDb2x1bW5Db3VudDsgeCArPSAxKSB7XHJcbiAgICAgICAgICAgIHZhciBicmlja1ggPSAoeCAqICh0aGlzLmJyaWNrV2lkdGggKyB0aGlzLmJyaWNrUGFkZGluZykpICsgdGhpcy5icmlja09mZnNldExlZnQ7XHJcbiAgICAgICAgICAgIHZhciBicmlja1kgPSAoeSAqICh0aGlzLmJyaWNrSGVpZ2h0ICsgdGhpcy5icmlja1BhZGRpbmcpKSArIHRoaXMuYnJpY2tPZmZzZXRUb3A7XHJcbiAgICAgICAgICAgIHZhciBjb2xvciA9IDEyMCArIHkgKiAzMDtcclxuICAgICAgICAgICAgdGhpcy5icmlja3NbeV1beF0gPSBuZXcgQnJpY2sodGhpcywgYnJpY2tYLCBicmlja1ksIGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zY29yZSA9IDA7XHJcblxyXG4gICAgdGhpcy5yaWdodFByZXNzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMubGVmdFByZXNzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucnVubmluZyA9IHRydWU7XHJcbiAgICB0aGlzLmxvb3AoKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmRyYXdTY29yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2codGhpcy5zY29yZSlcclxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjE2cHggQXJpYWxcIjtcclxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiIzM2MzYzNlwiO1xyXG4gICAgdGhpcy5jdHgudGV4dEFsaWduID0gXCJsZWZ0XCI7XHJcbiAgICB0aGlzLmN0eC5maWxsVGV4dChcIlNjb3JlOiBcIiArIHRoaXMuc2NvcmUsIDgsIDIwKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImFcIilcclxuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5jdHguZm9udCA9IFwiNDZweCBBcmlhbFwiO1xyXG4gICAgdGhpcy5jdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiI2QyNmIzMFwiO1xyXG4gICAgdGhpcy5jdHguZmlsbFRleHQoXCJHYW1lIE92ZXIhXCIsIHRoaXMuY2FudmFzLndpZHRoIC8gMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nYW1lV29uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjQ2cHggQXJpYWxcIjtcclxuICAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCIjN2ViMzY0XCI7XHJcbiAgICB0aGlzLmN0eC5maWxsVGV4dChcIldpbiFcIiwgdGhpcy5jYW52YXMud2lkdGggLyAyLCB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmtleURvd25IYW5kbGVyID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKGUua2V5Q29kZSA9PSAzOSkge1xyXG4gICAgICAgIHRoaXMucmlnaHRQcmVzc2VkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAzNykge1xyXG4gICAgICAgIHRoaXMubGVmdFByZXNzZWQgPSB0cnVlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKGUua2V5Q29kZSA9PSAzOSkge1xyXG4gICAgICAgIHRoaXMucmlnaHRQcmVzc2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gMzcpIHtcclxuICAgICAgICB0aGlzLmxlZnRQcmVzc2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gY2xlYXIgc2NyZWVuXHJcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgdGltZVxyXG4gICAgICAgIHZhciBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHZhciBkdCA9IChjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWUpO1xyXG4gICAgICAgIHRoaXMubGFzdFRpbWUgPSBjdXJyZW50VGltZTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoZHQpO1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG5cclxuICAgIC8vIGxvb3BcclxuICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuICAgIHRoaXMuYmFsbC51cGRhdGUoZHQpO1xyXG4gICAgdGhpcy5wYWRkbGUudXBkYXRlKGR0KTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGRyYXcgYnJpY2tzXHJcbiAgICB0aGlzLmJyaWNrcy5mb3JFYWNoKGZ1bmN0aW9uKGJyaWNrUm93KSB7XHJcbiAgICAgICAgYnJpY2tSb3cuZm9yRWFjaChmdW5jdGlvbihicmljaykge1xyXG4gICAgICAgICAgICBpZiAoYnJpY2suYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBicmljay5kcmF3KHRoaXMuY3R4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuYmFsbC5kcmF3KHRoaXMuY3R4KTtcclxuICAgIHRoaXMucGFkZGxlLmRyYXcodGhpcy5jdHgpO1xyXG5cclxuICAgIHRoaXMuZHJhd1Njb3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XHJcbiIsImZ1bmN0aW9uIFBhZGRsZShnYW1lKSB7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4gICAgdGhpcy5oZWlnaHQgPSAxMDtcclxuICAgIHRoaXMud2lkdGggPSA3NTtcclxuICAgIHRoaXMuc3BlZWQgPSAyMDA7IC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICB0aGlzLnggPSAodGhpcy5nYW1lLmNhbnZhcy53aWR0aCAtIHRoaXMud2lkdGgpIC8gMjtcclxufVxyXG5cclxuUGFkZGxlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgucmVjdCh0aGlzLngsIHRoaXMuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gdGhpcy5oZWlnaHQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBcIiMyNDMzNDJcIjtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcbn07XHJcblxyXG5QYWRkbGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICBpZiAodGhpcy5nYW1lLnJpZ2h0UHJlc3NlZCAmJiB0aGlzLnggPCB0aGlzLmdhbWUuY2FudmFzLndpZHRoIC0gdGhpcy53aWR0aCkge1xyXG4gICAgICAgIHRoaXMueCArPSAodGhpcy5zcGVlZCAqIGR0KSAvIDEwMDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLmdhbWUubGVmdFByZXNzZWQgJiYgdGhpcy54ID4gMCkge1xyXG4gICAgICAgIHRoaXMueCAtPSAodGhpcy5zcGVlZCAqIGR0KSAvIDEwMDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhZGRsZTtcclxuIiwidmFyIFB3ZEFwcCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9qcy9Qd2RBcHBcIik7XHJcbnZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZVwiKTtcclxudmFyIEFwcE1lbnUgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvQXBwTWVudVwiKTtcclxuXHJcbi8vIENyZWF0ZWQgZnJvbSB0aGlzIHR1dG9yaWFsIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2FtZXMvV29ya2Zsb3dzLzJEX0JyZWFrb3V0X2dhbWVfcHVyZV9KYXZhU2NyaXB0XHJcblxyXG4vKipcclxuICogQnJlYWtvdXQgYXBwIGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBhcHAgY29uZmlnIG9iamVjdFxyXG4gKi9cclxuZnVuY3Rpb24gQnJlYWtvdXQoY29uZmlnKSB7XHJcbiAgICBQd2RBcHAuY2FsbCh0aGlzLCBjb25maWcpO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBIVE1MXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2JyZWFrb3V0XCIpO1xyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgdGhpcy5nYW1lID0gbmV3IEdhbWUodGhpcyk7XHJcblxyXG4gICAgLy8gYWRkIGEgZHJvcGRvd24gbWVudSB0byB0aGUgd2luZG93XHJcbiAgICB0aGlzLm1lbnUgPSBuZXcgQXBwTWVudSh0aGlzLmFwcFdpbmRvdy5tZW51RWxlbWVudCwgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJGaWxlXCIsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJOZXcgZ2FtZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5nYW1lLm5ld0dhbWUuYmluZCh0aGlzLmdhbWUpXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiUXVpdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hcHBXaW5kb3cuY2xvc2UuYmluZCh0aGlzLmFwcFdpbmRvdylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuZ2FtZS5uZXdHYW1lKCk7XHJcblxyXG5cclxufVxyXG5cclxuQnJlYWtvdXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQd2RBcHAucHJvdG90eXBlKTtcclxuQnJlYWtvdXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnJlYWtvdXQ7XHJcblxyXG5cclxuLyoqXHJcbiAqIHdoZW4gdGhlIGFwcCBpcyBjbG9zaW5nXHJcbiAqL1xyXG5CcmVha291dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZ2FtZS5ydW5uaW5nID0gZmFsc2U7XHJcblxyXG4gICAgLy8gcmVtb3ZlIHRoZSBncmFwaGljc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwd2RcIikucmVtb3ZlQ2hpbGQodGhpcy5hcHBXaW5kb3cuZWxlbWVudCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJyZWFrb3V0O1xyXG4iLCJ2YXIgQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYXQsIG5hbWUpIHtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLmNoYXQgPSBjaGF0O1xyXG4gICAgdGhpcy5jaGF0LmNoYW5uZWxzW25hbWVdID0gdGhpcztcclxuXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXQtY2hhbm5lbFwiKTtcclxuICAgIHRoaXMuY2hhdERpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XHJcblxyXG4gICAgdGhpcy5jaGF0RGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIC8vIGxpc3RlbiBmb3IgZW50ZXIga2V5XHJcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgIC8vc2VuZCBhIG1lc3NhZ2VcclxuICAgICAgICAgICAgdGhpcy5jaGF0LnNlbmRNZXNzYWdlKHRoaXMubmFtZSwgZXZlbnQudGFyZ2V0LnZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGVtcHR5IHRleHRhcmVhXHJcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmNoYXQuY2hhdENoYW5uZWxFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuY2hhdERpdik7XHJcblxyXG4gICAgLy9jaGFubmVsIGxpc3QgZW50cnlcclxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0LWNoYW5uZWwtbGlzdC1lbnRyeVwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICB0aGlzLmNoYXQuY2hhbm5lbExpc3RFbGVtZW50Lmluc2VydEJlZm9yZShjbG9uZSwgdGhpcy5jaGF0LmpvaW5DaGFubmVsQnV0dG9uKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudCA9IHRoaXMuY2hhdC5jaGFubmVsTGlzdEVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICBpZiAobmFtZSA9PT0gXCJcIikge1xyXG4gICAgICAgIG5hbWUgPSBcIkRlZmF1bHRcIjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IG5hbWU7XHJcbiAgICB0aGlzLmxpc3RFbnRyeUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2hhdC5hY3RpdmVDaGFubmVsLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNob3coKTtcclxuICAgICAgICB0aGlzLmNoYXQuYWN0aXZlQ2hhbm5lbCA9IHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIGNsb3NlIGNoYW5uZWxcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZUNoYW5uZWwoKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5wcmludE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlXCIpWzBdO1xyXG4gICAgdmFyIG1lc3NhZ2VEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xyXG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmNoYXQtdGV4dFwiKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuZGF0YTtcclxuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbChcIi5jaGF0LWF1dGhvclwiKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UudXNlcm5hbWU7XHJcbiAgICB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbChcIi5jaGF0LW1lc3NhZ2VzXCIpWzBdLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xyXG5cclxuICAgIGlmICh0aGlzLmNoYXQuYWN0aXZlQ2hhbm5lbCAhPT0gdGhpcykge1xyXG4gICAgICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY2hhdC1jaGFubmVsLW5ld21lc3NhZ2VcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGFubmVsLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNoYXREaXYuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIHRoaXMubGlzdEVudHJ5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1hY3RpdmUtY2hhbm5lbFwiKTtcclxufTtcclxuXHJcbkNoYW5uZWwucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY2hhdERpdi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjaGF0LWFjdGl2ZS1jaGFubmVsXCIpO1xyXG4gICAgdGhpcy5saXN0RW50cnlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LWNoYW5uZWwtbmV3bWVzc2FnZVwiKTtcclxufTtcclxuXHJcbkNoYW5uZWwucHJvdG90eXBlLmNsb3NlQ2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9yZW1vdmUgY2hhbm5lbCBsaXN0IGVudHJ5XHJcbiAgICB0aGlzLmNoYXQuY2hhbm5lbExpc3RFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMubGlzdEVudHJ5RWxlbWVudCk7XHJcblxyXG4gICAgLy9yZW1vdmUgY2hhdCBkaXZcclxuICAgIHRoaXMuY2hhdC5jaGF0Q2hhbm5lbEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5jaGF0RGl2KTtcclxuXHJcbiAgICB0aGlzLmNoYXQuY2xvc2VDaGFubmVsKHRoaXMpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGFubmVsO1xyXG4iLCJ2YXIgUHdkQXBwID0gcmVxdWlyZShcIi4uLy4uLy4uL2pzL1B3ZEFwcFwiKTtcclxudmFyIHNvY2tldENvbmZpZyA9IHJlcXVpcmUoXCIuL3NvY2tldENvbmZpZy5qc29uXCIpO1xyXG52YXIgQ2hhbm5lbCA9IHJlcXVpcmUoXCIuL0NoYW5uZWxcIik7XHJcblxyXG4vKipcclxuICogQ2hhdCBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gYXBwIGNvbmZpZ3VyYXRpb24gb2JqZWN0XHJcbiAqL1xyXG5mdW5jdGlvbiBDaGF0KGNvbmZpZykge1xyXG4gICAgUHdkQXBwLmNhbGwodGhpcywgY29uZmlnKTsgLy9pbmhlcml0IGZyb20gcHdkQXBwIG9iamVjdFxyXG4gICAgdGhpcy5jaGFubmVscyA9IHt9O1xyXG4gICAgdGhpcy5hY3RpdmVDaGFubmVsID0gbnVsbDtcclxuICAgIHRoaXMuc29ja2V0ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmlucHV0TmFtZSgpIC8vIGdldCB1c2VybmFtZVxyXG4gICAgLnRoZW4oZnVuY3Rpb24odXNlcm5hbWUpIHtcclxuICAgICAgICB0aGlzLnVzZXJuYW1lID0gdXNlcm5hbWU7XHJcbiAgICAgICAgdGhpcy5zdGFydENoYXQoKTtcclxuICAgIH0uYmluZCh0aGlzKSlcclxuICAgIC50aGVuKHRoaXMuY29ubmVjdCgpKSAvLyB0aGVuIHdlIGNvbm5lY3RcclxuICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlQ2hhbm5lbCA9IG5ldyBDaGFubmVsKHRoaXMsIFwiXCIpOyAvLyB0aGVuIHdlIGNvbm5lY3QgdG8gdGhlIGRlZmF1bHQgY2hhbm5lbFxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuQ2hhdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFB3ZEFwcC5wcm90b3R5cGUpO1xyXG5DaGF0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENoYXQ7XHJcblxyXG4vKipcclxuICogZW50ZXIgdXNlcm5hbWVcclxuICovXHJcbkNoYXQucHJvdG90eXBlLmlucHV0TmFtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKFxyXG4gICAgICAgIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cclxuICAgICAgICAgICAgLy8gc2hvdyBuYW1lIGlucHV0IHRleHQgYW5kIGJ1dHRvblxyXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXQtdXNlcm5hbWUtaW5wdXRcIik7XHJcbiAgICAgICAgICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwV2luZG93LmNvbnRlbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LWJ0bi11c2VybmFtZVwiKTtcclxuICAgICAgICAgICAgdmFyIHRleHRJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5jaGF0LXVzZXJuYW1lLWlucHV0IGlucHV0W3R5cGU9dGV4dF1cIik7XHJcblxyXG4gICAgICAgICAgICB0ZXh0SW5wdXQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGV4dElucHV0LnZhbHVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRleHRJbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0ZXh0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGV4dElucHV0LnZhbHVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0ZXh0SW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGNyZWF0ZSBjaGF0IGNoYW5uZWwgaHRtbFxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUuc3RhcnRDaGF0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBjbGVhciB3aW5kb3cgb2YgcHJldmlvdXMgZWxlbWVudCAodGhlIGlucHV0IHVzZXJuYW1lIHNjcmVlbilcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS50ZXh0Q29udGVudCA9IFwiXCI7XHJcbiAgICBcclxuICAgIC8vIGNyZWF0ZSBodG1sXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXRcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xyXG4gICAgdGhpcy5hcHBXaW5kb3cuY29udGVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG4gICAgdGhpcy5jaGF0Q2hhbm5lbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIHRoaXMuaWQgKyBcIiAuY2hhdC1jaGFubmVsc1wiKTtcclxuICAgIHRoaXMuY2hhbm5lbExpc3RFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtY2hhbm5lbC1saXN0XCIpO1xyXG5cclxuICAgIC8vIGhvb2sgdXAgam9pbiBjaGFubmVsIGJ1dHRvblxyXG4gICAgdGhpcy5qb2luQ2hhbm5lbEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIGlucHV0W3R5cGU9YnV0dG9uXCIpO1xyXG4gICAgdGhpcy5qb2luQ2hhbm5lbElucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLmNoYXQtam9pbi1jaGFubmVsXCIpO1xyXG5cclxuICAgIHRoaXMuc2hvd0pvaW5DaGFubmVsSW5wdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyByZW1vdmUgdGhlIGxpc3RlbmVyXHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbEJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zaG93Sm9pbkNoYW5uZWxJbnB1dCk7XHJcblxyXG4gICAgICAgIC8vIHNob3cgdGhlIGpvaW4gbmV3IGNoYW5uZWwgZm9ybSBhbmQgcG9zaXRpb24gaXQgbmV4dCB0byB0aGUgbW91c2UgY3Vyc29yXHJcbiAgICAgICAgdGhpcy5qb2luQ2hhbm5lbElucHV0LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgICAgIHZhciBidG5ib3VuZGluZ1JlY3QgPSB0aGlzLmpvaW5DaGFubmVsQnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHZhciBpbnB1dEJvdW5kaW5nUmVjdCA9IHRoaXMuam9pbkNoYW5uZWxJbnB1dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgdmFyIGxlZnQgPSBidG5ib3VuZGluZ1JlY3QubGVmdCAtIHRoaXMuYXBwV2luZG93LnggKyBidG5ib3VuZGluZ1JlY3Qud2lkdGggKyA0ICsgXCJweFwiO1xyXG4gICAgICAgIHZhciB0b3AgPSBidG5ib3VuZGluZ1JlY3QudG9wIC0gdGhpcy5hcHBXaW5kb3cueSAtIChpbnB1dEJvdW5kaW5nUmVjdC5oZWlnaHQgLyAyKSArIChidG5ib3VuZGluZ1JlY3QuaGVpZ2h0IC8gMikgKyBcInB4XCI7XHJcblxyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5zdHlsZS5sZWZ0ID0gbGVmdDtcclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuc3R5bGUudG9wID0gdG9wO1xyXG5cclxuICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5mb2N1cygpO1xyXG5cclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgLy8gdGhpcyBjbGljayBzaG91bGRudCBwYXNzIHRocm91Z2ggb3RoZXJ3aXNlIHRoZSBpbnB1dCB3aWxsIGJlIGhpZGRlbiBieSB0aGUgd2luZG93Y2xpY2tsaXN0ZW5lclxyXG5cclxuICAgICAgICAvL2hpZGUgdGhlIGpvaW4gY2hhbm5lbCBkaXYgaWYgdGhlcmVzIGEgY2xpY2sgYW55d2hlcmUgb24gc2NyZWVuIGV4Y2VwdCBpbiB0aGUgam9pbiBjaGFubmVsIGRpdlxyXG4gICAgICAgIHRoaXMuaGlkZUpvaW5DaGFubmVsRm9ybSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0pO1xyXG4gICAgICAgICAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tKb2luQ0hhbm5lbEZvcm0pO1xyXG5cclxuICAgICAgICAgICAgLy8gYWN0aXZhdGUgdGhlIGpvaW4gY2hhbm5lbCBidXR0b24gYWdhaW5cclxuICAgICAgICAgICAgdGhpcy5qb2luQ2hhbm5lbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zaG93Sm9pbkNoYW5uZWxJbnB1dCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAvLyBkb250IGhpZGUgaWYgdGhlIGNsaWNrIGlzIGluIHRoZSBqb2luIGNoYW5uZWwgZGl2XHJcbiAgICAgICAgdGhpcy5jbGlja0pvaW5DSGFubmVsRm9ybSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmhpZGVKb2luQ2hhbm5lbEZvcm0pO1xyXG4gICAgICAgIHRoaXMuam9pbkNoYW5uZWxJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0pvaW5DSGFubmVsRm9ybSk7XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgdGhpcy5qb2luQ2hhbm5lbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zaG93Sm9pbkNoYW5uZWxJbnB1dCk7XHJcbiAgICB0aGlzLmpvaW5DaGFubmVsSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgLy8gbGlzdGVuIGZvciBlbnRlciBrZXlcclxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgLy8gam9pbiBjaGFubmVsXHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlQ2hhbm5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlQ2hhbm5lbCA9IG5ldyBDaGFubmVsKHRoaXMsIGV2ZW50LnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZUpvaW5DaGFubmVsRm9ybSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IDEpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChzb2NrZXRDb25maWcuYWRkcmVzcyk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkNvdWxkIG5vdCBjb25uZWN0XCIpKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwibWVzc2FnZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5jaGFubmVsIGluIHRoaXMuY2hhbm5lbHMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWxzW21lc3NhZ2UuY2hhbm5lbF0ucHJpbnRNZXNzYWdlKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uKGNoYW5uZWwsIHRleHQpIHtcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxyXG4gICAgICAgIGRhdGE6IHRleHQsXHJcbiAgICAgICAgdXNlcm5hbWU6IHRoaXMudXNlcm5hbWUsXHJcbiAgICAgICAgY2hhbm5lbDogY2hhbm5lbCxcclxuICAgICAgICBrZXk6IHNvY2tldENvbmZpZy5rZXlcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jb25uZWN0KCkudGhlbihmdW5jdGlvbihzb2NrZXQpIHtcclxuICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XHJcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiLCBlcnJvcik7XHJcbiAgICB9KTtcclxuXHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5jbG9zZUNoYW5uZWwgPSBmdW5jdGlvbihjaGFubmVsKSB7XHJcbiAgICBkZWxldGUgdGhpcy5jaGFubmVsc1tjaGFubmVsLm5hbWVdO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHJlbW92ZSB0aGUgZ3JhcGhpY3NcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkXCIpLnJlbW92ZUNoaWxkKHRoaXMuYXBwV2luZG93LmVsZW1lbnQpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIHRhc2tiYXJcclxuICAgIC8vIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcHdkIC50YXNrYmFyXCIpLnJlbW92ZUNoaWxkKHRoaXMudGFza2JhckFwcC5lbGVtZW50KTtcclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XHJcbiIsIm1vZHVsZS5leHBvcnRzPXtcclxuICBcImFkZHJlc3NcIjogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxyXG4gIFwia2V5XCI6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxyXG59XHJcbiIsInZhciBJbWFnZSA9IHJlcXVpcmUoXCIuL0ltYWdlXCIpO1xyXG52YXIga2V5Ym9hcmQgPSByZXF1aXJlKFwiLi9rZXlib2FyZFwiKTtcclxuXHJcbi8qKlxyXG4gKiBzaHVmZmxlIHRoZSBhcnJheSBvZiBpbWFnZXNcclxuICogQHBhcmFtICB7b2JqZWN0fSBib2FyZCAtIHJlZmVyZW5jZSB0byB0aGUgYm9hcmRcclxuICovXHJcbmZ1bmN0aW9uIHNodWZmbGUoYm9hcmQpIHtcclxuICAgIHZhciBpO1xyXG4gICAgdmFyIHJhbmRvbUluZGV4O1xyXG4gICAgdmFyIGJhY2tJbmRleDtcclxuXHJcbiAgICAvLyBtb3ZlIHRocm91Z2ggdGhlIGRlY2sgb2YgY2FyZHMgZnJvbSB0aGUgYmFjayB0byBmcm9udFxyXG4gICAgZm9yIChpID0gYm9hcmQuaW1hZ2VBcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaSAtPSAxKSB7XHJcbiAgICAgICAgLy9waWNrIGEgcmFuZG9tIGNhcmQgYW5kIHN3YXAgaXQgd2l0aCB0aGUgY2FyZCBmdXJ0aGVzdCBiYWNrIG9mIHRoZSB1bnNodWZmbGVkIGNhcmRzXHJcbiAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcclxuICAgICAgICBiYWNrSW5kZXggPSBib2FyZC5pbWFnZUFycmF5W2ldO1xyXG4gICAgICAgIGJvYXJkLmltYWdlQXJyYXlbaV0gPSBib2FyZC5pbWFnZUFycmF5W3JhbmRvbUluZGV4XTtcclxuICAgICAgICBib2FyZC5pbWFnZUFycmF5W3JhbmRvbUluZGV4XSA9IGJhY2tJbmRleDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEJvYXJkXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwd2QgLSBwd2QgcmVmZXJlbmNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5zIC0gaG93IG1hbnkgY29sdW1ucyB3aWRlIHRoZSBtZW1vcnkgZ2FtZSBzaG91bGQgbWVcclxuICogQHBhcmFtIHtudW1iZXJ9IHJvd3MgLSBob3cgbWFueSByb3dzXHJcbiAqL1xyXG5mdW5jdGlvbiBCb2FyZChwd2QsIGNvbHVtbnMsIHJvd3MpIHtcclxuICAgIHRoaXMucHdkID0gcHdkO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikudGV4dENvbnRlbnQgPSBcIlwiO1xyXG5cclxuICAgIC8vIFRPRE86IHZlcmlmeSB3aWR0aC9oZWlnaHRcclxuICAgIHRoaXMucm93cyA9IHJvd3M7XHJcbiAgICB0aGlzLmNvbHVtbnMgPSBjb2x1bW5zO1xyXG4gICAgdGhpcy5pbWFnZVNpemUgPSAxMTA7XHJcbiAgICB0aGlzLmF0dGVtcHRzID0gMDtcclxuICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMua2V5Ym9hcmRTZWxlY3QgPSB7XHJcbiAgICAgICAgeDogMCxcclxuICAgICAgICB5OiAwXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGNyZWF0ZSBodG1sXHJcbiAgICB0aGlzLndyYXBwZXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS13cmFwcGVyXCIpO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQpLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIDEpO1xyXG5cclxuICAgIC8vIEF0dGVtcHRzIGh0bWxcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5LWF0dGVtcHRzXCIpO1xyXG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQgKyBcIiAud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG4gICAgdGhpcy5hdHRlbXB0c0RpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5wd2QuaWQgKyBcIiAubWVtb3J5LWF0dGVtcHRzXCIpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1ib2FyZFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMuY29sdW1ucyAqIHRoaXMuaW1hZ2VTaXplICsgXCJweFwiO1xyXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLm1pbldpZHRoID0gdGhpcy5jb2x1bW5zICogdGhpcy5pbWFnZVNpemUgKyBcInB4XCI7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLnB3ZC5pZCArIFwiIC53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0aGlzLndyYXBwZXJFbGVtZW50KTtcclxuICAgIHRoaXMud3JhcHBlckVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICAvL2NyZWF0ZSBhcnJheSBvZiBpbWFnZXNcclxuICAgIHRoaXMuaW1hZ2VBcnJheSA9IFtdO1xyXG4gICAgdmFyIGRvY2ZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29sdW1ucyAqIHRoaXMucm93czsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIG5ld0ltYWdlID0gbmV3IEltYWdlKE1hdGguZmxvb3IoaSAvIDIpICsgMSwgaSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5pbWFnZUFycmF5LnB1c2gobmV3SW1hZ2UpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzaHVmZmxlKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuaW1hZ2VBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XHJcbiAgICAgICAgZG9jZnJhZy5hcHBlbmRDaGlsZChpbWFnZS5lbGVtZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChkb2NmcmFnKTtcclxuXHJcbiAgICAvL2hhbmRsZSBjbGlja3NcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvL3JlbW92ZSBrZXlib2FyZCBzZWxlY3Qgb3V0bGluZVxyXG4gICAgICAgIGtleWJvYXJkLnJlbW92ZU91dGxpbmUodGhpcyk7XHJcbiAgICAgICAgdmFyIGNsaWNrZWRJZCA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWlkXCIpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChjbGlja2VkSWQgPT0gaW1hZ2UuaWQpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlLmNsaWNrKHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vaGFuZGxlIGtleWJvYXJkXHJcbiAgICBrZXlib2FyZC5oYW5kbGVJbnB1dCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLnNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0R2FtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuYXR0ZW1wdHMgPSAwO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy9mbGlwIGltYWdlc1xyXG4gICAgICAgIHRoaXMuaW1hZ2VBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XHJcbiAgICAgICAgICAgIGltYWdlLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5LzAucG5nJylcIjtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm9hcmQ7XHJcbiIsInZhciBrZXlib2FyZCA9IHJlcXVpcmUoXCIuL2tleWJvYXJkXCIpO1xyXG5cclxuLyoqXHJcbiAqIGltYWdlIGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbWFnZU51bWJlclxyXG4gKiBAcGFyYW0ge051bWJlcn0gaWRcclxuICogQHBhcmFtIHtPYmplY3R9IGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBJbWFnZShpbWFnZU51bWJlciwgaWQsIGJvYXJkKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktaW1hZ2VcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pbWFnZW51bWJlclwiLCBpbWFnZU51bWJlcik7XHJcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBpZCk7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmltYWdlTnVtYmVyID0gaW1hZ2VOdW1iZXI7XHJcbiAgICB0aGlzLmJvYXJkID0gYm9hcmQ7XHJcbiAgICB0aGlzLmNsaWNrYWJsZSA9IHRydWU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBoYW5kbGUgY2xpY2tzXHJcbiAqL1xyXG5JbWFnZS5wcm90b3R5cGUuY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAodGhpcy5jbGlja2FibGUpIHtcclxuICAgICAgICB0aGlzLmNsaWNrYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvdygpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuYm9hcmQuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5zZWxlY3RlZCA9IHRoaXM7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBfc2VsZWN0ZWQgPSB0aGlzLmJvYXJkLnNlbGVjdGVkO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmF0dGVtcHRzICs9IDE7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmF0dGVtcHRzRGl2LnRleHRDb250ZW50ID0gXCJBdHRlbXB0czogXCIgKyB0aGlzLmJvYXJkLmF0dGVtcHRzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ib2FyZC5zZWxlY3RlZC5pbWFnZU51bWJlciA9PT0gdGhpcy5pbWFnZU51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgLy8gbWF0Y2hcclxuICAgICAgICAgICAgICAgIGtleWJvYXJkLnJlbW92ZU91dGxpbmUodGhpcy5ib2FyZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1ncmVlblwiKTtcclxuICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktZ3JlZW5cIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA0MDApO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIG5vdCBhIG1hdGNoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1yZWRcIik7XHJcbiAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibWVtb3J5LXJlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBfc2VsZWN0ZWQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zZWxlY3RlZC5jbGlja2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xpY2thYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogZmxpcCBiYWNrIHRoZSBpbWFnZVxyXG4gKi9cclxuSW1hZ2UucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCgnaW1hZ2UvYXBwcy9tZW1vcnkvMC5wbmcnKVwiO1xyXG59O1xyXG5cclxuLyoqIFxyXG4gKiByZXZlYWwgaW1hZ2VcclxuICovXHJcbkltYWdlLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoJ2ltYWdlL2FwcHMvbWVtb3J5L1wiICsgdGhpcy5pbWFnZU51bWJlciArIFwiLnBuZycpXCI7XHJcbn07XHJcblxyXG4vKiogXHJcbiAqIHJlbW92ZSBpbWFnZVxyXG4gKi9cclxuSW1hZ2UucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktZmFkZS1vdXRcIik7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlOyIsInZhciBQd2RBcHAgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvUHdkQXBwXCIpO1xyXG52YXIgQm9hcmQgPSByZXF1aXJlKFwiLi9Cb2FyZC5qc1wiKTtcclxudmFyIEFwcE1lbnUgPSByZXF1aXJlKFwiLi4vLi4vLi4vanMvQXBwTWVudVwiKTtcclxuXHJcbi8qKlxyXG4gKiBNZW1vcnkgYXBwIGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBhcHAgY29uZmlnIG9iamVjdFxyXG4gKi9cclxuZnVuY3Rpb24gTWVtb3J5KGNvbmZpZykge1xyXG4gICAgUHdkQXBwLmNhbGwodGhpcywgY29uZmlnKTtcclxuXHJcbiAgICAvLyBhZGQgYSBkcm9wZG93biBtZW51IHRvIHRoZSB3aW5kb3dcclxuICAgIHRoaXMubWVudSA9IG5ldyBBcHBNZW51KHRoaXMuYXBwV2luZG93Lm1lbnVFbGVtZW50LCBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcIkZpbGVcIixcclxuICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk5ldyBnYW1lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLm5ld0dhbWUuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlF1aXRcIixcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYXBwV2luZG93LmNsb3NlLmJpbmQodGhpcy5hcHBXaW5kb3cpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKHRoaXMsIDQsMyk7XHJcbiAgICB0aGlzLmJvYXJkLnN0YXJ0R2FtZSgpO1xyXG59XHJcblxyXG5NZW1vcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQd2RBcHAucHJvdG90eXBlKTtcclxuTWVtb3J5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbW9yeTtcclxuXHJcbk1lbW9yeS5wcm90b3R5cGUubmV3R2FtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvbnRlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLndpbmRvdy1jb250ZW50XCIpO1xyXG4gICAgY29udGVudEVsZW1lbnQudGV4dENvbnRlbnQgPSBcIlwiO1xyXG5cclxuICAgIC8vIGlucHV0IHJvd3MvY29scyBodG1sXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeS1zZXR1cFwiKTtcclxuICAgIHZhciBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBjb250ZW50RWxlbWVudC5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5idG5cIik7XHJcbiAgICB2YXIgcm93c0lucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyB0aGlzLmlkICsgXCIgLm1lbW9yeS1yb3dzLWlucHV0XCIpO1xyXG4gICAgdmFyIGNvbHNJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93LVwiICsgdGhpcy5pZCArIFwiIC5tZW1vcnktY29scy1pbnB1dFwiKTtcclxuXHJcbiAgICByb3dzSW5wdXQudmFsdWUgPSB0aGlzLmJvYXJkLnJvd3M7XHJcbiAgICBjb2xzSW5wdXQudmFsdWUgPSB0aGlzLmJvYXJkLmNvbHVtbnM7XHJcblxyXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKHRoaXMsIGNvbHNJbnB1dC52YWx1ZSxyb3dzSW5wdXQudmFsdWUpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3RhcnRHYW1lKCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHdoZW4gdGhlIGFwcCBpcyBjbG9zaW5nXHJcbiAqL1xyXG5NZW1vcnkucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyByZW1vdmUgdGhlIGdyYXBoaWNzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3B3ZFwiKS5yZW1vdmVDaGlsZCh0aGlzLmFwcFdpbmRvdy5lbGVtZW50KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5O1xyXG4iLCIvKipcclxuICogcmVtb3ZlIHRoZSBvdXRsaW5lIGZyb20gc2VsZWN0ZWQgbWVtb3J5IGltYWdlXHJcbiAqIEBwYXJhbSAge29iamVjdH0gYm9hcmQgLSBib2FyZCByZWZlcmVuY2VcclxuICovXHJcbmZ1bmN0aW9uIHJlbW92ZU91dGxpbmUoYm9hcmQpIHtcclxuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCArIFwiIC5tZW1vcnkta2V5Ym9hcmRTZWxlY3RcIikpIHtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvdy1cIiArIGJvYXJkLnB3ZC5pZCArIFwiIC5tZW1vcnkta2V5Ym9hcmRTZWxlY3RcIikuY2xhc3NMaXN0LnJlbW92ZShcIm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIFxyXG4gKiBzZWxlY3QgYW4gaW1hZ2VcclxuICogQHBhcmFtICB7b2JqZWN0fSBib2FyZFxyXG4gKi9cclxuZnVuY3Rpb24gc2VsZWN0KGJvYXJkKSB7XHJcbiAgICByZW1vdmVPdXRsaW5lKGJvYXJkKTtcclxuICAgIHZhciBzZWxlY3RlZCA9IGJvYXJkLmtleWJvYXJkU2VsZWN0LnggKyBib2FyZC5rZXlib2FyZFNlbGVjdC55ICogYm9hcmQuY29sdW1ucztcclxuICAgIGJvYXJkLmltYWdlQXJyYXlbc2VsZWN0ZWRdLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1rZXlib2FyZFNlbGVjdFwiKTtcclxufVxyXG5cclxuLyoqIFxyXG4qIENhcHR1cmUga2V5Ym9hcmQgcHJlc3NlcyBhbmQgdXNlIGl0IHRvIHNlbGVjdCBtZW1vcnkgY2FyZHNcclxuKiBAcGFyYW0gIHtvYmplY3R9IGJvYXJkXHJcbiAqL1xyXG5mdW5jdGlvbiBoYW5kbGVJbnB1dChib2FyZCkge1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3ctXCIgKyBib2FyZC5wd2QuaWQpLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGUua2V5Q29kZSA/IGUua2V5Q29kZSA6IGUud2hpY2g7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gMzcpIHtcclxuICAgICAgICAgICAgLy9sZWZ0XHJcbiAgICAgICAgICAgIGlmIChib2FyZC5rZXlib2FyZFNlbGVjdC54ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYm9hcmQua2V5Ym9hcmRTZWxlY3QueCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0KGJvYXJkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNlIGlmIChrZXkgPT09IDM4KSB7XHJcbiAgICAgICAgICAgIC8vdXBcclxuICAgICAgICAgICAgaWYgKGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC55IC09IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2UgaWYgKGtleSA9PT0gMzkpIHtcclxuICAgICAgICAgICAgLy9yaWdodFxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueCA8IGJvYXJkLmNvbHVtbnMgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC54ICs9IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDQwKSB7XHJcbiAgICAgICAgICAgIC8vZG93blxyXG4gICAgICAgICAgICBpZiAoYm9hcmQua2V5Ym9hcmRTZWxlY3QueSA8IGJvYXJkLnJvd3MgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICBib2FyZC5rZXlib2FyZFNlbGVjdC55ICs9IDE7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3QoYm9hcmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDMyKSB7XHJcbiAgICAgICAgICAgIC8vc3BhY2VcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gYm9hcmQua2V5Ym9hcmRTZWxlY3QueCArIGJvYXJkLmtleWJvYXJkU2VsZWN0LnkgKiBib2FyZC5jb2x1bW5zO1xyXG4gICAgICAgICAgICBib2FyZC5pbWFnZUFycmF5W3NlbGVjdGVkXS5jbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sIHRydWUpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5oYW5kbGVJbnB1dCA9IGhhbmRsZUlucHV0O1xyXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmVPdXRsaW5lID0gcmVtb3ZlT3V0bGluZTtcclxuIl19
