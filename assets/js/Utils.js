/**
 * Created by Profesor08 on 04.04.2017.
 */

if (!String.prototype.ltrim)
{
  (function ()
  {
    String.prototype.ltrim = function (s)
    {
      if (s === undefined)
      {
        return this;
      }

      return this.replace(new RegExp("^[" + s + "]*"), '');
    };
  })();
}

if (!String.prototype.rtrim)
{
  (function ()
  {
    String.prototype.rtrim = function (s)
    {
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


/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch)
{
  Object.defineProperty(Object.prototype, "watch", {
    enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop, handler)
    {
      let
        oldval = this[prop]
        , newval = oldval
        , getter = function ()
        {
          return newval;
        }
        , setter = function (val)
        {
          oldval = newval;
          return newval = handler.call(this, prop, oldval, val);
        }
      ;

      if (delete this[prop])
      { // can't watch constants
        Object.defineProperty(this, prop, {
          get: getter
          , set: setter
          , enumerable: true
          , configurable: true
        });
      }
    }
  });
}

// object.unwatch
if (!Object.prototype.unwatch)
{
  Object.defineProperty(Object.prototype, "unwatch", {
    enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop)
    {
      let val = this[prop];
      delete this[prop]; // remove accessors
      this[prop] = val;
    }
  });
}