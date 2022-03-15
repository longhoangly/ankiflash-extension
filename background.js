chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {

        if (request.isFinish === true) {
            sendResponse({ isSuccess: true })

            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

            await closeTabByUrl(sender.tab.url)
        }
    }
)

async function closeTabByUrl(url) {

    let tabs = await chrome.tabs.query({})
    tabs = await tabs.filter(tab => {
        return tab.url.includes(url)
    })

    tabs.forEach(async tab => {
        console.log("closing the tab: {}", tab.id)
        await chrome.tabs.remove(tab.id)
    })
}