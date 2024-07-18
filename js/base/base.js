String.prototype.format = function () {
    let i = 0,
        args = arguments;
    return this.replace(/{}/g, () => {
        return args[i] ? args[i++] : "";
    });
};

export class Base {
    static LOG_CONFIG = {
        DEBUG: false,
        TRACE: false,
    };

    static RESP_TYPE_ENUM = {
        TEXT: "TEXT",
        JSON: "JSON",
        RESPONSE: "RESPONSE",
    };

    static uuid() {
        let dt = Date.now();
        let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            (c) => {
                let r = (dt + Math.random() * 16) % 16 | 0;
                dt = Math.floor(dt / 16);
                return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
            }
        );

        return uuid;
    }

    static isNotNull(str) {
        return str !== "" && str !== undefined && str !== null;
    }

    static isNull(str) {
        return str === "" || str === undefined || str === null;
    }

    static isValidJson(value) {
        if (typeof value === "object" || Array.isArray(value)) {
            value = JSON.stringify(value);
        }

        try {
            JSON.parse(value);
            if (typeof value === "boolean" || value === "") {
                return false;
            } else {
                return true;
            }
        } catch (err) {
            Base.logDebug("Error occurred", err);
            return false;
        }
    }

    static randomString(
        length,
        includedChars = false,
        includedSpecials = false
    ) {
        let characters = "123456789";

        if (includedChars) {
            characters +=
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }

        if (includedSpecials) {
            characters += "!@#$%^&*()_+-={};':\"|.<>?";
        }

        let random = "";
        for (let i = 0; i < length; i++) {
            if (i === 1) {
                characters += "0";
            }

            random += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        return random;
    }

    static randomInt(max) {
        return Math.floor(Math.random() * max + 1);
    }

    static randomItems(arr, offset = 2) {
        if (offset > arr.length) {
            throw Error(
                `Input array ${arr} length is shorter than the number of random element ${offset}`
            );
        }

        let resultArr = [];
        for (let index = 0; index < offset; index++) {
            let randIdx = Math.floor(Math.random() * arr.length);

            resultArr.push(arr[randIdx]);
            arr.splice(randIdx, 1);
        }

        return resultArr;
    }

    static randomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static showElement(selector) {
        $(selector).show("fast");
    }

    static hideElement(selector) {
        $(selector).hide("fast");
    }

    static showHideElement(selector, isShown) {
        if (isShown) {
            Base.showElement(selector);
        } else {
            Base.hideElement(selector);
        }
    }

    static setDisplayAttribute(selector, attr) {
        $(selector).attr("style", `display: ${attr};`);
    }

    static confirmAlert(msg) {
        if (!confirm(msg)) {
            throw new Error("You choose Cancel option!!");
        }
    }

    static stopAlert(msg) {
        throw new Error(`Stoooop execution here!! Reason: ${msg}`);
    }

    static jsonToString(json, isFormatted = false) {
        try {
            if (typeof json === "object") {
                if (isFormatted) {
                    json = JSON.stringify(json, null, "  ");
                } else {
                    json = JSON.stringify(json);
                }
            } else {
                json = JSON.stringify(JSON.parse(json));
            }
        } catch (err) {
            Base.logDebug(
                "Cannot convert JSON object to String...Please re-check json object...",
                err
            );
        } finally {
            return json;
        }
    }

    static stringToJson(jsonStr) {
        let json = jsonStr;
        try {
            json = JSON.parse(jsonStr);
        } catch (error) {
            Base.logDebug(
                "Cannot convert String to JSON object...Please re-check json format...",
                error
            );
        } finally {
            return json;
        }
    }

    static distinctArray(arr) {
        return arr
            .filter(Boolean)
            .filter((value, index, array) => array.indexOf(value) === index);
    }

    // Compare two arrays
    static compareArraysIgnoreOrder(a, b) {
        if (a.length !== b.length) return false;
        const uniqueValues = new Set([...a, ...b]);

        for (const v of uniqueValues) {
            const aCount = a.filter((e) => e === v).length;
            const bCount = b.filter((e) => e === v).length;

            if (aCount !== bCount) return false;
        }

        return true;
    }

    static logSuccess(...args) {
        console.log(Base.#decorLogMsg(args), "color: LightGreen", ...args);

        if (Base.LOG_CONFIG.TRACE) {
            console.trace();
        }
    }

    static logWarn(...args) {
        console.log(Base.#decorLogMsg(args), "color: DarkOrange", ...args);

        if (Base.LOG_CONFIG.TRACE) {
            console.trace();
        }
    }

    static logInfo(...args) {
        console.log(Base.#decorLogMsg(args), "color: DarkGray", ...args);

        if (Base.LOG_CONFIG.TRACE) {
            console.trace();
        }
    }

    static logError(...args) {
        console.log(Base.#decorLogMsg(args), "color: Red", ...args);

        if (Base.LOG_CONFIG.TRACE) {
            console.trace();
        }
    }

    static logDebug(...args) {
        if (Base.LOG_CONFIG.DEBUG) {
            console.log(Base.#decorLogMsg(args), "color: Red", ...args);
        }

        if (Base.LOG_CONFIG.TRACE) {
            console.trace();
        }
    }

    static #decorLogMsg(args) {
        let msgConfig = "%c ";
        args.forEach((arg) => {
            const type = typeof arg;
            switch (type) {
                case "bigint":
                    msgConfig += "%o ";
                    break;
                case "number":
                    msgConfig += "%o ";
                    break;
                case "boolean":
                    msgConfig += "%o ";
                    break;
                case "string":
                    msgConfig += "%s ";
                    break;
                case "object":
                    msgConfig += "%o ";
                    break;
                case "undefined":
                    msgConfig += "%o ";
                    break;
                default:
                    msgConfig += "%o ";
            }
        });

        return msgConfig;
    }

    static getWeekNo(offset) {
        let currentdate = new Date();
        var oneJan = new Date(currentdate.getFullYear(), 0, 1);

        var numberOfDays =
            (currentdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000);

        var weekNo =
            Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7) + offset;

        Base.logWarn(
            `The week number of the date (${currentdate}) is ${currentdate.getFullYear()}-W${String(
                weekNo
            ).padStart(2, "0")}.`
        );

        return `${currentdate.getFullYear()}-W${String(weekNo).padStart(
            2,
            "0"
        )}`;
    }

    static objToUrlParams(obj) {
        const formData = new URLSearchParams();

        for (const key in obj) {
            if (Array.isArray(obj[key]) || Base.isValidJson(obj[key])) {
                formData.append(key, Base.jsonToString(obj[key]));
            } else {
                formData.append(key, obj[key]);
            }
        }

        return formData.toString();
    }

    static objToUrlParamsV2(obj) {
        var str = "";

        for (const key in obj) {
            if (str != "") {
                str += "&";
            }
            str += key + "=" + encodeURIComponent(obj[key]);
        }

        return str;
    }

    static getDaysArray(start, end) {
        // From: "2021-06-09" to "2021-06-10"
        for (
            var arr = [], dt = new Date(start);
            dt <= end;
            dt.setDate(dt.getDate() + 1)
        ) {
            arr.push(new Date(dt));
        }
        return arr;
    }

    static getJsonDate(offsetDate = 0, separator = "-") {
        let tmpDate = new Date();
        Base.logDebug("tmpDate.getTime()", tmpDate.getTime());

        let date = new Date(tmpDate.getTime());
        let localTimezone = (-1 * date.getTimezoneOffset()) / 60;

        // Get current date by Singapore timezone
        let timezone = +8;

        date.setDate(date.getDate() + offsetDate);
        date.setHours(date.getHours() - localTimezone);
        date.setHours(date.getHours() + timezone);
        Base.logDebug("date.getTime()", date.getTime());

        let dateString = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        )
            .toJSON()
            .slice(0, 10);

        return dateString.replaceAll("-", separator);
    }

    static requiredField(varValue, varName) {
        Base.logDebug(varValue, "... is value of required field ...", varName);

        if (varValue !== false && !varValue) {
            throw new Error(
                `{${varName}} is required field, but actual value is {${varValue}}`
            );
        }
    }

    static setIntervalNoDelay(func, interval, ...args) {
        func(...args);
        return setInterval(func, interval, ...args);
    }

    static calc(str) {
        str = str.replaceAll(" ", "");
        const blocks = str.split(/[+-]/i);
        let mainOperators = [...str.matchAll(/[+-]/g)].map((r) => r[0]);

        let blockValues = [];
        for (const block of blocks) {
            const numbers = block.split(/[/*]/i);
            let subOperators = [...block.matchAll(/[/*]/g)].map((r) => r[0]);
            blockValues.push(Base.#calcArray(numbers, subOperators));
        }

        return blockValues.length === 1
            ? blockValues[0]
            : Base.#calcArray(blockValues, mainOperators);
    }

    static #calcArray(numbers, operators) {
        Base.logDebug("numbers", numbers, "operators", operators);

        if (operators.length < 1) {
            throw new Error("Should have at least 1 operator");
        }

        if (numbers.length < 2) {
            throw new Error("Should have at least 2 numbers");
        }

        if (operators.length !== numbers.length - 1) {
            throw new Error(
                "operators array should be less than numbers array ONE element"
            );
        }

        let combinedVal = Base.#calcNum(
            numbers.shift(),
            operators.shift(),
            numbers.shift()
        );
        numbers.unshift(combinedVal);

        return numbers.length === 1
            ? combinedVal
            : Base.#calcArray(numbers, operators);
    }

    static #calcNum(num1, operator, num2) {
        Base.logDebug("num1", num1, "operator", operator, "num2", num2);

        switch (operator) {
            case "+":
                return num1 + num2;
            case "-":
                return num1 - num2;
            case "/":
                return num1 / num2;
            case "*":
                return num1 * num2;
            default:
                Base.logError("Operation not found");
                return undefined;
        }
    }

    static toReadableTime(timeInSecond) {
        timeInSecond = Math.floor(timeInSecond);

        let seconds = timeInSecond % 60;

        let timeInMinute = (timeInSecond - seconds) / 60;
        let minutes = timeInMinute % 60;

        let hours = (timeInMinute - minutes) / 60;

        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    static getMedian(arr) {
        if (arr.length === 0) {
            return undefined;
        }

        arr.sort((a, b) => a - b);
        const middleIndex = Math.floor(arr.length / 2);

        if (arr.length % 2 === 0) {
            return (arr[middleIndex - 1] + arr[middleIndex]) / 2;
        } else {
            return arr[middleIndex];
        }
    }

    static getPercentageValue(arr, percent) {
        if (arr.length === 0) {
            return undefined;
        }

        arr.sort((a, b) => a - b);
        const lowIndex = parseInt(arr.length * percent);
        const upIndex = Math.floor(arr.length * percent);

        return (arr[lowIndex] + arr[upIndex]) / 2;
    }

    static async setElementColor(selector, colorCode) {
        // $(selector).css("cssText", `color: ${colorCode} !important`);
        // $(selector).css({"font-style": "italic", "font-weight": "bold","text-decoration": "underline"});

        let cssObj = { color: colorCode };
        $(selector).css(cssObj);
    }

    static async disableElement(selector) {
        $(selector).prop("disabled", true);
    }

    static async enableElement(selector) {
        $(selector).prop("disabled", false);
    }

    static async isNumber(value) {
        if (value == null || value == undefined) {
            return false;
        }

        value = String(value);
        let matches = value.match(/^\d+(\.\d+){0,1}$/g);
        return matches !== null && matches.length > 0;
    }

    static async removeStorage(keys) {
        if (keys.length > 0) {
            await chrome.storage.local.remove(keys, (data) => {
                Base.logInfo("Removed keys", keys, "from local storage", data);
            });
        } else {
            Base.logError("No key to remove!! Please check your input!!");
        }
    }

    static async getStorages(keys) {
        let promise = await new Promise((resolve, reject) => {
            // keys = null to get the whole storage
            chrome.storage.local.get(keys, (data) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(data);
            });
        });

        return promise;
    }

    static async getStorage(key) {
        let data = await Base.getStorages([key]);
        Base.logDebug("Return storage...", key, data[key]);
        return data[key];
    }

    static async setStorage(key, value) {
        let json = {};
        json[key] = value;
        Base.logDebug("Saving storage...", key, value);

        let promise = await new Promise((resolve, reject) => {
            chrome.storage.local.set(json, () => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(true);
            });
        });

        return promise;
    }

    static async getJsonStorage(storageKey, jsonKeys = []) {
        if (jsonKeys.length === 0) {
            throw new Error("Please use getStorage method instead.");
        }

        let json = await Base.getStorage(storageKey);
        let value = await Base.#getJsonFieldValue(jsonKeys, json);

        Base.logDebug("Return storage JSON value...", value);
        return value;
    }

    static async #getJsonFieldValue(keys, json) {
        Base.logDebug("Getting field value", keys, "from", json);

        if (Base.isValidJson(json)) {
            if (keys.length === 1) {
                return json[keys.shift()];
            } else {
                return Base.#getJsonFieldValue(keys, json[keys.shift()]);
            }
        } else {
            return undefined;
        }
    }

    static async setJsonStorage(storageKey, jsonKeys, value) {
        if (jsonKeys.length === 0) {
            throw new Error("Please use setStorage method instead.");
        }

        let json = await Base.getStorage(storageKey);
        let storedJson = await Base.#setJsonFieldValue(jsonKeys, value, json);
        await Base.setStorage(firstKey, storedJson);

        Base.logDebug("Saving storage JSON value...", storedJson);
        return storedJson;
    }

    static async #setJsonFieldValue(keys, value, json) {
        Base.logDebug("Setting", value, "to", json, "by", keys);

        if (json) {
            if (keys.length === 1) {
                json[keys.shift()] = value;
                return json;
            } else {
                let firstKey = keys.shift();
                let subJson = await Base.#setJsonFieldValue(
                    keys,
                    value,
                    json[firstKey]
                );
                json[firstKey] = subJson;
                return json;
            }
        } else {
            json = {};
            json[keys.shift()] = value;
            return json;
        }
    }

    static async fetchWithTimeout(request) {
        let requestTimeout = await Base.getJsonStorage("ankiFlashOptions", [
            "requestTimeout",
        ]);

        if (!request.timeout) {
            request.timeout = requestTimeout;
        }
        const { timeout = request.timeout * 1000 } = request.options;

        const abortController = new AbortController();
        const id = setTimeout(() => abortController.abort(), timeout);

        const response = await fetch(request.url, {
            ...request.options,
            signal: abortController.signal,
        });

        clearTimeout(id);
        return response;
    }

    static async fetchNeutral(request) {
        if (request.payload !== null) {
            if (Base.isValidJson(request.payload)) {
                request.payload = Base.jsonToString(request.payload);
            }

            if (request.payload instanceof FormData) {
                let formData = {};
                for (const pair of request.payload.entries()) {
                    formData[pair[0]] = pair[1];
                }
            }
        }

        let fetchOptions = {
            method: request.method,
            headers: new Headers(request.headers),
            body: request.payload,
            redirect: "follow",
            credentials: "include",
            mode: "cors",
            referrer: request.url,
            referrerPolicy: "strict-origin-when-cross-origin",
        };

        let response;
        let printedResponse;

        let printedPayload = Base.isValidJson(request.payload)
            ? JSON.parse(request.payload)
            : request.payload;

        try {
            response = await Base.fetchWithTimeout({
                url: request.url,
                options: fetchOptions,
            });

            try {
                if (request.respType === Base.RESP_TYPE_ENUM.RESPONSE) {
                    printedResponse = response;
                } else if (request.respType === Base.RESP_TYPE_ENUM.TEXT) {
                    printedResponse = await response.text();
                } else {
                    printedResponse = await response.clone().json();
                }

                if (
                    response.ok ||
                    response.status == 200 ||
                    printedResponse.success
                ) {
                    Base.logSuccess(
                        request.method,
                        "URL",
                        request.url,
                        "HEADERS",
                        request.headers,
                        "PAYLOAD",
                        printedPayload,
                        "RESPONSE",
                        printedResponse.slice(0, 1000)
                    );
                } else {
                    Base.logError(
                        request.method,
                        "URL",
                        request.url,
                        "HEADERS",
                        request.headers,
                        "PAYLOAD",
                        printedPayload,
                        "RESPONSE",
                        printedResponse
                    );
                }
            } catch (error) {
                printedResponse = await response.text();
                Base.logError(
                    request.method,
                    "URL",
                    request.url,
                    "HEADERS",
                    request.headers,
                    "PAYLOAD",
                    printedPayload,
                    "RESPONSE",
                    printedResponse,
                    "ERROR",
                    error
                );
            }
        } catch (error) {
            Base.logError(
                request.method,
                "URL",
                request.url,
                "HEADERS",
                request.headers,
                "PAYLOAD",
                printedPayload,
                "RESPONSE",
                printedResponse,
                "ERROR",
                error
            );
        }

        return printedResponse;
    }

    static async fetchRetries(request) {
        let retryTimes = await Base.getJsonStorage("letoOptions", [
            "retryTimes",
        ]);
        let retryInterval = await Base.getJsonStorage("letoOptions", [
            "retryInterval",
        ]);
        let retryCodes = await Base.getJsonStorage("letoOptions", [
            "retryCodes",
        ]);

        let json;
        let requestCount = 0;
        do {
            json = await Base.fetchNeutral(request);

            requestCount++;
            if (json.error === undefined || requestCount === retryTimes) {
                break;
            }
            await Base.delayTime(retryInterval);
        } while (
            json.error !== undefined &&
            retryCodes.includes(json.error.code)
        );

        return json;
    }

    static async fetchJsonContent(jsonPath) {
        Base.logInfo("JS navitve fetching JSON file.", jsonPath);

        let response = await fetch(jsonPath);
        let json = await response.json();
        Base.logSuccess("Json", json);

        return json;
    }

    static async getJsonContent(jsonPath) {
        Base.logInfo("JQuery getting JSON file.", jsonPath);

        let json = await $.getJSON(jsonPath, (data) => {
            Base.logInfo("Json", data);
        }).fail((err) => {
            Base.logError("an error has occurred.", err);
        });

        return json;
    }

    static async getUrlContent(url) {
        Base.logInfo("JQuery getting HTML content.", url);

        let html = await $.get(url, (data) => {
            Base.logDebug("Html", data);
        }).fail((err) => {
            Base.logError("an error has occurred.", err);
        });

        return html;
    }

    static async getCookie(cookieDetails) {
        let cookie = await chrome.cookies.get(cookieDetails);

        if (cookie !== null && cookie != undefined && cookie.value) {
            Base.logDebug("Found cookie", cookieDetails, cookie.value);
            return cookie.value;
        }

        Base.logDebug("Cookie not found!!", cookieDetails);
    }

    static async getCookies(cookieDetails, filters = {}) {
        let cookies = await chrome.cookies.getAll(cookieDetails);

        if (cookies !== null && cookies != undefined) {
            Base.logDebug("Found raw cookies", cookieDetails, filters, cookies);

            cookies = cookies.filter((c) => {
                let rt = true;

                for (const key of Object.keys(filters)) {
                    rt = rt && filters[key] && filters[key].includes(c[key]); // filters.domain
                }

                return rt;
            });

            Base.logInfo(
                "Found filtered cookies",
                cookieDetails,
                filters,
                cookies
            );
            return cookies;
        }

        Base.logWarn("Cookie not found!!", cookieDetails);
    }

    static async removeCookies(cookieDetails, filters = {}) {
        let cookies = await Base.getCookies(cookieDetails, filters);
        Base.logInfo(
            "Going to remove cookies",
            cookieDetails,
            filters,
            cookies
        );

        let removeResults = [];
        for (const cookie of cookies) {
            let details = {
                url: cookieDetails.url || filters.domain, // in case of partitioned cookie, cookieDetails will not have url, then use filter.domain
                name: cookie.name,
            };

            if (cookie.partitionKey) {
                details.partitionKey = cookie.partitionKey;
            }

            Base.logInfo("Removing cookie", cookieDetails, filters, cookie);
            removeResults.push(await chrome.cookies.remove(details));
        }

        return removeResults;
    }

    static async getCookieString(cookieDetails, filters = {}) {
        let cookies = await Base.getCookies(cookieDetails, filters);

        let cookieString = cookies
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

        return cookieString;
    }

    static async updateCookieString(cookieKey, setCookies) {
        let cookieString = await Base.getStorage(cookieKey);

        if (setCookies.length > 0) {
            let storageCookies = cookieString
                .split(";")
                .map((c) => c.trim())
                .map((c) => {
                    return { name: c.split("=")[0], value: c.split("=")[1] };
                });

            // append new cookies which were not in storage before
            for (const setCookie of setCookies.filter(
                (sc) => !storageCookies.map((c) => c.name).includes(sc.name)
            )) {
                storageCookies.push({
                    name: setCookie.name,
                    value: setCookie.value,
                });
            }

            // update cookies already in storage string
            storageCookies.forEach((storageCookie) => {
                let [foundCookie] = setCookies.filter(
                    (c) => c.name === storageCookie.name
                );

                if (foundCookie) {
                    storageCookie.value = foundCookie.value;
                }
            });

            cookieString = storageCookies
                .map((c) => `${c.name}=${c.value}`)
                .join("; ");

            Base.logWarn(`Updating... ${cookieKey}=`, cookieString);
            await Base.setStorage(cookieKey, cookieString);
        }

        return cookieString;
    }

    static async openThenCloseLoadedTab(url, isActive = false) {
        Base.logInfo("Opening URL", url);
        let activeTab = await Base.getActiveTab();

        let createdTab = await Base.#createBrowserTab({
            url: url,
            active: isActive,
            index: parseInt(activeTab.index) + 1,
        });

        await Base.setStorage(createdTab.id, false);
        chrome.tabs.onUpdated.addListener(async (tabId, info) => {
            if (createdTab.id === tabId && info.status === "complete") {
                await Base.setStorage(createdTab.id, true);
                await chrome.tabs.remove(createdTab.id);
            }
        });

        await Base.waitUntil(
            async (tabId) => {
                return { isStopped: await Base.getStorage(String(tabId)) };
            },
            500,
            30000,
            createdTab.id
        );
    }

    static async openNewTab(url, isActive = false) {
        Base.logInfo("Opening URL", url);
        let activeTab = await Base.getActiveTab();

        await Base.#createBrowserTab({
            url: url,
            active: isActive,
            index: parseInt(activeTab.index) + 1,
        });
    }

    static async #createBrowserTab(createProperties) {
        let promise = await new Promise((resolve, reject) => {
            chrome.tabs.create(createProperties, (createdTab) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(createdTab);
            });
        });

        return promise;
    }

    static async getActiveTab() {
        let [activeTab] = await Base.#queryBrowserTabs({
            active: true,
            currentWindow: true,
        });

        return activeTab;
    }

    static async #queryBrowserTabs(queryInfo) {
        let promise = await new Promise((resolve, reject) => {
            chrome.tabs.query(queryInfo, (tabs) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(tabs);
            });
        });

        return promise;
    }

    static async flattenJSON(obj = {}, res = {}, extraKey = "") {
        for (let key in obj) {
            if (
                typeof obj[key] !== "object" ||
                // We will return array of values. Array of object will be proceed recursive.
                (Array.isArray(obj[key]) &&
                    obj[key].length > 0 &&
                    typeof obj[key][0] !== "object")
            ) {
                res[extraKey + key] = obj[key];
            } else {
                await Base.flattenJSON(obj[key], res, `${extraKey}${key}.`);
            }
        }
        return res;
    }

    static async compareTwoJsonObjects(jsonA, jsonB) {
        // objects are equals
        // const y = { a: "1", b: "2" };
        // const x = { b: "2", a: "1" };

        // let a = await Common.flattenJSON(x);
        // let b = await Common.flattenJSON(y);

        // Common.logError("a", a, "b", b);
        // Common.logError("a === b", a === b); // false

        // let result = await Common.compareTwoJsonObjects(x, y);
        // Common.logError("result", result); // true

        let flattenJsonA = await Base.flattenJSON(jsonA);
        const sortObjectA = await Base.sortObject(flattenJsonA);

        let flattenJsonB = await Base.flattenJSON(jsonB);
        const sortObjectB = await Base.sortObject(flattenJsonB);

        return JSON.stringify(sortObjectA) === JSON.stringify(sortObjectB);
    }

    static async sortObject(obj) {
        return Object.keys(obj)
            .sort()
            .reduce((r, k) => ((r[k] = obj[k]), r), {});
    }

    static async removeJsonByKeys(obj = {}, keyList = []) {
        for (let key in obj) {
            if (!Array.isArray(obj) && !keyList.includes(key)) {
                delete obj[key];
            } else {
                if (typeof obj[key] === "object") {
                    await Base.removeJsonByKeys(obj[key], keyList);
                }
            }
        }
        return obj;
    }

    static async simpleEscape(str) {
        return str !== null ? str.replaceAll('"', '\\"') : null;
    }

    static async simpleUnescape(str) {
        return str !== null ? str.replaceAll('\\"', '"') : null;
    }

    static async encodeUriBase64(str) {
        return btoa(encodeURI(str));
    }

    static async decodeUriBase64(str) {
        return decodeURI(atob(str));
    }

    static async copyTextToClipboard(selector) {
        let copyText = document.querySelector(selector);

        copyText.select();
        /* For mobile devices */
        copyText.setSelectionRange(0, 99999);

        navigator.clipboard.writeText(copyText.value);
    }

    static async extSendMessageToBrowserTab(tabId, msgObj) {
        let promise = await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, msgObj, (response) => {
                Base.logWarn("response from browser tab", response);

                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(response);
            });
        });

        return promise;
    }

    static async tabSendMessageToBackground(msgObj) {
        let promise = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(msgObj, (response) => {
                Base.logWarn("response from background", response);

                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(response);
            });
        });

        return promise;
    }

    static async delayTime(ms) {
        return new Promise((res) => {
            setTimeout(res, ms);
            Base.logInfo(`Waiting for ${ms} ms`);
        });
    }

    static async waitUntil(
        stopConditionFunc,
        retryInterval = 500,
        timeoutMilis = 30000,
        ...args
    ) {
        if (retryInterval === 0) {
            retryInterval = await Base.getJsonStorage("letoOptions", [
                "retryInterval",
            ]);
        }

        let result;
        let isStopped = false;

        let maxChecks = parseInt(timeoutMilis / retryInterval);
        for (let index = 0; index < maxChecks; index++) {
            result = await stopConditionFunc(...args);
            Base.logWarn(
                "waitUntil",
                stopConditionFunc.name,
                "params",
                args,
                "RETURNED",
                result,
                "...CHECKING !!!"
            );
            isStopped = result.isStopped;

            if (isStopped) {
                Base.logWarn(
                    "waitUntil",
                    stopConditionFunc.name,
                    "params",
                    args,
                    "RETURNED",
                    result,
                    "...STOPPED !!!"
                );
                break;
            }
            await Base.delayTime(retryInterval);
        }

        if (!isStopped) {
            Base.logError(
                "waitUntil",
                stopConditionFunc.name,
                "params",
                args,
                "RETURNED",
                result,
                "...STILL CHECKING !!!",
                `BUT Max check times reached !!! GIVE UP !!!`
            );
        }

        return result;
    }

    static async sha256(message) {
        // encode as UTF-8
        const msgBuffer = new TextEncoder().encode(message);

        // hash the message
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        // convert bytes to hex string
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        Base.logWarn(message, "=> hased 256 to =>", hashHex);

        return hashHex;
    }

    static async downloadFile(filename, text) {
        var element = document.createElement("a");
        element.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(text)
        );
        element.setAttribute("download", filename);

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();
        document.body.removeChild(element);
    }

    static async exportCsvFile(rows, fileName) {
        // each row is an array of text cells
        Base.logWarn("Downloading csv file which contains below rows", rows);

        let csvContent =
            "data:application/csv;charset=utf-8," +
            rows.map((e) => e.join(",")).join("\n");

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");

        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);

        // Required for FF
        document.body.appendChild(link);

        link.click();
        link.remove();
    }
}
