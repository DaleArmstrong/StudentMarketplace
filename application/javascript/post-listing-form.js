/*
This file contains the javascript that sends a listing to the backend.

Author: Joseph Babel
*/

// Render categories into form
function renderCategoriesIntoForm(allCategories) {
    for (i = 1; i < allCategories.length; i++) {
        $('#form-category').append('<option value="' + allCategories[i] + '">' + allCategories[i] + '</option>');
    }
    $('#form-category').selectpicker("refresh");
}

// Try to load categories from local storage
function loadCategoriesIntoForm() {
    let localStorageCategories = JSON.parse(localStorage.getItem('categories'));
    if (localStorageCategories == null || localStorageCategories.length == 0) {
        fetch('/categories/')
            .then((data) => {
                return data.json();
            })
            .then((dataJson) => {
                renderCategoriesIntoForm(dataJson);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        renderCategoriesIntoForm(localStorageCategories);
    }
}

window.onload = function () {
    let postListingButton = document.getElementById('submit-button');

    postListingButton.addEventListener('click', (e) => {
        e.preventDefault();
        submitListing();
    });

    $('#form-category').change(function () {
        let categoryDropdown = document.getElementById('form-category');
        if (categoryDropdown.value == 'Textbooks') {
            $('#class-label').removeClass('input-hidden');
            $('#class-field').removeClass('input-hidden');
            $('#class-field').prop("required", "true");
        } else {
            $('#class-label').addClass('input-hidden');
            $('#class-field').addClass('input-hidden');
            $('#class-field').removeAttr('required');
        }
    })

    loadCategoriesIntoForm();
}

// Send the post request with the listing info
async function submitListing() {
    let form = document.getElementById('post-listing-form');
    let userJSON = localStorage.getItem('loggedInUser');

    if (userJSON != null && form.reportValidity()) {
        let user = JSON.parse(userJSON);

        var fetchOptions = {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + user.authToken,
            },
            body: new FormData(form)
        }

        var fetchURL = '/listing/';

        fetch(fetchURL, fetchOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.status)
                } else {
                    return response.json();
                }
            })
            .then((dataJson) => {
                window.location.href = '/listing/?id=' + dataJson.id;
            })
            .catch((err) => {
                console.log(err);
            })
    }
}

// Update image preview
$('#file-upload').on('change', function (e) {
    var fileCount = $(this)[0].files.length;
    var imagePreview = $('#image-preview');

    imagePreview.empty();

    for (var i = 0; i < fileCount; i++) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('<img>', {
                'src': e.target.result,
                'class': 'thumbnail'
            }).appendTo(imagePreview);
        }
        imagePreview.show()
        reader.readAsDataURL($(this)[0].files[i]);
    }
});