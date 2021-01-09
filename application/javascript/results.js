/*
This file contains javascript that gets search results from the server and
builds the search results page.

Author: Joseph Babel
*/

let allListings;
let listingsCount = 0;
let zeroFound = 0;
let skip = 0;

// Load the search results from the server into the html
function loadListings() {
    let _html = '';

    for (listing in allListings) {
    let isOdd = true;
    let isTextbook = allListings[listing].course != null;

        _html +=
            '<li id="' +
            allListings[listing].id +
            '" class="list-group-item list-group-item-action p-2 ' +
            (isOdd ? 'list-group-item-1' : 'list-group-item-2') +
            '">' +
            '<div class="row no-gutters">';
        _html +=
            '<div class="col-lg-7 d-flex">' +
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
            '</div>'
        _html +=
            '<div class="col-sm-12 col-md p-2">' +
            '<button id="' + allListings[listing].id + '" type="button" class="btn btn-primary btn-block pull-right no-overflow" data-toggle="modal" data-target="#modal"' +
            'onclick="event.stopPropagation(); openContactModal(this);">Contact Seller</button>';
        _html += '</div></div></li>';

        isOdd = !isOdd;
    }

    $('#results').html(_html);

    var listings = document.getElementById('results').children;

    // Set onclick attribute for every li
    // This has to be done in a separate scope. If not, dynamically adding the id to the href link
    // does not work properly (took me like an hour to figure this out lol).
    for (var i = 0; i < listings.length; i++) {
        setOnClick(listings[i]);
    }

    // Update listings count
    if (!zeroFound)
        $('.num-results').html('<h5>Showing ' + allListings.length + ' results out of ' + listingsCount + ' total...</h5>');
    else
        $('.num-results').html('<h5>Zero results found... You may be interested in these other items.<br>Showing ' + allListings.length + ' results out of ' + listingsCount + ' total...</h5>');
}

// Redirect to listing page in new tab
function setOnClick(li) {
    li.onclick = function () {
        $('<a href="/listing/?id=' + li.id + '" target="_blank"></a>')[0].click();
    }
}

function clearResults() {
    $('#results').empty();
}

function openContactModal(buttonObj) {

    user = JSON.parse(localStorage.getItem('loggedInUser'));

    // If user is not logged in, redirect to login page
    if (!user) {
        window.location.assign('/html/login-register.html');
        return;
    }

    $('#modal').modal();

    // Find relevant listing
    var listing;
    for (var i = 0; i < allListings.length; i++) {
        if (allListings[i].id == buttonObj.id) {
            listing = allListings[i];
        }
    }
    modal = document.getElementById('contact-text');


    // Add listing id to be used by sendMessage
    $('#modal').data('id', listing.id);

    $('#from-text').html('From: ' + user.email);
    $('#listing-text').html('Listing: ' + listing.name);
    $('#contact-text').val('');
}

function sendMessage() {
    $('#modal').modal('toggle');

    var message = "";
    message += $('#from-text').html() + '\n';
    message += $('#listing-text').html() + '\n';

    message += $('#contact-text').val();

    var id = $('#modal').data('id');

    var fetchBody = {
        "message": message,
        "listing_id": id
    }

    var fetchOptions = {
        method: "POST",
        body: JSON.stringify(fetchBody)
    }

    var fetchURL = '/message/';

    fetch(fetchURL, fetchOptions)
        .then((response) => {
            if (response.ok) {
                alert('Message sent!');
            } else {
                alert('Message failed to send.');
            }
        })
}

// render disabled states for edge cases in pagination
function loadPageNumbers() {
    pagination = $('.pagination')
    currentPage = $('.pagination .active a').html()
    previousPageButton = $('.pagination .previous')
    nextPageButton = $('.pagination .next')
    totalPages = listingsCount / 15

    if (currentPage == 1) {
        previousPageButton.addClass('disabled')
    } else {
        previousPageButton.removeClass('disabled')
    }

    if (currentPage >= totalPages) {
        nextPageButton.addClass('disabled')
    } else {
        nextPageButton.removeClass('disabled')
    }

}

$(document).ready(function () {
    var search = new URLSearchParams(window.location.search);
    var category = search.get('category');
    var keywords = search.get('keywords');

    var fetchOptions = {
        method: 'GET',
    };

    fetchURL = '/search/?category=' + category + '&keywords=' + keywords;

    fetch(fetchURL, fetchOptions)
        .then((data) => {
            return data.json();
        })
        .then((dataJson) => {
            allListings = dataJson['listings'];
            listingsCount = dataJson['listings_count'];
            zeroFound = dataJson['zero_found'];
            loadListings();
            loadPageNumbers();
        })
        .catch((err) => {
            console.log(err);
        });

    if (category) {
        document.getElementById('category').value = category;
    } else {
        document.getElementById('category').value = 'Any';
    }

    if (keywords) {
        document.getElementById('search-bar').value = keywords;
    } else {
        document.getElementById('search-bar').placeholder = 'Search...';
    }

    // change sort for listings
    $('#sort').on('changed.bs.select', function () {
        clearResults();

        fetchURL = '/search/?category=' + category + '&keywords=' + keywords + '&sort=' + $(this).val() + '&skip=' + skip;;

        fetch(fetchURL, fetchOptions)
            .then((data) => {
                return data.json();
            })
            .then((dataJson) => {
                allListings = dataJson['listings'];
                listingsCount = dataJson['listings_count'];
                zeroFound = dataJson['zero_found'];
                loadListings();
            })
            .catch((err) => {
                console.log(err);
            });
    })

    // change page numbers
    $('.pagination a').click(function (e) {
        previousPageButton = $('.pagination .previous');
        nextPageButton = $('.pagination .next');
        currentPage = $('.pagination .active a');
        let buttonValue = $(this).html();
        if (buttonValue == '&lt;' && !previousPageButton.hasClass('disabled')) {
            skip -= 15;
        } else if (buttonValue == '&gt;' && !nextPageButton.hasClass('disabled')) {
            skip += 15;
        }
        currentPage.html((skip / 15) + 1);

        clearResults();

        fetchURL = '/search/?category=' + category + '&keywords=' + keywords + '&sort=' + $('#sort').val() + '&skip=' + skip;

        fetch(fetchURL, fetchOptions)
            .then((data) => {
                return data.json();
            })
            .then((dataJson) => {
                allListings = dataJson['listings'];
                listingsCount = dataJson['listings_count'];
                zeroFound = dataJson['zero_found'];
                loadListings();
                loadPageNumbers();
            })
            .catch((err) => {
                console.log(err);
            });
    });
});
