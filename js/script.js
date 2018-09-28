const body = document.body;
const pageHeader = document.querySelector(".page-header");

const scrollbar = (function() {
  const div = document.createElement("div");
  div.style.cssText = "width: 50px; \
    height: 50px;\
    overflow: scroll;\
  ";
  body.appendChild(div);

  const scrollbar = div.offsetWidth - div.clientWidth;
  body.removeChild(div);

  return scrollbar;
})();


function Menu(options) {
  const menu = options.menu;
  const button = options.button;

  menu.style.transition = "transform 0.8s";

  menu.onclick = function(event) {
    if (event.target.classList.contains("main-nav__link") ||
      event.target.classList.contains("main-nav__social-link")) {
      close();
    }
  }

  let isOpen = false;

  function toggle() {
    if(isOpen) {
      close();
    } else open();
  }

  function open() {
    menu.style.paddingRight = `${scrollbar}px`;
    menu.classList.add("main-nav--opened");

    isOpen = true;

    const menuEvent = new Event("open", {
      bubbles: true
    });

    menu.dispatchEvent(menuEvent);
  }

  function close() {
    menu.style.paddingRight = "";
    menu.classList.remove("main-nav--opened");

    isOpen = false;

    const menuEvent = new Event("close", {
      bubbles: true
    });

    menu.dispatchEvent(menuEvent);
  }

  button.addEventListener("click", (event) => {
    toggle();
  })
}

const menu = new Menu({
  menu: document.querySelector(".main-nav"),
  button: document.querySelector(".page-header__button")
});



body.addEventListener("open", () => {
  body.style.cssText = `overflow: hidden; \
  padding-right: ${scrollbar}px`
});

body.addEventListener("close", () => {
  body.style.cssText = "";
});

let timerId;

pageHeader.addEventListener("open", () => {
  pageHeader.classList.add("menu-opened");
  pageHeader.style.paddingRight = `${scrollbar}px`;

  if (!timerId) {
    pageHeader.style.color = "#ffffff";
  }

  clearTimeout(timerId);
  timerId = false;
});

pageHeader.addEventListener("close", () => {
  pageHeader.classList.remove("menu-opened");
  pageHeader.style.paddingRight = "";

  timerId = setTimeout(function() {
    pageHeader.style.color = "";
    timerId = false;
  }, 500);
});


// --invert header------------
const works = document.querySelector(".works");
const about = document.querySelector(".about");

window.onscroll = function() {
  let whiteSections = [works, about].map( (a) => a.getBoundingClientRect());

  if ( !pageHeader.classList.contains(".page-header--invert")
    && whiteSections.some( (a) => a.top < 50 && a.bottom > 50 ) ) {
    pageHeader.classList.add("page-header--invert");
  } else {
    pageHeader.classList.remove("page-header--invert");
  }
};

// --scroll down------------------


function getElementY(elem) {
  return elem.getBoundingClientRect().top + window.pageYOffset;
}

function doScrolling(elementY, duration) {
  var startingY = window.pageYOffset;
  var diff = elementY - startingY;
  var start;

  // Bootstrap our animation - it will get called right before next frame shall be rendered.
  window.requestAnimationFrame(function step(timestamp) {
    if (!start) start = timestamp;
    // Elapsed milliseconds since start of scrolling.
    var time = timestamp - start;
    // Get percent of completion in range [0, 1].
    var percent = Math.min(time / duration, 1);

    window.scrollTo(0, startingY + diff * percent);

    // Proceed with animation as long as we wanted it to.
    if (time < duration) {
      window.requestAnimationFrame(step);
    }
  })
}

document.querySelector(".intro__scroll-down-button").onclick = function() {
  const a = getElementY( document.querySelector(".works") );
  doScrolling(a, 400);
}

document.querySelector(".works__scroll-down-button").onclick = function() {
  const a = getElementY( document.querySelector(".about") );
  doScrolling(a, 400);
}

function isVisible(elem) {
  const coords = elem.getBoundingClientRect();
  const windowHeigt = document.documentElement.clientHeight;

  const topVisible = coords.top > 0 && coords.bottom < windowHeigt;
  const bottomVisible = coords.bottom < windowHeigt && coords.bottm > 0;

  return topVisible || bottomVisible;
}

// window.addEventListener("scroll", function() {
//   let a = isVisible(document.querySelector(".slider"));
//   if (a) s.animate();
// });


isVisible(document.querySelector(".slider"));
