// Website header variables

var menuParentItems = document.querySelectorAll('.header__menu--desktop .header__menu-item--has-submenu');
var openToggle = document.querySelectorAll('.header__menu-toggle--open');
var closeToggle = document.querySelectorAll('.header__menu-toggle--close');
var mobileChildToggle = document.querySelectorAll('.header__menu--mobile .header__menu-child-toggle');
var langToggle = document.querySelectorAll('.header__language-switcher-child-toggle');

// Desktop menu

if (menuParentItems) {
  Array.prototype.forEach.call(menuParentItems, function(el){

    // Link variables

    var childToggle = el.querySelector('.header__menu-child-toggle');

    // Handles hover over

    el.addEventListener('mouseover', function(){
      this.classList.add('header__menu-item--open');
      this.querySelector('a').setAttribute('aria-expanded', 'true');
      this.querySelector('button').setAttribute('aria-expanded', 'true');
    });

    // Handles hover out

    el.addEventListener('mouseout', function(){
      document.querySelector('.header__menu-item--open > a').setAttribute('aria-expanded', 'false');
      document.querySelector('.header__menu-item--open > button').setAttribute('aria-expanded', 'false');
      document.querySelector('.header__menu-item--open').classList.remove('header__menu-item--open');
    });

    // Handles toggle for submenus

    childToggle.addEventListener('click', function(){
      if (this.parentNode.classList.contains('header__menu-item--open')) {
        this.parentNode.classList.remove('header__menu-item--open');
        this.parentNode.querySelector('a').setAttribute('aria-expanded', 'false');
        this.parentNode.querySelector('button').setAttribute('aria-expanded', 'false');
      }
      else {
        this.parentNode.classList.add('header__menu-item--open');
        this.parentNode.querySelector('a').setAttribute('aria-expanded', 'true');
        this.parentNode.querySelector('button').setAttribute('aria-expanded', 'true');
      }
    });

  });

}

function fillStars() {
  let ratingElement = document.getElementById('header-rating-score-stars'); // Select all elements with class 'rating-score'
    let rating = parseFloat(ratingElement.dataset.rating); // Get the rating

    let fullStars = Math.floor(rating); // Integer part
    let fractionStar = rating % 1; // Fractional part
    let starElements = ratingElement.querySelectorAll(".star");

    for (let i = 0; i < fullStars; i++) {
      // fill the star completely
      starElements[i].querySelector(".star-fg").style.width = "100%";
    }

    // fill the fractional star
    if (fractionStar > 0 && fullStars < starElements.length) {
      starElements[fullStars].querySelector(".star-fg").style.width = `${fractionStar * 100}%`;
    }

    // empty the remaining stars
    for (let i = fullStars + 1; i < starElements.length; i++) {
      starElements[i].querySelector(".star-fg").style.width = "0%";
    }

  
};
fillStars();


