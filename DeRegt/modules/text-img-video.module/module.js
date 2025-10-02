document.addEventListener('DOMContentLoaded', function () {
  // Find all elements with the class 'leader-with-video__play'
  const playButtons = document.querySelectorAll('.leader-with-video__play')

  playButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      // Find the closest parent with the class 'leader-with-video__layers'
      const parentLayer = button.closest('.leader-with-video__layers')

      // If the parent is found, toggle the 'playing' class
      if (parentLayer) {
        parentLayer.classList.toggle('playing')
      }
    })
  })
})
