/**
 * Created by Profesor08 on 04.04.2017.
 */


class Player
{

  constructor(client_id)
  {
    this.client_id = client_id;

    this.tracks = [];
    this["artwork-500"] = null;
    this.playTime = null;
    this.durationTime = null;
    this.progressBar = null;
    this.progressPoint = null;
    this.playControl = null;
    this.playList = null;
    this.trackName = null;

    this.selectedPlayListItem = null;

    this.progressPointDrag = false;
    this.volumePointDrag = false;

    this.audio = null;

    this._initAudio();
  }

  /**
   * Initialize audio element, all it events and parameters
   * @private
   */
  _initAudio()
  {
    this.audio = new Audio();
    this.audio.autoplay = false;

    if ("volume" in localStorage)
    {
      this.setVolume(parseFloat(localStorage["volume"]));
    }
    else
    {
      this.setVolume(0.3);
    }

    let firstLoad = true;

    /**
     * When source stream is ready to play, player will start playing
     */
    this.audio.addEventListener("canplay", () =>
    {
      if (!firstLoad)
      {
        this.play();
      }

      firstLoad = false;
    });


    this.audio.addEventListener("pause", () =>
    {
      if (this.selectedPlayListItem)
      {
        this.selectedPlayListItem.classList.add("paused");
      }
    });

    /**
     * When duration becomes known, it will be updated on player
     */
    this.audio.addEventListener("durationchange", () =>
    {
      this.updateDurationTime(this.tracks.get());
    });

    /**
     * When stream is playing, it will update played time information on player
     */
    this.audio.addEventListener("timeupdate", () =>
    {
      this.updatePlayTime();
      this.updateProgressBar();
    });

    /**
     * Set next playing track, when current will finish
     */
    this.audio.addEventListener("ended", () =>
    {
      this.setTrack(this.tracks.next());
    });

    /**
     * If happens some error, player will reload track and play it
     */
    this.audio.addEventListener("error", () =>
    {
      this.setTrack(this.tracks.get());
    })
  }

  /**
   * Initializing player with tracks
   * @param {Track[]} tracks
   */
  initialize(tracks)
  {
    this.tracks = new TrackArray(tracks);

    if ("lastPlayedTrack" in localStorage)
    {
      this.tracks.setByTrackId(parseInt(localStorage["lastPlayedTrack"]));
    }

    this.setTrack(this.tracks.get());
    this.initializePlayList();
  }

  initializePlayList()
  {
    if (this.playList)
    {
      this.playList.innerHTML = "";

      this.tracks.toArray().forEach((track, id) =>
      {
        let template = document.querySelector("#track-template");
        let div = document.createElement("div");

        div.innerHTML = template.innerHTML;
        div = div.firstElementChild;
        div.setAttribute("data-track-id", track.id);


        div.addEventListener("click", event =>
        {
          event.preventDefault();

          if (this.selectedPlayListItem && event.target.isSameNode(this.selectedPlayListItem.querySelector(".play-track")))
          {
            if (this.audio.paused)
            {
              this.play();
            }
            else
            {
              this.pause();
            }
          }
          else
          {
            this.setTrack(track, id);
          }
        });

        let img = div.querySelector(".image img");
        img.src = track.artwork_url.replace(/large/, "small");

        let author = div.querySelector(".info .author a");
        author.innerText = track.user.username;
        author.href = track.user.permalink_url;

        let title = div.querySelector(".info .title a");
        title.innerText = track.title;
        title.href = track.permalink_url;

        this.playList.appendChild(div);
      });

      this.playList.scrollIntoView({behavior: 'smooth'});

      this.highlightPlaylistTrack(this.tracks.get());
    }
  }

