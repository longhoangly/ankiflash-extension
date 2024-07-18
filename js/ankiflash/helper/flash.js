import { Common } from "../../base/common.js";

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

    static async downloadFiles(urls, filename = "") {
        let downloadInfos = [];

        for (const url of urls) {
            const partialFilePath =
                filename || `AnkiFlash/${url.split("/").pop()}`;

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

        Common.logInfo("downloadInfos", downloadInfos);
        return downloadInfos;
    }
}
