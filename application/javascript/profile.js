/*
This file contains the javascript for displaying a user's info, messages, and
listings

Author: Joseph Babel, Dale Armstrong
*/

let allMessages;
let allListings;

function loadMessages() {
    let _html = '';
    let isOdd = true;

    if (allMessages.length != 0) {
        for (message in allMessages) {
            let messageElements = allMessages[message].message.split('\n');
            let messageHeader = messageElements[0];
            let messageListing = messageElements[1];
            let messageBody = messageElements[2];
            let messageDate = new Date(allMessages[message].timestamp);

            _html +=
                '<li id="' +
                allMessages[message].id +
                '" class="' +
                (isOdd ? 'list-group-item-1' : 'list-group-item-2') +
                ' p-2 d-flex justify-content-between">';
            _html +=
                '<div><div class="d-flex"><p class="text-dark"><b>' +
                messageHeader +
                '</b><br>' +
                messageListing +
                '</div><div class="text-secondary">Date: ' +
                messageDate +
                '</p><br></div>' +
                '<p class="text-dark">' +
                messageBody +
                '</p></div>' +
                '<button onclick="location.href=\'/listing/?id=' +
                allMessages[message].listing_id +
                '\'" type="button" class="btn btn-primary">View Listing</button>'
                '</li>';

            isOdd = !isOdd;
        }
    } else {
        _html = '<h5>No messages found...</h5>'
    }


    $('#messages').html(_html);
}

// Load the search results from the server into the html
function loadListings() {
    let _html = '';
    let isOdd = true;

    if (allListings.length != 0) {
        for (listing in allListings) {
            let isTextbook = allListings[listing].course != null;
            let isApproved = allListings[listing].isApproved;

            _html +=
                '<li onclick="location.href=\'/listing/?id=' +
                allListings[listing].id +
                '\'" class="list-group-item list-group-item-action p-2 ' +
                (isOdd ? 'list-group-item-1' : 'list-group-item-2') +
                '">' +
                '<div class="row no-gutters">';
            _html +=
                '<div class="col-lg-10 d-flex">' +
                '<img class="thumbnail rounded" src="' +
                allListings[listing].photoPaths[0].thumbnailPath +
                '">';
            _html +=
                '<div class="p-2">' +
                '<h5><b>' +
                allListings[listing].name +
                '</b></h5>';
            _html +=
                '<p class="text-secondary no-overflow">' +
                allListings[listing].description +
                '</p></div></div>';
            _html +=
                '<div class="col p-2"><b>Price: </b>$' +
                allListings[listing].price +
                '<br><br>' +
                (isTextbook ? '<b>Course: </b>' +
                allListings[listing].course : '') +
                '<br><br>' +
                (isApproved ? '<b>Approved: </b>Yes' : '<b>Approved: </b>No') +
                '</div></div></li>';

            isOdd = !isOdd;
        }
    } else {
        _html = '<h5>No listings found...</h5>'
    }



    $('#listings').html(_html);
}

$(document).ready(function () {
    let userJSON = localStorage.getItem('loggedInUser');
    let fetchOptions;

    if (userJSON != null) {
        let user = JSON.parse(userJSON);

        let welcome = document.getElementById('welcome-message');
        let userEmail = document.getElementById('user-email');
        welcome.innerHTML += user.email;
        userEmail.innerHTML += user.email;

        fetchOptions = {
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + user.authToken,
            },
        }
    }

    fetchURL = '/message/';

    fetch(fetchURL, fetchOptions)
        .then((response) => {
            return response.json();
        })
        .then((dataJson) => {
            allMessages = dataJson;
            loadMessages()
        })

    fetchURL = '/listing/user/'

    fetch(fetchURL, fetchOptions)
    .then((response) => {
        return response.json();
    })
    .then((dataJson) => {
        allListings = dataJson;
        loadListings();
    })
});

function swapChangePassword() {
    if (document.getElementById("change-password").style.display == "block") {
        document.getElementById("change-password").style.display = "none";
    }
    else
        document.getElementById("change-password").style.display = "block";
}

function hideChangePassword() {
    resetPasswords();
    document.getElementById("change-password").style.display = "none";
}

function swapDeactivateAccount() {
    if (document.getElementById("deactivate-account").style.display == "block") {
        document.getElementById("deactivate-account").style.display = "none";
        resetDeactivate();
    }
    else
        document.getElementById("deactivate-account").style.display ="block";
}

function hideDeactivateAccount() {
    resetDeactivate();
    document.getElementById("deactivate-account").style.display = "none";
}

const pwdErrorHolder = document.getElementById("pwd-error-registered-holder");
const pwdErrorHolderMsg = document.getElementById("pwd-error-msg-registered");

