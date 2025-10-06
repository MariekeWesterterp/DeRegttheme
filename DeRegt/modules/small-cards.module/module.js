(function () {
  if (typeof document === 'undefined') {
    return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var modules = document.querySelectorAll('.small-cards');

    for (var i = 0; i < modules.length; i++) {
      (function (moduleEl) {
        var grid = moduleEl.querySelector('.small-cards__grid[data-mobile-limit]');
        var button = moduleEl.querySelector('.small-cards__load-more');

        if (!grid || !button) {
          return;
        }

        var mobileLimitAttr = grid.getAttribute('data-mobile-limit');
        var mobileLimit = parseInt(mobileLimitAttr, 10);

        if (isNaN(mobileLimit) || mobileLimit < 0) {
          mobileLimit = 4;
        }

        button.addEventListener('click', function () {
          var cards = Array.prototype.slice.call(grid.querySelectorAll('.small-cards__card'));
          var extraCards = cards.slice(mobileLimit);
          var prefersReducedMotion = false;

          if (typeof window.matchMedia === 'function') {
            prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          }

          if (prefersReducedMotion) {
            grid.classList.add('is-expanded');
            button.classList.add('is-hidden');
            button.setAttribute('aria-expanded', 'true');
            button.setAttribute('disabled', 'disabled');
            return;
          }

          extraCards.forEach(function (card, index) {
            card.classList.add('small-cards__card--enter');
            card.style.transitionDelay = (index * 60) + 'ms';

            var handleTransitionEnd = function (event) {
              if (event.target !== card || event.propertyName !== 'opacity') {
                return;
              }

              card.removeEventListener('transitionend', handleTransitionEnd);
              card.classList.remove('small-cards__card--enter');
              card.classList.remove('is-visible');
              card.style.transitionDelay = '';
            };

            card.addEventListener('transitionend', handleTransitionEnd);
          });

          grid.classList.add('is-expanded');

          window.requestAnimationFrame(function () {
            extraCards.forEach(function (card) {
              card.classList.add('is-visible');
            });
          });

          button.classList.add('is-hidden');
          button.setAttribute('aria-expanded', 'true');
          button.setAttribute('disabled', 'disabled');
        });
      })(modules[i]);
    }
  });
})();
