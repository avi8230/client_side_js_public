// הפניה לדף אימות זהות -----------------------------------------------
if (!localStorage.getItem("token")) {
    location = "./auth.html";
}

// ----------------------------------------------------------------------------------------
// ------------------------------------ Elements ------------------------------------------
const scoreSelector_from = document.getElementById("scoreSelector_from");
const scoreSelector_to = document.getElementById("scoreSelector_to");
const sumOfWords_div = document.getElementById("sumOfWords");
const downloadBtn = document.getElementById("downloadBtn");
const rateSelector = document.getElementById("rateSelector");

const tableTitle = document.getElementById("tableTitle");
const scoreTable_down = document.getElementById("scoreTable").rows[1].cells[0];
const scoreTable_words = document.getElementById("scoreTable").rows[1].cells[1];
const scoreTable_up = document.getElementById("scoreTable").rows[1].cells[2];

const cardsContainer = document.getElementById('cardsContainer');
const audio = document.getElementsByTagName('audio')[0];
let cards;
let answerBtn;
let scoreBtn;
let wBtn;
let xBtn;
// ------------------------------------ variables -----------------------------------------
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
const preferences = JSON.parse(localStorage.getItem("preferences"));
let userUuid = user.uuid;
let scores = [];
let words = [];
let rate = 0;
let address;
// ----------------------------------------------------------------------------------------
// ------------------------------------ Listeners -----------------------------------------
window.onload = async () => {
    // הכתובת של השרת -----------------------------------------------
    const ip = window.location.hostname;
    const port = window.location.port;
    address = `${ip}:${port}`;
    const span_address = document.getElementById('span_address');
    span_address.innerHTML = address;
    if (address.startsWith('127')) {
        address = 'localhost:3001';
    }

    await createScoreSelector();
    await createRateSelector();
    rate = rateSelector.value;
}

// Update score selector
scoreSelector_from.onchange = async function () {
    let min = +scoreSelector_from.value;
    scoreSelector_to.length = 0;
    // for (const score of scores) {
    //     if (score.score >= min) {
    //         let option = new Option(score.score, score.score);
    //         scoreSelector_to.options[scoreSelector_to.options.length] = option;
    //     }
    // }
    for (const score of scores) {
        if (score >= min) {
            let option = new Option(score, score);
            scoreSelector_to.options[scoreSelector_to.options.length] = option;
        }
    }

    // Update Amount Of Words
    let scoreFrom = scoreSelector_from.value;
    let scoreTo = scoreSelector_to.value;
    sumOfWords = await amountOfWords(scoreFrom, scoreTo);
    sumOfWords_div.innerHTML = `= ${sumOfWords}`;
}

// Update Amount Of Words
scoreSelector_to.onchange = async function () {
    let scoreFrom = scoreSelector_from.value;
    let scoreTo = scoreSelector_to.value;
    sumOfWords = await amountOfWords(scoreFrom, scoreTo);
    sumOfWords_div.innerHTML = `= ${sumOfWords}`;
}

// Download Button
downloadBtn.onclick = async function () {
    // Creating Cards
    let scoreFrom = scoreSelector_from.value;
    let scoreTo = scoreSelector_to.value;
    words = await getWords(scoreFrom, scoreTo);
    await createCards(words);
    flipCards();

    // Update the test counters
    scoreTable_down.innerHTML = 0;
    scoreTable_up.innerHTML = 0;
    scoreTable_words.innerHTML = words.length;
    tableTitle.innerHTML = '';

    // למקרה שמישהו יוריד את המילים שוב, לפני סיום המבחן
    sumOfWords_div.innerHTML = '';
    sumOfWords = await amountOfWords(scoreFrom, scoreTo); // לצורך חישוב הציון
}

// Update Rate
rateSelector.onchange = function () {
    rate = rateSelector.value;
}
// ------------------------------------------------------------------------------------------------------
// -------------------------------- 1 - Functions To Creating Cards -------------------------------------
// 1 - Get Words
async function getWords(scoreFrom, scoreTo) {
    return new Promise(async (resolve, reject) => {
        const result = await fetch(`http://${address}/api/get/words/${scoreFrom}/${scoreTo}`, {
            method: 'GET',
            headers: { 'authorization': "Bearer " + token }
        });
        let arrWords = await result.json();
        let arrWords_shuffled = arrWords.sort(() => Math.random() - 0.5);
        resolve(arrWords_shuffled);
    });
}

