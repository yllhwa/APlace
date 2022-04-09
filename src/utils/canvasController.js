export default class canvasController {
  constructor(ratioSettings) {
    this.ratioSettings = ratioSettings || {
      min: 0.5,
      max: 20,
      touchMin: 1,
      touchMax: 60,
      step: (_ratio) => 1,
      default: 2,
    };
    this.ratio = {
      current: this.ratioSettings.default,
      changing: false,
      position: { x: 0, y: 0 },
    };
    this.mouse = {
      grab: false,
      grabPosition: { x: 0, y: 0 },
      move: false,
      moveStartPosition: { x: 0, y: 0 },
    };
    this.touch = {
      lastTouch: { point1: { x: 0, y: 0 }, point2: { x: 0, y: 0 } },
      firstTouchCenter: { x: 0, y: 0 },
      grab: false,
      grabPosition: { x: 0, y: 0 },
      move: false,
      moveStartPosition: { x: 0, y: 0 },
    };
  }
  registerCanvas(canvas) {
    this.canvas = canvas;
  }
  getEventAbsolutePosition(event) {
    return { x: event.clientX, y: event.clientY };
  }
  getEventRelativePosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  getDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }
  getCenter(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }
  scroolToNewPositonWithRatio(lastRatio, newRatio, position) {
    this.ratio.position.x -= position.x * (newRatio / lastRatio - 1);
    this.ratio.position.y -= position.y * (newRatio / lastRatio - 1);
  }
  handleWheel(event) {
    event.preventDefault();
    if (this.ratio.changing) return;
    this.ratio.changing = true;
    let ratio;
    if (event.deltaY < 0) {
      if (
        this.ratio.current + this.ratioSettings.step(this.ratio.current) <
        this.ratioSettings.max
      ) {
        ratio =
          this.ratio.current + this.ratioSettings.step(this.ratio.current);
      } else {
        ratio = this.ratioSettings.max;
      }
    } else {
      if (
        this.ratio.current - this.ratioSettings.step(this.ratio.current) >
        this.ratioSettings.min
      ) {
        ratio =
          this.ratio.current - this.ratioSettings.step(this.ratio.current);
      } else {
        ratio = this.ratioSettings.min;
      }
    }
    if (ratio) {
      let lastRatio = this.ratio.current;
      this.ratio.current = ratio;
      this.scroolToNewPositonWithRatio(
        lastRatio,
        ratio,
        this.getEventRelativePosition(event)
      );
    }
    setTimeout(() => {
      this.ratio.changing = false;
    }, 50);
  }
  handleMouseDown(event) {
    const position = this.getEventAbsolutePosition(event);
    this.mouse.grab = true;
    this.mouse.grabPosition.x = position.x;
    this.mouse.grabPosition.y = position.y;

    this.mouse.move = false;

    this.mouse.moveStartPosition.x = position.x;
    this.mouse.moveStartPosition.y = position.y;
    this.mouse.scrollLeft = this.ratio.position.x;
    this.mouse.scrollTop = this.ratio.position.y;
  }
  handleMouseMove(event) {
    if (!this.mouse.grab) return;
    const position = this.getEventAbsolutePosition(event);
    if (
      position.x !== this.mouse.grabPosition.x &&
      position.y !== this.mouse.grabPosition.y
    ) {
      this.mouse.move = true;
    } else {
      this.mouse.move = false;
    }
    if (this.mouse.move) {
      this.ratio.position.x =
        this.mouse.scrollLeft + (position.x - this.mouse.moveStartPosition.x);
      this.ratio.position.y =
        this.mouse.scrollTop + (position.y - this.mouse.moveStartPosition.y);
    }
  }
  handleMouseUp(event) {
    this.mouse.grab = false;
  }
  handleTouchStart(event) {
    if (event.touches.length === 1) {
      const position = this.getEventAbsolutePosition(event.touches[0]);
      this.touch.grab = true;
      this.touch.grabPosition.x = position.x;
      this.touch.grabPosition.y = position.y;

      this.touch.move = false;

      this.touch.moveStartPosition.x = position.x;
      this.touch.moveStartPosition.y = position.y;
      this.touch.scrollLeft = this.ratio.position.x;
      this.touch.scrollTop = this.ratio.position.y;
    } else if (event.touches.length === 2) {
      this.grab = false;
      this.touch.lastTouch.point1 = this.getEventAbsolutePosition(
        event.touches[0]
      );
      this.touch.lastTouch.point2 = this.getEventAbsolutePosition(
        event.touches[1]
      );
      this.firstTouchCenter = this.getCenter(
        { x: event.touches[0].clientX, y: event.touches[0].clientY },
        { x: event.touches[1].clientX, y: event.touches[1].clientY }
      );
    }
  }
  handleTouchMove(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
      if (!this.touch.grab) return;
      const position = this.getEventAbsolutePosition(event.touches[0]);
      if (
        position.x !== this.touch.grabPosition.x &&
        position.y !== this.touch.grabPosition.y
      ) {
        this.touch.move = true;
      } else {
        this.touch.move = false;
      }
      if (this.touch.move) {
        this.ratio.position.x =
          this.touch.scrollLeft + (position.x - this.touch.moveStartPosition.x);
        this.ratio.position.y =
          this.touch.scrollTop + (position.y - this.touch.moveStartPosition.y);
      }
    } else if (event.touches.length === 2) {
      this.touch.grab = false;
      let point1 = this.getEventAbsolutePosition(event.touches[0]);
      let point2 = this.getEventAbsolutePosition(event.touches[1]);
      let lastDistance = this.getDistance(
        this.touch.lastTouch.point1,
        this.touch.lastTouch.point2
      );
      let newDistance = this.getDistance(point1, point2);
      let ratio = newDistance / lastDistance;
      let newRatio = this.ratio.current * ratio;
      if (newRatio > this.ratioSettings.touchMax) {
        newRatio = this.ratioSettings.touchMax;
      } else if (newRatio < this.ratioSettings.touchMin) {
        newRatio = this.ratioSettings.touchMin;
      }
      let lastRatio = this.ratio.current;
      this.ratio.current = newRatio;
      let relatedCenter = this.getEventRelativePosition({
        clientX: this.firstTouchCenter.x,
        clientY: this.firstTouchCenter.y,
      });
      this.ratio.position.x -= relatedCenter.x * (newRatio / lastRatio - 1);
      this.ratio.position.y -= relatedCenter.y * (newRatio / lastRatio - 1);
      this.touch.lastTouch.point1 = point1;
      this.touch.lastTouch.point2 = point2;
    }
  }
  handleTouchCancel(event) {
    this.grab = false;
  }
  handleTouchEnd(event) {
    this.grab = false;
  }
}
