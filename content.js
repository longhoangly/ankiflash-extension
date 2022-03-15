$(document).ready(async () => {

    console.log('Page fully loaded and parsed')

    const src = chrome.runtime.getURL('common.js')
    const module = await import(src)

    let enabled = await module.Common.getChromeStorage("enableAnkiFlash")
    console.log("enableAnkiFlash", enabled)

    if (enabled === "true") {
        var html = document.documentElement.innerHTML;
        let response = await module.Common.httpPostLocalServer('/api/v1/addrecord/word_content', html)

        if (response !== undefined) {
            console.log("Finished sending HTML content to server. Close created tab.")
            chrome.runtime.sendMessage({ isFinish: true }, function (response) {
                console.log("Response from background script", response.isSuccess)
            })
        } else {
            alert("Cannot connect to local AnkiFlash server! Please contact the author of AnkiFlash for supporting!")
        }
    }
})
