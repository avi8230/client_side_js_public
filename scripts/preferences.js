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

    // ------ name
    const user = JSON.parse(localStorage.getItem("user"));
    const name = user.name;
    document.getElementById("name").setAttribute("value", name);

    // ------ text direction & text direction translation
    const preferences = JSON.parse(localStorage.getItem("preferences"));
    const textDirection = preferences.textDirection;
    const textDirectionTranslation = preferences.textDirectionTranslation;
    document.getElementById(textDirection + 1).checked = true;
    document.getElementById(textDirectionTranslation + 2).checked = true;

    // ------ rate speech
    const rateFavorite = parseFloat(preferences.rateSpeech);
    let rateSelector = document.getElementById("rateSpeech");
    let rate = 0.25;
    while (rate <= 6) {
        let option = new Option(rate, rate);
        rateSelector.options[rateSelector.options.length] = option;
        if (rate == rateFavorite) {
            option.setAttribute("selected", "selected");
        }
        rate += 0.25;
    }

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

    const language = preferences.language;
    const voice = preferences.voice;

    var languageSelector = document.getElementById("language");
    var voiceSelector = document.getElementById("voice");

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
    document.getElementById(highQuality).checked = true;
};

// ------------------------------------------------------------
$(() => {

    $(document).ready(function () {

        const user = JSON.parse(localStorage.getItem("user"));

        $("#submit").click(function (event) {

            const token = localStorage.getItem("token");

            $("#output").text("");

            //stop submit the form, we will post it manually.
            event.preventDefault();

            // Get form
            var form = $('#preferencesForm')[0];

            // FormData object 
            var data = new FormData(form);

            // If you want to add an extra field for the FormData
            // data.append("CustomField", "This is some extra data, testing");

            $.ajax({
                type: "PATCH",
                enctype: 'multipart/form-data',
                url: `http://${address}/api/preferences`,
                data: data,
                processData: false,
                contentType: false,
                cache: false,
                timeout: 800000,
                headers: {
                    'authorization': "Bearer " + token
                },
                success: function (data) {

                    localStorage.setItem("preferences", JSON.stringify(data.preferences));

                    var name = data.user.name;
                    user.name = name;
                    localStorage.setItem("user", JSON.stringify(user));

                    $("#password").val("");
                    $("#output").text(`${JSON.stringify(data.user)}${JSON.stringify(data.preferences)}${JSON.stringify(data.sendEmail)}`);

                },
                error: function (e) {
                    $("#output").text(e.responseText);
                }
            });
        });
    });

});