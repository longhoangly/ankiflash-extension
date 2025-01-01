/** @format */

import { Common } from "../base/common.js";
import { Constant } from "../base/constant.js";
import { Translation } from "./dto/translation.js";
import { Generator } from "./generator.js";
import { Flash } from "./helper/flash.js";

$(document).ready(async () => {
	// Preconfig
	Common.presetOptions("../data/default-options.json");

	// Register handlers
	AnkiFlash.addHandlers();

	// Handle downloaded file
	Flash.renameDownloadedFiles();

	// Reder UI fields
	await AnkiFlash.setupLayout();

	// Ready logs
	Common.logWarn("==========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========");
	Common.logWarn("==========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========");
	Common.logWarn("===== Finished Loading.... ====================");
	Common.logWarn("===== Welcome to AnkiFlash Generator ==========");
	Common.logWarn("==========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========");
	Common.logWarn("==========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========");
});

export class AnkiFlash {
	static async setupLayout() {
		const fieldConfigs = [
			{
				fields: [
					{ id: "target", default: Constant.ENGLISH, priority: 2 },
				],
				options: AnkiFlash.#getTargetAsOptions,
				triggers: [{ id: "mainDict" }],
			},
			{
				fields: [
					{ id: "mainDict", default: Constant.OXFORD, priority: 3 },
				],
				handler: AnkiFlash.#mainDictChangedHandler,
				options: AnkiFlash.#getDictionaryAsOptions,
			},
			{
				fields: [
					{ id: "isOnline", default: true },
					{ id: "relatedWords", default: true },
				],
			},
			{
				fields: [
					{ id: "inputTxt" },
					{ id: "outputTxt" },
					{ id: "failureTxt" },
				],
				handler: AnkiFlash.#textboxChangedHandler,
			},
			{
				fields: [
					{ id: "source", default: Constant.ENGLISH, priority: 1 },
				],
				options: [
					{
						value: Constant.VIETNAMESE,
						text: Constant.VIETNAMESE,
					},
					{
						value: Constant.ENGLISH,
						text: Constant.ENGLISH,
					},
					{
						value: Constant.FRENCH,
						text: Constant.FRENCH,
					},
					{
						value: Constant.JAPANESE,
						text: Constant.JAPANESE,
					},
				],
				triggers: [{ id: "target" }, { id: "mainDict" }],
			},
		];
		await Common.universalSetupFields(fieldConfigs);

		// Reset value of output and failure boxes
		for (const fieldId of ["outputTxt", "failureTxt"]) {
			await Common.setFieldValue(fieldId, "");
		}

		// init counters' values
		for (const fieldId of ["inputTxt", "outputTxt", "failureTxt"]) {
			await AnkiFlash.#calculateCounters(fieldId);
		}

		$("#outputTxt").attr("rows", 11);
		$("#failureTxt").attr("rows", 10);
		$("#failureTxt").attr("style", "margin-top: -2px");
	}

	static async addHandlers() {
		$("#btnGenerate").click(async () => {
			const inputWords = (await Common.getTabStorage("inputTxt"))
				.split("\n")
				.filter(Boolean);

			if (inputWords.length === 0) {
				alert("No word found! Please check your input!");
				return;
			}

			const genInputDto = {
				words: inputWords,
				translation: new Translation(
					await Common.getTabStorage("source"),
					await Common.getTabStorage("target")
				),
				relatedWords: await Common.getTabStorage("relatedWords"),
				isOnline: await Common.getTabStorage("isOnline"),
				mainDict: await Common.getTabStorage("mainDict"),
			};

			const gen = new Generator(genInputDto);
			Common.logWarn("gen", gen);

			const cards = await gen.generateCards();
			Common.logWarn("cards", cards);

			if (cards.length === 0) {
				alert("No card generated! Please check your input!");
				return;
			}

			if (
				cards
					.map((c) => {
						return c.meaning;
					})
					.filter(Boolean).length > 0
			) {
				await gen.generateCsv(cards);
			}

			Common.logWarn(Constant.FINISHED_MSG);
		});

		$("#btnCancel").click(async () => {
			await Common.setTabStorage("isCanceled", true);
			Common.logWarn(Constant.FINISHED_MSG);
		});
	}

	static async #textboxChangedHandler(event) {
		await Common.inputChangedHandler(event);
		const fieldId = event.data.fieldId;
		await AnkiFlash.#calculateCounters(fieldId);
	}

	static async #calculateCounters(fieldId) {
		const txtLines = ((await Common.getTabStorage(fieldId)) || "")
			.split("\n")
			.filter(Boolean);

		switch (fieldId) {
			case "inputTxt":
				$("#totalLbl").html(`Total: ${txtLines.length}`);
				break;
			case "outputTxt":
				$("#outputLbl").html(`Completed: ${txtLines.length}`);
				break;
			case "failureTxt":
				$("#failureLbl").html(`Failure: ${txtLines.length}`);
				break;
		}
	}

	static async #getTargetAsOptions() {
		const source = await Common.getTabStorage("source");
		return Constant.SUPPORTED_TRANSLATIONS.filter(
			(t) => t.translation.source === source
		).map((t) => {
			return { value: t.translation.target, text: t.translation.target };
		});
	}

	static async #getDictionaryAsOptions() {
		const translation = new Translation(
			await Common.getTabStorage("source"),
			await Common.getTabStorage("target")
		);

		const [dictionaries] = Constant.SUPPORTED_TRANSLATIONS.filter((t) =>
			translation.equals(t.translation)
		).map((t) => t.dictionaries);

		return dictionaries.map((d) => {
			return { value: d.name, text: d.name };
		});
	}

	static async #mainDictChangedHandler(event) {
		const mainDict = await Common.inputChangedHandler(event);

		const isRelatedWordSupported = [
			Constant.JISHO,
			Constant.KANTAN,
			Constant.OXFORD,
			Constant.WIKTIONARY,
			Constant.LACVIET,
		].includes(mainDict);

		if (isRelatedWordSupported) {
			Common.enableElement("#relatedWords");
		} else {
			Common.setFieldValue("relatedWords", false);
			Common.disableElement("#relatedWords");
		}
	}
}
