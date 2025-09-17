var overviewScore = document.querySelectorAll('.overview-score');
var overviewTotal = document.querySelectorAll('.overview-total');
var ratingscorestars = document.querySelector('#rating-score');
var reviewCardTemplate = document.querySelector('#review-card');
var reviewScoreBar = document.querySelector('#reviewscore-bar');
var reviewScoreIcon = document.querySelector('#reviewtotal-icon');
var reviewOverviewBar = document.querySelector('#reviewoverview-bar');
var reviewOverviewIcon = document.querySelector('#reviewscore-icon');
var reviewCardContainer = document.querySelector('.coach-review__bottom');
var hidereviews = document.querySelector('#js_hide');
var showreviews = document.querySelector('#js_show');



function getReview(coachid, amount) {
  fetch("https://member.cialdini.com/_hcms/api/coachreviewsIS?coach_survey_id=" + coachid, {
  'method': 'GET',
  'headers': {
    'Content-Type': 'application/json',
  }
  })  
  .then(response => response.json())
   .then(result => {
    console.log(result);
      overviewScore.forEach((y) => {
    y.innerText = result.statistics.averageScore / 2;   // set the average score in the overview
  })
      overviewTotal.forEach((t) => {
    t.innerText = result.statistics.count;  // set the amount of reviews in the overview
  })
  var outcome = result.statistics.averageScore / 2;
       const scoreValue = "--value-current: " + outcome + "; --value-target: 5;"; // set the average score in the targets part
   reviewScoreBar.style.cssText = scoreValue;
    if (ratingscorestars) {  // if there are stars shown near the overall rating
    var score = Math.round(outcome);
   ratingscorestars.dataset.rating = score; 
    }
       const overviewValue = "--value-current: " + result.statistics.count + "; --value-target: 40;"; // set the amount of total reviews in the targets part
   reviewOverviewBar.style.cssText = overviewValue;
    if (result.statistics.count > 39 ){
     const icon = reviewScoreIcon.classList;
      icon.add("coach-targets__item--low");
    }
     if (outcome >= 4 ){
       if (reviewOverviewIcon){
       overview = reviewOverviewIcon.classList;
       overview.add("coach-targets__item--low");
       }
     }
    
   if (result.statistics.count === 0 ){ // if there are no reviews don't show
      hidereviews.style.display = "block";
      showreviews.style.display = "none";
    } else {
        showreviews.style.display = "block";
    }
    const arr = Array.from(result.responses);
    var counter = 0;
    arr.forEach((item) => {
  if (amount === 3 && counter < 3) {
    addReview(item); // make the reviews
    counter++;
  } 
   if (amount === 6) {
    addReview(item);
  }
})
    if (amount === 6) {
  if (arr.length > amount){          // paginate the reviews
  initSort()
    pagination();               
  }
    }
    })
    .catch(error => console.log('error', error));
}



function addReview(data) {
  console.log('addreview');
  const originalDate = data.createdAt;
const parts = originalDate.split("-");
const newDate = parts.reverse().join("-");
const score = data.score /2;
  const title = data.metadata["job title"];
   const image = data.attachments[0];
  const clone = reviewCardTemplate.content.cloneNode(true);
  if (!data.author) {
    data.author = "Anonymous";
  }
  roundscore = Math.round(score);
   if (clone.querySelector('.card-review__text')){
  clone.querySelector('.card-review__text').innerText = data.testimonial;
   }
    if (clone.querySelector('.card-review__rate-text')){
  clone.querySelector('.card-review__rate-text').innerText = score;
    }
     if (clone.querySelector('.rating-score')){
  clone.querySelector('.rating-score').dataset.rating = Math.round(score);
     }
    if (clone.querySelector('.card-review__author')){
 clone.querySelector('.card-review__author').innerText = data.author;
    }
      if (clone.querySelector('.card-review__author')){
  clone.querySelector('.card-review__author').dataset.sort = newDate;
      }
      if (clone.querySelector('.card-testimonial__value')){
  clone.querySelector('.card-testimonial__value').innerHTML = title;
      }
if (image){
      if (clone.querySelector('.card-testimonial__image')){
  picture = clone.querySelector('.card-testimonial__image');
        picture.src = image;
      }
}
  reviewCardContainer.append(clone);
}


function initSort() {
var options = {
  valueNames: [
    { name: 'sort', attr: 'data-sort'}
  ],
  listClass: 'coach-review__bottom',
};
var filteredList = new List('review_list', options);
function sortList(e) {
  filteredList.sort('sort', {
  order: e.target.value === 'date-asc' ? 'asc' : 'desc'
  })
}
  $('select[name=sort]').change(sortList);
}

if (document.getElementById('js-sort_list')) {
var myList = new List('js-sort_list', {
  listClass: 'card-review',
  valueNames: [  { name: 'sort', attr: 'data-sort'}],
  sortClass: 'sort',
  sortAscClass: 'asc',
  sortDescClass: 'desc',
  sortFunction: function(a, b) {
    var dateA = new Date(a.elm.getAttribute('data-date'));
    var dateB = new Date(b.elm.getAttribute('data-date'));

    if (dropdownMenu.value === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  }
});
  } else {
  console.log("Element with ID 'js-sort_list' not found.");
}


var dropdownMenu = document.getElementById('sort-selector');
if (dropdownMenu){
dropdownMenu.addEventListener('change', function() {
  myList.sort('sort');
});
}







