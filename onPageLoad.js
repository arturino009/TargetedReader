const config = { attributes: false, childList: true, subtree: true };

const callback = function(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.target.localName == 'body') {
            observer.disconnect();
            console.log("Starting body observer");
            observerBody.observe(document.body, config);
            break;
        }
    };
}
const callbackBody = function(mutationsList, observerBody) {
    var elements = document.body.querySelectorAll(currentRules);
    if (elements.length == currentRules.length && !foundAll) {
        for (node of elements) {
            node.classList.add("skip_main")
        }
        foundAll = true;
        $(".skip_main").parents().addClass("skip");
        $(".skip_main").find('*').addClass("skip");
        var nodes = document.body.querySelectorAll(":not(.skip_main):not(.skip):not(style)")
        for (child of nodes) {
            $(child).remove();
        }
    } else if (foundAll) {
        $(".skip_main").find('*').addClass("skip");
        var nodes = document.body.querySelectorAll(":not(.skip_main):not(.skip):not(style)")
        for (child of nodes) {
            $(child).remove();
        }
    }
}
currentRules = null;
var foundAll = false;
const observerBody = new MutationObserver(callbackBody);
chrome.storage.sync.get(['enableTool'], function(res) {
    if (res.enableTool == true) {
        chrome.storage.sync.get(['filterRules'], function(res) {
            for (const [site, rule] of Object.entries(res.filterRules)) {
                if (window.location.href == site) {
                    $('<style type="text/css">body {display: none;}</style>').appendTo($('head'));
                    currentRules = rule;
                    const observer = new MutationObserver(callback);
                    observer.observe(document, config);
                    document.addEventListener("DOMContentLoaded", () => {
                        observerBody.disconnect();
                        console.log("Deleting remaining elements");
                        document.body.style.display = "block";
                        var nodes = document.body.querySelectorAll(":not(.skip_main):not(.skip):not(style)")
                        for (child of nodes) {
                            $(child).remove();
                        }
                    });
                    break;
                }
            }
        });
    }
});