/**
 * Created by Profesor08 on 04.04.2017.
 */
/*
const http =
  {
    get: function (url)
    {
      return new Promise(function (resolve, reject)
      {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("load", function ()
        {
          if (this.status >= 200 && this.status < 300)
          {
            let contentType = xhr.getResponseHeader("Content-Type");

            if (contentType && contentType.indexOf("application/json") > -1)
            {
              resolve(JSON.parse(xhr.responseText));
            }
            else
            {
              resolve(xhr.responseText);
            }
          }
          else
          {
            reject({
              status: this.status,
              statusText: xhr.statusText
            });
          }
        });

        xhr.addEventListener("error", function ()
        {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        });

        xhr.open('GET', url, true);
        xhr.send();
      });
    }
  };

*/

const http = {
  get: function (url)
  {
    return new Promise(function (resolve, reject)
    {
      const xhr = new XMLHttpRequest();

      xhr.addEventListener("load", function ()
      {
        if (this.status >= 200 && this.status < 300)
        {
          resolve(this.responseText);
        }
        else
        {
          reject(this);
        }
      });

      xhr.addEventListener("error", function ()
      {
        reject(this);
      });

      xhr.open('GET', url, true);
      xhr.send();
    });
  }
};

async function getJSON(url)
{
  try
  {
    return JSON.parse(await http.get(url));
  }
  catch(err)
  {
    console.log(err);
    return [];
  }
}