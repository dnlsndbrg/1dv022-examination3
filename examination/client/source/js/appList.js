module.exports = {
    "Chat": {
        entry: require("./apps/chat/app"),
        title: "Chat",
        width: 500,
        height: 400,
        icon: "fa-commenting"
    },
    "Memory": {
        entry: require("./apps/memory/app"),
        title: "Memory",
        width: 550,
        height: 440,
        icon: "fa-clone"
    },
    Runner: {
        entry: require("./apps/breakout/app"),
        title: "Breakout",
        width: 480,
        height: 324,
        icon: "fa-rocket"
    }
};

