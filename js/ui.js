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

//search button

const playerhead = document.querySelector("#playerhead");
const addbtn = document.querySelector(".buttonadd");
const searchbtn = document.querySelector(".cssbuttons-io");
const deletebtn = document.querySelector(".delbutton");
const searchbtntext = document.querySelector(".cssbuttons-io span");
const searchinput = document.querySelector("#search-list");

const searchsvg =`<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-width="5" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
</svg>
`;

const closesvg =`<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M6 18 17.94 6M18 18 6.06 6"/>
</svg>
`;

let search = false;

searchbtntext.addEventListener("click", function () {
  search = !search;
  if (search) {
    playerhead.style["grid-template-columns"] = "1fr ";
  addbtn.style.display = "none";
  deletebtn.style.display = "none";
  searchbtn.style["grid-template-columns"] = "7fr  1fr";  
  searchbtn.style["max-width"] = "none";
  searchinput.style.display = "flex";
  searchbtntext.innerHTML = closesvg  + "Close" ;
  
  }
  else {
    playerhead.style["grid-template-columns"] = "1fr 1fr 1fr";
    addbtn.style.display = "flex";
    deletebtn.style.display = "flex";
    searchbtn.style["grid-template-columns"] = "1fr ";    
    searchbtn.style["max-width"] = "150px";
    searchinput.style.display = "none";
    searchbtntext.innerHTML = searchsvg + "Search ";
    searchinput.value = ""; 
    let songs = document.querySelectorAll('#playlist li');
    songs.forEach((song) => {
      song.style.display = "grid";
    });   
  }
  
  
});