"use strict";

var simplePrefs = require("sdk/simple-prefs");
var prefs = simplePrefs.prefs;
var tabs = require("sdk/tabs");
var timers = require("sdk/timers");
var Request = require("sdk/request").Request;
var _ = require("sdk/l10n").get;

var { StatusButton } = require("./button/status");

/* ::::: ::::: */

const checkUrl = "https://www.linux.org.ru/notifications-count";
const notifUrl = "https://www.linux.org.ru/notifications";

/* ::::: Status Button ::::: */

var button = StatusButton({
    id: "lor-notifier",
    site: "linux.org.ru",
    label: _("LOR Notifier"),
    icon: {
        normal: {
            "18": "./icon.png",
            "32": "./icon-menuPanel.png",
            "36": "./icon@2x.png",
            "64": "./icon-menuPanel@2x.png"
        },
        notice: {
            "18": "./iconNotification.png",
            "32": "./iconNotification-menuPanel.png",
            "36": "./iconNotification@2x.png",
            "64": "./iconNotification-menuPanel@2x.png"
        },
        error: {
            "18": "./iconWarning.png",
            "32": "./iconWarning-menuPanel.png",
            "36": "./iconWarning@2x.png",
            "64": "./iconWarning-menuPanel@2x.png"
        }
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

/* ::::: Check updates ::::: */

function update() {
    Request({
        url: checkUrl,
        onComplete: function (response) {
            switch (response.status) {
                case 200:
                    let count = parseInt(response.text);
                    button.setState(button.NORMAL, count);
                    break;
                case 403:
                    button.setState(button.ERROR_LOGIN);
                    break;
                default:
                    button.setState(button.ERROR_CONNECT);
            }
        }
    }).get();
};

update(); // Start first update

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

