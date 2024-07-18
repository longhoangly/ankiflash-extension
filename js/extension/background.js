import { Common } from "../base/common.js";

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ankiFlash",
        title: "AnkiFlash Generator",
    });

    Common.presetOptions();
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("html/ankiflash.html"),
        active: true,
        index: 0,
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "ankiFlash") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("html/ankiflash.html"),
            active: true,
            index: 0,
        });
    }
});
