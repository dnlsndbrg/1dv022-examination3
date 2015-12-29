var AppWindow = require("../../../js/AppWindow");
var config = require("./config.json");

function Chat(config) {
  this.title = "Chat";
  this.width = 400;
  this.height = 300;
  this.id = config.id;
  config.width = this.width;
  config.height = this.height;
  config.title = this.title;
  this.appWindow = new AppWindow(config);
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


}

Chat.prototype.connect = function() {
  return new Promise(function(resolve, reject){

    if (this.socket && this.socket.readyState === 1) {
      resolve(this.socket);
      return;
    }

    this.socket = new WebSocket(config.address);

    this.socket.addEventListener("open", function() {
      resolve(this.socket)
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
    key: config.key
  }

  console.log(this);
  this.connect().then(function(socket){
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

}

module.exports = Chat;
