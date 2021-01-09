/*
This file generates the nav bar. This removes the need to copy paste the html
in every single html file. We also get the categories from the server and handle
search persistence here.

Author: Dale Armstrong, Niall Healy
*/

$(document).ready(function() {
    let navbar = document.getElementById("navId");

    navbar.innerHTML = '<div class="d-flex flex-grow-1"> \
		<a class="navbar-brand" href="/">GatorTrader</a> \
		<form action="/results/" method="GET" class="mr-2 my-auto w-100 d-inline-block order-1"> \
			<div class="input-group justify-content-center"> \
				<div class="input-group-prepend btn-group"> \
					<button class="btn btn-secondary dropdown-toggle" id="dropdown-button" type="button" data-toggle="dropdown" \
						aria-haspopup="true" aria-expanded="false">Any</button> \
					<input name="category" id="category" value="Any" type="hidden"> \
					<ul class="dropdown-menu" id="dropdown-category"> \
					</ul> \
				</div> \
				<input type="text" class="form-control border border-right-0" id="search-bar" name="keywords" placeholder="Search..." maxlength="40" pattern="^[a-zA-Z0-9\\s\-]+$" \
		                   oninput="this.setCustomValidity(\'\')" oninvalid="this.setCustomValidity(\'Please only enter alpanumeric characters.\')"> \
				<span class="input-group-append"> \
					<button class="btn btn-outline-light border border-left-0" id="search-button" type="submit"> \
						<i class="fa fa-search"></i> \
					</button> \
				</span> \
			</div> \
		</form> \
	</div> \
	<button class="navbar-toggler order-0" type="button" data-toggle="collapse" data-target="#collapse-menu"> \
		<span class="navbar-toggler-icon"></span> \
	</button> \
	<div class="navbar-collapse collapse flex-shrink-1 flex-grow-0 order-last" id="collapse-menu"> \
		<ul class="navbar-nav ml-auto"> \
			<li class="nav-item"> \
				<a class="nav-link" href="/html/about-landing-page.html">About</a> \
			</li> \
			<li class="nav-item"> \
				<a class="nav-link" onclick="postOnClick();">Post</a> \
			</li> \
			<li class="dropdown" id="account-login"> \
			</li> \
		</ul> \
	</div>';

    loadCategories();

    renderNavForUser();

    searchPersistence();

    $(".category-item").on("click", function() {
        $("input[name=category]").val($(this).attr("data-value"));
        $("#dropdown-button").html($(this).text());
    });
});

function postOnClick() {
    if (localStorage.getItem('loggedInUser')) {
        window.location.href='/html/post-listing-form.html';
    }
    else {
        window.location.href='/html/login-register.html';
    }
}

function handleLogout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
}

function searchPersistence() {
    let search = new URLSearchParams(window.location.search);
    let category = search.get('category');
    let keywords = search.get('keywords');


    if (category) {
        $("input[name=category]").val(category);
        $("#dropdown-button").html(category);
    } else {
        document.getElementById('category').value = 'Any';
    }

    if (keywords) {
        document.getElementById('search-bar').value = keywords;
    } else {
        document.getElementById('search-bar').placeholder = "Search..."
    }
}

function loadCategories() {
    let localStorageCategories = JSON.parse(localStorage.getItem('categories'));
    if (localStorageCategories == null || localStorageCategories.length == 0) {
        getCategoriesFromServer();
    } else {
        renderCategoryDropdown(localStorageCategories);
    }
}

function renderNavForUser() {
    if (localStorage.getItem('loggedInUser')) {
        let accountLogin = document.getElementById('account-login');
        let _html = `<a class="dropdown-toggle nav-link" id="dropdown-hide" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Account</a> \
	                <ul class="dropdown-menu dropdown-menu-right" id="login-dropdown"> \
	                    <li><a class="nav-link" href="/html/profile.html">Profile</a></li> \
	                    <li><a class="nav-link" id="logout-button" onclick="handleLogout();">Logout</a></li> \
	                </ul>`;
        accountLogin.innerHTML = _html;
        // document.getElementById('logout-button').onclick = logoutUser;
    } else {
        let accountLogin = document.getElementById('account-login');
        let _html = `<a class="nav-link" href="/html/login-register.html">Login/Register</a>`
        accountLogin.innerHTML = _html;
    }
}

function getCategoriesFromServer() {
    fetch('/categories/')
        .then((data) => {
            return data.json();
        })
        .then((dataJson) => {
            storeAndRenderCategories(dataJson);
        })
        .catch((err) => {
            console.log(err);
        });
}

function storeAndRenderCategories(categories) {
    var dropdown = document.getElementById('dropdown-category');
    var categoriesToStore = [];
    var _html = '';
    for (i = 0; i < categories.length; i++) {
        categoriesToStore.push(categories[i].category);
        _html += '<li class="category-item" data-value="' + categories[i].category + '">' + categories[i].category + '</li>';
    }

    localStorage.setItem('categories', JSON.stringify(categoriesToStore));
    dropdown.innerHTML = _html;
}

function renderCategoryDropdown(categories) {
    var dropdown = document.getElementById('dropdown-category');
    var _html = '';
    for (i = 0; i < categories.length; i++) {
        _html += '<li class="category-item" data-value="' + categories[i] + '">' + categories[i] + '</li>';
    }
    dropdown.innerHTML = _html;
}
