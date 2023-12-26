// הפניה לדף אימות זהות -----------------------------------------------
if (!localStorage.getItem("token")) {
    location = "./auth.html";
}

window.onload = async function () {
    // The address of the server ----------------------
    const ip = window.location.hostname;
    const port = window.location.port;
    address = `${ip}:${port}`;
    const span_address = document.getElementById('span_address');
    span_address.innerHTML = address;
    if (address.startsWith('127')) {
        address = 'localhost:3001';
    }

    // ------------------------------------------------
    const token = localStorage.getItem("token");

    let scores = await fetch(`http://${address}/api/get/arrayOfScores`, {
        method: 'GET',
        headers: { 'authorization': "Bearer " + token }
    });

    scores = await scores.json();
    let sum = 0;

    for (let i = 0; i < 11; i++) {
        let td = document.getElementById(`${i}`);
        td.innerHTML = scores[i];
        sum += scores[i];
    }

    td = document.getElementById('td_total');
    td.innerHTML = sum;

}
