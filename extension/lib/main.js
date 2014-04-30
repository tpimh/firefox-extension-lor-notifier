"use strict";

var simplePrefs = require("sdk/simple-prefs");
var prefs = simplePrefs.prefs;
var tabs = require("sdk/tabs");
var { ActionButton } = require("sdk/ui/button/action");
var timers = require("sdk/timers");
var Request = require("sdk/request").Request;

var _ = require("sdk/l10n").get;

/* ::::: ::::: */

const checkUrl = "https://www.linux.org.ru/notifications-count";
const notifUrl = "https://www.linux.org.ru/notifications";

var statusList = {
    NORMAL: 1,
    ERROR_LOGIN: 2,
    ERROR_CONNECT: 3
}

/* ::::: Action Button ::::: */

var button = ActionButton({
    id: "lor-notifier",
    label: _("LOR Notifier"),
    icon: {
        "16": "./icon.png",
        "32": "./icon-menuPanel.png"
    },
    onClick: function(state) {
        for each (var tab in tabs) {
            if (tab.url === notifUrl) {
                tab.activate();
                tab.reload();
                return;
            }
        }

        var urls = ["about:blank", "about:newtab", "about:home"];
        if (urls.indexOf(tabs.activeTab.url) > -1) {
            tabs.activeTab.url = notifUrl;
        } else {
            tabs.open(notifUrl);
        }

        timers.setTimeout(update, 5 * 1000);
        timers.setTimeout(update, 25 * 1000);
    }
});

function updateButtonState(status, count=0) {
    var n = "";
    switch(status) {
        case statusList.NORMAL:
            if (count > 0) {
                n = "Notification";
                button.label = _("Unread notifications", count);
                break;
            }
            button.label = _("No unread notifications");
            break;
        case statusList.ERROR_LOGIN:
            n = "Warning";
            button.label = _("You have to be logged", "linux.org.ru");
            break;
        default:
            n = "Warning";
            button.label = _("Server not found");
    }
    button.icon = {
        "16": "./icon" + n + ".png",
        "32": "./icon" + n + "-menuPanel.png"
    };
};

function update() {
    Request({
        url: checkUrl,
        onComplete: function (response) {
            switch (response.status) {
                case 200:
                    let count = parseInt(response.text);
                    updateButtonState(statusList.NORMAL, count);
                    break;
                case 403:
                    updateButtonState(statusList.ERROR_LOGIN);
                    break;
                default:
                    updateButtonState(statusList.ERROR_CONNECT);
            }
        }
    }).get();
};

/* ::::: Start first update ::::: */

update();

/* ::::: Set timer ::::: */

var timerId = null;
var updateInterval;

function updateTimer() {
    if (timerId !== null) {
        timers.clearInterval(timerId);
    }

    updateInterval = prefs["update-interval"];
    if (updateInterval < 5)
        updateInterval = 5;

    timerId = timers.setInterval(update, updateInterval * 1000);
}

updateTimer();
simplePrefs.on("update-interval", updateTimer);
