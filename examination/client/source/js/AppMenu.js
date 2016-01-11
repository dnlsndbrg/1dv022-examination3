var AppMenuItem = require("./AppMenuItem");

function AppMenu(menuElement, menuName, menuItems) {
    this.menuElement = menuElement;

    var template = document.querySelector("#window-menu-container");
    var clone = document.importNode(template.content, true);
    menuElement.appendChild(clone);
    this.container = menuElement.lastElementChild;
    this.container.lastElementChild.textContent = menuName;

    this.menuItems = [];

    // populate menu
    menuItems.forEach(function(item) {
        // var template = document.querySelector("#window-menu-item");
        // var clone = document.importNode(template.content, true);
        // this.container.appendChild(clone);
        // container.lastElementChild.textContent = item.name;

        // this.menuItems.push(new AppMenuItem(item));
    });
}

module.exports = AppMenu;
