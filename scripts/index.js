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

    // הפניה לדף אימות זהות -----------------------------------------------
    if (!localStorage.getItem("token")) {
        location = "./pages/auth.html";
    }
    else {

        // שם משתמש -----------------------------------------------
        const user = JSON.parse(localStorage.getItem("user"));
        if (user.name) {
            document.getElementById('user').append(user.name);
        } else {
            const email = user.email;
            document.getElementById('user').append(email.slice(0, email.indexOf('@')));
        }

        // מהירות דיבור -----------------------------------------------
        const preferences = JSON.parse(localStorage.getItem("preferences"));
        const rateFavorite = parseFloat(preferences.rateSpeech);
        let rateSelector = document.getElementById("rate");
        let rate = 0.25;
        while (rate <= 6) {
            let option = new Option(rate, rate);
            rateSelector.options[rateSelector.options.length] = option;
            if (rate == rateFavorite) {
                option.setAttribute("selected", "selected");
            }
            rate += 0.25;
        }

        // Get All Words -----------------------------------------------
        getAllWords();

        // Search Box -----------------------------------------------
        const input_search = document.getElementById("search");

        input_search.addEventListener('input', async function () {

            const str = input_search.value;

            if (str != "" && str[0] != " ") {
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user"));
                const userUuid = user.uuid;

                let words = await fetch(`http://${address}/api/get/WordsThatStartWithString/${str}`, {
                    method: 'GET',
                    headers: {
                        'authorization': "Bearer " + token
                    }
                });

                words = await words.json();
                words.reverse();

                let index = words.length + 1;
                let toAdd = document.createDocumentFragment();

                for (const word of words) {
                    index--;

                    var newDiv = document.createElement('div');
                    newDiv.setAttribute("class", "wordContainer");
                    newDiv.setAttribute("id", word.uuid);
                    newDiv.innerHTML = html_template(index, word, userUuid);

                    toAdd.appendChild(newDiv);
                }

                document.getElementById('mainWords').innerHTML = "";
                document.getElementById('mainWords').appendChild(toAdd);
                updateNumOfWords(words.length);
            }
            else if (str == "") {
                getAllWords();
            }
            else if (str == " ") {
                document.getElementById('mainWords').innerHTML = "";
                updateNumOfWords(0);
            }
        });

    }
}

async function getAllWords() {

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userUuid = user.uuid;

    const responseWords = await fetch(`http://${address}/api/get/words`, {
        method: 'GET',
        headers: {
            'authorization': "Bearer " + token
        }
    });

    let words = await responseWords.json();
    words.reverse();

    let index = words.length + 1;
    var toAdd = document.createDocumentFragment();

    for (const word of words) {
        index--;

        var newDiv = document.createElement('div');
        newDiv.setAttribute("class", "wordContainer");
        newDiv.setAttribute("id", word.uuid);
        newDiv.innerHTML = html_template(index, word, userUuid);

        toAdd.appendChild(newDiv);
    }

    document.getElementById('mainWords').appendChild(toAdd);
    updateNumOfWords(words.length);
}

