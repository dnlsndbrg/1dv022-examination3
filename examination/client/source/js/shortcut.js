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
    this.element.addEventListener("click", function() {
        this.pwd.startApp(this.config);
    }.bind(this));
}

module.exports = Shortcut;
