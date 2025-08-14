//preloader
const preloader = document.querySelector(".preloaderback");
const preloadImage = new Image();

if (darkModeSaved === 'true') {
  preloadImage.src = './images/pre-back-dark.jpg';
  preloader.style.backgroundColor = 'black';
} else {
  preloadImage.src = './images/pre-back.jpg';
  preloader.style.backgroundColor = 'white';
}

const preloadback = document.querySelector(".pre-back");
setTimeout(() => {
preloadback.style.opacity = "1";
}, 300);

// Wait for the background image to load
preloadImage.onload = () => {  
  preloader.style.setProperty('--bg-url', `url("${preloadImage.src}")`);
  preloader.style.setProperty('--img-ani', "fade-in 0.5s ease-in-out forwards");
  preloader.style.setProperty('--img-op', "1");

  // Then wait for window load
  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.style.animation = "fade-out 0.5s ease-in-out forwards";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    }, 3000);
  });
};



//add files button
document.querySelector('#import-files').addEventListener('click', function () {
  document.getElementById('file-input').click();
});

//add folder button
document.querySelector('#import-folder').addEventListener('click', function () {
  document.getElementById('folder-input').click();
});

const addbutton = document.getElementById('addButton');
const addmenu = document.getElementById('addbtn-menu');

let isMenuOpen = false;

// Toggle menu visibility on click
addbutton.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent bubbling
  isMenuOpen = !isMenuOpen;
  addmenu.style.display = isMenuOpen ? 'block' : 'none';
});

// Hide menu if clicked outside
document.addEventListener('click', (e) => {
  if (!addmenu.contains(e.target) && !addbutton.contains(e.target)) {
    addmenu.style.display = 'none';
    isMenuOpen = false;
  }
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

// handle small screen
// Script to detect small screens and show the warning message
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('mobileWarning');

  // Function to check screen width and show/hide warning
  function checkScreenWidth() {
    if (window.innerWidth < 390) {
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
const playerSection = document.querySelector("#playersec");

const observerOptions = {
  threshold: 0.45, // Adjust if needed
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

    if (entry.target.id === "playersec") {
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
