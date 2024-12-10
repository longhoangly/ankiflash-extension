import { Base } from "./base.js";

export class Common extends Base {
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

        if (params.fieldId) {
            document.getElementById(`#${params.fieldId}`).appendChild(divCon);
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
            `${chrome.runtime.id}_Screenshots/Chrome_Screenshot_${suffix}.JPEG`
        );
    }

    static convertTimestampToDate(timestamp, timezone) {
        // timezone = "+8";

        let date = new Date(timestamp);
        Common.logDebug("Localtime", date.toLocaleString());

        const localTimezone = (-1 * date.getTimezoneOffset()) / 60;
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

    static async pushAlert(params) {
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
        if (tagName === "TEXTAREA") {
            fieldType = "TEXTAREA";
        } else if (tagName === "SELECT") {
            fieldType = "DROPDOWN";
        } else if (tagName === "INPUT" && type === "checkbox") {
            fieldType = "CHECKBOX";
        } else if (tagName === "INPUT" && type === "radio") {
            fieldType = "RADIO";
        }
        Common.logDebug(`Field ${fieldId} type is ${fieldType}`);

        return fieldType;
    }

    static async universalSetupFields(configs) {
        const settingFieldIds = [];
        const prioritizedFields = [];
        const noPriorityFields = [];

        for (const config of configs) {
            for (const field of config.fields) {
                field.handler =
                    field.handler ||
                    config.handler ||
                    Common.inputChangedHandler;

                field.type = Common.#getFieldType(field.id);
                field.options = field.options || config.options;
                field.triggers = field.triggers || config.triggers || [];
                field.datePicker = field.datePicker || config.datePicker;

                const storedField = Common.UI_FIELDS[`${field.id}Config`];
                const combinedField = {
                    ...storedField,
                    ...field,
                };

                Common.UI_FIELDS[`${field.id}Config`] = combinedField;
                settingFieldIds.push(field.id);

                if (field.priority) {
                    prioritizedFields.push(field);
                } else {
                    noPriorityFields.push(field);
                }
            }
        }

        for (let field of prioritizedFields.sort((a, b) => {
            a.priority - b.priority;
        })) {
            field = Common.UI_FIELDS[`${field.id}Config`];
            if (!field.initialized) {
                Common.logInfo(
                    field.priority,
                    "initialized proritized field",
                    field
                );
                await Common.#configFieldValues(field);
                await field.handler({
                    data: { fieldId: field.id },
                });
                field.initialized = true;
            }
        }

        for (let field of noPriorityFields) {
            field = Common.UI_FIELDS[`${field.id}Config`];
            if (!field.initialized) {
                Common.logInfo("initialized normal field", field);
                Common.#configFieldValues(field).then(() => {
                    field.handler({
                        data: { fieldId: field.id },
                    });
                });
                field.initialized = true;
            }
        }

        for (const fieldId of settingFieldIds) {
            const field = Common.UI_FIELDS[`${fieldId}Config`];

            Common.logDebug("init field's config", field);
            for (const trigger of field.triggers) {
                trigger.field = Common.UI_FIELDS[`${trigger.id}Config`];
            }

            $(`#${field.id}`).off();
            switch (field.type) {
                case "CHECKBOX":
                    $(`#${field.id}`).click(async () => {
                        await field.handler({
                            data: { fieldId: field.id },
                        });
                        await Common.#configFieldTriggers(field);
                    });
                    break;
                case "RADIO":
                    await $(`input[name='${field.id}']`).change(async () => {
                        await field.handler({
                            data: { fieldId: field.id },
                        });
                        await Common.#configFieldTriggers(field);
                    });
                    break;
                default:
                    $(`#${field.id}`).on("input", async () => {
                        await field.handler({
                            data: { fieldId: field.id },
                        });
                        await Common.#configFieldTriggers(field);
                    });
                    break;
            }
        }
    }

    static async #configFieldTriggers(field) {
        for (const trigger of field.triggers) {
            Common.logInfo(`${field.id} triggers ${trigger.id}'s options...`);
            await Common.#configFieldValues(trigger.field, true);

            Common.logInfo(`${field.id} triggers ${trigger.id}'s handler...`);
            await trigger.field.handler({
                data: { fieldId: trigger.id },
            });
        }
    }

    static async #configFieldValues(field, isExtTriggered) {
        if (Array.isArray(field.options)) {
            await Common.#setFieldOptions(field, field.options);
        } else if (field.options) {
            const optionsKey = `${field.id}Options`;

            let options = (await Common.getTabStorage(optionsKey)) || [];
            if (options.length > 0) {
                await Common.#setFieldOptions(field, options);
            }

            if (isExtTriggered || options.length === 0) {
                options = await field.options({
                    data: { fieldId: field.id },
                });

                await Common.#setFieldOptions(field, options);
                await Common.setTabStorage(optionsKey, options);
            } else {
                new Promise((resolve, _) => {
                    resolve(
                        field.options({
                            data: { fieldId: field.id },
                        })
                    );
                }).then((opts) => {
                    Common.setTabStorage(optionsKey, opts);
                });
            }
        } else {
            // set value
            let fieldValue = await Common.getTabStorage(field.id);
            if (fieldValue === undefined) {
                fieldValue = field.default;
            }
            await Common.setFieldValue(field.id, fieldValue);

            // setup date picker
            if (field.datePicker) {
                Common.logInfo(`[${field.id}] is configured as date picker...`);

                $(`#${field.id}`).datepicker({
                    dateFormat: "yy-mm-dd",
                    onSelect: async (dateTxt, inst) => {
                        await Common.inputChangedHandler({
                            data: { fieldId: field.id },
                        });
                    },
                    ...field.datePicker,
                });
            }
        }
    }

    static async #setFieldOptions(field, options) {
        let selectedOption;
        if (options.length === 0) {
            options = [{ value: "Not Available", text: "Not Available" }];
            Common.disableElement(`#${field.id}`);
        } else {
            selectedOption = await Common.getTabStorage(field.id);
            if (selectedOption === undefined) {
                selectedOption = field.default;
            }

            if (!options.map((o) => o.value).includes(selectedOption)) {
                selectedOption = options[0].value;
            }
            Common.enableElement(`#${field.id}`);
        }

        if (options.length > 20) {
            $(`#${field.id}`).select2({
                theme: "classic",
                data: options.map((o) => {
                    return { id: o.value, text: o.text };
                }),
            });
        } else {
            $(`#${field.id}`).find("option").remove();
            for (const option of options) {
                $("<option/>")
                    .val(option.value)
                    .html(option.text)
                    .appendTo(`#${field.id}`);
            }
        }

        await Common.setFieldValue(field.id, selectedOption);
    }

    static async setFieldValue(fieldId, value) {
        const fieldType = Common.#getFieldType(fieldId);
        switch (fieldType) {
            case "CHECKBOX":
                $(`#${fieldId}`).prop("checked", value);
                break;
            case "RADIO":
                const radio = `input:radio[name='${fieldId}'][value='${value}']`;
                $(radio).prop("checked", true);
                break;
            default:
                $(`#${fieldId}`).val(value).trigger("change");

                const fieldConfig = Common.UI_FIELDS[`${fieldId}Config`];
                if (fieldType === "TEXTBOX" && !fieldConfig.datePicker) {
                    await Common.#autoCompleteFieldHandler(value, fieldId);
                }
                break;
        }

        Common.logDebug(`[setFieldValue] set storage... [${fieldId}]`, value);
        await Common.setTabStorage(fieldId, value);
    }

    static async inputChangedHandler(event) {
        const fieldId = event.data.fieldId;

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

                if ($(`#${fieldId}`).find("option").length > 20) {
                    const [selectedItem] = $(`#${fieldId}`).select2("data");
                    $(`#select2-${fieldId}-container`).text(selectedItem.text);
                }

                break;
            default:
                input = $(`#${fieldId}`).val();
                break;
        }

        await Common.setTabStorage(fieldId, input);
        Common.logInfo(
            `[inputChangedHandler] set storage... [${fieldId}]`,
            input
        );

        const fieldConfig = Common.UI_FIELDS[`${fieldId}Config`];
        if (fieldType === "TEXTBOX" && !fieldConfig.datePicker) {
            await Common.#autoCompleteFieldHandler(input, fieldId);
        }

        return input;
    }

    static async #autoCompleteFieldHandler(input, fieldId) {
        if (input !== undefined && input.length >= 3) {
            let histories =
                (await Common.getTabStorage(`${fieldId}History`)) || [];

            histories = await histories.reverse();
            if (!histories.includes(input) && input !== undefined) {
                histories.push(input);
            }

            if (histories.length > 100) {
                histories = histories.slice(
                    histories.length - 100,
                    histories.length
                );
            }
            histories = await histories.reverse();
            await Common.setTabStorage(`${fieldId}History`, histories);
        }

        const histories =
            (await Common.getTabStorage(`${fieldId}History`)) || [];
        await Common.#createAutoCompleteField(fieldId, histories);
    }

    static async #createAutoCompleteField(fieldId, source) {
        $(`#${fieldId}`)
            .autocomplete({
                minLength: 0,
                source: source,
                select: async (event, ui) => {
                    $(`#${fieldId}`).val(ui.item.label);
                    await Common.setTabStorage(fieldId, ui.item.label);
                    Common.logInfo(
                        `autocomplete selected option '${fieldId}'`,
                        ui.item
                    );
                },
            })
            .on("focus", async () => {
                $(`#${fieldId}`).autocomplete("search", $(`#${fieldId}`).val());
            })
            .on("blur", async () => {
                $(`#${fieldId}`).val(await Common.getTabStorage(fieldId));
            });
    }

    static async presetOptions(
        jsonPath = "../../data/default-options.json",
        storageConfigName = `${chrome.runtime.id}Options`
    ) {
        Common.logInfo(
            `Loading config file ${jsonPath} into the storage... ${storageConfigName}`
        );
        const jsonConfig = await Common.fetchJsonContent(jsonPath);
        await Common.setStorage(storageConfigName, jsonConfig);
    }

    static async blockTraffics() {
        const isBlocked = await Common.getJsonStorage(
            `${chrome.runtime.id}Options`,
            ["traffic", "isBlocked"]
        );

        const trafficUrls = await Common.getJsonStorage(
            `${chrome.runtime.id}Options`,
            ["traffic", "baseUrls"]
        );

        trafficUrls.forEach(async (domain) => {
            if (isBlocked) {
                const ruleId = Common.randomInt(1000, 99999999);
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
                const tabs = await chrome.tabs.query({
                    url: `*://*.${domain}/*`,
                });

                Common.logInfo("Closing existing tabs", tabs);
                chrome.tabs.remove(tabs.map((t) => t.id));
            }
        });
    }

    static async clearNetRules() {
        const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
        Common.logInfo("Removing NET rules", currentRules);

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: currentRules.map((rule) => rule.id),
        });
    }

    static async setCookie(
        cookieStorageKey,
        baseUrl,
        ruleId = Common.randomInt(1000, 99999999)
    ) {
        let cookieString = await Common.getTabStorage(cookieStorageKey);

        Common.logInfo("Setting cookie", {
            cookieStorageKey: cookieStorageKey,
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

            if (baseUrl.includes("xxx")) {
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
