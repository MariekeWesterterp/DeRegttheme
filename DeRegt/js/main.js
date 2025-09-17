// Mobile menu
     const openButton = document.getElementsByClassName("header__menu-toggle--open")[0];
        const headerModal = document.getElementsByClassName("header__overlay")[0];
        const headerMenuclose = document.getElementsByClassName("header__menu-toggle--close")[0];
        const headerMenuMobile = document.getElementsByClassName("header__menu--mobile")[0];
        const closeButton = document.getElementsByClassName("")[0];
  
       window.onclick = (e) => {
         if (e.target === headerMenuclose) {
             closeModalMobiel();
         }
    };
if (headerMenuclose){
     headerMenuclose.addEventListener("click", function () {
          headerModal.classList.remove("active");
      headerMenuMobile.classList.remove("active");
    })
     openButton.addEventListener("click", function () {
        headerModal.classList.add("active");
      headerMenuMobile.classList.add("active");
    headerMenuclose.classList.add("active");
      headerMenuclose.style.display = "block";
    });
}

        function closeModalMobiel() {
            // headerMenuMobile.style.display = "none";
            headerModal.classList.remove("active");
            headerMenuMobile.classList.remove("active");
        }


//open close login-modal

      const modal = document.getElementById("login");
        const shadow = document.getElementById("shadow");

        window.onclick = (e) => {
            if (e.target === shadow) {
                closeModal();
            }
        };

        function closeModal() {
            modal.classList.remove("active");
            shadow.classList.remove("active");
        }

        function openModal() {
           closeModalMobiel();
            modal.classList.add("active");
            shadow.classList.add("active");
        }

const sticky = document.getElementsByClassName("header-cta")[0];
const stickyAlert = document.getElementsByClassName("header-alert__section")[0];
window.addEventListener("scroll", function () {
  if(sticky){
    if (this.scrollY > 500) {
        sticky.classList.add("active");
      if (stickyAlert) {
      stickyAlert.classList.add("active");
      }
    }
    else {
        sticky.classList.remove("active");
           if (stickyAlert) {
      stickyAlert.classList.remove("active");
           }
    }
  }
});



function feedbackForm() {
  document.getElementById("openForm").classList.add("showpopup");
  // show feedback and checkmark or cross
  var myFeedback = function() { 
    setTimeout(() => {
      if (this.required){
      var check =  this.parentElement;
      var parent =  check.parentElement;
      var child = this.classList;
        var length = this.value.length;
       if (this.type == 'tel' ){
        length = length - 5;
              var parent =  parent.parentElement;
       }
   
      if (child.contains('error')) {
         if (length == 0) {
            parent.classList.remove('showfeedback');
          parent.classList.add('showerror');

       } else {
    parent.classList.remove('showfeedback');
    parent.classList.add('showerror');
       }
      }  else {
       if (length == 0) {
          parent.classList.add('showerror');
          parent.classList.remove('showfeedback');
       } else {
    parent.classList.remove('showerror');
    parent.classList.add('showfeedback');
       }
      }
    }
}, 500);
      
  }
  
var input = document.getElementsByClassName('hs-input'); 
     // check if the input items are focused out
for (var i = 0; i < input.length ; i++) {
    input[i].addEventListener('blur', myFeedback);

  }
}

function closedMobileCTA() {
  document.getElementById("cta_mobile").classList.add("hide");;
}
function closedForm() {
  document.getElementById("openForm").classList.remove("showpopup");;
}
  


function closePopup(item) {
  var modal = document.getElementById(item);
  const list = modal.classList;
  list.remove("open");
}

function openPopup(item) {
  var modal = document.getElementById(item);
  const list = modal.classList;
  list.add("open");

}

