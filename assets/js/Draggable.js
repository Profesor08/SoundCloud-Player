/**
 * Created by Profesor08 on 07.04.2017.
 */

class Draggable
{

  constructor(element, params)
  {
    this.element = element;

    this.config = {
      handle: null,
      container: null,
      axisX: false,
      axisY: false,

      dragstart: null,
      dragstop: null,
      drag: null
    };

    Object.assign(this.config, params);

    if (this.config.axisX === false && this.config.axisY === false)
    {
      this.config.axisX = true;
      this.config.axisY = true;
    }

    if (!this.config.handle)
    {
      this.config.handle = this.element;
    }

    if (!this.config.container)
    {
      this.config.container = document.body;
    }

    this.initDragging();
  }

  initDragging()
  {
    let isDragging = false;
    let rect = null;

    let allowableElementPosition = ["absolute", "fixed"];
    let allowableContainerPosition = ["absolute", "relative", "fixed"];

    if (allowableElementPosition.indexOf(window.getComputedStyle(this.element).position) === -1)
    {
      this.element.position = "absolute";
    }

    if (allowableContainerPosition.indexOf(window.getComputedStyle(this.config.container).position) === -1)
    {
      this.config.container.position = "relative";
    }

    document.addEventListener("mousedown", event =>
    {
      if (event.target === this.config.handle && event.button === 0)
      {
        isDragging = true;
        rect = this.config.container.getBoundingClientRect();

        if (typeof this.config.dragstart === "function")
        {
          this.config.dragstart();
        }
      }
    });

    document.addEventListener("mouseup", () =>
    {
      if (isDragging)
      {
        isDragging = false;

        if (typeof this.config.dragstop === "function")
        {
          this.config.dragstop();
        }
      }
    });

    // this.element.addEventListener("touchmove", event =>
    // {
    //   console.log(event);
    //   this._move(event, this.config.container.getBoundingClientRect());
    // });

    document.addEventListener("mousemove", event =>
    {
      if (isDragging)
      {
        this._move(event, rect);
      }
    });
  }

  _move(event, rect)
  {
    let x = this._fixPosition(event.clientX - rect.left, 0, rect.width);
    let y = this._fixPosition(event.clientY - rect.top, 0, rect.height);

    if (this.config.axisX)
    {
      this.element.style.left = x + "px";
    }

    if (this.config.axisY)
    {
      this.element.style.top = y + "px";
    }

    if (typeof this.config.drag === "function")
    {
      this.config.drag({
        x: x,
        y: y
      });
    }
  }

  _fixPosition(value, min, max)
  {
    if (value < min)
    {
      value = min;
    }
    else if (value > max)
    {
      value = max;
    }

    return value;
  }
}