/**
 * Created by Profesor08 on 04.04.2017.
 */

class SoundCloud
{

  constructor(params)
  {
    this.config = {
      api_url: null,
      api_v2_url: null,
      client_id: null
    };

    this.initialize(params);
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

  async getLikes(user_id)
  {
    let url = new Url(this.config.api_url)
      .path("e1")
      .path("users")
      .path(user_id)
      .path("likes")
      .query({
        "client_id": this.config.client_id,
        "format": "json",
        "limit": 1000,
        "date": Date.now()
      })
      .get();

    let likes = await getJSON(url);

    return likes.filter(
      like => like.track !== null
    ).map(
      like => like.track
    );
  }

  async setUser(profile_url)
  {
    let url = new Url(this.config.api_url)
      .path("resolve")
      .query({
        url: profile_url,
        client_id: this.config.client_id
      })
      .get();

    return await getJSON(url);
  }

}