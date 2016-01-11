function AppMenu(menuElement, menus) {

    var template = document.querySelector("#window-menu-container");
    var clone = document.importNode(template.content, true);
    menuElement.appendChild(clone);
    this.element = menuElement.lastElementChild.lastElementChild;

    menus.forEach(function(menu) {
        // create menu header
        var template = document.querySelector("#window-menu-header");
        var clone = document.importNode(template.content, true);
        this.element.appendChild(clone);

        // add header name
        this.element.lastElementChild.firstElementChild.textContent = menu.name;

        // add menu items
        var dropdown = this.element.lastElementChild.lastElementChild;
        menu.items.forEach(function(item) {

            // create menu item html
            var template = document.querySelector("#window-menu-item");
            var clone = document.importNode(template.content, true);
            dropdown.appendChild(clone);

            // set name and assign eventlistener
            var itemElement = dropdown.lastElementChild.lastElementChild;
            itemElement.textContent = item.name;
            itemElement.addEventListener("click", item.action);

        }.bind(this));
    }.bind(this));
}

module.exports = AppMenu;