  /**
   * Initialization of player controls events and etc.
   * @param controls
   */
  initializeControls(controls)
  {
    /**
     * Player Play button events
     */
    if (controls.playControl)
    {
      this.playControl = controls.playControl;

      this.playControl.addEventListener("click", () =>
      {
        if (this.audio.paused)
        {
          this.play();
        }
        else
        {
          this.pause();
        }
      });
    }

    if (controls.next)
    {
      controls.next.addEventListener("click", e => this.next())
    }

    if (controls.previous)
    {
      controls.previous.addEventListener("click", e => this.previous())
    }

    if (controls.loopButton)
    {
      controls.loopButton.addEventListener("click", () =>
      {
        if (this.audio.loop)
        {
          controls.loopButton.classList.remove("active");
          this.audio.loop = false;
        }
        else
        {
          controls.loopButton.classList.add("active");
          this.audio.loop = true;
        }
      })
    }

    if (controls["artwork-500"])
    {
      this["artwork-500"] = controls["artwork-500"];
    }

    if (controls.playTime)
    {
      this.playTime = controls.playTime;
    }

    if (controls.durationTime)
    {
      this.durationTime = controls.durationTime;
    }

    if (controls.progressBar)
    {
      this.progressBar = controls.progressBar;
    }

    if (controls.playList)
    {
      this.playList = controls.playList;
    }

    if (controls.timeLine)
    {
      this.timeLine = controls.timeLine;

      this.timeLine.addEventListener("mousedown", event =>
      {
        if (event.target !== this.progressPoint && this.audio.duration)
        {
          let x = event.layerX;
          let time = parseInt(parseInt(this.audio.duration) / 100 * (x / (this.timeLine.clientWidth / 100)));

          this.setTime(time);
          this.play();
        }
      })
    }

    if (controls.progressPoint)
    {
      this.progressPoint = controls.progressPoint;

      new Draggable(this.progressPoint, {
        handle: this.progressPoint,
        container: this.progressPoint.parentNode,
        axisX: true,

        dragstart: () =>
        {
          this.progressPointDrag = true;
          this.progressPoint.classList.add("active");
        },

        dragstop: () =>
        {
          this.progressPointDrag = false;
          this.progressPoint.classList.remove("active");
        },

        drag: result =>
        {
          this.progressBar.style.width = result.x + "px";
          let time = parseInt(parseInt(this.audio.duration) / 100 * (result.x / (this.timeLine.clientWidth / 100)));
          this.setTime(time);
        }
      });

    }

    if (controls.allowSpaceBarControl)
    {
      let keyDown = false;

      document.addEventListener("keydown", event =>
      {
        if (!keyDown)
        {
          keyDown = true;

          if (event.keyCode === 32 || event.keyCode === 179)
          {
            if (this.audio.paused)
            {
              this.play();
            }
            else
            {
              this.pause();
            }
          }

          if (event.keyCode === 37 || event.keyCode === 177)
          {
            this.previous();
          }

          if (event.keyCode === 39 || event.keyCode === 176)
          {
            this.next();
          }
        }
      });

      document.addEventListener("keyup", () =>
      {
        keyDown = false;
      });
    }

    if (controls.trackName)
    {
      this.trackName = controls.trackName;
    }

    this.initializeVolumeControl(controls.volumeControl);
  }


  initializeVolumeControl(control)
  {
    this.volumeControl = control;

    /**
     * Init volume button, on click it will toggle muted state of audio
     * If audio volume was 0 on load, it will set volume to 1
     */
    if (control.button)
    {
      let defaultVolume = 0;

      control.button.addEventListener("click", event =>
      {
        if (control.button === event.target)
        {
          if (this.audio.volume === 0)
          {
            if (defaultVolume === 0)
            {
              this.setVolume(1);
            }
            else
            {
              this.setVolume(defaultVolume);
            }
          }
          else
          {
            defaultVolume = this.audio.volume;
            this.setVolume(0);
          }

          if (this.audio.volume === 0)
          {
            this.volumeControl.button.classList.add("muted");
          }
          else
          {
            this.volumeControl.button.classList.remove("muted");
          }
        }
      });

      if (this.audio.volume === 0)
      {
        this.volumeControl.button.classList.add("muted");
      }
      else
      {
        this.volumeControl.button.classList.remove("muted");
      }
    }

    if (control.point && control.handle && control.container && control.bar)
    {
      new Draggable(control.point, {
        handle: control.point.firstElementChild,
        container: control.container,
        axisY: true,

        dragstart: () =>
        {
          if (control.button)
          {
            control.button.classList.add("active");
          }
        },

        dragstop: () =>
        {
          if (control.button)
          {
            control.button.classList.remove("active");
          }
        },

        drag: result =>
        {
          let height = control.container.clientHeight;
          let volume = (100 - parseInt(result.y / (height / 100))) / 100;
          control.bar.style.height = height - result.y + "px";
          localStorage["volume"] = volume;
          this.setVolume(volume);
        }
      });

      let volumePosition = this.audio.volume * 100;
      control.point.style.top = control.container.clientHeight - volumePosition + "px";
      control.bar.style.height = volumePosition + "px";
    }

  }

