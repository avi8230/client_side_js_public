let address;

$(() => {
    // הכתובת של השרת -----------------------------------------------
    const ip = window.location.hostname;
    const port = window.location.port;
    address = `${ip}:${port}`;
    const span_address = document.getElementById('span_address');
    span_address.innerHTML = address;
    if (address.startsWith('127')) {
        address = 'localhost:3001';
    }

    // Register ------------------------------------------
    $("#formRegister").submit(e => {

        e.preventDefault();

        const email = {
            email: $("#textBoxEmail").val(),
        };

        $.ajax({
            method: "POST",
            url: `http://${address}/api/users/register`,
            data: JSON.stringify(email),
            contentType: "application/json",
            // dataType: "json",
            error: err => {
                $("#outputRegister_1").text(`Error: ${err.responseText}. status: ${err.status}`);
            },
            success: response => {
                $("#outputRegister_1").text(`${JSON.stringify(response)}`);
            }
        });

    });

    // Login ------------------------------------------
    $("#formLogin").submit(e => {

        e.preventDefault();

        const credentials = {
            email: $("#textBoxUsername").val(),
            password: $("#textBoxPassword").val(),
            rememberMe: $("#rememberMe").is(':checked')
        };

        $.ajax({
            method: "POST",
            url: `http://${address}/api/users/login`,
            data: JSON.stringify(credentials),
            contentType: "application/json",
            dataType: "json",
            error: err => {
                $("#outputLogin_1").text(`Error: ${err.responseText} status: ${err.status}`);
            },
            success: async response => {

                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));
                localStorage.setItem("preferences", JSON.stringify(response.preferences));

                // $("#outputLogin_1").text(`${JSON.stringify(response.user)}${JSON.stringify(response.preferences)}`);
                $("#outputLogin_1").text(`${JSON.stringify(response)}`);

                // setTimeout(
                //     function () { location = "../index.html"; },
                //     2000
                // )

            }
        });

    });

    // Password Reset ------------------------------------------
    $("#formPasswordResetStepOne").submit(e => {

        e.preventDefault();

        const credentials = {
            email: $("#textBoxEmailReset").val(),
        };

        $.ajax({
            method: "POST",
            url: `http://${address}/api/users/passwordReset/stepOne`,
            data: JSON.stringify(credentials),
            contentType: "application/json",
            dataType: "json",
            error: err => {
                $("#outputPasswordResetStepOne").text(`Error: ${err.responseText} status: ${err.status}`);
            },
            success: async response => {
                $("#outputPasswordResetStepOne").text(`${JSON.stringify(response)}`);
            }
        });

    });

    $("#formPasswordResetStepTwo").submit(e => {

        e.preventDefault();

        const credentials = {
            email: $("#textBoxEmailReset").val(),
            temporaryPassword: $("#textBoxPasswordReset").val(),
        };

        $.ajax({
            method: "POST",
            url: `http://${address}/api/users/passwordReset/stepTwo`,
            data: JSON.stringify(credentials),
            contentType: "application/json",
            dataType: "json",
            error: err => {
                $("#outputPasswordResetStepTow").text(`Error: ${err.responseText} status: ${err.status}`);
            },
            success: async response => {
                $("#outputPasswordResetStepTow").text(`${JSON.stringify(response)}`);
            }
        });
    });

});

// Logout ------------------------------------------
function logout() {
    localStorage.clear();
    $("#outputLogout").text("You went out successfully.");
}

