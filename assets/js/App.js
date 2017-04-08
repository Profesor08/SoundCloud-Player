/**
 * Created by Profesor08 on 04.04.2017.
 */

const player = new Player("e9f897e4636fc2682a1c243b511d30b8");

player.initializeControls({
  // "artwork-500": document.querySelector(".artwork-500"),
  "artwork-500": document.body,
  playControl: document.querySelector(".aimp .play"),
  previous: document.querySelector(".aimp .previous"),
  next: document.querySelector(".aimp .next"),
  playTime: document.querySelector(".aimp .play-time"),
  durationTime: document.querySelector(".aimp .track-length"),
  progressBar: document.querySelector(".aimp .progress-bar"),
  timeLine: document.querySelector(".aimp .time-line"),
  progressPoint: document.querySelector(".aimp .progress-point"),
  loopButton: document.querySelector(".aimp .repeat"),
  shuffleButton: document.querySelector(".aimp .shuffle"),
  playList: document.querySelector(".aimp #playlist-123"),
  // trackName: document.querySelector(".aimp .track-name"),
  volumeControl: {
    button: document.querySelector(".aimp .volume"),
    container: document.querySelector(".aimp .volume-background"),
    bar: document.querySelector(".aimp .volume-progress-bar"),
    point: document.querySelector(".aimp .volume-progress-point"),
    handle: document.querySelector(".aimp .volume-progress-point").firstElementChild,
    slider: document.querySelector(".aimp .volume-bg-wrapper"),
  },
  allowSpaceBarControl: true
});

const sc = new SoundCloud({
  client_id: "e9f897e4636fc2682a1c243b511d30b8",
  api_url: "https://api.soundcloud.com"
});

sc.setUser("https://soundcloud.com/profesor08", function ()
{
  sc.getLikes(function (likes)
  {
    player.initialize(likes);
  });
});