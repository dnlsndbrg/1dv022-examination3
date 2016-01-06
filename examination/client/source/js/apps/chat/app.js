var PwdApp = require("../../../js/PwdApp");
var socketConfig = require("./socketConfig.json");
var Channel = require("./Channel");

function Chat(config) {
    PwdApp.call(this, config);
    this.channels = [];
    this.inputName();


    /*
    // chat stuff
    this.socket = null;
    var template = document.querySelector("#chat");
    this.chatDiv = document.importNode(template.content.firstElementChild, true);
    this.connect().then(function(socket) {

    });

    this.chatDiv.addEventListener("keypress", function(event) {
        // listen for enter key
        if (event.keyCode === 13) {
            //send a message
            this.sendMessage(event.target.value);

            // empty textarea
            event.target.value = "";

            event.preventDefault();
        }
    }.bind(this));

    this.appWindow.content.appendChild(this.chatDiv);
    */
}

Chat.prototype = Object.create(PwdApp.prototype);
Chat.prototype.constructor = Chat;

Chat.prototype.inputName = function() {
    var template = document.querySelector("#chat-name-input");
    var clone = document.importNode(template.content, true);
    this.appWindow.content.appendChild(clone);

    document.querySelector(".chat-name-input input[type=button]").addEventListener("click", function() {
        this.username = document.querySelector(".chat-name-input input[type=text]").value;
        this.start();
        this.joinChannel(""); // join default channel;
        
    }.bind(this));

};

Chat.prototype.start = function() {
    var template = document.querySelector("#chat");
    this.element = document.importNode(template.content, true);
    this.appWindow.content.textContent = "";
    this.appWindow.content.appendChild(this.element);
    this.channelListElement = document.querySelector("#window-" + this.id + " .chat-channel-list"); // the div with the list of connected channels
};

Chat.prototype.joinChannel = function(name) {
    var newChannel = new Channel(name);
    this.channels.push(newChannel);
    this.showChannel(newChannel);

    var template = document.querySelector("#chat-channel-list-entry");
    var clone = document.importNode(template.content, true);

    if (name === "") {
        name = "Default"
    };

    //clone.textContent = name;
    
    this.channelListElement.appendChild(clone);

    //console.log(this.channelListElement.lastElementChild)
    // add click listener to be able to show the channel
    //this.channelListElement.lastElementChild.addEventListener("click", function() {
    //    console.log("CLICAKSCAS");
    //});
};

Chat.prototype.showChannel = function(channel) {

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
                this.printMessage(message);
            }
        }.bind(this));

    }.bind(this));

};

Chat.prototype.sendMessage = function(text) {
    var data = {
        type: "message",
        data: text,
        username: "Daniel",
        channel: "",
        key: socketConfig.key
    };

    this.connect().then(function(socket) {
        socket.send(JSON.stringify(data));
    }).catch(function(error) {
        console.log("Error: ", error);
    });

};

Chat.prototype.printMessage = function(message) {
    var template = this.chatDiv.querySelectorAll("template")[0];

    var messageDiv = document.importNode(template.content.firstElementChild, true);
    messageDiv.querySelectorAll(".chat-text")[0].textContent = message.data;
    messageDiv.querySelectorAll(".chat-author")[0].textContent = message.username;

    this.chatDiv.querySelectorAll(".chat-messages")[0].appendChild(messageDiv);
};

Chat.prototype.close = function() {
    // remove the graphics
    document.querySelector("#pwd").removeChild(this.appWindow.element);

    // remove from taskbar
    document.querySelector("#pwd .taskbar").removeChild(this.taskbarApp.element);

};

module.exports = Chat;
