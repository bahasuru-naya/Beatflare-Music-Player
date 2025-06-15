//preloader
const preloader = document.querySelector(".preloaderback");
window.addEventListener("load", () => {

  setTimeout(() => {
    preloader.style.display = "none";
  }, 3000);
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

//window.onbeforeunload = function (event) {
//event.preventDefault();

//};


// handle small screen
// Script to detect small screens and show the warning message
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('mobileWarning');

  // Function to check screen width and show/hide warning
  function checkScreenWidth() {
    if (window.innerWidth < 350) {
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


const button = document.querySelector(".player-top-button");
const svgIcon = button?.querySelector(".svgIcon");

const rotateSVG = () => {
  svgIcon.classList.add("rotated");
};

const resetSVG = () => {
  svgIcon.classList.remove("rotated");
};


// Function to hide or show button
const setButtonVisibility = (visible) => {
  button.style.transition = "all 0.3s ease";
  button.style.opacity = visible ? "1" : "0";
  button.style.pointerEvents = visible ? "auto" : "none";
};

// Setup observers for #home and #player
const homeSection = document.querySelector("#home");
const playerSection = document.querySelector("#player");

const observerOptions = {
  threshold: 0.6, // Adjust if needed
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.target.id === "home") {
      if (entry.isIntersecting) {
        rotateSVG();
      } else {
        resetSVG();
      }
    }

    if (entry.target.id === "player") {
      if (entry.isIntersecting) {
        setButtonVisibility(false);
      } else {
        setButtonVisibility(true);
      }
    }
  });
}, observerOptions);

if (homeSection) observer.observe(homeSection);
if (playerSection) observer.observe(playerSection);
