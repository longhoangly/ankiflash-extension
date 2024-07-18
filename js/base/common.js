import { Constant } from "./constant.js";

export class Common extends Constant {
    static addHyperLink(innerHTML, hyperLink) {
        let divShipment = document.createElement("a");
        divShipment.className = "removeId";
        divShipment.innerHTML = innerHTML;
        divShipment.setAttribute("href", hyperLink);
        divShipment.setAttribute("target", "_blank");
        divShipment.style.fontWeight = "bold";
        divShipment.style.margin = "10px 20px 10px 20px";
        divShipment.style.cursor = "pointer";
        divShipment.style.display = "block";
        document.body.firstElementChild.appendChild(divShipment);
    }

    static addImage(caption, imgSrc) {
        let divCon = document.createElement("div");
        divCon.className = "removeId";
        divCon.style.display = "inline";

        let span = document.createElement("span");
        span.innerHTML = caption;
        span.className = "img_label removeId";
        span.style.color = "DarkOrange";
        divCon.appendChild(span);

        let img = new Image();
        img.src = imgSrc;
        img.className = "ship_img_scan removeId";
        img.style.background = "white";
        img.style.marginBottom = "10px";
        divCon.appendChild(img);

        document.body.firstElementChild.appendChild(divCon);
    }

    static removeElements(selector = ".removeId") {
        let tags = document.body.querySelectorAll(selector);
        tags.forEach((tag) => tag.remove());
    }

    static async forceRefreshOptions(fieldId) {
        await Common.setStorage(`${fieldId}OptionsIsForced`, true);
    }

    static async convertTimestampToZoneTime(timestamp) {
        console.debug("local stamp", timestamp);

        let date = new Date(timestamp);
        console.debug("localTime", date.toLocaleString());

        let localTimezone = (-1 * date.getTimezoneOffset()) / 60;
        console.debug("localOffset", localTimezone);

        let timezoneStr = await Common.getStorage("timezone");
        let timezone = parseInt(timezoneStr);
        console.debug("zoneOffset", timezone);

        date.setHours(date.getHours() - localTimezone);
        date.setHours(date.getHours() + timezone);
        console.debug("zoneTime", date.toLocaleString());

        return date;
    }

    static async convertTimestampToZoneStamp(timestamp) {
        let date = await Common.convertTimestampToZoneTime(timestamp);
        console.debug("zone stamp", date.getTime());
        return date.getTime();
    }

    static async alertHtml(
        message,
        isSuccess = true,
        uiId = "alert",
        timeout = 5
    ) {
        if (isSuccess) {
            $(`#${uiId}`).attr("class", "alert alert-success");
        } else {
            $(`#${uiId}`).attr("class", "alert alert-danger");
        }

        $(`#${uiId}`).html(message);
        $(`#${uiId}`).attr("style", "display: block;");

        await Common.delayTime(timeout * 1000);
        $(`#${uiId}`).attr("style", "display: none;");
    }

