var desktop = require("./desktop");
var AppWindow = require("./AppWindow");
var Mouse = require("./Mouse");

var pwd = {
  mouse: new Mouse(),
  apps: [],
  zIndex: 3
}

pwd.apps.push(new AppWindow(pwd, {
  id: 1,
  title: "test window",
  x: 20,
  y: 100,
  zIndex: 1,
  width: 300,
  height: 300
}));
pwd.apps.push(new AppWindow(pwd, {
  id: 2,
  title: "another window",
  x: 100,
  y: 300,
  zIndex: 2,
  width: 250,
  height: 400
}));