// 2 - Create Cards
function createCards(words) {
    return new Promise(async (resolve, reject) => {
        cardsContainer.innerHTML = '';
        let i = 1;
        for (const word of words) {
            cardsContainer.innerHTML += `
            <div class="scene">
            <div class="card">
                <div class="front">
                    <div class="border">
                        <div class="number">${i}</div>
                        <div class="frontWord" onclick="playAudio('${word.speechWord}')">${word.word}</div>
                    </div>
                    <div class="answerBtn"><i class="fa-solid fa-arrow-rotate-left"></i></div>
                </div>
                <div class="back">
                    <div class="answer">
                        <div class="backWord" onclick="playAudio('${word.speechWord}')">${word.word}</div>
                        <div class="wordTranslation">${word.wordTranslation}</div>
                        <div class="sentence" onclick="playAudio('${word.speechSentence}')">${word.sentence}</div>
                        <div class="sentenceTranslation">${word.sentenceTranslation}</div>
                        <div class="img"><img src="http://${address}/api/get/image/${userUuid}/${word.picture}" alt="image"></div>
                        </div>
                    <div class="buttons">
                        <div class="xBtn" id="xBtn_${word.uuid}" onclick="updateScore('${word.score - 1}','${word.uuid}', '-')"><i class="fa-solid fa-x"></i></div>
                        <div class="scoreBtn" id="scoreBtn_${word.uuid}">${word.score}</div>
                        <div class="wBtn" id="wBtn_${word.uuid}" onclick="updateScore('${word.score + 1}','${word.uuid}', '+')"><i class="fa-solid fa-check"></i></div>
                    </div>
                </div>
            </div>
            </div>
            `;
            i++;
        }
        resolve();
    });
}

// 3 - Flip Cards
function flipCards() {
    answerBtn = document.querySelectorAll('.fa-arrow-rotate-left');
    scoreBtn = document.querySelectorAll('.scoreBtn');
    cards = document.querySelectorAll('.card');
    for (let i = 0; i < cards.length; i++) {
        answerBtn[i].addEventListener('click', function () {
            cards[i].classList.toggle('is-flipped');
        });
        scoreBtn[i].addEventListener('click', function () {
            cards[i].classList.toggle('is-flipped');
        });
    }
}

// --------------------------------- 2 - Functions To Creating Settings ------------------------------------
// 1 - Create Score Selector
async function createScoreSelector() {
    // return new Promise(async (resolve, reject) => {
    //     const resultScores = await fetch(`http://${address}/api/get/scores`, {
    //         method: 'GET',
    //         headers: { 'authorization': "Bearer " + token }
    //     });
    //     scores = await resultScores.json();

    //     function compare(a, b) {
    //         if (a.score < b.score) {
    //             return -1;
    //         }
    //         if (a.score > b.score) {
    //             return 1;
    //         }
    //         return 0;
    //     }
    //     scores.sort(compare);

    //     for (const score of scores) {
    //         let option = new Option(score.score, score.score);
    //         scoreSelector_from.options[scoreSelector_from.options.length] = option;
    //     }
    //     for (const score of scores) {
    //         let option = new Option(score.score, score.score);
    //         scoreSelector_to.options[scoreSelector_to.options.length] = option;
    //     }
    //     resolve();
    // });
    scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (const score of scores) {
        let option = new Option(score, score);
        scoreSelector_from.options[scoreSelector_from.options.length] = option;
    }
    for (const score of scores) {
        let option = new Option(score, score);
        scoreSelector_to.options[scoreSelector_to.options.length] = option;
    }
}

// 2 - Amount Of Words
async function amountOfWords(scoreFrom, scoreTo) {
    return new Promise(async (resolve, reject) => {
        const result = await fetch(`http://${address}/api/get/amountByScore/${scoreFrom}/${scoreTo}`, {
            method: 'GET',
            headers: { 'authorization': 'Bearer ' + token }
        });
        let sum = await result.json();
        resolve(sum);
    });
}

