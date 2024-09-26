import { Constant } from "./constant.js";

export class Common extends Constant {
    static UI_FIELDS = {};

    static addHyperLink(params) {
        params.fieldId = params.fieldId || "";
        params.className = params.className || "";
        Common.requiredField(params.innerHTML, "params.innerHTML");
        Common.requiredField(params.hyperLink, "params.hyperLink");

        let aElement = document.createElement("a");
        aElement.className = params.className;
        aElement.innerHTML = params.innerHTML;
        aElement.setAttribute("href", params.hyperLink);
        aElement.setAttribute("target", "_blank");

        aElement.style.fontWeight = "bold";
        aElement.style.margin = "10px 20px 10px 20px";
        aElement.style.cursor = "pointer";
        aElement.style.display = "block";

        if (params.fieldId) {
            document.getElementById(`#${params.fieldId}`).appendChild(aElement);
        } else {
            document.body.firstElementChild.appendChild(aElement);
        }
    }

    static addImage(params) {
        params.fieldId = params.fieldId || "";
        params.className = params.className || "";
        Common.requiredField(params.caption, "params.caption");
        Common.requiredField(params.imgSrc, "params.imgSrc");

        let divCon = document.createElement("div");
        divCon.className = params.className;
        divCon.style.display = "inline";

        let span = document.createElement("span");
        span.innerHTML = params.caption;
        span.className = params.className;
        span.style.color = "DarkOrange";
        divCon.appendChild(span);

        let img = new Image();
        img.src = params.imgSrc;
        img.className = params.className;
        img.style.background = "white";
        img.style.marginBottom = "10px";
        divCon.appendChild(img);

        if (fieldId) {
            document.getElementById(`#${fieldId}`).appendChild(divCon);
        } else {
            document.body.firstElementChild.appendChild(divCon);
        }
    }

    static removeElements(selector) {
        const tags = document.body.querySelectorAll(selector);
        tags.forEach((tag) => tag.remove());
    }

    static async screenshotActiveTab() {
        const activeTab = await Common.getActiveTab();

        const shotContent = await chrome.tabs.captureVisibleTab(
            activeTab.windowId,
            {
                format: "jpeg",
            }
        );

        const suffix = Common.getJsonDate({
            offsetDate: 0,
            separator: "_",
            timezone: +7,
            onlyDate: false,
        })
            .replaceAll(":", "_")
            .replaceAll(".", "_");

        await Common.chromeDownloadFiles(
            [shotContent],
            `Ankiflash_Screenshots/Chrome_Screenshot_${suffix}.JPEG`
        );
    }

    static convertTimestampToDate(timestamp, timezone) {
        // timezone = "+8";

        let date = new Date(timestamp);
        Common.logDebug("Localtime", date.toLocaleString());

        let localTimezone = (-1 * date.getTimezoneOffset()) / 60;
        Common.logDebug("Localtimezone", localTimezone);

        date.setHours(date.getHours() - localTimezone);
        date.setHours(date.getHours() + parseInt(timezone));
        Common.logDebug("Zonetime", date.toLocaleString());

        return date;
    }

    static convertTimestampToZonestamp(timestamp, timezone) {
        // timezone = "+8";

        const date = Common.convertTimestampToDate(timestamp, timezone);
        Common.logDebug("Zonestamp", date.getTime());

        return date.getTime();
    }

    static async bootsAlert(params) {
        params.isSuccess = params.isSuccess || true;
        params.fieldId = params.fieldId || "alert";
        params.timeout = params.timeout || 5;
        Common.requiredField(params.message, "params.message");

        if (params.isSuccess) {
            $(`#${params.fieldId}`).attr("class", "alert alert-success");
        } else {
            $(`#${params.fieldId}`).attr("class", "alert alert-danger");
        }

        $(`#${params.fieldId}`).html(params.message);
        $(`#${params.fieldId}`).attr("style", "display: block;");

        await Common.delayTime(params.timeout * 1000);
        $(`#${params.fieldId}`).attr("style", "display: none;");
    }

    static #getFieldType(fieldId) {
        const tagName =
            $(`#${fieldId}`).prop("tagName") ||
            $(`[name='${fieldId}']`).prop("tagName");
        const type =
            $(`#${fieldId}`).prop("type") ||
            $(`[name='${fieldId}']`).prop("type");

        let fieldType = "TEXTBOX";
        if (tagName === "SELECT") {
            fieldType = "DROPDOWN";
        }
        if (tagName === "INPUT" && type === "checkbox") {
            fieldType = "CHECKBOX";
        }
        if (tagName === "INPUT" && type === "radio") {
            fieldType = "RADIO";
        }
        Common.logDebug(`Field ${fieldId} type is ${fieldType}`);

