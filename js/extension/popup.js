import { Common } from "../base/common.js";

$(document).ready(async () => {
    await Popup.popupPageStartupHandler();

    $("#exportChromeStorage").click(async () => {
        Popup.exportLocalStorageHandler();
    });

    $("#getStorageKeys").click(async () => {
        let localStorage = await Common.getStorages(null);
        Common.logInfo("localStorage keys", Object.keys(localStorage));
        Common.logInfo("localStorage", localStorage);

        let storageKeys = $("#storageKeys").val().split(",").filter(Boolean);
        let values = await Common.getStorages(storageKeys);
        Common.logInfo("Get storage...", storageKeys, values);
    });

    $("#removeStorage").click(async () => {
        let storageKeys = $("#storageKeys").val().split(",").filter(Boolean);
        Common.confirmAlert(
            `Are you sure you want to remove storage with keys = ${storageKeys}?`
        );

        Common.logInfo("storageKeys", storageKeys);
        await Common.removeStorage(storageKeys);
    });

    $("#urlsCurrentWindow").click(async () => {
        let currentWindowTabs = await Popup.getUrlsOnCurrentWindow();
        $("#links").val(currentWindowTabs.map((t) => t.url).join("\n"));
    });

    $("#urlsAllWindows").click(async () => {
        let allWindowsTabs = await Popup.getUrlsOnAllWindows();
        $("#links").val(allWindowsTabs.map((t) => t.url).join("\n"));
    });

    $("#openTabs").click(async () => {
        let urls = $("#links")
            .val()
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean);

        for (let url of urls) {
            await chrome.tabs.create({
                url: url,
                active: false,
            });
            await Common.delayTime(1000);
        }
    });

    $("#copy").click(async () => {
        Common.copyTextToClipboard("#links");
        Common.displayUiAlert("Links copied to Clipboard.");
    });

    $("#clear").click(async () => {
        $("#links").val("");
        $("#linkList").val("W10=");
    });

    $("#createList").click(async () => {
        await Popup.createNewListHandler();
    });

    $("#editList").click(async () => {
        await Popup.editExistingListHandler();
    });

    $("#deleteList").click(async () => {
        await Popup.deleteExistingList();
    });

    $("#closeTabs").click(async () => {
        let links = $("#links")
            .val()
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean);
        let tabs = await chrome.tabs.query({});

        tabs.forEach(async (tab) => {
            if (links.includes(tab.url)) {
                await chrome.tabs.remove(tab.id);
                await Common.delayTime(1000);
            }
        });
    });

    $("#linkList").on("input", async () => {
        let selectedList = $("#linkList option:selected").text();
        await Common.setStorage("selectedList", selectedList);
        await Popup.getLinksFromSelectedList(selectedList);
    });
});

export class Popup {
    // Handlers
    static async popupPageStartupHandler() {
        let linkList = await Common.getStorage("linkList");
        Common.logInfo("linkList", linkList);

        if (linkList === undefined || linkList === "undefined") {
            await Common.setStorage("linkList", []);
        }
        await Popup.loadLinkListFromStorage();

        let selectedList = await Common.getStorage("selectedList");
        await Popup.getLinksFromSelectedList(selectedList);

        let fieldConfigs = [
            {
                type: "input",
                handler: Common.inputChangedHandler,
                fields: [{ id: "storageKeys", default: "" }],
            },
        ];
        Common.configDataFields(fieldConfigs);
    }

