/**
 * Created by Profesor08 on 04.04.2017.
 */

class SoundCloud
{

  constructor(params)
  {
    this.config = {
      api_url: null,
      client_id: null,
      user_id: null
    };

    this.initialize(params);

    this._url = new Url(this.config.api_url);
  }

  initialize(params)
  {
    if (params !== null)
    {
      for (let property in params)
      {
        if (params.hasOwnProperty(property) && this.config.hasOwnProperty(property))
        {
          this.config[property] = params[property];
        }
      }
    }
  }

  get(path, callback)
  {
    let url = this._url
      .path(path)
      .query({
        "client_id": this.config.client_id,
        "format": "json",
        "limit": 1000
      })
      .get();

    http.get(url).then(result =>
    {
      callback(result);
    })
  }

  getLikes(callback)
  {
    this.get("/e1/users/" + this.config.user_id + "/likes", result =>
    {
      let tracks = [];

      result.forEach(like =>
      {
        if (like.track !== null)
        {
          tracks.push(like.track);
        }
      });

      callback(tracks);
    });
  }

  setUser(profile_url, callback)
  {
    let url = this._url
      .path("resolve")
      .query({
        url: profile_url,
        client_id: this.config.client_id
      })
      .get();

    http.get(url).then(result =>
    {
      if (result.id)
      {
        this.config.user_id = result.id;
      }

      if (typeof callback === "function")
      {
        callback();
      }
    });
  }

}