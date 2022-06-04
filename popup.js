let toggleImages = document.getElementById("toggleImages");
let elementSelector = document.getElementById("elementSelector");
let toggleTool = document.getElementById("toggleTool");

chrome.storage.sync.get(['enableTool'], function(res) {
    toggleTool.checked = res.enableTool;
});

chrome.storage.sync.get(['hideImages'], function(res) {
    toggleImages.checked = res.hideImages;
});

toggleTool.addEventListener("change", function() {
    chrome.storage.sync.set({ enableTool: toggleTool.checked });
});

toggleImages.addEventListener("change", function() {
    chrome.storage.sync.set({ hideImages: toggleImages.checked });
});

elementSelector.addEventListener("click", async() => {
    elementSelector.disabled = true;
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Clicked the button');
    await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        css: '.hova { border: 5px solid red; }',
    });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["jquery-3.6.0.js"]
    });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["getQuerySelector.js"]
    });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: setMask
    });
});

function setMask() {
    chrome.storage.sync.get(['filterRules'], function(res) {
        console.log('Set the mask');
        var foundElements = null;
        for (const [site, rule] of Object.entries(res.filterRules)) {
            if (window.location.href == site) {
                foundElements = document.body.querySelectorAll(rule);
                $(foundElements).addClass("hova");
                break;
            }
        }
        $('body').children().mouseover(function(e) {
            $(".hova").removeClass("hova");
            $(e.target).addClass("hova");
            $(foundElements).addClass("hova");
            return false;
        }).mouseout(function(e) {
            $(this).removeClass("hova");
            $(foundElements).addClass("hova");
        });
        document.addEventListener('click', function(event) {
            // event.target is the element that was clicked
            $('body').children().off();
            $(".hova").removeClass("hova");
            // do whatever you want here
            var selector = getQuerySelector(event.target);
            console.log(selector);
            // if you want to prevent the default click action
            // (such as following a link), use these two commands:
            event.stopPropagation();
            event.preventDefault();


            if (window.location.href in res.filterRules) {
                if (res.filterRules[window.location.href].includes(selector)) {
                    const index = res.filterRules[window.location.href].indexOf(selector);
                    if (index > -1) {
                        res.filterRules[window.location.href].splice(index, 1);
                    }
                    if (res.filterRules[window.location.href].length == 0) {
                        delete res.filterRules[window.location.href];
                    }
                } else {
                    res.filterRules[window.location.href].push(selector)
                }
            } else {
                res.filterRules[window.location.href] = [selector]
            }
            chrome.storage.sync.set({ filterRules: res.filterRules });
            //console.log("Added rule " + getQuerySelector(event.target) + " on " + window.location.href);

        }, { once: true }, true);
    });
}