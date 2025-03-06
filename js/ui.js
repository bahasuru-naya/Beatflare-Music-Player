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

/*

//bubble animation
(function () {  

  function getRandomColor() {
    var colors = ["#456", "#890", "#634", "#299", "tomato", "#fb3"],
      idx = Math.floor(colors.length * Math.random());

    return (colors[idx]);
  }

  function animateIt(el, dur, delay) {
    var animateEl = el.animate([
      {
        opacity: 0,
        transform: "translate(-50%, -50%) scale(0)"
      },

      {
        opacity: 1,
        transform: "translate(-50%, -50%) scale(1)"
      },
      {
        opacity: 0,
        transform: "translate(-50%, -50%) scale(1.1)"
      }

    ],
      {
        duration: dur,
        easing: "ease-out",
        fill: "forwards",
        delay: delay || 0
      });

    return animateEl;
  } 
  function createBubble() {
    var ns = "http://www.w3.org/2000/svg",
      bubble = document.createElement("div"),
      bubbleDummy = document.createElement("div"),
      heart = document.createElementNS(ns,"svg")      ;

    heart.setAttribute("viewBox", "0 0 24 24")
    heart.innerHTML=`<path d="M9.5 13C7.567 13 6 14.567 6 16.5S7.567 20 9.5 20s3.5-1.567 3.5-3.5S11.433 13 9.5 13Z"/>
  <path fill-rule="evenodd" d="M11 5c0-.55228.4477-1 1-1 1.5438 0 3.3242.75435 4.5149 2.16836 1.2348 1.46632 1.7886 3.5834.9338 6.14784-.1747.524-.741.8071-1.2649.6325-.524-.1747-.8071-.741-.6325-1.2649.6452-1.93556.199-3.31848-.5662-4.22716C14.4407 6.8102 13.7107 6.37433 13 6.15825V16.5c0 .5523-.4477 1-1 1s-1-.4477-1-1V5Z" clip-rule="evenodd"/>`;
    bubble.classList.add("bubble");
    bubble.style.color = getRandomColor();
    bubbleDummy.classList.add("bubble-dummy");
    heart.classList.add("heart");

    
    bubble.appendChild(bubbleDummy);
    bubble.appendChild(heart);

    document.body.appendChild(bubble);
    return {
      setPosition: function (x, y) {
        x = Math.min(x,document.body.offsetWidth-100);
        y =Math.min(y,document.body.offsetHeight-100);
        bubble.style.left = x + "px";

        bubble.style.top = y + "px";
      },
      _animate: function () {
        var animateBubble = animateIt(bubbleDummy, 1200),
          animateHeart = animateIt(heart, 2000);

        console.log(animateBubble)

        return {
          bubbleDur: 1200,
          heartDur: 2000
        }
      },
      remove: function (el) {
        bubble.remove();
      }
    }
  }


  

  function handleDown(e) {
    var _x = e.pageX,
      _y = e.pageY;

    var bubble = createBubble();

    bubble.setPosition(_x, _y);
    var animation = bubble._animate(),
      totalDelay = animation.bubbleDur + animation.heartDur;
    
    setTimeout(() => {
      bubble.remove();
      console.log("removed");
    }, totalDelay);

    console.log(animation);
  }

  var w = document.body.clientWidth,
    h = document.body.clientHeight;

  function bubbleUp() {
    var de = {
      pageX: Math.random() * w,
      pageY: Math.random() * h
    }

    handleDown(de);

    bblUp = setTimeout(bubbleUp, 200);

  }
  bubbleUp();

  window.addEventListener("resize", function () {
    w = document.body.offsetWidth-70,
      h = document.body.offsetHeight-100;
  }, false);
})(); */