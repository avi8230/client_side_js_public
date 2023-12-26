// הפניה לדף אימות זהות -----------------------------------------------
if (!localStorage.getItem("token")) {
    location = "./auth.html";
}

// ----------------------------------------------------------------------------------------
// ------------------------------------ Elements ---------------------------------------
const mediaPlayer = document.getElementById("settings");
const playlist = document.getElementById("playlist");
const settings = document.getElementById("settings");
const settingsButton = document.getElementById("settingsButton");
const mediaPlayerButton = document.getElementById("mediaPlayerButton");
const listButton = document.getElementById("listButton");
const repeatButton = document.getElementById("repeat");
const shuffleButton = document.getElementById("shuffle");
const translation_MediaPlayer = document.getElementById("translation_MediaPlayer");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const pauseButton = document.getElementById("pause");
const playButton = document.getElementById("play");
const audio = document.getElementById("audio");
const songImage = document.getElementById("img");
const songText = document.getElementById("text_MediaPlayer");
const songTranslation = document.getElementById("translation_MediaPlayer");
const songNumber = document.getElementById("number");
const playlistSongs = document.getElementById("playlist");
const rateSelector = document.getElementById("rateSelector");
const scoreSelector_from = document.getElementById("scoreSelector_from");
const scoreSelector_to = document.getElementById("scoreSelector_to");
const downloadBtn = document.getElementById("downloadBtn");
const sleepInput = document.getElementById("sleepInput");
const sortSelector = document.getElementById("sortSelector");
const sumOfWords_div = document.getElementById("sumOfWords");
// ------------------------------------ variables ---------------------------------------
const preferences = JSON.parse(localStorage.getItem("preferences"));
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
let userUuid = user.uuid;;
let songs = [];
let totalSongs = 0;
let index = 0;
let rate = 0;
let loop = true;
let isPlaying = false;
let prevSong = 0;
let sleep = false;
let minutes = 0;
let scores = [];
let loopCount = 0;
let isRepeat = false;
let address;
// ----------------------------------------------------------------------------------------
// ------------------------------------ Listeners 1 ---------------------------------------
// Switch between tabs
settingsButton.addEventListener("click", () => {
    mediaPlayer.style.display = 'none';
    playlist.style.display = 'none';
    settings.style.display = 'flex';
    settingsButton.style.color = 'white';
    mediaPlayerButton.style.color = 'rgb(171, 171, 171)';
    listButton.style.color = 'rgb(171, 171, 171)';
});
mediaPlayerButton.addEventListener("click", () => {
    mediaPlayer.style.display = 'flex';
    playlist.style.display = 'none';
    settings.style.display = 'none';
    settingsButton.style.color = 'rgb(171, 171, 171)';
    mediaPlayerButton.style.color = 'white';
    listButton.style.color = 'rgb(171, 171, 171)';
});
listButton.addEventListener("click", () => {
    mediaPlayer.style.display = 'none';
    playlist.style.display = 'flex';
    settings.style.display = 'none';
    settingsButton.style.color = 'rgb(171, 171, 171)';
    mediaPlayerButton.style.color = 'rgb(171, 171, 171)';
    listButton.style.color = 'white';
});
// Hide translation
translation_MediaPlayer.addEventListener("click", () => {
    if (translation_MediaPlayer.style.color == 'rgb(213, 213, 213)') {
        translation_MediaPlayer.style.color = 'transparent';
    }
    else {
        translation_MediaPlayer.style.color = 'rgb(213, 213, 213)';
    }
});
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

    // Update Sum Of Words
    let scoreFrom = scoreSelector_from.value;
    let scoreTo = scoreSelector_to.value;
    sumOfWords = await amountOfWords(scoreFrom, scoreTo);
    updateSumOfWords(sumOfWords);
}
scoreSelector_to.onchange = async function () {
    let scoreFrom = scoreSelector_from.value;
    let scoreTo = scoreSelector_to.value;
    sumOfWords = await amountOfWords(scoreFrom, scoreTo);
    updateSumOfWords(sumOfWords);
}
// ------------------------------------ Listeners 2 ---------------------------------------
// Onload
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

    await createRateSelector();
    await createScoreSelector();

    // let scoreFrom = scoreSelector_from.value;
    // let scoreTo = scoreSelector_to.value;
    // let sortBy = sortSelector.value;
    // songs = await getSongs(scoreFrom, scoreTo, sortBy);

    // totalSongs = songs.length;
    rate = rateSelector.value;

    // await createPlaylist(songs);
    // settingsDirectionText();
    // setSong(index);

    let scoreFrom = scoreSelector_from.value;
    let scoreTo = scoreSelector_to.value;
    sumOfWords = await amountOfWords(scoreFrom, scoreTo);
    updateSumOfWords(sumOfWords);
}
// Play
playButton.addEventListener("click", playAudio);
// Pause
pauseButton.addEventListener("click", pauseAudio);
// Next
nextButton.addEventListener("click", nextSong);
// Prev
prevButton.addEventListener("click", previousSong);
// Ends
audio.onended = () => {
    nextSong();
}
// Repeat
repeatButton.addEventListener("click", () => {
    if (audio.loop == false) {
        audio.loop = true;
        loopCount = 0;
        isRepeat = true;
        repeatButton.style.color = 'white';
    } else {
        audio.loop = false;
        isRepeat = false;
        repeatButton.style.color = 'rgb(171, 171, 171)';
    }
});
// Repeat only 3 times
document.getElementById('audio').addEventListener('timeupdate', function () {
    if (this.currentTime == 0) {
        loopCount++;
    }
    if (loopCount == 3) {
        audio.loop = false;
        loopCount = 0;
    }
});
// Shuffle
shuffleButton.addEventListener("click", () => {
    if (loop == true) {
        loop = false;
        shuffleButton.style.color = 'white';
    } else {
        loop = true;
        shuffleButton.style.color = 'rgb(171, 171, 171)';
    }
});
// Rate
rateSelector.onchange = function () {
    rate = rateSelector.value;
}
// Score
downloadBtn.onclick = async function () {
    pauseAudio();

    let scoreFrom = scoreSelector_from.value;
    let scoreTo = scoreSelector_to.value;
    let sortBy = sortSelector.value;
    songs = await getSongs(scoreFrom, scoreTo, sortBy);

    totalSongs = songs.length;
    await createPlaylist(songs);
    index = 0;
    prevSong = 0;
    setSong(index);
}
// SleepTimer
sleepInput.onchange = function () {
    if (sleep) {
        clearTimeout(sleep);
    }
    minutes = sleepInput.value * 60 * 1000;
    if (minutes > 0) {
        sleep = setTimeout(function () {
            pauseAudio();
            sleepInput.value = '';
        }, minutes);
    }
}
// Sort
sortSelector.onchange = async function () {
    pauseAudio();

    let scoreFrom = scoreSelector_from.value;
    let scoreTo = scoreSelector_to.value;
    let sortBy = sortSelector.value;
    songs = await getSongs(scoreFrom, scoreTo, sortBy);

    await createPlaylist(songs);
    index = 0;
    prevSong = 0;
    setSong(index);
}
// ----------------------------------------------------------------------------------------
// ------------------------------------ Functions 1 ---------------------------------------
// 1 - set
function setSong(index) {
    let { picture, text, translation, speech, number } = songs[index];
    songImage.src = `http://${address}/api/get/image/${userUuid}/${picture}`;
    songText.innerHTML = text;
    songTranslation.innerHTML = translation;
    audio.src = `http://${address}/api/get/audio/${userUuid}/${speech}`;
    audio.playbackRate = rate;
    songNumber.innerHTML = `${number} / ${totalSongs}`;
    // Coloring an item in the list
    if (songs[index].isWord) {
        if (prevSong > 0) {
            document.getElementById(prevSong).style.background = 'rgb(45, 45, 45)';
        }
        document.getElementById(songs[index].id).style.background = 'rgb(30, 30, 30)';
        prevSong = songs[index].id;
    }
    // Update repeat
    if (isRepeat) {
        audio.loop = true;
    }
}
// 2 - play
function playAudio() {
    if (songs.length == 0) {
        return;
    }
    audio.play();
    pauseButton.style.display = "flex";
    playButton.style.display = "none";
    isPlaying = true;
    // Moving the list
    if (songs[index].isWord) {
        if (index < 3) {
            location.href = "#";
            location.href = `#${1}`;
        }
        else {
            location.href = "#";
            location.href = `#${songs[index].id - 3}`;
        }
    }
}
// 3 - pause
function pauseAudio() {
    audio.pause();
    pauseButton.style.display = "none";
    playButton.style.display = "flex";
    isPlaying = false;
}
// 4 - next
function nextSong() {
    if (songs.length == 0) {
        return;
    }
    if (loop) {
        if (index == songs.length - 1) { index = 0; }
        else { index++; }
    } else {
        index = Math.floor(Math.random() * songs.length);
    }
    setSong(index);
    if (isPlaying) { playAudio(); }
}
// 5 - previous (you can't go back to a randomly played song)
function previousSong() {
    if (songs.length == 0) {
        return;
    }
    if (index > 0) { index -= 1; }
    else { index = songs.length - 1; }
    setSong(index);
    if (isPlaying) { playAudio(); }
}
// 6 - set index
function setIndex(i) {
    index = i;
    setSong(i);
    if (isPlaying) { playAudio(); }
}
// ------------------------------------ Functions 2 ---------------------------------------
// 1 - Create Songs
async function getSongs(scoreFrom, scoreTo, sortBy) {
    return new Promise(async (resolve, reject) => {
        const result = await fetch(`http://${address}/api/get/words/${scoreFrom}/${scoreTo}`, {
            method: 'GET',
            headers: { 'authorization': "Bearer " + token }
        });
        let words = await result.json();

        if (sortBy) {
            switch (sortBy) {
                case 'alphabetically':
                    words = words.sort((a, b) => a.word.localeCompare(b.word));
                    break;
                case 'date': {
                    words.reverse();
                    break;
                }
                default:
                    break;
            }
        }

        songs = [];
        let num = 0;
        let id = 0;
        for (const word of words) {
            num++;
            id++;
            songs.push({
                number: num,
                text: word.word,
                translation: word.wordTranslation,
                picture: word.picture,
                speech: word.speechWord,
                date: word.date,
                isWord: true,
                id
            });
            if (word.sentence) {
                num++;
                songs.push({
                    number: num,
                    text: word.sentence,
                    translation: word.sentenceTranslation,
                    picture: word.picture,
                    speech: word.speechSentence,
                    isWord: false,
                    date: word.date
                });
            }
        }
        resolve(songs);
    });
}
// 2 - Create Playlist
function createPlaylist(songs) {
    clearSleep();
    return new Promise(async (resolve, reject) => {
        playlistSongs.innerHTML = '';
        for (let i in songs) {
            if (songs[i].isWord) {
                playlistSongs.innerHTML += `
                <div id="${songs[i].id}" class="itemInList" onclick="setIndex(${i})">
                    <div class="image_Playlist">
                        <img src="http://${address}/api/get/image/${userUuid}/${songs[i].picture}" alt="image">
                    </div>
                    <div class="text_Playlist">${songs[i].text}</div>
                    <div class="number_Playlist">${songs[i].number}</div>
                </div>
                `;
            }
        }
        resolve();
    });
}
// ------------------------------------ Functions 3 ---------------------------------------
// 1 - Create Rate Selector
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
// 2 - Create Score Selector
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
// 3 - Settings Direction Text
function settingsDirectionText() {
    const textDirection = preferences.textDirection;
    const textDirectionTranslation = preferences.textDirectionTranslation;
    songText.style.direction = textDirection;
    songTranslation.style.direction = textDirectionTranslation;

    var elements = Array.prototype.slice
        .call(document.getElementsByClassName("text_Playlist"));
    for (var i = 0; i < elements.length; ++i) {
        elements[i].style.direction = textDirection;
    }
}
// 4 - clear Sleep
function clearSleep() {
    if (sleep) {
        clearTimeout(sleep);
        sleepInput.value = '';
    }
}

// 6 - Amount Of Words
async function amountOfWords(scoreFrom, scoreTo) {
    return new Promise(async (resolve, reject) => {
        const result = await fetch(`http://${address}/api/get/amountByScore/${scoreFrom}/${scoreTo}`, {
            method: 'GET',
            headers: { 'authorization': "Bearer " + token }
        });
        let sum = await result.json();
        resolve(sum);
    });
}

// 5 - Update Sum Of Words
function updateSumOfWords(sumOfWords) {
    sumOfWords_div.innerHTML = `= ${sumOfWords}`;
}
