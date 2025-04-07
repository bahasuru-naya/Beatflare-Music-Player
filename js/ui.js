//preloader
const preloader = document.querySelector(".preloaderback");
window.addEventListener("load", () => {

  setTimeout(() => {
    preloader.style.display = "none";
  }, 1500);
  //preloader.style.animation = "fade-out 2s cubic-bezier(0.550, 0.085, 0.680, 0.530)  both";


});

//add button
document.querySelector('.buttonadd').addEventListener('click', function () {
  document.getElementById('file-input').click();
});

const menutoggle = document.getElementById('menu-toggle');
const menuitems = document.getElementsByClassName('menu__item');

for (let i = 0; i < menuitems.length; i++) {
  menuitems[i].addEventListener('click', function () {
    // Code to uncheck the checkbox or perform action
    if (menutoggle.checked) {
      menutoggle.checked = false;
    }
  });
}


const tabs = document.querySelector(".tabs");
const btns = document.querySelectorAll(".tbutton");
const articles = document.querySelectorAll(".tcontent");
tabs.addEventListener("click", function (e) {
  const id = e.target.dataset.id;
  if (id) {
    // remove selected from other buttons
    btns.forEach(function (btn) {
      btn.classList.remove("live");
    });
    e.target.classList.add("live");
    // hide other articles
    articles.forEach(function (article) {
      article.classList.remove("live");
    });
    const element = document.getElementById(id);
    element.classList.add("live");
  }
});

// handle reload

window.onbeforeunload = function (event) {
  event.preventDefault();

};


//close error msg
document.querySelector('#error_ok').addEventListener('click', function () {
  document.querySelector('#error').style.display = 'none';
});


// handle small screen
// Script to detect small screens and show the warning message
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('mobileWarning');

  // Function to check screen width and show/hide warning
  function checkScreenWidth() {
    if (window.innerWidth < 500) {
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
      overlay.style.display = 'none';
      document.body.style.overflow = ''; // Enable scrolling
    }
  }

  // Check on initial load
  checkScreenWidth();

  // Check when window is resized
  window.addEventListener('resize', checkScreenWidth);
});