  play()
  {
    if (this.audio.readyState)
    {
      this.audio.play();
    }
    else
    {
      this.setTrack(this.tracks.get());
    }

    if (this.playControl)
    {
      this.playControl.classList.add("pause");
    }

    if (this.selectedPlayListItem)
    {
      this.selectedPlayListItem.classList.remove("paused");
    }
  }

  pause()
  {
    this.audio.pause();

    if (this.playControl)
    {
      this.playControl.classList.remove("pause");
    }
  }

  stop()
  {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  next()
  {
    this.setTrack(this.tracks.next());
  }

  previous()
  {
    this.setTrack(this.tracks.previous());
  }

  /**
   * Update all track pictures
   * @param {Track} track
   */
  updateArtWorks(track)
  {
    if (this["artwork-500"])
    {
      if (track)
      {
        let url = track.artwork_url.replace(/large/i, "t500x500");
        this["artwork-500"].style.backgroundImage = "url(" + url + ")";
      }
    }
  }

  /**
   * Updates progress bar or sets to specific value
   * @param {*} value - if is set value, will set progressbar to current position
   */
  updateProgressBar(value)
  {
    if (!this.progressPointDrag)
    {
      if (Number.isInteger(value))
      {
        this.progressBar.style.width = "0%";
      }
      else
      {
        let p = this.audio.currentTime / (this.audio.duration / 100);
        this.progressBar.style.width = p + "%";
      }

      this.progressPoint.style.left = this.progressBar.offsetWidth + "px";
    }
  }

  /**
   * Updates played time indicator on Player
   */
  updatePlayTime()
  {
    this.playTime.innerText = this.timestampToTime(parseInt(this.audio.currentTime));
  }

  /**
   * Convert timestamp in seconds to format [Hours:]Minutes:seconds
   * @param seconds
   * @returns {string}
   */
  timestampToTime(seconds)
  {
    let hours = parseInt(seconds / 3600);
    seconds %= 3600;
    let minutes = parseInt(seconds / 60);
    seconds %= 60;

    let time = [];

    if (hours > 0)
    {
      time.push(hours);
      time.push(minutes >= 10 ? minutes : "0" + minutes);
    }
    else
    {
      time.push(minutes);
    }

    time.push(seconds >= 10 ? seconds : "0" + seconds);

    return time.join(":");
  }

  /**
   * Convert track duration time to format [Hours:]Minutes:seconds
   * @param duration
   * @returns {string}
   */
  durationToTime(duration)
  {
    return this.timestampToTime(parseInt(duration / 1000));
  }

  /**
   * Updates duration time indicator on Player
   * @param {Track} track
   */
  updateDurationTime(track)
  {
    this.durationTime.innerText = this.durationToTime(track.duration);
  }

  /**
   * Playing selected track
   * @param {Track} track
   * @param {int} [id=null]
   */
  setTrack(track, id)
  {
    this.audio.src = track.stream_url
      + new Url()
        .query({
          "client_id": this.client_id
        })
        .get();

    if (id)
    {
      this.tracks.set(id);
    }

    this.updateArtWorks(track);
    this.updateProgressBar(0);
    this.highlightPlaylistTrack(track);

    if (this.trackName)
    {
      this.trackName.innerText = track.title;
    }

    localStorage["lastPlayedTrack"] = track.id;
  }

  /**
   * Set playback position of current track in seconds
   * @param {int} time
   */
  setTime(time)
  {
    this.audio.currentTime = time;
  }

  setVolume(volume)
  {
    this.audio.volume = volume;
  }

  /**
   * Highlight selected track in playlist
   * @param {Track} track
   */
  highlightPlaylistTrack(track)
  {
    if (this.selectedPlayListItem)
    {
      this.selectedPlayListItem.classList.remove("playing");
    }

    this.selectedPlayListItem = this.playList.querySelector("[data-track-id=\"" + track.id + "\"]");

    if (this.selectedPlayListItem)
    {
      this.selectedPlayListItem.classList.add("playing");
      this.selectedPlayListItem.classList.add("paused");

      if (this.selectedPlayListItem.offsetTop > this.playList.offsetHeight / 2)
      {
        // this.playList.scrollTop = this.selectedPlayListItem.offsetTop - this.playList.offsetHeight / 2;
        this.playList.scrollTo(this.selectedPlayListItem.offsetTop - this.playList.offsetHeight / 2, 500);
      }
      else
      {
        // this.playList.scrollTop = 0;
        this.playList.scrollTo(0, 1000);
      }
    }
  }
}