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

  this.resize = function(event) {
    console.log("resize", event);
  }
}

var pwd = new Pwd();
pwd.installApps();
window.addEventListener("resize", pwd.resize);
