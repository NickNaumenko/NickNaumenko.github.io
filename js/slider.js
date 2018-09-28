function Slider(slider) {
  this.slider = document.querySelector(slider);
  this.frame = this.slider.querySelector(".slider__frame");
  this.items = this.frame.children;
  this.itemsCount = this.items.length;
  this.position = 0;
  this.isAnimated = false;
};

Slider.prototype.init = function() {
  let itemsInView = Math.ceil(this.slider.clientWidth / 580);
  if (itemsInView < this.itemsCount) itemsInView = this.itemsCount;

  const fragmentPrev = document.createDocumentFragment();
  const fragmentNext = document.createDocumentFragment();

  let j = itemsInView % this.itemsCount ? this.itemsCount - (itemsInView % this.itemsCount) : 0;

  for (let i = 0, n = 0; i < itemsInView; i++) {
    let clone1 = this.items[j].cloneNode(true);
    let clone2 = this.items[n].cloneNode(true);

    fragmentPrev.appendChild(clone1);
    fragmentNext.appendChild(clone2);

    j = j < this.itemsCount - 1 ? j + 1 : 0;
    n = n < this.itemsCount - 1 ? n + 1 : 0;
  }


  this.frame.insertBefore(fragmentPrev, this.items[0]);
  this.frame.appendChild(fragmentNext);


  for (let i = -itemsInView; i < this.itemsCount + itemsInView; i++) {
    this.items[i + itemsInView].style.position = "absolute";
    this.items[i + itemsInView].style.left = `${i * 580}px`;
  }
};


Slider.prototype.smoothScroll = function(finish) {
  const self = this;

  let start = this.frame.getBoundingClientRect().left;
  let distance = Math.abs(finish - start);
  let speed = 30;
  let time = distance / speed;

  function scroll() {
    if (start < finish) {
      self.isAnimated = true;

      start += speed;
      start = start < finish ? start : finish;

      setTimeout( () => {
        self.frame.style.transform = `translateX(${start}px)`;
        scroll();
      }, 20);
    } else if (start > finish) {
      self.isAnimated = true;

      start -= speed;
      start = start > finish ? start : finish;

      setTimeout( () => {
        self.frame.style.transform = `translateX(${start}px)`;
        scroll();
      }, 20);
    } else  self.isAnimated = false;
  }

  scroll();
};


Slider.prototype.moveTo = function() {
  let coords = this.frame.getBoundingClientRect().left;
  this.position = Math.round(coords / 580);

  let shift = this.position * 580 - coords;

  if ( Math.abs(this.position) >= this.itemsCount) {
    this.position = this.position > 0 ? this.position - this.itemsCount :
      this.position + this.itemsCount;
  }

  this.frame.style.transform = `translateX(${this.position * 580 - shift}px)`;

  return shift;
};

Slider.prototype.align = function(shift) {
  this.smoothScroll(this.position * 580);
};

Slider.prototype.moveLeft = function() {
  if (this.isAnimated) return;

  this.moveTo();
  this.position--;
  this.smoothScroll( this.position * 580 );
};

Slider.prototype.moveRight = function() {
  if (this.isAnimated) return;

  this.moveTo();
  this.position++;
  this.smoothScroll( this.position * 580 );
}

Slider.prototype.drag = function(events) {
  let self = this;

  let startPosition, downX, position;
  let elem = this.frame;

  function handleDown(event) {
    if (event.which && event.which != 1) return;

    startPosition = elem.getBoundingClientRect().left;
    downX = getEventPosition(event);

    elem.ondragstart = function() {
      return false;
    };

    document.addEventListener(events[1], handleMove);
    document.addEventListener(events[2], handleUp);
  }

  function handleMove(event) {
    clearSelection();
    let path = getEventPosition(event) - downX;

    if ( Math.abs(path) < 3 ) return;

    position = getEventPosition(event) - downX + startPosition;

    move(position);
  }

  function handleUp(event) {
    document.removeEventListener(events[1], handleMove);
    document.removeEventListener(events[2], handleUp);

    self.moveTo();
    self.smoothScroll(self.position * 580);
  };

  function getEventPosition(event) {
    if (event instanceof MouseEvent) return event.pageX;
    if (event instanceof TouchEvent) return event.changedTouches[0].pageX;
  };

  function move(position) {
    elem.style.transform = `matrix(1,0,0,1,${position},0)`;
  };

  function clearSelection() {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else { // старый IE
      document.selection.empty();
    }
  };

  elem.addEventListener(events[0], handleDown);
}

Slider.prototype.wheel = function() {
  const self = this;

  function onWheel(event) {
    let delta = event.deltaY || event.detail || event.wheelDelta;

    if (delta < 0) self.moveRight();
    if (delta > 0) self.moveLeft();

    event.preventDefault();
  }

  this.slider.addEventListener("wheel", onWheel);
}

Slider.prototype.animate = function() {
  this.slider.classList.add("slider--inview");
  document.querySelector(".works__button--prev").classList
    .add("works__button--prev-inview");
  document.querySelector(".works__button--next").classList
    .add("works__button--next-inview");

  for (let i = 0; i < this.items.length; i++) {
    if (i >= this.itemsCount) {
      this.items[i].style.animationDelay = `${0.4 + 0.3 * (i - 3)}s`;
    }
  }
}



if (window.matchMedia("(min-width: 768px)").matches) {
  const s = new Slider(".slider");
  s.init();
  s.drag(["mousedown", "mousemove", "mouseup"]);
  s.drag(["touchstart", "touchmove", "touchend"]);
  s.wheel();

  const next = document.querySelector(".slider__next");
  next.onclick = function(event) {
    s.moveRight();
  }
  const prev = document.querySelector(".slider__prev");
  prev.onclick = function(event) {
    s.moveLeft();
  }

  window.addEventListener("scroll", function() {
    let a = isVisible(document.querySelector(".slider"));
    if (a) s.animate();
  });
}