    static async exportLocalStorageHandler() {
        Common.confirmAlert("Are you sure you want to export local storage?");

        let fullLocalStorage = await Common.getStorages(null);
        Common.logInfo("fullLocalStorage", fullLocalStorage);

        await Popup.#download(
            "ankiflash_storage.json",
            JSON.stringify(fullLocalStorage, null, "  ")
        );
    }

    static async createNewListHandler() {
        let listNames = await Popup.loadLinkListFromStorage();
        let urls = $("#links")
            .val()
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean);

        let listName = $("#listName").val();
        if (listName.trim() === "") {
            Common.displayUiAlert(
                "List name cannot be empty! Please choose another name!",
                false
            );
            return;
        } else if (listNames.includes(listName)) {
            Common.displayUiAlert(
                "List name already exist! Please choose another name!",
                false
            );
            return;
        } else if (urls.length === 0) {
            Common.displayUiAlert(
                "No URL to add into a list! Please check input value!",
                false
            );
            return;
        }

        let urlsStr = $("#links")
            .val()
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean)
            .join('","');
        let linkListObj = JSON.parse(`{"${listName}": ["${urlsStr}"] }`);

        let currentLinkList = await Common.getStorage("linkList");
        currentLinkList.push(linkListObj);
        await Common.setStorage("linkList", currentLinkList);

        await Popup.loadLinkListFromStorage(listName);
        Common.displayUiAlert(`List name "${listName}" created.`);
    }

    static async editExistingListHandler() {
        let selectedListName = $("#linkList option:selected").text();
        if (selectedListName === "Choose A List") {
            Common.displayUiAlert(
                "Please choose a valid list to update.",
                false
            );
            return;
        }

        let linkList = await Common.getStorage("linkList");
        // delete selected list first
        linkList = linkList.filter(
            (list) => Object.keys(list)[0] !== selectedListName
        );
        // add new list with the same selected name
        let urlsStr = $("#links")
            .val()
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean)
            .join('","');

        let linkListObj = JSON.parse(
            `{"${selectedListName}": ["${urlsStr}"] }`
        );
        linkList.push(linkListObj);
        await Common.setStorage("linkList", linkList);

        await Popup.loadLinkListFromStorage(selectedListName);
        Common.displayUiAlert(`List name "${selectedListName}" updated.`);
    }

    static async deleteExistingList() {
        let selectedList = $("#linkList option:selected").text();
        if (selectedList === "Choose A List") {
            Common.displayUiAlert(
                "Please choose a valid list to delete.",
                false
            );
            return;
        }

        let linkList = await Common.getStorage("linkList");
        // filter out the selected list name
        linkList = linkList.filter(
            (list) => Object.keys(list)[0] !== selectedList
        );
        await Common.setStorage("linkList", linkList);

        await Popup.loadLinkListFromStorage();
        Common.displayUiAlert(`List name "${selectedList}" deleted.`);
    }

    // Basic functions
    static async getLinksFromSelectedList(selectedList) {
        Common.logInfo("selectedList", selectedList);
        if (!selectedList || selectedList === "Choose A List") {
            return;
        }

        let linkList = await Common.getStorage("linkList", true);
        Common.logInfo("linkList", linkList);

        let [links] = linkList.filter(
            (list) => Object.keys(list)[0] === selectedList
        );
        Common.logInfo("links", links[selectedList]);

        $("#links").val(links[selectedList].join("\n"));

        $.each($("#linkList option"), async (i, opt) => {
            if ($(opt).text() === selectedList) {
                $(opt).prop("selected", true);
                return;
            }
        });
    }

    static async #download(filename, text) {
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

    static async loadLinkListFromStorage(selectedListName = "") {
        $("#linkList").find("option").remove();
        $("<option/>").val("W10=").html("Choose A List").appendTo("#linkList");

        let listNames = [];
        let selectedListVal = "";

        let linkList = await Common.getStorage("linkList", true);
        await linkList.forEach(async (list) => {
            let listName = Object.keys(list)[0];
            listNames.push(listName);

            $("<option/>")
                .val(btoa(JSON.stringify(list[listName])))
                .html(listName)
                .appendTo("#linkList");

            if (selectedListName === listName) {
                selectedListVal = btoa(JSON.stringify(list[listName]));
            }
        });

        if (selectedListVal !== "") {
            $(`#linkList option[value='${selectedListVal}']`).attr(
                "selected",
                "selected"
            );
        }

        return listNames;
    }

    static async getUrlsOnCurrentWindow() {
        let tabs = await chrome.tabs.query({ currentWindow: true });
        Common.logInfo("tabs from current window", tabs);

        return tabs;
    }

    static async getUrlsOnAllWindows() {
        let tabs = await chrome.tabs.query({});
        Common.logInfo("all tabs from all windows", tabs);

        return tabs;
    }
}