// Event handler for the register button
function changePasswordOnClick(e) {
    e.preventDefault();
    let currentPassword = document.getElementById('current-password').value;
    let pwd = document.getElementById('new-password').value;
    let pwd2 = document.getElementById('new-password2').value;

    if (!currentPassword || currentPassword.length < 6){
        document.getElementById("check-password-entered").style.opacity = 1;
        document.getElementById("check-password-entered").style.display = "block";
        document.getElementById("check-password-entered").innerHTML = "Must enter current password!";
        return false;
    }

    if (pwd !== pwd2) {
        return false;
    }

    var form = document.getElementById('change-password-form');

    var fetchOptions = {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + user.authToken,
        },
        body: new FormData(form)
    }

    var fetchURL = '/profile/changePassword/';

    fetch(fetchURL, fetchOptions)
        .then((response) => {
            if (!response.ok) {
                pwdErrorHolderMsg.style.opacity = 1;
                pwdErrorHolder.style.display = "contents";
                throw new Error(response.status)
            } else {
                pwdErrorHolderMsg.style.opacity = 0;
                pwdErrorHolder.style.display = "none";
                return response.json();
            }

        })
        .then((dataJson) => {
            alert("Password has been changed!");
        })
        .catch((err) => {
            console.log(err);
        });
}

// Event handler for the login button
function deactivateAccount(e) {
    e.preventDefault();
    let currentPassword = document.getElementById('deactivate-current-password').value;

    if (!currentPassword || currentPassword.length < 6){
        document.getElementById("check-password-entered-deactivate").style.opacity = 1;
        document.getElementById("check-password-entered-deactivate").style.display = "block";
        document.getElementById("check-password-entered-deactivate").innerHTML = "Must enter current password!";
        return false;
    }

    var form = document.getElementById('deactivate-form');

    var fetchOptions = {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + user.authToken,
        },
        body: new FormData(form)
    }

    var fetchURL = 'profile/deactivate/';

    fetch(fetchURL, fetchOptions)
        .then((response) => {
            if (!response.ok) {
                pwdErrorHolderMsg.style.opacity = 1;
                pwdErrorHolder.style.display = "contents";
                throw new Error(response.status)
            } else {
                pwdErrorHolderMsg.style.opacity = 0;
                pwdErrorHolder.style.display = "none";
                return response.json();
            }

        })
        .then((dataJson) => {
            localStorage.removeItem('loggedInUser');
            alert("Account Deleted!");
            window.location.href = '/';
        })
        .catch((err) => {
            console.log(err);
        });
}

function resetPasswords() {
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("new-password2").value = "";
    document.getElementById("check-pw-match").style.opacity = 0;
    document.getElementById("check-pw-match").style.display = "none";
    document.getElementById("check-password-entered").style.opacity = 0;
    document.getElementById("check-password-entered").style.display = "none";
    document.getElementById("check-pw-min-characters").style.opacity = 0;
    document.getElementById("check-pw-min-characters").style.display = "none";
}

function resetDeactivate() {
    document.getElementById('deactivate-current-password').value = "";
    document.getElementById("check-password-entered-deactivate").style.opacity = 0;
    document.getElementById("check-password-entered-deactivate").style.display = "none";
}

// added password length check
// checks if both password fields are equal
function checkPassword() {
    const pwCheck = document.getElementById("check-pw-match");
    const pwMinCheck = document.getElementById("check-pw-min-characters");
    const pwdCheck = document.getElementById("check-password-entered");

    var currentPassword = $("current-password").val();
    var password = $("#new-password").val();
    var confirmPassword = $("#new-password2").val();

    if (pwdCheck.style.display == "block" && currentPassword.length > 0) {
        pwdCheck.style.opacity = 0;
        pwdCheck.style.display = "none";
    }

    if (password.length < 6) {
        pwMinCheck.style.opacity = 1;
        pwMinCheck.style.display = "block";
        $("#check-pw-min-characters").html("Password must be at least 6 characters");
    } else {
        pwMinCheck.style.opacity = 0;
        pwMinCheck.style.display = "none";
        $("#check-pw-match").html("");
    }

    if (confirmPassword == "") {
        pwCheck.style.opacity = 0;
        pwCheck.style.display = "none";
        $("#check-pw-match").html("");
    } else if (password != confirmPassword) {
        pwCheck.style.opacity = 1;
        pwCheck.style.display = "block";
        pwCheck.style.background = "#e58f8f";
        pwCheck.style.color = "#8a0000";
        pwCheck.style.border = "1px solid #8a0000";
        $("#check-pw-match").html("Passwords do not match!");
    } else {
        pwCheck.style.opacity = 1;
        pwCheck.style.display = "block";
        pwCheck.style.background = "#19cf1c";
        pwCheck.style.color = "#072e08";
        pwCheck.style.border = "1px solid #072e08";
        $("#check-pw-match").html("Passwords match");
    }
}

// Add event handler for the second password field to make sure they match
$(document).ready(function () {
    $("#current-password, #new-password, #new-password2").keyup(checkPassword);
});
