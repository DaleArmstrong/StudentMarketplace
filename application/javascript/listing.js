/*
This file contains javascript for loading an individual listing page

Author: Aaron Lander
*/

// Load response from server into html
function loadListing(listing) {
    document.getElementById('listing-name').innerHTML += listing.name;
    document.getElementById('listing-description').innerHTML += listing.description;
    document.getElementById('listing-price').innerHTML += '$' + listing.price;

    if(listing.course){
       $('#course-item').css({"display": "block"});
       $('#course-item').removeClass('input-hidden');
       $('#listing-course').append(listing.course);
    }

    // disable contact button if post is not yet approved
    const contactButton = document.getElementById("contact-button")
    if(!listing.isApproved) {
        contactButton.disabled = true;
        contactButton.innerHTML = "This listing has not yet been approved";
        contactButton.classList.add('btn-danger');
        contactButton.style.color = "black";
    }
    else {
        contactButton.disabled = false;
        contactButton.innerHTML = "Contact Seller";
        contactButton.classList.add('btn-primary');
        contactButton.style.color = "white";
    }

    var carousel = document.getElementById('carousel-inner');
    var indicators = document.getElementById('carousel-indicators');

    photos = listing.photoPaths;

    // Load each photo, and with each photo create a new indicator
    for (var i = 0; i < photos.length; i++) {
        var div;
        div = document.createElement('div');
        div.id = 'img-' + i;

        if (i == 0) {
            div.className = 'carousel-item active';
            carousel.appendChild(div);

            indicators.innerHTML += '<li data-target="#carousel" data-slide-to="' + i + '" class="active"></li>';
        } else {
            div.className = 'carousel-item';
            carousel.appendChild(div);

            indicators.innerHTML += '<li data-target="#carousel" data-slide-to="' + i + '"></li>';
        }

        var img = document.createElement('img');
        img.className = "img-fluid";
        img.src = photos[i].path;

        document.getElementById('img-' + i).appendChild(img);
    }
    $('#carousel').carousel();
}

function openContactModal() {

    user = JSON.parse(localStorage.getItem('loggedInUser'));

    // If user is not logged in, redirect to login page
    if(!user) {
      window.location.assign('/html/login-register.html');
      return;
    }

    $('#modal').modal();
    $('#contact-text').val('');
}

function setModalInfo(listing) {
    user = JSON.parse(localStorage.getItem('loggedInUser'));

    $('#from-text').html('From: ' + user.email);
    $('#listing-text').html('Listing: ' + listing.name);
}

function sendMessage(){
   $('#modal').modal('toggle');

   var message = "";
   message += $('#from-text').html() + '\n';
   message += $('#listing-text').html() + '\n';

   message += $('#contact-text').val();

   var search = new URLSearchParams(window.location.search);
   var id = parseInt(search.get('id'));

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
	   if(response.ok){
              alert('Message sent!');
	   }
	   else {
              alert('Message failed to send.');
	   }
	})
}

//function to store last 10 recent listings visited
function storeRecentListingId(id) {

    var recentlyVisited = null
    if (localStorage.hasOwnProperty('recentlyVisited')) {
        recentlyVisited = JSON.parse(localStorage.getItem('recentlyVisited'));
        if (recentlyVisited.includes(id))
            return

        if(recentlyVisited.length == 10) {
            recentlyVisited.shift();
        }

        recentlyVisited.push(id);
    } else {
        recentlyVisited = [id];
    }

    localStorage.setItem('recentlyVisited', JSON.stringify(recentlyVisited));
}

// Send get request for listing on page load
$(document).ready(function () {
    var search = new URLSearchParams(window.location.search);
    var id = parseInt(search.get('id'));

    var fetchOptions = {
        method: 'GET'
    }

    fetchURL = "/listing/getListing/?id=" + id

    // Listing information fetch call
    fetch(fetchURL, fetchOptions)
        .then((data) => {
            return data.json();
        })
        .then((dataJson) => {
            storeRecentListingId(id);
            loadListing(dataJson);
            setModalInfo(dataJson);
        })
        .catch((err) => {
            console.log(err);
        })
});
