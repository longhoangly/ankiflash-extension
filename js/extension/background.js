import { Common } from "../base/common.js";

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ankiFlash",
        title: "AnkiFlash Generator",
    });

    Common.presetOptions();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    let appUrl;
    if (tab) {
        if (info.menuItemId === "ankiFlash") {
            appUrl = chrome.runtime.getURL("html/ankiflash.html");
        }
        chrome.tabs.create({ url: appUrl, active: true, index: 0 });
    }
});

// Listent messages from content.js & other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.isRequestsCaptured) {
        sendResponse({ isSuccess: true });

        Common.logInfo(
            sender.tab
                ? "from a content script:" + sender.tab.url
                : "from the extension scripts"
        );
    }

    if (request.isReloaded) {
        chrome.runtime.reload();
    }
});
