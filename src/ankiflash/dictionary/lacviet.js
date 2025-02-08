/** @format */

import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";
import { Dictionary } from "../dictionary.js";
import { Meaning } from "../dto/meaning.js";
import { Translation } from "../dto/translation.js";
import { Flash } from "../helper/flash.js";

export class LacViet extends Dictionary {
	constructor(genInputDto) {
		super(genInputDto);
	}

	async standardizedWords() {
		Common.logWarn(`[standardizedWords] ${LacViet.name}`);

		let stdWords = [];
		for (const word of this.genInputDto.words) {
			stdWords = stdWords.concat(await this.#getStandardizedWords(word));
		}
		return stdWords;
	}

	async getWordTypes(cardInputDto) {
		Common.logWarn(`[getWordTypes] ${LacViet.name}`, cardInputDto);
		const lvDocument = await this.#getDocument(cardInputDto);

		let wordTypes = $(lvDocument).find("div.m5t.p10lr");
		if (wordTypes.length > 0) {
			wordTypes = wordTypes
				.text()
				.replaceAll("|Tất cả", "")
				.replaceAll("|Từ liên quan", "");
			wordTypes = `(${wordTypes.split("|").join(" | ")})`;
		} else {
			wordTypes = "";
		}

		Common.logWarn("wordTypes", wordTypes);
		return wordTypes;
	}

	async getPhonetics(cardInputDto) {
		Common.logWarn(`[getPhonetics] ${LacViet.name}`, cardInputDto);
		const lvDocument = await this.#getDocument(cardInputDto);

		let phonetics = $(lvDocument).find("div.p5l.fl.cB");
		if (phonetics.length > 0) {
			phonetics = phonetics.text().replaceAll("\n", "");
		} else {
			phonetics = "";
		}

		Common.logWarn("phonetics", phonetics);
		return phonetics;
	}

	async getExamples(cardInputDto, count = 5) {
		Common.logWarn(`[getExamples] ${LacViet.name}`, cardInputDto);
		const lvDocument = await this.#getDocument(cardInputDto);

		let exampleTags = $(lvDocument).find("div.e");
		exampleTags = exampleTags.slice(0, count);

		const examples = [];
		for (const exampleTag of exampleTags) {
			examples.push($(exampleTag).text());
		}

		if (examples.length === 0) {
			return Constant.NO_EXAMPLE;
		}

		const word = cardInputDto.standardizedWord.word;
		for (let i = 0; i < examples.length; i++) {
			if (examples[i].toLowerCase().includes(word.toLowerCase())) {
				examples[i] = examples[i].replaceAll(word, `{{c1::${word}}}`);
			} else {
				examples[i] = "{} {}".format(examples[i], "{{c1::...}}");
			}
		}

		return Flash.buildExamples(examples);
	}

	async getSounds(cardInputDto) {
		Common.logWarn(`[getSounds] ${LacViet.name}`, cardInputDto);
		const lvDocument = await this.#getDocument(cardInputDto);

		const soundLinks = [];
		const [soundTag] = $(lvDocument).find("embed");
		soundLinks.push(
			$(soundTag)
				.attr("flashvars")
				.replaceAll("file=", "")
				.replaceAll("&autostart=false", "")
		);

		Common.logWarn("soundLinks", soundLinks);
		if (!cardInputDto.isOnline) {
			await Common.chromeDownloadFiles(soundLinks);
		}

		const sounds = [];
		for (const soundLink of soundLinks) {
			let sound = soundLink;
			if (!cardInputDto.isOnline) {
				sound = sound.split("/").pop();
			}

			sounds.push(
				'<audio src="{}" type="audio/wav" preload="auto" autobuffer controls>[sound:{}]</audio>'.format(
					sound,
					sound
				)
			);
		}

		return sounds.join(" ");
	}

	async getImages(cardInputDto) {
		Common.logWarn(`[getImages] ${LacViet.name}`, cardInputDto);
		return '<a href="https://www.google.com/search?biw=1280&bih=661&tbm=isch&sa=1&q={}" style="font-size: 15px; color: blue">Search Images</a>'.format(
			cardInputDto.standardizedWord.wordOri
		);
	}

	async getMeaning(cardInputDto) {
		Common.logWarn(`[getMeaning] ${LacViet.name}`, cardInputDto);
		const lvDocument = await this.#getDocument(cardInputDto);

		const meanings = [];
		const meaningGroups = $(lvDocument).find("div[id*=partofspeech]");

		for (const meaningGroup of meaningGroups) {
			if (
				$(meaningGroup).attr("id").toLowerCase() !== "partofspeech_100"
			) {
				const meaningElements = $(meaningGroup).find("div");

				let examples = [];
				let meaning = new Meaning();
				let afterFirstMeaning = false;

				for (const meaningElement of meaningElements) {
					if ($(meaningElement).attr("class") === "ub") {
						meaning.wordType = $(meaningElement)
							.text()
							.trim()
							.replace("\n", "")
							.toUpperCase();
					} else if ($(meaningElement).attr("class") === "m") {
						// from the second meaning tag
						if (afterFirstMeaning) {
							meaning.examples = examples;
							meanings.push(meaning);
							// reset value
							meaning = new Meaning();
							examples = [];
						}

						meaning.meaning = $(meaningElement).html().trim();
						afterFirstMeaning = true;
					} else if (
						$(meaningElement).attr("class") === "e" ||
						$(meaningElement).attr("class") === "em" ||
						$(meaningElement).attr("class") === "im" ||
						$(meaningElement).attr("class") === "id"
					) {
						const meaningTags = $(meaningElement).find("a");
						for (const tag of meaningTags) {
							$(tag).attr(
								"href",
								`http://tratu.coviet.vn${$(tag).attr("href")}`
							);
						}
						examples.push($(meaningElement).html().trim());
					}
				}
				meaning.examples = examples;
				meanings.push(meaning);
			}
		}

		return Flash.buildMeaning(
			cardInputDto.standardizedWord.word,
			await this.getWordTypes(cardInputDto),
			await this.getPhonetics(cardInputDto),
			meanings
		);
	}

	async #getStandardizedWords(word) {
		const payload = {
			word,
			amount: 12,
			dong: "Đóng",
			showinlang: 1,
		};

		if (
			new Translation(Constant.VIETNAMESE, Constant.ENGLISH).equals(
				this.genInputDto.translation
			)
		) {
			payload.dict = "V-A";
		} else if (
			new Translation(Constant.VIETNAMESE, Constant.FRENCH).equals(
				this.genInputDto.translation
			)
		) {
			payload.dict = "V-F";
		} else if (
			new Translation(Constant.VIETNAMESE, Constant.VIETNAMESE).equals(
				this.genInputDto.translation
			)
		) {
			payload.dict = "V-V";
		} else if (
			new Translation(Constant.ENGLISH, Constant.VIETNAMESE).equals(
				this.genInputDto.translation
			)
		) {
			payload.dict = "A-V";
		} else if (
			new Translation(Constant.FRENCH, Constant.VIETNAMESE).equals(
				this.genInputDto.translation
			)
		) {
			payload.dict = "F-V";
		} else {
			throw new Error("Translation not supported");
		}

		const params = Object.keys(payload)
			.map(key => `${key}=${payload[key]}`)
			.join("\r\n");

		let html = await Common.fetchNeutral({
			headers: {
				"Content-Type": "text/plain;charset=UTF-8",
			},
			method: "POST",
			payload: params,
			respType: Common.RESP_TYPE_ENUM.TEXT,
			url: Constant.LV_SEARCH_URL,
		});
		html = html.slice(1);
		html = html.slice(0, -1);

		const stdWords = [];
		for (const li of $(html).find("li").prevObject) {
			const liTxt = $(li).text();

			if (
				this.genInputDto.relatedWords
					? liTxt.includes(word)
					: liTxt === word
			) {
				stdWords.push({
					word,
					wordId: $(li)
						.attr("onclick")
						.replaceAll("\\'location.href=\"", "")
						.replaceAll("\"\\'", ""),
					wordOri: word,
				});
			}
		}

		return stdWords;
	}

	async #getDocument(cardInputDto) {
		Common.logInfo(
			"Getting LacViet document from URL = '{}'".format(
				cardInputDto.standardizedWord.wordId
			)
		);

		const [stdWord] = this.genInputDto.standardizedWords.filter(w =>
			Common.compareTwoJsonObjects(cardInputDto.standardizedWord, w)
		);

		if (!stdWord.lacVietDocument) {
			stdWord.lacVietDocument = await Common.getUrlContent(
				`${Constant.LV_BASE_URL}${stdWord.wordId}`
			);
		}

		return stdWord.lacVietDocument;
	}
}