    static async configDataFields(fieldConfigs) {
        for (const config of fieldConfigs) {
            for (const field of config.fields) {
                let value = await Common.#configFieldHandler(config, field);
                if (field.autocomplete) {
                    Common.#addOptionAutoCompleteField(value, field.id);
                    Common.AUTO_COMPLETE_FIELD_IDS.push(field.id);
                }

                await Common.#popuplateDataOptions(
                    config,
                    field.id,
                    config.forceGetOptions
                );
                Common.#configFieldTriggers(config, field, fieldConfigs);
                Common.#configFieldOptionsTriggers(config, field, fieldConfigs);
            }
        }
    }

    static async #popuplateDataOptions(config, fieldId, force = false) {
        if (config.options != undefined && Array.isArray(config.options)) {
            if (config.options.length === 0) {
                let noOptionsString = "No Optionsss";
                await Common.#setFieldOptions(fieldId, [
                    { value: noOptionsString, text: noOptionsString },
                ]);
                await Common.setFieldValue(fieldId, noOptionsString);
            } else {
                await Common.#setFieldOptions(fieldId, config.options);
                let storageValue = await Common.getStorage(fieldId);

                if (
                    !config.options
                        .map((o) => String(o.value))
                        .includes(String(storageValue))
                ) {
                    storageValue =
                        config.options.length > 0
                            ? config.options[config.options.length - 1].value
                            : "";
                }
                await Common.setFieldValue(fieldId, storageValue);
            }
        } else if (config.options != undefined) {
            let optionsKey = `${fieldId}Options`;
            let createdKey = `${fieldId}OptionsCreated`;
            let forceKey = `${fieldId}OptionsIsForced`;

            let storageOptions = await Common.getStorage(optionsKey);
            let created = await Common.getStorage(createdKey);
            let forceRefreshOptions = await Common.getStorage(forceKey);

            if (
                force ||
                forceRefreshOptions ||
                storageOptions === undefined ||
                // refresh options list after one day
                Date.now() - created > 24 * 60 * 60 * 1000 // milis
            ) {
                storageOptions = await config.options(fieldId);
                await Common.setStorage(optionsKey, storageOptions);
                await Common.setStorage(createdKey, Date.now());
                await Common.setStorage(forceKey, false);
            }

            await Common.#popuplateDataOptions(
                { options: storageOptions },
                fieldId
            );
        }
    }

    // the field updates trigger its handler
    static async #configFieldHandler(config, field) {
        let handler = Common.inputChangedHandler;
        if (field.handler) {
            handler = field.handler;
        } else if (config.handler) {
            handler = config.handler;
        }
        Common.logInfo(
            `Mapping handler '${handler.name}' for field ${field.id}`
        );

        let value = await Common.getFieldValue(field.id, field.default);
        if (config.type === "input") {
            // INPUT or SELECT or TEXTAREA
            Common.logInfo(
                `Setting value '${value}' for INPUT field ${field.id}`
            );

            let tagName = $(`#${field.id}`).prop("tagName").toLowerCase();
            if (tagName === "textarea") {
                $(`#${field.id}`).html(value);
            } else {
                $(`#${field.id}`).val(value);
            }
            $(`#${field.id}`).on("input", { fieldId: field.id }, handler);
        } else if (config.type === "radio") {
            // RADIO
            Common.logInfo(
                `Setting value '${value}' for RADIO field ${field.id}`
            );

            await $(`input[name='${field.id}']`).change(
                { fieldId: field.id },
                handler
            );
            $(`input[name='${field.id}'][value='${value}']`).click();
        } else if (config.type === "checked") {
            // CHECKBOX
            Common.logInfo(
                `Setting value '${value}' for CHECKBOX field ${field.id}`
            );

            $(`#${field.id}`).prop("checked", value);
            $(`#${field.id}`).click({ fieldId: field.id }, handler);
        } else {
            throw new Error(`Field type ${config.type} is not supported!`);
        }

        if (config.isStartupTriggered || field.isStartupTriggered) {
            await handler({ data: { fieldId: field.id } });
        }

        return value;
    }

    // the field updates trigger other fields' handlers
    static async #configFieldTriggers(config, field, fieldConfigs) {
        let triggerHandlerIds =
            field.triggerHandlerIds || config.triggerHandlerIds;

        let triggers = [];
        if (triggerHandlerIds && triggerHandlerIds.length > 0) {
            Common.logWarn(
                `Field ${
                    field.id
                } will trigger updates for '${triggerHandlerIds.join(
                    ","
                )}' fields`
            );

            for (const triggerId of triggerHandlerIds) {
                let [triggerConfig] = fieldConfigs.filter((c) => {
                    return c.fields
                        .map((f) => {
                            return f.id;
                        })
                        .includes(triggerId);
                });

                let [triggerField] = triggerConfig.fields.filter((f) => {
                    return f.id === triggerId;
                });

                let triggerHandler = Common.inputChangedHandler;
                if (triggerField.handler) {
                    triggerHandler = triggerField.handler;
                } else if (triggerConfig.handler) {
                    triggerHandler = triggerConfig.handler;
                }

                triggers.push({
                    triggerId: triggerId,
                    triggerHandler: triggerHandler,
                });
            }
            Common.logWarn(field.id, "triggers", triggers);
        }

        for (const trigger of triggers) {
            Common.logWarn(
                `Changes from '${field.id}' triggers ${trigger.triggerHandler.name}`
            );

            let time = 0;
            if (config.type === "input") {
                // INPUT or SELECT or TEXTAREA
                $(`#${field.id}`).on("input", { fieldId: field.id }, () => {
                    // Reset the timer
                    clearTimeout(time);
                    time = setTimeout(() => {
                        // Enter code here or a execute function.
                        trigger.triggerHandler({
                            data: { fieldId: trigger.triggerId },
                        });
                    }, 100);
                });
            } else if (config.type === "radio") {
                // RADIO
                await $(`input[name='${field.id}']`).change(
                    { fieldId: field.id },
                    () => {
                        // Reset the timer
                        clearTimeout(time);
                        time = setTimeout(() => {
                            // Enter code here or a execute function.
                            trigger.triggerHandler({
                                data: { fieldId: trigger.triggerId },
                            });
                        }, 100);
                    }
                );
            } else if (config.type === "checked") {
                // CHECKBOX
                $(`#${field.id}`).click({ fieldId: field.id }, () => {
                    // Reset the timer
                    clearTimeout(time);
                    time = setTimeout(() => {
                        // Enter code here or a execute function.
                        trigger.triggerHandler({
                            data: { fieldId: trigger.triggerId },
                        });
                    }, 100);
                });
            } else {
                throw new Error(`Field type ${config.type} is not supported!`);
            }
        }
    }

    // the field updates trigger other field's options updates accordingly
    static async #configFieldOptionsTriggers(config, field, fieldConfigs) {
        let triggerOptionsIds =
            field.triggerOptionsIds || config.triggerOptionsIds;

        let triggers = [];
        if (triggerOptionsIds && triggerOptionsIds.length > 0) {
            Common.logWarn(
                `Field ${
                    field.id
                } will trigger updates for '${triggerOptionsIds.join(
                    ","
                )}' fields`
            );

            for (const triggerId of triggerOptionsIds) {
                let [triggerConfig] = fieldConfigs.filter((c) => {
                    return c.fields
                        .map((f) => {
                            return f.id;
                        })
                        .includes(triggerId);
                });

                triggers.push({
                    triggerId: triggerId,
                    triggerConfig: triggerConfig,
                });
            }
            Common.logWarn(field.id, "triggers", triggers);
        }

        for (const trigger of triggers) {
            Common.logWarn(
                `Changes from '${field.id}' triggers ${trigger.triggerId}`
            );

            let time = 0;
            if (config.type === "input") {
                // INPUT or SELECT or TEXTAREA
                $(`#${field.id}`).on("input", { fieldId: field.id }, () => {
                    // Reset the timer
                    clearTimeout(time);
                    time = setTimeout(async () => {
                        // Enter code here or a execute function.
                        await Common.#popuplateDataOptions(
                            trigger.triggerConfig,
                            trigger.triggerId,
                            true
                        );
                    }, 100);
                });
            } else if (config.type === "radio") {
                // RADIO
                await $(`input[name='${field.id}']`).change(
                    { fieldId: field.id },
                    () => {
                        // Reset the timer
                        clearTimeout(time);
                        time = setTimeout(async () => {
                            // Enter code here or a execute function.
                            await Common.#popuplateDataOptions(
                                trigger.triggerConfig,
                                trigger.triggerId,
                                true
                            );
                        }, 100);
                    }
                );
            } else if (config.type === "checked") {
                // CHECKBOX
                $(`#${field.id}`).click({ fieldId: field.id }, () => {
                    // Reset the timer
                    clearTimeout(time);
                    time = setTimeout(async () => {
                        // Enter code here or a execute function.
                        await Common.#popuplateDataOptions(
                            trigger.triggerConfig,
                            trigger.triggerId,
                            true
                        );
                    }, 100);
                });
            } else {
                throw new Error(`Field type ${config.type} is not supported!`);
            }
        }
    }

    static async #setFieldOptions(fieldId, options) {
        $(`#${fieldId}`).find("option").remove();
        for (let option of options) {
            $("<option/>")
                .val(option.value)
                .html(option.text)
                .appendTo(`#${fieldId}`);
        }
    }

    static async #addOptionAutoCompleteField(input, fieldId) {
        Common.logInfo("Setup autocomplete field", fieldId);

        if (input !== undefined && input.length >= 3) {
            let histories =
                (await Common.getStorage(`${fieldId}-history`)) || [];

            histories = histories.reverse();
            if (!histories.includes(input) && input !== undefined) {
                histories.push(input);
            }

            if (histories.length > 30) {
                histories = histories.slice(
                    histories.length - 20,
                    histories.length
                );
            }
            histories = histories.reverse();
            await Common.setStorage(`${fieldId}-history`, histories);
        }

        let histories = (await Common.getStorage(`${fieldId}-history`)) || [];
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
                    await Common.setStorage(fieldId, ui.item.label);
                    Common.logInfo(fieldId, `[${ui.item.label}]`);
                },
            })
            .on("focus", async () => {
                $(`#${fieldId}`).autocomplete("search", $(`#${fieldId}`).val());
            })
            .on("blur", async () => {
                $(`#${fieldId}`).val(await Common.getStorage(fieldId));
            });
    }

    static async triggerInputChanged(fieldId) {
        return await Common.inputChangedHandler({ data: { fieldId: fieldId } });
    }

    static async inputChangedHandler(event) {
        let fieldId = event.data.fieldId;
        Common.logInfo("event.data.fieldId >", fieldId);

        let tagName =
            $(`#${fieldId}`).prop("tagName") ||
            $(`[name='${fieldId}']`).prop("tagName");

        let type =
            $(`#${fieldId}`).prop("type") ||
            $(`[name='${fieldId}']`).prop("type");

        let input = $(`#${fieldId}`).val();

        // DROPDOWN value
        if (tagName === "SELECT") {
            input = $(`#${fieldId} option:selected`).val();
        }

        // CHECKBOX value
        if (tagName === "INPUT" && type === "checkbox") {
            input = $(`#${fieldId}`).prop("checked");
        }

        // RADIO value
        if (tagName === "INPUT" && type === "radio") {
            input = $(`input[name='${fieldId}']:checked`).val();
        }

        await Common.setStorage(`${fieldId}`, input);

        let output = await Common.getStorage(`${fieldId}`);
        Common.logInfo("Saved storage...", `[${fieldId}]`, `[${output}]`);

        if (Common.AUTO_COMPLETE_FIELD_IDS.includes(fieldId)) {
            await Common.#addOptionAutoCompleteField(input, fieldId);
        }

        return input;
    }

    static async setFieldValue(fieldId, value, isEventFired = false) {
        await $(`#${fieldId}`).val(value);
        let setValue = await Common.triggerInputChanged(fieldId);

        if (setValue !== value) {
            let tagName =
                $(`#${fieldId}`).prop("tagName") ||
                $(`[name='${fieldId}']`).prop("tagName");

            let type =
                $(`#${fieldId}`).prop("type") ||
                $(`[name='${fieldId}']`).prop("type");

            // CHECKBOX value
            if (tagName === "INPUT" && type === "checkbox") {
                Common.logInfo("set checkbox value", fieldId, value);
                $(`#${fieldId}`).prop("checked", value);
                await Common.triggerInputChanged(fieldId);
            }

            // RADIO value
            if (tagName === "INPUT" && type === "radio") {
                Common.logInfo("set radio value", fieldId, value);
                $(`input[name='${fieldId}'][value='${value}']`).click();
                await Common.setStorage(fieldId, value);
            }
        }

        if (isEventFired) {
            $(`#${fieldId}`).trigger("input");
        }
    }

    static async getFieldValue(key, defaultValue = "") {
        let storageValue = await Common.getStorage(key);

        if (storageValue === undefined || ["routeDate"].includes(key)) {
            await Common.setStorage(key, defaultValue);
        }

        return await Common.getStorage(key);
    }

    static async presetOptions(
        jsonPath = "../../data/default-options.json",
        storageConfigName = "ankiFlashOptions"
    ) {
        Common.logInfo(`loading config file ${jsonPath} into the storage...`);
        let jsonConfig = await Common.fetchJsonContent(jsonPath);
        await Common.setStorage(storageConfigName, jsonConfig);
    }

    static async blockTraffics() {
        let isBlocked = await Common.getJsonStorage("ankiFlashOptions", [
            "traffic",
            "isBlocked",
        ]);

        let trafficUrls = await Common.getJsonStorage("ankiFlashOptions", [
            "traffic",
            "baseUrls",
        ]);

        trafficUrls.forEach(async (domain) => {
            if (isBlocked) {
                let ruleId = parseInt(Common.randomInt(99999999));
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

                Common.logInfo("Query existing tabs", `*://*.${domain}/*`);
                let tabs = await chrome.tabs.query({
                    url: `*://*.${domain}/*`,
                });

                Common.logInfo("Closing existing tabs", tabs);
                chrome.tabs.remove(tabs.map((t) => t.id));
            }
        });
    }

    static async clearNetworkRules() {
        const currentRules =
            await chrome.declarativeNetRequest.getDynamicRules();
        Common.logWarn("currentRules", currentRules);

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: currentRules.map((rule) => rule.id),
        });
    }

    static async setCookie(ruleId, cookieKey, baseUrl, extraCookies = []) {
        let cookieString = await Common.getStorage(cookieKey);

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
