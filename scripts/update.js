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

        const urlParams = new URLSearchParams(window.location.search);
        const language = urlParams.get('language');
        const voice = urlParams.get('voice');

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
        // -----

        const word = urlParams.get('word');
        document.getElementById("word").setAttribute("value", word);

        const wordTranslation = urlParams.get('wordTranslation');
        document.getElementById("wordTranslation").setAttribute("value", wordTranslation);

        const sentence = urlParams.get('sentence');
        document.getElementById("sentence").append(sentence);

        const sentenceTranslation = urlParams.get('sentenceTranslation');
        document.getElementById("sentenceTranslation").append(sentenceTranslation);

        const highQuality = urlParams.get('highQuality');
        if (highQuality && highQuality > 0) {
            document.getElementById("highQuality").setAttribute("checked", "true");
        }
    }
};

// ------------------------------------------------------------
$(() => {

    $(document).ready(function () {

        $("#btnSubmit").click(function (event) {

            const token = localStorage.getItem("token");

            $("#output").text("");

            event.preventDefault();

            const urlParams = new URLSearchParams(window.location.search);
            const uuid = urlParams.get('uuid');

            var form = $('#my-form')[0];
            var data = new FormData(form);

            $.ajax({
                type: "PUT",
                enctype: 'multipart/form-data',
                url: `http://${address}/api/update/${uuid}`,
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
                },
                error: function (e) {
                    $("#output").text(e.responseText);
                }
            });

        });
    });

});