        return fieldType;
    }

    static async configUniversalFields(configs) {
        for (const config of configs) {
            for (let field of config.fields) {
                field.handler = field.handler || config.handler;
                field.isStartupHandler =
                    field.isStartupHandler || config.isStartupHandler || true;

                field.options = field.options || config.options;
                field.isStorageOptions =
                    field.isStorageOptions || config.isStorageOptions || true;

                field.type = Common.#getFieldType(field.id);
                field.autocomplete =
                    field.autocomplete || config.autocomplete || false;
                field.triggers = field.triggers || config.triggers || [];

                Common.UI_FIELDS[`${field.id}Config`] = field;
            }
        }

        for (const [_, field] of Object.entries(Common.UI_FIELDS)) {
            for (let trigger of field.triggers) {
                trigger.optionsIndex = Object.keys(trigger).indexOf("options");
                trigger.handlerIndex = Object.keys(trigger).indexOf("handler");

                const triggerField = Common.UI_FIELDS[`${trigger.id}Config`];
                trigger.field = triggerField;
            }
        }

        for (const [_, field] of Object.entries(Common.UI_FIELDS)) {
            Common.logWarn("Init field config", field);

            // init options (before init value)
            await Common.#configFieldOptions(field);

            // init value (have to be later than init options)
            let fieldValue = await Common.getTabStorage(field.id);
            if (fieldValue === undefined) {
                fieldValue = field.default;
            }
            await Common.setFieldValue(field.id, fieldValue);

            // init handler
            switch (field.type) {
                case "CHECKBOX":
                    $(`#${field.id}`).click(async () => {
                        await field.handler({
                            data: { fieldId: field.id },
                        });
                        await Common.#configFieldTriggers(field.triggers);
                    });
                    break;
                case "RADIO":
                    await $(`input[name='${field.id}']`).change(async () => {
                        await field.handler({
                            data: { fieldId: field.id },
                        });
                        await Common.#configFieldTriggers(field.triggers);
                    });
                    break;
                default:
                    $(`#${field.id}`).on("input", async () => {
                        await field.handler({
                            data: { fieldId: field.id },
                        });
                        await Common.#configFieldTriggers(field.triggers);
                    });
                    break;
            }

            // startup handler
            if (field.isStartupHandler) {
                await field.handler({ data: { fieldId: field.id } });
            }
        }
    }

    static async #configFieldOptions(source) {
        if (Array.isArray(source.options)) {
            await Common.#setFieldOptions(source.id, source.options);
        } else if (source.options) {
            let optionsKey = `${source.id}Options`;
            let storageOptions = await Common.getTabStorage(optionsKey);

            let createdKey = `${source.id}OptionsCreated`;
            let created = await Common.getTabStorage(createdKey);

            if (
                !storageOptions ||
                source.isStorageOptions ||
                // refresh options list after one day
                Date.now() - created > 24 * 60 * 60 * 1000
            ) {
                storageOptions = await source.options({
                    data: { fieldId: source.id },
                });
                await Common.setTabStorage(optionsKey, storageOptions);
                await Common.setTabStorage(createdKey, Date.now());
            }
            await Common.#setFieldOptions(source.id, storageOptions);
        }
    }

    static async #configFieldTriggers(triggers) {
        for (const trigger of triggers) {
            if (trigger.handlerIndex < trigger.optionsIndex) {
                if (trigger.handler) {
                    await trigger.field.handler({
                        data: { fieldId: trigger.id },
                    });
                }
                if (trigger.options) {
                    await Common.#configFieldOptions(trigger.field);
                }
            } else {
                if (trigger.options) {
                    await Common.#configFieldOptions(trigger.field);
                }
                if (trigger.handler) {
                    await trigger.field.handler({
                        data: { fieldId: trigger.id },
                    });
                }
            }
        }
    }

    static async #autoCompleteFieldHandler(input, fieldId) {
        Common.logInfo("Autocomplete field value changed", fieldId, input);

        if (input !== undefined && input.length >= 3) {
            let histories =
                (await Common.getTabStorage(`${fieldId}-history`)) || [];

            histories = histories.reverse();
            if (!histories.includes(input) && input !== undefined) {
                histories.push(input);
            }

            if (histories.length > 100) {
                histories = histories.slice(
                    histories.length - 100,
                    histories.length
                );
            }
            histories = histories.reverse();
            await Common.setTabStorage(`${fieldId}-history`, histories);
        }

        let histories =
            (await Common.getTabStorage(`${fieldId}-history`)) || [];
        await Common.#createAutoCompleteField(fieldId, histories);
    }

    static async #createAutoCompleteField(fieldId, source) {
        Common.logInfo("Create autocomplete field", fieldId, source);

        $(`#${fieldId}`)
            .autocomplete({
                minLength: 0,
                source: source,
                select: async (event, ui) => {
                    $(`#${fieldId}`).val(ui.item.label);
                    await Common.setTabStorage(fieldId, ui.item.label);
                    Common.logInfo(`Autocomplete '${fieldId}'`, ui.item);
                },
            })
            .on("focus", async () => {
                $(`#${fieldId}`).autocomplete("search", $(`#${fieldId}`).val());
            })
            .on("blur", async () => {
                $(`#${fieldId}`).val(await Common.getTabStorage(fieldId));
            });
    }

    static async #setFieldOptions(fieldId, options) {
        if (options.length === 0) {
            options = [{ value: "Not Available", text: "Not Available" }];
            await Common.setFieldValue(fieldId, undefined);
            Common.disableElement(`#${fieldId}`);
        } else {
            let storageValue = await Common.getTabStorage(fieldId);
            if (
                !options
                    .map((o) => String(o.value))
                    .includes(String(storageValue))
            ) {
                storageValue = options[options.length - 1].value;
            }
            await Common.setFieldValue(fieldId, storageValue);
            Common.enableElement(`#${fieldId}`);
        }

        $(`#${fieldId}`).find("option").remove();
        for (const option of options) {
            $("<option/>")
                .val(option.value)
                .html(option.text)
                .appendTo(`#${fieldId}`);
        }
    }

    static async inputChangedHandler(event) {
        const fieldId = event.data.fieldId;
        Common.logWarn(`Field '${fieldId}' input changed`);

        let input;
        const fieldType = Common.#getFieldType(fieldId);
        switch (fieldType) {
            case "CHECKBOX":
                input = $(`#${fieldId}`).prop("checked");
                break;
            case "RADIO":
                input = $(`input[name='${fieldId}']:checked`).val();
                break;
            case "DROPDOWN":
                input = $(`#${fieldId} option:selected`).val();
                break;
            default:
                input = $(`#${fieldId}`).val();
                break;
        }
        await Common.setTabStorage(fieldId, input);
        Common.logInfo(
            `[inputChangedHandler] Set storage... [${fieldId}] [${input}]`
        );

        let output = await Common.getTabStorage(fieldId);
        Common.logDebug(
            `[inputChangedHandler] Get storage... [${fieldId}] [${output}]`
        );

        const field = Common.UI_FIELDS[`${fieldId}Config`];
        if (field.autocomplete) {
            await Common.#autoCompleteFieldHandler(input, fieldId);
        }

        return input;
    }

    static async setFieldValue(fieldId, value) {
        const fieldType = Common.#getFieldType(fieldId);
        switch (fieldType) {
            case "CHECKBOX":
                $(`#${fieldId}`).prop("checked", value);
                break;
            case "RADIO":
                $(`input[name='${fieldId}'][value='${value}']`).click();
                break;
            default:
                await $(`#${fieldId}`).val(value);
                break;
        }

        Common.logInfo(
            `[setFieldValue] Set storage... [${fieldId}] [${value}]`
        );

        await Common.setTabStorage(fieldId, value);
        $(`#${fieldId}`).trigger("input");
    }

    static async presetOptions(
        jsonPath = "../../data/default-options.json",
        storageConfigName = "ankiflashOptions"
    ) {
        Common.logInfo(`Loading config file ${jsonPath} into the storage...`);
        let jsonConfig = await Common.fetchJsonContent(jsonPath);
        await Common.setStorage(storageConfigName, jsonConfig);
    }

    static async blockTraffics() {
        let isBlocked = await Common.getJsonStorage("ankiflashOptions", [
            "traffic",
            "isBlocked",
        ]);

        let trafficUrls = await Common.getJsonStorage("ankiflashOptions", [
            "traffic",
            "baseUrls",
        ]);

        trafficUrls.forEach(async (domain) => {
            if (isBlocked) {
                let ruleId = Common.randomInt(1000, 99999999);
                Common.logInfo("Add blocking rules", domain, ruleId);

                chrome.declarativeNetRequest.updateDynamicRules({
                    addRules: [
                        {
                            id: ruleId,
                            priority: 1,
                            action: { type: "block" },
                            condition: {
                                urlFilter: `${domain}/*`,
                                resourceTypes: ["main_frame", "sub_frame"],
                            },
                        },
                    ],
                });

                Common.logInfo(`Query existing tabs *://*.${domain}/*`);
                let tabs = await chrome.tabs.query({
                    url: `*://*.${domain}/*`,
                });

                Common.logInfo("Closing existing tabs", tabs);
                chrome.tabs.remove(tabs.map((t) => t.id));
            }
        });
    }

    static async clearNetworkRules() {
        const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
        Common.logInfo("currentRules", currentRules);

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: currentRules.map((rule) => rule.id),
        });
    }

    static async setCookie(ruleId, cookieKey, baseUrl, extraCookies = []) {
        let cookieString = await Common.getTabStorage(cookieKey);

        if (extraCookies.length > 0) {
            let extraCookieString = extraCookies
                .map((c) => `${c.name}=${c.value}`)
                .join("; ");
            cookieString = `${extraCookieString}; ${cookieString}`;
        }

        Common.logInfo("Setting cookie", {
            cookieKey: cookieKey,
            baseUrl: baseUrl,
            cookieString: cookieString,
        });

        let addRules = [];
        if (cookieString) {
            let addRule = {
                id: ruleId,
                priority: 1,
                action: {
                    type: "modifyHeaders",
                    requestHeaders: [
                        {
                            header: "cookie",
                            operation: "set",
                            value: cookieString,
                        },
                    ],
                },
                condition: {
                    urlFilter: `${baseUrl}/*`,
                },
            };

            if (baseUrl.includes("thub")) {
                addRule.condition.domainType = "thirdParty";
            }

            addRules.push(addRule);
        }

        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [ruleId],
            addRules: addRules,
        });
    }
}
