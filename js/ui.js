//preloader
const preloader = document.querySelector(".preloaderback");
window.addEventListener("load", () => {

  //setTimeout(() => {
  //preloader.style.display = "none";} , 1000);
  preloader.style.animation = "fade-out 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.75s both";
  preloader.addEventListener('animationend', () => {
    // Once the animation ends, hide the preloader
    preloader.style.display = 'none'; // Alternatively, you can remove the element with preloader.remove();
  });

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