function Shortcut(config, pwd) {
  this.title = config.title;
  this.entry = config.entry;
  this.pwd = pwd;
  // create html
  var template = document.querySelector("#shortcut");
  var clone = document.importNode(template.content, true);
  document.querySelector("#pwd").appendChild(clone);
  this.element = document.querySelector("#pwd").lastElementChild;
  this.element.textContent = this.title;
  //add event listener
  this.element.addEventListener("click", function() {
    this.pwd.startApp(this.entry);
  }.bind(this));
}

module.exports = Shortcut;
