var Channel = function(name) {
    this.name = name;
    var template = document.querySelector("#chat-messages");
    this.element = document.importNode(template.content, true);
};

module.exports = Channel;
