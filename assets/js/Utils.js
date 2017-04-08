/**
 * Created by Profesor08 on 04.04.2017.
 */

if (!String.prototype.ltrim) {
  (function() {
    String.prototype.ltrim = function(s) {
      if (s === undefined)
      {
        return this;
      }

      return this.replace(new RegExp("^[" + s + "]*"), '');
    };
  })();
}

if (!String.prototype.rtrim) {
  (function() {
    String.prototype.rtrim = function (s) {
      if (s === undefined)
      {
        return this;
      }

      return this.replace(new RegExp("[" + s + "]*$"), '');
    };
  })();
}

Element.prototype.scrollTo = function (offset, duration)
{
  let scrollCount = 0;
  let oldTimestamp = performance.now();
  let isScrollingDown = this.scrollTop < offset;
  let critical = isScrollingDown ? this.scrollHeight - this.clientHeight : 0;

  if (isScrollingDown)
  {
    if (offset > critical)
    {
      offset = critical;
    }
  }
  else
  {
    if (offset < critical)
    {
      offset = critical
    }
  }

  let step = newTimestamp =>
  {
    scrollCount += Math.PI / (duration / (newTimestamp - oldTimestamp));

    if (isScrollingDown)
    {
      if (this.scrollTop + scrollCount < offset)
      {
        this.scrollTop += scrollCount;
        requestAnimationFrame(step);
      }
      else
      {
        this.scrollTop = offset;
      }
    }
    else
    {
      if (this.scrollTop - scrollCount > offset)
      {
        this.scrollTop -= scrollCount;
        requestAnimationFrame(step);
      }
      else
      {
        this.scrollTop = offset;
      }
    }
  };

  requestAnimationFrame(step);
};