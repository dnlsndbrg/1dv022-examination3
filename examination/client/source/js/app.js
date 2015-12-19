var desktop = require("./desktop");
var AppWindow = require("./AppWindow");
var Mouse = require("./Mouse");

var pwd = {
  selectedWindow: null,
  mouse: new Mouse(),
  apps: []
}

pwd.apps.push(new AppWindow(pwd, {id: 1}));
pwd.apps.push(new AppWindow(pwd, {id: 2}));
