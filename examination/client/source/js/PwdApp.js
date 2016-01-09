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
