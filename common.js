class Common {

    static async httpPostLocalServer(aipUrl, htmlContent) {

        let baseURL = 'http://localhost:8081'

        var myHeaders = new Headers();
        myHeaders.append("content-type", "application/json")
        myHeaders.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36");

        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: encodeURIComponent(htmlContent),
            redirect: "follow"
        }

        let fetchURL = aipUrl.includes("http") ? aipUrl : baseURL + aipUrl
        console.log("url", fetchURL)

        let result
        try {
            let response = await fetch(fetchURL, requestOptions)
            result = await response.text()
            console.log("response", result)
        } catch (error) {
            console.error("error", error)
        }

        return result
    }

    static async delayTime(ms) {
        return new Promise((res) => {
            setTimeout(res, ms)
            console.log(`Waited for ${ms} ms`)
        })
    }

    static async displayAlert(id, message, isSuccess = true, timeout = 5) {

        if (isSuccess) {
            $(`#${id}`).attr("class", "alert alert-success")
        } else {
            $(`#${id}`).attr("class", "alert alert-danger")
        }

        $(`#${id}`).html(message)
        $(`#${id}`).attr("style", "display: block-inline;")

        await Common.delayTime(timeout * 1000)
        $(`#${id}`).attr("style", "display: none;")
    }

    static async getChromeStorage(key, isObject = false) {

        let data = await new Promise((resolve, reject) => {
            chrome.storage.local.get([key], (data) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError)
                }
                resolve(data)
            })
        })

        if (isObject) {
            return data[key] !== "null" && data[key] !== "undefined" && data[key] !== undefined ? JSON.parse(atob(data[key])) : []
        }

        return data[key] !== "null" && data[key] !== "undefined" && data[key] !== undefined ? data[key] : ""
    }

    static async setChromeStorage(key, value, isObject = false) {

        if (isObject) {
            value = btoa(JSON.stringify(value, null, "  "))
        }

        let jsonObj = JSON.parse(`{"${key}": "${value}"}`)
        let promise = await new Promise((resolve, reject) => {
            chrome.storage.local.set(jsonObj, () => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError)
                }

                resolve(true)
            })
        })

        return promise
    }
}

export { Common }