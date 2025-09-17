var reviewTestTemplate = document.querySelector('#testimonial-card');
var reviewTestContainer = document.querySelector('#masonry-grid');
 
var msnry;



function setMasonry(){
  var elem = document.querySelector('#masonry-grid');
  var items = elem.querySelectorAll('.grid-item:not(.hidden)');
  var itemCount = 20;
  var loadMoreButton = document.getElementById('loadMore');
//   var msnry;
    function initMasonry() {
    if (msnry) {
      msnry.destroy();
    }
    msnry = new Masonry(elem, {
      itemSelector: '.grid-item:not(.hidden)',
      columnWidth: '.grid-sizer',
      percentPosition: true,
      gutter: 30
    });
  }
  function showItems(n) {
 
    for (var i = 0; i < items.length; i++) {
      if (i < n) {
     items[i].classList.remove('hidden');
      } else {
        items[i].classList.add('hidden');
      }
    }
        // Re-initialize Masonry with updated items
    initMasonry();

  }


  // Show only the first 9 items initially
  showItems(itemCount);

    // Add click event listener to the load more button
  loadMoreButton.addEventListener('click', function() {
    itemCount += 20;
    showItems(itemCount);

    // Hide the load more button if all items are displayed
    if (itemCount >= items.length) {
      loadMoreButton.style.display = 'none';
    }
  });

  // Initially hide the load more button if there are 9 or fewer items
  if (items.length <= 20) {
    loadMoreButton.style.display = 'block';
  }


}







