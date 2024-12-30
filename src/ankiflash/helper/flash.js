/** @format */

import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";

export class Flash {
	static async convertGenToCardDto(genInputDto, word) {
		let cardInputDto = structuredClone(genInputDto);

		delete cardInputDto.words;
		delete cardInputDto.standardizedWords;

		if (typeof word === "object") {
			cardInputDto.standardizedWord = word;
		} else {
			cardInputDto.word = word;
		}

		return cardInputDto;
	}

	static async buildExamples(exampleStrs, isJapanese = false) {
		let examples = [];

		if (isJapanese) {
			examples.push('<div class="content-container japan-font">');
		} else {
			examples.push('<div class="content-container">');
		}
		examples.push('<ul class="content-circle">');

		if (isJapanese) {
			let index = 0;
			for (const example of exampleStrs) {
				if (index % 2 == 0) {
					examples.push(
						'<li class="content-example">{}</li>'.format(
							example.trim()
						)
					);
				} else {
					examples.push(
						'<li class="content-sub-example">{}</li>'.format(
							example.trim()
						)
					);
				}
				index += 1;
			}
		} else {
			for (const example of exampleStrs) {
				examples.push(
					'<li class="content-example">{}</li>'.format(example.trim())
				);
			}
		}

		examples.push("</ul>");
		examples.push("</div>");

		Common.logWarn("examples", examples.join(""));
		return examples.join("");
	}

	static async buildMeaning(
		word,
		wordType,
		phonetic,
		meanings,
		isJapanese = false
	) {
		let strList = [];

		if (isJapanese) {
			strList.push('<div class="content-container japan-font">');
		} else {
			strList.push('<div class="content-container">');
		}

		strList.push('<h2 class="h">{}</h2>'.format(word.trim()));
		if (wordType) {
			strList.push(
				'<span class="content-type">{}</span>'.format(wordType.trim())
			);
		}

		if (phonetic) {
			strList.push(
				'<span class="content-phonetic">{}</span>'.format(
					phonetic.trim()
				)
			);
		}

		strList.push('<ul class="content-order">');
		for (const mean of meanings) {
			if (mean.wordType) {
				strList.push(
					'<h4 class="content-meaning-type"\'>{}</h4>'.format(
						mean.wordType.trim()
					)
				);
				strList.push("</ul>");
				strList.push('<ul class="content-order">');
			}

			if (mean.meaning) {
				strList.push(
					'<li class="content-meaning">{}</li>'.format(
						mean.meaning.trim()
					)
				);
			}

			if (mean.subMeaning) {
				strList.push(
					'<div class="content-sub-meaning">{}</div>'.format(
						mean.subMeaning.trim()
					)
				);
			}

			if (mean.examples.length > 0) {
				strList.push('<ul class="content-circle">');

				if (isJapanese) {
					index = 0;
					for (example in mean.examples) {
						if (index % 2 == 0) {
							strList.push(
								'<li class="content-example">{}</li>'.format(
									example.trim()
								)
							);
						} else {
							strList.push(
								'<li class="content-sub-example">{}</li>'.format(
									example.trim()
								)
							);
						}
						index += 1;
					}
				} else {
					for (const example of mean.examples) {
						strList.push(
							'<li class="content-example">{}</li>'.format(
								example.trim()
							)
						);
					}
				}

				strList.push("</ul>");
			}
		}

		strList.push("</ul>");
		strList.push("</div>");

		return strList.join("");
	}

	static async renameDownloadedFiles() {
		chrome.downloads.onDeterminingFilename.addListener(
			(downloadItem, suggest) => {
				if (
					downloadItem.byExtensionId === chrome.runtime.id ||
					[Constant.ANKI_DECK, Constant.MAPPING_CSV].includes(
						downloadItem.filename
					)
				) {
					suggest({
						filename: `AnkiFlash/${downloadItem.filename}`,
						conflictAction: "overwrite",
					});
					Common.logWarn("downloaded", downloadItem);
				}
			}
		);
	}
}
