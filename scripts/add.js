// הפניה לדף אימות זהות -----------------------------------------------
if (!localStorage.getItem("token")) {
    location = "./auth.html";
}

let address;

window.onload = function () {

    // הכתובת של השרת -----------------------------------------------
    const ip = window.location.hostname;
    const port = window.location.port;
    address = `${ip}:${port}`;
    const span_address = document.getElementById('span_address');
    span_address.innerHTML = address;
    if (address.startsWith('127')) {
        address = 'localhost:3001';
    }

    // -----------------------------------------------
    if (!localStorage.getItem("token")) {
        location = "../pages/auth.html";
    }
    else {
        const token = localStorage.getItem("token");

        // ------ language & voice
        var languagesAndVoices = {
            "en-US": [
                { "name": "English-Female", "value": "en-US-JennyNeural" },
                { "name": "English-Male", "value": "en-US-GuyNeural" }
            ],
            "he-IL": [
                { "name": "Hebrew-Female", "value": "he-IL-HilaNeural" },
                { "name": "Hebrew-Male", "value": "he-IL-AvriNeural" }
            ],
        }

        const preferences = JSON.parse(localStorage.getItem("preferences"));
        const language = preferences.language;
        const voice = preferences.voice;

        var languageSelector = document.getElementById("languageSelector");
        var voiceSelector = document.getElementById("voiceSelector");

        for (var lan in languagesAndVoices) {
            let option = new Option(lan, lan);
            languageSelector.options[languageSelector.options.length] = option;
            if (language && lan.localeCompare(language) === 0) {
                option.setAttribute("selected", "selected");
            }
        }

        var errVoices = language ? languagesAndVoices[language] : languagesAndVoices["en-US"];
        for (var i = 0; i < errVoices.length; i++) {
            let option = new Option(errVoices[i].name, errVoices[i].value);
            voiceSelector.options[voiceSelector.options.length] = option;
            if (voice && (errVoices[i].value).localeCompare(voice) === 0) {
                option.setAttribute("selected", "selected");
            }
        }

        languageSelector.onchange = function () {
            voiceSelector.length = 0;
            errVoices = languagesAndVoices[this.value];
            for (var i = 0; i < errVoices.length; i++) {
                let option = new Option(errVoices[i].name, errVoices[i].value);
                voiceSelector.options[voiceSelector.options.length] = option;
                if (voice && (errVoices[i].value).localeCompare(voice) === 0) {
                    option.setAttribute("selected", "selected");
                }
            }
        }

        // ------ high quality
        const highQuality = preferences.highQuality;
        if (highQuality == 1) {
            document.getElementById('highQuality').checked = true;
        }

        // ------ text direction & text direction translation
        const textDirection = preferences.textDirection;
        const textDirectionTranslation = preferences.textDirectionTranslation;
        document.getElementById("word").style.direction = textDirection;
        document.getElementById("wordTranslation").style.direction = textDirectionTranslation;
        document.getElementById("sentence").style.direction = textDirection;
        document.getElementById("sentenceTranslation").style.direction = textDirectionTranslation;

        // ------ The word already exists + Creating recommended links
        const input_Word = document.getElementById("word");
        const div_ifExists = document.getElementById("ifExists");

        let linkTo_googleTranslate = document.getElementById("linkTo_googleTranslate");
        let linkTo_oxfor = document.getElementById("linkTo_oxfor");
        let linkTo_yourDictionary = document.getElementById("linkTo_yourDictionary");
        let linkTo_googleImage = document.getElementById("linkTo_googleImage");

        input_Word.addEventListener('input', async function () {
            const word = input_Word.value;

            // The word already exists
            if (word != "" && word[0] != " ") {
                let exists = await fetch(`http://${address}/api/get/wordExists/${word}`, {
                    method: 'GET',
                    headers: { 'authorization': "Bearer " + token }
                });
                exists = await exists.json();
                if (exists) {
                    input_Word.style.backgroundColor = 'red';
                    div_ifExists.innerHTML = " - The word already exists.";
                }
                else {
                    input_Word.style.backgroundColor = '#aba094';
                    div_ifExists.innerHTML = "";
                }
            }
            else if (word == "") {
                input_Word.style.backgroundColor = '#aba094';
                div_ifExists.innerHTML = "";
            }

            // Creating recommended links
            linkTo_googleTranslate.href = `https://translate.google.com/?sl=en&tl=iw&text=${word}&op=translate`;
            linkTo_oxfor.href = `https://www.oxfordlearnersdictionaries.com/definition/english/${word}_1?q=${word}`;
            linkTo_yourDictionary.href = `https://sentence.yourdictionary.com/${word}`;
            linkTo_googleImage.href = `https://www.google.co.il/search?q=${word}&newwindow=1&hl=iw&authuser=0&tbm=isch&sxsrf=AB5stBhij1cjd3mZLhIHGZawLzmaMvftSA%3A1688891509574&source=hp&biw=1279&bih=1271&ei=dXCqZIn9IMjkxc8Ptfy1oAg&iflsig=AD69kcEAAAAAZKp-hYStKlzIu200UVP20itWW70ek2xe&ved=0ahUKEwjJi_aTm4GAAxVIcvEDHTV-DYQQ4dUDCAc&uact=5&oq=test&gs_lcp=CgNpbWcQAzIECCMQJzIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDoHCCMQ6gIQJzoICAAQgAQQsQNQ6QpY_BVgmBtoAXAAeACAAaIBiAGTBJIBAzAuNJgBAKABAaoBC2d3cy13aXotaW1nsAEK&sclient=img`;

        });

    }
};

// ------------------------------------------------------------
$(() => {

    $(document).ready(function () {

        $("#btnSubmit").click(function (event) {

            const token = localStorage.getItem("token");

            $("#output").text("");

            //stop submit the form, we will post it manually.
            event.preventDefault();

            // Get form
            var form = $('#my-form')[0];

            // FormData object 
            var data = new FormData(form);

            // If you want to add an extra field for the FormData
            // data.append("CustomField", "This is some extra data, testing");

            // disabled the submit button
            // $("#btnSubmit").prop("disabled", true);

            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: `http://${address}/api/words/add`,
                data: data,
                processData: false,
                contentType: false,
                cache: false,
                timeout: 800000,
                headers: {
                    'authorization': "Bearer " + token
                },
                success: function (data) {
                    $("#output").text(data);
                    // console.log("SUCCESS : ", data);
                    // $("#btnSubmit").prop("disabled", false);
                },
                error: function (e) {
                    $("#output").text(e.responseText);
                    // console.log("ERROR : ", e);
                    // $("#btnSubmit").prop("disabled", false);
                }
            });
        });
    });

});