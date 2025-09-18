document.addEventListener('DOMContentLoaded', function () {
  var headers = document.querySelectorAll('.dr-header');

  headers.forEach(function (header) {
    var toggle = header.querySelector('.dr-header__toggle');
    var navLinks = header.querySelectorAll('.dr-header__nav-link');

    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('dr-header--nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (header.classList.contains('dr-header--nav-open')) {
          header.classList.remove('dr-header--nav-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });
});
