"use strict";

var { ActionButton } = require("sdk/ui/button/action");
var _ = require("sdk/l10n").get;

function StatusButton(options) {
    var NORMAL = 1;
    var ERROR_LOGIN = 2;
    var ERROR_CONNECT = 3;

    var icon = options.icon;
    var site = options.site;

    var button = ActionButton({
        id: options.id,
        label: options.label,
        icon: icon.normal,
        onClick: options.onClick
    });

    var setState = function(status, count=0) {
        switch(status) {
            case NORMAL:
                if (count > 0) {
                    button.label = _("Unread notifications", count);
                    button.icon = icon.notice;
                }
                else {
                    button.label = _("No unread notifications");
                    button.icon = icon.normal;
                }
                break;
            case ERROR_LOGIN:
                button.label = _("You have to be logged", site);
                button.icon = icon.error;
                break;
            case ERROR_CONNECT:
                button.label = _("Server not found");
                button.icon = icon.error;
        }
    };

    return {
        NORMAL: NORMAL,
        ERROR_LOGIN: ERROR_LOGIN,
        ERROR_CONNECT: ERROR_CONNECT,

        setState: setState,
    };
}

exports.StatusButton = StatusButton;