function html_template(index, word, userUuid) {
    let highQuality = word.highQuality > 0 ? "high quality" : "";
    // כדי לראות אותם controls ניתן להוסיף לרכיבי האודיו את המילה 
    return `
    <div class="data">
        <div>
            <div class="numbers">
               <div class="score">score: 
                   <input type="number" class="scoreInput" id="scoreInput_${word.uuid}" min="1" max="10" value="${word.score}" onblur="updateScore('${word.uuid}')">
               </div>
               <div class="number">index : ${index}</div>
               <div class="uuid">uuid : ${word.uuid}</div>
            </div>
            <div class="date">${word.date.slice(0, 10)}<br>${word.date.slice(10, 16)}</div>
            <div class="announcer">
               <div class="language">${word.language}</div>
               <div class="voice">${word.voice.slice(6)}</div>
               <div class="quality">${highQuality}</div>
            </div>
        </div>
        <div class="change">
            <div class="update" onclick="updateWord('${word.uuid}', '${word.word}', '${word.wordTranslation}', '${word.sentence}', '${word.sentenceTranslation}', '${word.language}', '${word.voice}', '${word.highQuality}')">UPDATE</div>
            <div class="delete" onclick="deleteWord('${word.uuid}')">DELETE</div>
        </div>
    </div>
    <div class="audioAndText">
        <div class="divWord">
        <div class="word" onclick="play('${word.speechWord}')">${word.word}</div>
        <div class="wordTranslation">${word.wordTranslation}</div>
        <div class="parentSpeechWord">
            <div class="speechWord"> 
                <audio id="${word.speechWord}">
                    <source src="http://${address}/api/get/audio/${userUuid}/${word.speechWord}" type="audio/wav">
                </audio>
            </div>
        </div>
        </div>
        <div class="divSentence">
            <div class="sentence" onclick="play('${word.speechSentence}')">${word.sentence}</div>
            <div class="sentenceTranslation">${word.sentenceTranslation}</div>
            <div class="parentSpeechSentence">
                <div class="speechSentence"> <audio id="${word.speechSentence}">
                    <source src="http://${address}/api/get/audio/${userUuid}/${word.speechSentence}" type="audio/wav">
                </audio>
                </div>
            </div>
        </div>
    </div>
    <div class="picture">
        <img src="http://${address}/api/get/image/${userUuid}/${word.picture}" alt="picture">
    </div>
`;
}

function updateNumOfWords(numOfWords) {
    const div_numOfWords = document.getElementById('numOfWords');
    div_numOfWords.innerHTML = numOfWords;
}

// Add -----------------------------------------------
function addWord() {
    window.open(
        `http://${address}/pages/add.html`,
        "_self"
    );
}
// Delete -----------------------------------------------
function deleteWord(uuid) {

    const token = localStorage.getItem("token");
    var result = confirm(`Are you sure you want to delete the word ${uuid} ?`);
    if (result) {

        $.ajax({

            url: `http://${address}/api/delete/${uuid}`,
            type: "DELETE",

            headers: {
                'authorization': "Bearer " + token
            },

            success: function (data) {
                const divWord = document.getElementById(uuid);
                divWord.remove();

                const div_numOfWords = document.getElementById('numOfWords');
                let numOfWords = (+div_numOfWords.innerHTML) - 1;
                updateNumOfWords(numOfWords);
            },

            error: function (e) {
                alert(`ERROR status: ${e.status}: ${e.responseText}`);
            }

        });
    }
}

// Update -----------------------------------------------
function updateWord(uuid, word, wordTranslation, sentence, sentenceTranslation, language, voice, highQuality) {
    window.open(
        `http://${address}/pages/updade.html?uuid=${uuid}&word=${word}&wordTranslation=${wordTranslation}&sentence=${sentence}&sentenceTranslation=${sentenceTranslation}&language=${language}&voice=${voice}&highQuality=${highQuality}`,
        "_self"
    );
}

// Play Audio -----------------------------------------------
function play(id) {
    var audioPlay = document.getElementById(id);
    audioPlay.playbackRate = document.getElementById('rate').value;
    audioPlay.play();
}

// Logout ------------------------------------------
function logout() {
    localStorage.clear();
}

// Update Score ------------------------------------------
function updateScore(uuid) {

    const score = document.getElementById(`scoreInput_${uuid}`).value;
    if (score > 10) { score == 10 };
    const token = localStorage.getItem("token");
    // console.log(`http://localhost:3001/api/update/score/${uuid}/${score}`)
    $.ajax({

        url: `http://${address}/api/update/score/${uuid}/${score}`,
        type: "PATCH",

        headers: {
            'authorization': "Bearer " + token
        },

        success: function (data) {
            alert(JSON.stringify(data));
        },

        error: function (e) {
            alert(`ERROR status: ${e.status}: ${e.responseText}`);
        }

    });
}