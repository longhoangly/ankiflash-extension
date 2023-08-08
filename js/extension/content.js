var processingChanges = false;

$(document).ready(async () => {
    // Loading common.js dynamic
    const src = chrome.runtime.getURL("js/base/common.js");
    const commonFile = await import(src);

    let currentUrl = window.location.href;
    commonFile.Common.logWarning(
        "[AnkiFlash] checking current URL",
        currentUrl,
        document.title
    );

    if (currentUrl.includes("test.com")) {
        // Code executed on specific URL
    }
});

class Content {
    static async #getHtml(url) {
        let html = document.documentElement.innerHTML;
        commonFile.Common.logWarning("Getting HTML from", url, html);
        return html;
    }
}
