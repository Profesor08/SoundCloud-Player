/**
 * Created by Profesor08 on 04.04.2017.
 */


class Player
{

  constructor(client_id)
  {
    this.client_id = client_id;
    this.audio = null;
    this.tracks = null;

    this.buttons = {};
    this.progressControl = {};
    this.volumeControl = {};
    this.waveformContainer = null;

    this.selectedPlayListItem = null;

    this["artwork-500"] = null;
    this.playTime = null;
    this.durationTime = null;
    this.playList = null;
    this.trackName = null;

    this.shuffled = false;

    this.progressPointDrag = false;

    this.loop = false;
    this.waveform = null;

    this.events = {
      setTrack: []
    };

    this._initAudio();

    this.watch("tracks", function (id, oldVal, newVal)
    {
      return newVal;
    });
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
      let volume = parseFloat(localStorage["volume"]);

      if (volume >= 0 && volume <= 1)
      {
        this.setVolume(parseFloat(localStorage["volume"]));
      }
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

    /**
     * When audio paused, will change class for playlist item
     */
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
      if (this.loop)
      {
        this.setTrack(this.tracks.get());
      }
      else
      {
        this.setTrack(this.tracks.next());
      }
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
  setTracks(tracks)
  {
    this.tracks = new TrackArray(tracks);

    if ("lastPlayedTrack" in localStorage)
    {
      this.tracks.setByTrackId(parseInt(localStorage["lastPlayedTrack"]));
    }

    this.setTrack(this.tracks.get());
    this.initializePlayList();
  }

  /**
   * Initialize playlist
   */
  initializePlayList()
  {
    if (this.playList)
    {
      this.playList.innerHTML = "";

      /**
       * Loading html template for each track and appending it to playlist container
       */
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

          /**
           * If click target is button .play-track, it will toggle play/pause state of current track
           */
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
        /**
         * t500x500: 500×500
         * crop: 400×400
         * t300x300: 300×300
         * large: 100×100 (default)
         * t67x67: 67×67 (only on artworks)
         * badge: 47×47
         * small: 32×32
         * tiny: 20×20 (on artworks)
         * tiny: 18×18 (on avatars)
         * mini: 16×16
         */
        // img.src = track.artwork_url.replace(/large/, "small");
        img.src = track.artwork_url.replace(/large/, "badge");

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
   * Initialize main control buttons [play, playToggle, pause, stop. next, previous, loop, shuffle]
   * @param buttons
   */
  initButtons(buttons)
  {
    this.buttons = buttons;
    /**
     * Player Play button events
     */
    if (buttons.playToggle)
    {
      this.buttons.playToggle.addEventListener("click", () =>
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

    if (this.buttons.play)
    {
      this.play();
    }

    if (this.buttons.pause)
    {
      this.pause();
    }

    if (this.buttons.stop)
    {
      this.stop();
    }

    if (this.buttons.next)
    {
      this.buttons.next.addEventListener("click", e => this.next())
    }

    if (this.buttons.previous)
    {
      this.buttons.previous.addEventListener("click", e => this.previous())
    }

    if (this.buttons.loop)
    {
      this.buttons.loop.addEventListener("click", () =>
      {
        this.setLoop(!this.loop);
      });

      this.setLoop(localStorage["loop"] === "true");
    }

    if (this.buttons.shuffle)
    {
      this.buttons.shuffle.addEventListener("click", () =>
      {
        this.setShuffle(!this.shuffled);
      });

      this.setShuffle(localStorage["shuffle"] === "true");
    }
  }

  setLoop(value)
  {
    this.loop = value;

    if (value)
    {
      this.buttons.loop.classList.add("active");
    }
    else
    {
      this.buttons.loop.classList.remove("active");
    }

    localStorage["loop"] = value;
  }

  setShuffle(value)
  {
    this.shuffled = value;

    if (value)
    {
      this.buttons.shuffle.classList.add("active");
    }
    else
    {
      this.buttons.shuffle.classList.remove("active");
    }

    localStorage["shuffle"] = value;
  }

  /**
   * Initialization of player controls events and etc.
   * @param controls
   */
  initializeControls(controls)
  {
    if (controls.buttons)
    {
      this.initButtons(controls.buttons);
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

    if (controls.shuffleButton)
    {
      this.initializeShuffle(controls.shuffleButton);
    }

    if (controls.volumeControl)
    {
      this.initializeVolumeControl(controls.volumeControl);
    }

    if (controls.progressControl)
    {
      this.initializeProgressControl(controls.progressControl);
    }

    if (controls.waveformContainer)
    {
      this.waveformContainer = controls.waveformContainer;
    }
  }

  initializeProgressControl(control)
  {
    this.progressControl = control;

    if (control.container)
    {
      control.container.addEventListener("mousedown", event =>
      {
        if (event.button === 0 && event.target !== this.progressPoint && this.audio.duration)
        {
          let x = event.layerX;
          let time = parseInt(parseInt(this.audio.duration) / 100 * (x / (control.container.clientWidth / 100)));

          this.setTime(time);
          this.play();
        }
      })
    }

    if (control.point)
    {
      new Draggable(control.point, {
        handle: control.handle,
        container: control.container,
        axisX: true,

        dragstart: () =>
        {
          this.progressPointDrag = true;
          control.point.classList.add("active");
        },

        dragstop: () =>
        {
          this.progressPointDrag = false;
          control.point.classList.remove("active");
        },

        drag: result =>
        {
          control.bar.style.width = result.x + "px";
          let time = parseInt(parseInt(this.audio.duration) / 100 * (result.x / (control.container.clientWidth / 100)));
          this.setTime(time);
        }
      });
    }


  }

  initializeShuffle(button)
  {
    this.shuffleButton = button;
  }

  initializeVolumeControl(control)
  {
    this.volumeControl = control;

    if (control.button)
    {
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
          let volume = (100 - result.y / (height / 100)) / 100;
          localStorage["volume"] = volume;
          this.updateVolumeControl(volume);
          this.setVolume(volume);
        }
      });

    }

    this.updateVolumeControl(this.audio.volume);

  }

  /**
   * Update state of volume control
   * @param volume - audio volume value from 0 to 1
   */
  updateVolumeControl(volume)
  {
    if (this.volumeControl.container)
    {
      let height = this.volumeControl.container.clientHeight;
      let position = height * volume;

      if (this.volumeControl.bar)
      {
        this.volumeControl.bar.style.height = position + "px";
      }

      if (this.volumeControl.point)
      {
        this.volumeControl.point.style.top = height - position + "px";
      }

      if (this.volumeControl.button)
      {
        if (volume === 0)
        {
          this.volumeControl.button.classList.add("muted");
        }
        else
        {
          this.volumeControl.button.classList.remove("muted");
        }
      }
    }
  }

  /**
   * Set audio volume
   * @param volume - value from 0 to 1
   */
  setVolume(volume)
  {
    this.audio.volume = volume;
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

    if (this.buttons.playToggle)
    {
      this.buttons.playToggle.classList.add("pause");
    }

    if (this.selectedPlayListItem)
    {
      this.selectedPlayListItem.classList.remove("paused");
    }
  }

  pause()
  {
    this.audio.pause();

    if (this.buttons.playToggle)
    {
      this.buttons.playToggle.classList.remove("pause");
    }
  }

  stop()
  {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  next()
  {
    if (this.shuffled)
    {
      this.setTrack(this.tracks.getRandomTrack());
    }
    else
    {
      this.setTrack(this.tracks.next());
    }
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
        if (this.progressControl.bar)
        {
          this.progressControl.bar.style.width = "0%";
        }
      }
      else
      {
        let p = this.audio.currentTime / (this.audio.duration / 100);

        if (this.progressControl.bar)
        {
          this.progressControl.bar.style.width = p + "%";
        }

        if (this.waveform)
        {
          this.waveform.setPlayback(p);
        }

      }

      if (this.progressControl.bar && this.progressControl.point)
      {
        this.progressControl.point.style.left = this.progressControl.bar.offsetWidth + "px";
      }
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

    if (this.waveformContainer)
    {
      let url = track.waveform_url.replace(/png/, "json");

      (async () =>
      {
        let data = await getJSON(url);

        if (this.waveform)
        {
          this.waveform.updateWaveformData(data.samples);
        }
        else
        {
          // this.waveform = new Waveform(this.waveformContainer, data.samples);
          this.waveform = new Waveform({
            container: this.waveformContainer,
            audio: this.audio,
            data: data.samples,
            peakWidth: 2,
            peakSpace: 1,
            responsive: true,
            mouseOverEvents: true,
            mouseClickEvents: true,
            color: {
              background: "#8C8C8C",
              footer: "#B2B2B2",
              footerPlayback: "#FFAA80",
              hoverGradient: {
                from: "#FF7200",
                to: "#DA4218"
              },
              playbackGradient: {
                from: "#FF7200",
                to: "#DA4218"
              },
              hoverPlaybackGradient: {
                from: "#AB5D20",
                to: "#A84024"
              }
            }
          });
        }


      })();
    }

    localStorage["lastPlayedTrack"] = track.id;

    this.emitEvent("setTrack", [track]);
  }

  emitEvent(event, args)
  {
    if (event in this.events)
    {
      this.events[event].forEach(callback =>
      {
        callback.apply(this, args);
      });
    }
  }

  addEventListener(event, callback)
  {
    if (event in this.events)
    {
      this.events[event].push(callback);
    }
  }

  /**
   * Set playback position of current track in seconds
   * @param {int} time
   */
  setTime(time)
  {
    this.audio.currentTime = time;
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