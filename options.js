let area = document.getElementById("rules");
let saveButton = document.getElementById("saveRules");

function writeRules() {
    chrome.storage.sync.get(['filterRules'], function(res) {
        var text = '';
        for (const [site, rule] of Object.entries(res.filterRules)) {
            for (r of rule) {
                text = text.concat(site + "##" + r + "\n");
            }
            text = text.concat("\n");
        }
        area.value = text;
    });
}

function saveRules() {
    var allRules = area.value;
    var ruleList = allRules.split("\n");
    var newRules = {};
    for (rule of ruleList) {
        if (rule.includes("##")) {
            var splitRule = rule.split("##")[0]
            if (splitRule[0] in newRules) {
                newRules[splitRule[0]].push(splitRule[1])
            } else {
                newRules[splitRule[0]] = splitRule[1]
            }
            chrome.storage.sync.set({ filterRules: newRules });
        }
    }
    alert("Saved changes!")
}

saveButton.addEventListener('click', saveRules)

writeRules();