// 3 - Create Rate Selector
function createRateSelector() {
    return new Promise(async (resolve, reject) => {
        const rateFavorite = parseFloat(preferences.rateSpeech);
        let r = 0.25;
        while (r <= 6) {
            let option = new Option(r, r);
            rateSelector.options[rateSelector.options.length] = option;
            if (r == rateFavorite) {
                option.setAttribute("selected", "selected");
            }
            r += 0.25;
        }
        resolve();
    });
}

// --------------------------------- 3 - Functions For Test Operation ------------------------------------
// 1 - Play Audio
function playAudio(fileName) {
    audio.src = `http://${address}/api/get/audio/${userUuid}/${fileName}`;
    audio.playbackRate = rate;
    audio.play();
}

// 2 - Update Score
function updateScore(score, uuid, operator) {
    if (score >= 0 && score <= 10) {
        $.ajax({
            url: `http://${address}/api/update/score/${uuid}/${score}`,
            type: "PATCH",
            headers: {
                'authorization': "Bearer " + token
            },
            success: function (data) {
                scoreBtn = document.getElementById(`scoreBtn_${uuid}`);
                scoreBtn.innerHTML = data.score;
                wBtn = document.getElementById(`wBtn_${uuid}`);
                xBtn = document.getElementById(`xBtn_${uuid}`);
                xBtn.remove();
                wBtn.remove();
                if (operator == '+') {
                    scoreBtn.style.color = 'rgb(32, 220, 32)';
                    let up = scoreTable_up.innerHTML;
                    scoreTable_up.innerHTML = +up + 1;
                    scoreTable_words.innerHTML = parseInt(scoreTable_words.innerHTML) - 1;
                }
                else if (operator == '-') {
                    scoreBtn.style.color = 'red';
                    let down = scoreTable_down.innerHTML;
                    scoreTable_down.innerHTML = +down + 1;
                    scoreTable_words.innerHTML = parseInt(scoreTable_words.innerHTML) - 1;
                }
                if (scoreTable_words.innerHTML == 0) {
                    tableTitle.innerHTML = 'Score';
                    let success = parseInt(scoreTable_up.innerHTML);
                    let finalScore = parseInt(100 / sumOfWords * success);
                    scoreTable_words.innerHTML = `${finalScore}%`;
                    // createScoreSelector();
                }
            },
            error: function (e) {
                alert(`ERROR status: ${e.status}: ${e.responseText}`);
            }
        });
    }
    else if (score < 0) {
        wBtn = document.getElementById(`wBtn_${uuid}`);
        xBtn = document.getElementById(`xBtn_${uuid}`);
        xBtn.remove();
        wBtn.remove();

        scoreBtn = document.getElementById(`scoreBtn_${uuid}`);
        scoreBtn.style.color = 'red';
        let down = scoreTable_down.innerHTML;
        scoreTable_down.innerHTML = +down + 1;

        scoreTable_words.innerHTML = parseInt(scoreTable_words.innerHTML) - 1;

        if (scoreTable_words.innerHTML == 0) {
            tableTitle.innerHTML = 'Score';
            let success = parseInt(scoreTable_up.innerHTML);
            let finalScore = parseInt(100 / sumOfWords * success);
            scoreTable_words.innerHTML = `${finalScore}%`;
            // createScoreSelector();
        }
    }
    else if (score > 10) {
        wBtn = document.getElementById(`wBtn_${uuid}`);
        xBtn = document.getElementById(`xBtn_${uuid}`);
        xBtn.remove();
        wBtn.remove();

        scoreBtn = document.getElementById(`scoreBtn_${uuid}`);
        scoreBtn.style.color = 'rgb(32, 220, 32)';
        let up = scoreTable_up.innerHTML;
        scoreTable_up.innerHTML = +up + 1;

        scoreTable_words.innerHTML = parseInt(scoreTable_words.innerHTML) - 1;

        if (scoreTable_words.innerHTML == 0) {
            tableTitle.innerHTML = 'Score';
            let success = parseInt(scoreTable_up.innerHTML);
            let finalScore = parseInt(100 / sumOfWords * success);
            scoreTable_words.innerHTML = `${finalScore}%`;
            // createScoreSelector();
        }
    }
}
