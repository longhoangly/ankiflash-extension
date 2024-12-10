// "string1 {} string2".format("and")
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
        BLOB: "BLOB",
        TEXT: "TEXT",
        JSON: "JSON",
        RESPONSE: "RESPONSE",
    };

    static uuid() {
        let dt = Date.now();
        const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            (c) => {
                const r = (dt + Math.random() * 16) % 16 | 0;
                dt = Math.floor(dt / 16);
                return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
            }
        );

        return uuid;
    }

    static isDefined(value) {
        return (
            value !== "" &&
            value !== undefined &&
            value !== "undefined" &&
            value !== null &&
            value !== "null"
        );
    }

    static isUndefined(value) {
        return (
            value === "" ||
            value === undefined ||
            value === "undefined" ||
            value === null ||
            value === "null"
        );
    }

    static isValidJson(value) {
        if (typeof value === "object" || Array.isArray(value)) {
            value = JSON.stringify(value);
        }

        try {
            JSON.parse(value);
            return !(typeof value === "boolean" || value === "");
        } catch (err) {
            Base.logDebug("Error occurred", err);
            return false;
        }
    }

    static randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return parseInt(Math.floor(Math.random() * (max - min)) + min);
    }

    static randomString(params) {
        params.strLength = params.strLength || 10;
        params.includedChars = params.includedChars || false;
        params.includedSpecials = params.includedSpecials || false;

        let characters = "123456789";
        if (params.includedChars) {
            characters +=
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }

        if (params.includedSpecials) {
            characters += "!@#$%^&*()_+-={};':\"|.<>?";
        }

        let randStr = "";
        for (let i = 0; i < params.strLength; i++) {
            if (i === 1) {
                characters += "0";
            }

            randStr += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        return randStr;
    }

    static randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static randomItems(array, size = 2) {
        if (size > array.length) {
            throw Error(
                `Input array ${array} length is shorter than the number of random element ${size}`
            );
        }

        let resultArray = [];
        for (let index = 0; index < size; index++) {
            let randIdx = Math.floor(Math.random() * array.length);

            resultArray.push(array[randIdx]);
            array.splice(randIdx, 1);
        }

        return resultArray;
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

    static setDisplayAttribute(selector, value) {
        $(selector).attr("style", `display: ${value};`);
    }

    static confirmBox(message) {
        if (!confirm(message)) {
            throw new Error("Stopped because you chose Cancel option!");
        }
    }

    static stopExec(reason) {
        throw new Error(`Stopped execution here! Reason: ${reason}`);
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
            Base.logError("Error occurred", err);
        } finally {
            return json;
        }
    }

    static stringToJson(jsonStr) {
        let json = jsonStr;
        try {
            json = JSON.parse(jsonStr);
        } catch (err) {
            Base.logError("Error occurred", err);
        } finally {
            return json;
        }
    }

    static distinctArray(originArray) {
        return originArray
            .filter(Boolean)
            .filter((value, index, array) => array.indexOf(value) === index);
    }

    static compareArraysNoOrder(arrayOne, arrayTwo) {
        if (arrayOne.length !== arrayTwo.length) return false;
        const uniqueValues = new Set([...arrayOne, ...arrayTwo]);

        for (const v of uniqueValues) {
            const aCount = arrayOne.filter((e) => e === v).length;
            const bCount = arrayTwo.filter((e) => e === v).length;
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
            switch (typeof arg) {
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

    static weekNumber(offset) {
        const currentdate = new Date();

        const oneJan = new Date(currentdate.getFullYear(), 0, 1);

        const numberOfDays =
            (currentdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000);

        const weekNo =
            Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7) + offset;

        const weekNoStr = `${currentdate.getFullYear()}-W${String(
            weekNo
        ).padStart(2, "0")}`;

        Base.logWarn(
            `The week number of the date (${currentdate}) is ${weekNoStr}.`
        );

        return weekNoStr;
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
        let str = "";

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
        start = new Date(start);
        end = new Date(end);

        let arr = [];
        for (
            let dt = new Date(start);
            dt <= end;
            dt.setDate(dt.getDate() + 1)
        ) {
            arr.push(new Date(dt));
        }
        return arr;
    }

    static getJsonDate(
        timeConfig = {
            offsetDate: 0,
            separator: "-",
            // get current date by Singapore timezone
            timezone: +7,
            onlyDate: true,
        }
    ) {
        const tmpDate = new Date();
        Base.logDebug("tmpDate.getTime()", tmpDate.getTime());

        let date = new Date(tmpDate.getTime());
        const localTimezone = (-1 * date.getTimezoneOffset()) / 60;

        date.setDate(date.getDate() + timeConfig.offsetDate);
        date.setHours(date.getHours() - localTimezone);
        date.setHours(date.getHours() + timeConfig.timezone);
        Base.logDebug("date.getTime()", date.getTime());

        let dateString = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        ).toJSON();

        if (timeConfig.onlyDate) {
            dateString = dateString.slice(0, 10);
        }

        return dateString.replaceAll("-", timeConfig.separator);
    }

    static requiredField(varValue, varName) {
        Base.logDebug(varValue, "... is value of required field ...", varName);

        if (Base.isUndefined(varValue)) {
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
        const mainOperators = [...str.matchAll(/[+-]/g)].map((r) => r[0]);

        let blockValues = [];
        for (const block of blocks) {
            const numbers = block.split(/[/*]/i);
            const subOperators = [...block.matchAll(/[/*]/g)].map((r) => r[0]);
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

        const combinedVal = Base.#calcNum(
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

        const seconds = timeInSecond % 60;

        const timeInMinute = (timeInSecond - seconds) / 60;
        const minutes = timeInMinute % 60;

        const hours = (timeInMinute - minutes) / 60;

        return `${hours
            .toString()
            .padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    static getMedian(array) {
        if (array.length === 0) {
            return undefined;
        }

        array.sort((a, b) => a - b);
        const middleIndex = Math.floor(array.length / 2);

        if (array.length % 2 === 0) {
            return (array[middleIndex - 1] + array[middleIndex]) / 2;
        } else {
            return array[middleIndex];
        }
    }

    static getPercentageValue(array, percent) {
        if (array.length === 0) {
            return undefined;
        }

        array.sort((a, b) => a - b);
        const lowIndex = parseInt(array.length * percent);
        const upIndex = Math.floor(array.length * percent);

        return (array[lowIndex] + array[upIndex]) / 2;
    }

    static setElementColor(selector, colorCode) {
        // $(selector).css("cssText", `color: ${colorCode} !important`);
        // $(selector).css({"font-style": "italic", "font-weight": "bold","text-decoration": "underline"});
        const cssObj = { color: colorCode };
        $(selector).css(cssObj);
    }

    static disableElement(selector) {
        $(selector).prop("disabled", true);
    }

    static enableElement(selector) {
        $(selector).prop("disabled", false);
    }

    static isNumber(value) {
        if (value == null || value == undefined) {
            return false;
        }

        value = String(value);
        const matches = value.match(/^\d+(\.\d+){0,1}$/g);

        return matches !== null && matches.length > 0;
    }

    static async removeStorage(keys) {
        for (let index = 0; index < keys.length; index++) {
            keys[index] = String(keys[index]);
        }

        if (keys.length > 0) {
            await chrome.storage.local.remove(keys, (data) => {
                Base.logInfo("Removed keys", keys, "from local storage", data);
            });
        } else {
            Base.logError("No key to remove!! Please check your input!!");
        }
    }

    static async clearStorage() {
        await chrome.storage.local.clear(() => {
            Base.logInfo("Removed chrome extension - local storage");
        });
    }

    static async getStorages(keys) {
        const promise = await new Promise((resolve, reject) => {
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
        key = String(key);
        const data = await Base.getStorages([key]);
        Base.logDebug("Return storage...", key, data[key]);
        return data[key];
    }

    static async setStorage(key, value) {
        let json = {};
        json[key] = value;
        Base.logDebug("Saving storage...", key, value);

        const promise = await new Promise((resolve, reject) => {
            chrome.storage.local.set(json, () => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(true);
            });
        });

        return promise;
    }

    static async getTabStorage(key) {
        const currentTab = await Base.getCurrentTab();
        const tabId = currentTab?.id || chrome.runtime.id;

        const tabStorageValue = await Base.getStorage(`${tabId}_${key}`);
        Base.logDebug(
            "TabId",
            tabId,
            "key",
            key,
            "[getTabStorage]",
            tabStorageValue
        );
        return tabStorageValue;
    }

    static async getJsonStorage(storageKey, jsonKeys = []) {
        if (jsonKeys.length === 0) {
            throw new Error("Please use getStorage method instead.");
        }
        storageKey = String(storageKey);
        const json = await Base.getStorage(storageKey);
        const value = Base.#getJsonFieldValue(jsonKeys, json);

        Base.logDebug("Return storage JSON value...", value);
        return value;
    }

    static #getJsonFieldValue(keys, json) {
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
        storageKey = String(storageKey);
        const json = await Base.getStorage(storageKey);

        const storedJson = Base.setJsonFieldValue(jsonKeys, value, json);
        await Base.setStorage(storageKey, storedJson);

        Base.logDebug("Saving storage JSON value...", storedJson);
        return storedJson;
    }

    static async setTabStorage(key, value) {
        const currentTab = await Base.getCurrentTab();
        const tabId = currentTab?.id || chrome.runtime.id;

        Base.logDebug("TabId", tabId, "key", key, "[setTabStorage]", value);
        return await Base.setStorage(`${tabId}_${key}`, value);
    }

    static setJsonFieldValue(keys, value, json) {
        Base.logDebug("Setting", value, "to", json, "by", keys);

        if (json) {
            if (keys.length === 1) {
                json[keys.shift()] = value;
                return json;
            } else {
                const firstKey = keys.shift();
                const subJson = Base.setJsonFieldValue(
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
        const requestTimeout = await Base.getJsonStorage(
            `${chrome.runtime.id}Options`,
            ["requestTimeout"]
        );

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

        const fetchOptions = {
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
        let printedResp;

        const printedPayload = Base.isValidJson(request.payload)
            ? JSON.parse(request.payload)
            : request.payload;

        let commonLogs = [
            request.method,
            "URL",
            request.url,
            "HEADERS",
            request.headers,
            "PAYLOAD",
            printedPayload,
        ];

        try {
            response = await Base.fetchWithTimeout({
                url: request.url,
                options: fetchOptions,
            });

            try {
                if (request.respType === Base.RESP_TYPE_ENUM.RESPONSE) {
                    printedResp = response;
                } else if (request.respType === Base.RESP_TYPE_ENUM.TEXT) {
                    printedResp = await response.text();
                } else if (request.respType === Base.RESP_TYPE_ENUM.BLOB) {
                    printedResp = await response.blob();
                } else {
                    printedResp = await response.clone().json();
                }

                commonLogs = commonLogs.concat([
                    "RESPONSE",
                    Base.isValidJson(printedResp)
                        ? printedResp
                        : String(printedResp).slice(0, 500),
                ]);

                if (
                    response.ok ||
                    response.status == 200 ||
                    printedResp.success
                ) {
                    Base.logSuccess(...commonLogs);
                } else {
                    Base.logError(...commonLogs);
                }
            } catch (error) {
                printedResp = await response.text();
                commonLogs = commonLogs.concat([
                    "RESPONSE",
                    printedResp,
                    "ERROR",
                    error,
                ]);
                Base.logError(...commonLogs, "ERROR", error);
            }
        } catch (error) {
            Base.logError(...commonLogs, "ERROR", error);
        }

        return printedResp;
    }

    static async fetchRetries(request) {
        const retryTimes = await Base.getJsonStorage(
            `${chrome.runtime.id}Options`,
            ["retryTimes"]
        );
        const retryInterval = await Base.getJsonStorage(
            `${chrome.runtime.id}Options`,
            ["retryInterval"]
        );
        const retryCodes = await Base.getJsonStorage(
            `${chrome.runtime.id}Options`,
            ["retryCodes"]
        );

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
        Base.logInfo("JS navitve fetching JSON file", jsonPath);

        const response = await fetch(jsonPath);
        const json = await response.json();
        Base.logInfo("Json", json);

        return json;
    }

    static async getJsonContent(jsonPath) {
        Base.logInfo("JQuery getting JSON file", jsonPath);

        const json = await $.getJSON(jsonPath, (data) => {
            Base.logInfo("Json", data);
        }).fail((err) => {
            Base.logError("Error occurred", err);
        });

        return json;
    }

    static async getUrlContent(url) {
        Base.logInfo("JQuery getting URL content", url);

        const content = await $.get(url, (data) => {
            Base.logInfo("Content", data.slice(0, 500));
        }).fail((err) => {
            Base.logError("Error occurred", err);
        });

        return content;
    }

    static async getCookie(cookieDetails) {
        const cookie = await chrome.cookies.get(cookieDetails);

        if (cookie !== null && cookie != undefined && cookie.value) {
            Base.logDebug("Found cookie", cookieDetails, cookie.value);
            return cookie.value;
        }

        Base.logDebug("Cookie not found!!", cookieDetails);
    }

    static async getCookies(cookieDetails, filters = {}) {
        // filters = { domain: "xxx" }

        let cookies = await chrome.cookies.getAll(cookieDetails);

        if (cookies !== null && cookies != undefined) {
            Base.logDebug("Found raw cookies", cookieDetails, cookies);

            cookies = cookies.filter((c) => {
                let rt = true;

                for (const key of Object.keys(filters)) {
                    rt = rt && filters[key] && filters[key].includes(c[key]);
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
        // filters = { domain: "xxx" }

        const cookies = await Base.getCookies(cookieDetails, filters);
        Base.logInfo(
            "Going to remove cookies",
            cookieDetails,
            filters,
            cookies
        );

        let removeResults = [];
        for (const cookie of cookies) {
            let details = {
                // In case of partitioned cookie, cookieDetails will not have url, then use filter.domain
                url: cookieDetails.url || filters.domain,
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
        // filters = { domain: "xxx" }

        const cookies = await Base.getCookies(cookieDetails, filters);

        const cookieString = cookies
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

        return cookieString;
    }

    static async updateCookieString(cookieStorageKey, setCookies) {
        let cookieString = (await Base.getStorage(cookieStorageKey)) || "";

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
                const [foundCookie] = setCookies.filter(
                    (c) => c.name === storageCookie.name
                );
                if (foundCookie) {
                    storageCookie.value = foundCookie.value;
                }
            });

            cookieString = storageCookies
                .map((c) => `${c.name}=${c.value}`)
                .join("; ");

            Base.logWarn(
                `Updating cookie string... ${cookieStorageKey}=${cookieString}`
            );
            await Base.setStorage(cookieStorageKey, cookieString);
        }

        return cookieString;
    }

    static async openThenCloseLoadedTab(
        url,
        isWaiting = false,
        isActive = false
    ) {
        Base.logInfo("Opening URL...", url);
        const activeTab = await Base.getActiveTab();

        const createdTab = await Base.#createBrowserTab({
            url: url,
            active: isActive,
            index: parseInt(activeTab.index) + 1,
        });

        await Base.setStorage(createdTab.id, false);
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (
                createdTab.id === tabId &&
                changeInfo.status === "complete" &&
                tab.url.includes(url)
            ) {
                await Base.setStorage(createdTab.id, true);
                await chrome.tabs.remove(createdTab.id);
            }
        });

        if (isWaiting) {
            await Base.waitUntil(
                async (tabId) => {
                    const isTabClosed = await Base.getStorage(tabId);
                    return {
                        isStopped:
                            isTabClosed === undefined ? true : isTabClosed,
                    };
                },
                500,
                30000,
                createdTab.id
            );
        }
    }

    static async openNewTab(url, isActive = false) {
        Base.logInfo("Opening URL...", url);
        const activeTab = await Base.getActiveTab();

        await Base.#createBrowserTab({
            url: url,
            active: isActive,
            index: parseInt(activeTab.index) + 1,
        });
    }

    static async #createBrowserTab(createProperties) {
        const promise = await new Promise((resolve, reject) => {
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
        const [activeTab] = await Base.#queryBrowserTabs({
            active: true,
            currentWindow: true,
        });
        Base.logDebug("ActiveTab", activeTab);

        return activeTab;
    }

    static async getCurrentTab() {
        const promise = await new Promise((resolve, reject) => {
            chrome.tabs.getCurrent((tab) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(tab);
            });
        });

        return promise;
    }

    static async #queryBrowserTabs(queryInfo) {
        const promise = await new Promise((resolve, reject) => {
            chrome.tabs.query(queryInfo, (tabs) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(tabs);
            });
        });

        return promise;
    }

    static flattenJSON(obj = {}, res = {}, extraKey = "") {
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
                Base.flattenJSON(obj[key], res, `${extraKey}${key}.`);
            }
        }
        return res;
    }

    static compareTwoJsonObjects(jsonA, jsonB) {
        // objects are equals
        // const y = { a: "1", b: "2" };
        // const x = { b: "2", a: "1" };

        // const a = Common.flattenJSON(x);
        // const b = Common.flattenJSON(y);

        // Common.logWarn("a", a, "b", b);
        // Common.logWarn("a === b", a === b); // false

        // const result = Common.compareTwoJsonObjects(x, y);
        // Common.logWarn("result", result); // true

        const flattenJsonA = Base.flattenJSON(jsonA);
        const sortObjectA = Base.sortObject(flattenJsonA);

        const flattenJsonB = Base.flattenJSON(jsonB);
        const sortObjectB = Base.sortObject(flattenJsonB);

        return JSON.stringify(sortObjectA) === JSON.stringify(sortObjectB);
    }

    static sortObject(obj) {
        return Object.keys(obj)
            .sort()
            .reduce((r, k) => ((r[k] = obj[k]), r), {});
    }

    static filterJsonByKeys(obj = {}, keyList = []) {
        // keyList --- list of keys to keep in obj
        for (let key in obj) {
            if (!Array.isArray(obj) && !keyList.includes(key)) {
                delete obj[key];
            } else {
                if (typeof obj[key] === "object") {
                    Base.filterJsonByKeys(obj[key], keyList);
                }
            }
        }
        return obj;
    }

    static encodeUriBase64(str) {
        return btoa(encodeURI(str));
    }

    static decodeUriBase64(str) {
        return decodeURI(atob(str));
    }

    static copyTextToClipboard(selector) {
        let copyText = document.querySelector(selector);

        copyText.select();
        /* For mobile devices */
        copyText.setSelectionRange(0, 99999);

        navigator.clipboard.writeText(copyText.value);
    }

    static async extSendMessageToBrowserTab(tabId, msgObj) {
        Base.logInfo("Sending", msgObj, "to browser tab", tabId);

        try {
            const promise = await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tabId, msgObj, (response) => {
                    Base.logWarn("Response from browser tab", response);

                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }
                    resolve(response);
                });
            });
            return promise;
        } catch (err) {
            Base.logError("Sending Tab Error", err);
        }
    }

    static async tabSendMessageToBackground(msgObj) {
        Base.logInfo("Sending", msgObj, "to background");

        try {
            const promise = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(msgObj, (response) => {
                    Base.logWarn("Response from background", response);

                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }
                    resolve(response);
                });
            });
            return promise;
        } catch (err) {
            Base.logError("Sending Background Error", err);
        }
    }

    static async delayTime(ms) {
        return new Promise((res) => {
            setTimeout(res, ms);
            Base.logInfo(`wait for ${ms} ms...`);
        });
    }

    static async waitUntil(
        stopConditionFunc,
        retryInterval = 500,
        timeoutMilis = 30000,
        ...args
    ) {
        if (retryInterval === 0) {
            retryInterval = await Base.getJsonStorage(
                `${chrome.runtime.id}Options`,
                ["retryInterval"]
            );
        }

        let result;
        let isStopped = false;

        const maxChecks = parseInt(timeoutMilis / retryInterval);
        for (let index = 0; index < maxChecks; index++) {
            result = await stopConditionFunc(...args);
            Base.logDebug(
                "[waitUntil]",
                stopConditionFunc.name,
                "params",
                args,
                "RETURNED",
                result,
                "...CHECKING !!!"
            );
            isStopped = result.isStopped;

            if (isStopped) {
                Base.logDebug(
                    "[waitUntil]",
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
                "[waitUntil]",
                stopConditionFunc.name,
                "params",
                args,
                "RETURNED",
                result,
                "...STILL CHECKING !!! BUT Max check times reached !!! GIVE UP !!!"
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

    static downloadJsonFile(fileName, json) {
        const textContent = URL.createObjectURL(
            new Blob([Base.jsonToString(json, true)], {
                type: "application/json",
            })
        );

        Base.#downloadFileContent(fileName, textContent);
    }

    static downloadTextFile(fileName, text) {
        const textContent = "data:text/plain;charset=utf-8," + text;
        Base.#downloadFileContent(fileName, textContent);
    }

    static downloadCsvFile(fileName, rows) {
        // each row in CSV file is an array of cells
        Base.logInfo("Downloading csv file rows", rows);

        const csvContent =
            "data:application/csv;charset=utf-8," +
            rows.map((e) => e.join(",")).join("\n");

        Base.#downloadFileContent(fileName, csvContent);
    }

    static #downloadFileContent(fileName, fileContent) {
        const encodedUri = encodeURI(fileContent);

        let link = document.createElement("a");
        link.style.display = "none";

        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);

        // Required for FF
        document.body.appendChild(link);

        link.click();
        link.remove();
    }

    static async chromeDownloadFiles(urls, filename = "") {
        let downloadInfos = [];

        for (const url of urls) {
            const partialFilePath =
                filename || `${chrome.runtime.id}/${url.split("/").pop()}`;

            const downloadId = await chrome.downloads.download({
                url: url,
                filename: partialFilePath,
                conflictAction: "overwrite",
            });

            downloadInfos.push({
                url: url,
                filename: partialFilePath,
                downloadId: downloadId,
            });
        }

        Base.logInfo("downloadInfos", downloadInfos);
        return downloadInfos;
    }
}
