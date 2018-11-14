class Slider {
  constructor(slider) {
    this.slider = document.querySelector(slider);
    this.frame = this.slider.querySelector(".slider__frame");
    this.items = this.frame.children;
    this.itemsCount = this.items.length;
    this.position = 0;
    this.itemWidth = 580;
    this.isAnimated = false;
    this.handlers = [];
  }

  addListener(elem, event, handler) {
    this.handlers.push({
      elem,
      event,
      handler
    });

    elem.addEventListener(event, handler);
  }

  init() {
    let itemsInView = Math.ceil(this.slider.clientWidth / this.itemWidth);
    if (itemsInView < this.itemsCount) itemsInView = this.itemsCount;

    for (let i = 0, j = 0; i < itemsInView * 3 - this.itemsCount; i++) {
      let clone = this.items[j].cloneNode(true);

      this.frame.appendChild(clone);
      j = j == this.itemsCount - 1 ? 0 : j + 1;
    }

    for (let i = -itemsInView; i < itemsInView * 2; i++) {
      this.items[i + itemsInView].style.position = "absolute";
      this.items[i + itemsInView].style.left = `${i * this.itemWidth}px`;
    }
  }

  smoothScroll(finish) {
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
  }

  moveTo() {
    let coords = this.frame.getBoundingClientRect().left;
    this.position = Math.round(coords / this.itemWidth);

    let shift = this.position * this.itemWidth - coords;

    if ( Math.abs(this.position) >= this.itemsCount) {
      this.position = this.position > 0 ? this.position - this.itemsCount :
        this.position + this.itemsCount;
    }

    this.frame.style.transform = `translateX(${this.position * this.itemWidth - shift}px)`;

    return shift;
  }

  align(shift) {
    this.smoothScroll(this.position * this.itemWidth);
  }

  moveLeft() {
    if (this.isAnimated) return;

    this.moveTo();
    this.position--;
    this.smoothScroll( this.position * this.itemWidth);
  }

  moveRight() {
    if (this.isAnimated) return;

    this.moveTo();
    this.position++;
    this.smoothScroll( this.position * this.itemWidth);
  }

  drag(events) {
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

      self.addListener(document, events[1], handleMove);
      self.addListener(document, events[2], handleUp);

      // document.addEventListener(events[1], handleMove);
      // document.addEventListener(events[2], handleUp);
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
      self.smoothScroll(self.position * self.itemWidth);
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

    // elem.addEventListener(events[0], handleDown);
    this.addListener(elem, events[0], handleDown);
  }

  wheel() {
    const self = this;

    function onWheel(event) {
      let delta = event.deltaY || event.detail || event.wheelDelta;

      if (delta < 0) self.moveRight();
      if (delta > 0) self.moveLeft();

      event.preventDefault();
    }

    // this.slider.addEventListener("wheel", onWheel);
    this.addListener(self.slider, "wheel", onWheel);
  }

  animate() {
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

}


const mq = window.matchMedia( "(min-width: 768px)" );
mq.addListener(widthChange);
widthChange(mq);

var s;
function widthChange(ma) {
  if (mq.matches) {
    s = new Slider(".slider");
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
  } else {
    if (!s) return;

    s.frame.style = "";

    s.handlers.forEach( i => {
      i.elem.removeEventListener(i.event, i.handler);
    });

    let iterates = s.items.length;

    for (var i = 0; i < iterates; i++) {
      if (i < s.itemsCount) {
        s.items[i].style = "";
        continue;
      }

      s.frame.removeChild(s.items[s.itemsCount]);
    }
  }
}
