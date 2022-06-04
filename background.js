chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ enableTool: false });
    chrome.storage.sync.set({ hideImages: false });
    chrome.storage.sync.set({ filterRules: {} });
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.hideImages) {
        if (changes.hideImages.newValue) {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ["ruleset_1"]
            });
            console.log('Hiding images');
        } else {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ["ruleset_1"]
            });
            console.log('Showing images');
        }
    }
});