"use strict";
var DoUtility = (function () {
    function DoUtility() {
    }
    DoUtility.SelfInstantiateOnLoad = function (classType) {
        if (!classType) {
            console.log("SelfInstantiateOnLoad() classType arg cannot be null");
            return;
        }
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', function () { return new classType(); });
        }
        else {
            new classType();
        }
    };
    DoUtility.DecodeHtml = function (encodedHtml) {
        var textarea = document.createElement("textarea");
        textarea.innerHTML = encodedHtml;
        return textarea.value;
    };
    DoUtility.OpenWindowSticker = function (url) {
        var screen_width = window.screen.availWidth;
        var left_point = Math.trunc(screen_width / 2) - (500);
        var brochureWindow = window.open(url, "", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=1,resizable=yes,copyhistory=yes,width=1050,height=1500");
        brochureWindow.moveTo(left_point, 0);
    };
    DoUtility.OpenFordWindowSticker = function (url) {
        var t3websiteCookie = '';
        var guid = '';
        if (window.DealeronCookie) {
            t3websiteCookie = (window.DealeronCookie.getItem('t3website') || '');
        }
        if (t3websiteCookie != '') {
            var elements = t3websiteCookie.match(/<cookieguid>([^<]*)<\/cookieguid>/);
            if (elements.length > 1) {
                var cookieguid = elements[1];
                if (cookieguid != null) {
                    guid = cookieguid;
                }
            }
        }
        if (guid == '') {
            DoUtility.OpenWindowSticker(url);
        }
        else {
            DoUtility.OpenWindowSticker(url + "&cguid=" + guid);
        }
    };
    Object.defineProperty(DoUtility, "isTouchDevice", {
        get: function () {
            return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DoUtility, "isMobile", {
        get: function () {
            return window.innerWidth <= 991;
        },
        enumerable: false,
        configurable: true
    });
    return DoUtility;
}());
