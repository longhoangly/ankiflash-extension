var processingChanges = false;

$(document).ready(async () => {
    // Loading common.js dynamic
    const commonModule = await import(
        chrome.runtime.getURL("js/base/common.js")
    );

    commonModule.Common.logWarn(
        "[AnkiFlash] checking current URL",
        window.location.href,
        document.title
    );

    if (window.location.href.includes("xxx")) {
        // Code executed on specific URL
    }
});

class Content {
    static async #getHtml() {
        commonModule.Common.logWarn("Getting HTML from", window.location.href);
        return document.documentElement.innerHTML;
    }
}
