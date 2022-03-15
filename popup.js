import { Common } from './common.js'

$(document).ready(async () => {

    $("#enableAnkiFlash").on("click", async () => {

        let enabled = $('#enableAnkiFlash').prop('checked')
        await Common.setChromeStorage("enableAnkiFlash", enabled)

        console.log("enableAnkiFlash", await Common.getChromeStorage("enableAnkiFlash"))
    })

    let enabled = await Common.getChromeStorage("enableAnkiFlash")
    console.log("enableAnkiFlash", enabled)
    $('#enableAnkiFlash').prop('checked', enabled === "true")
})