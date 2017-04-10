/**
 * Created by Profesor08 on 04.04.2017.
 */

// const CLIENT_ID = "e9f897e4636fc2682a1c243b511d30b8";
const CLIENT_ID = "2t9loNQH90kzJcsFCODdigxfp325aq4z";

const player = new Player(CLIENT_ID);

player.initializeControls({
  "artwork-500": document.body,
  playTime: document.querySelector(".aimp .play-time"),
  durationTime: document.querySelector(".aimp .track-length"),
  progressBar: document.querySelector(".aimp .progress-bar"),
  timeLine: document.querySelector(".aimp .time-line"),
  progressPoint: document.querySelector(".aimp .progress-point"),
  playList: document.querySelector(".aimp #playlist-123"),

  buttons: {
    playToggle: document.querySelector(".aimp .play"),
    previous: document.querySelector(".aimp .previous"),
    next: document.querySelector(".aimp .next"),
    loop: document.querySelector(".aimp .repeat"),
    shuffle: document.querySelector(".aimp .shuffle")
  },

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
  client_id: CLIENT_ID,
  api_url: "https://api.soundcloud.com",
  api_v2_url: "https://api-v2.soundcloud.com"
});

(async () =>
{
  let user = await sc.setUser("https://soundcloud.com/profesor08");
  let tracks = await sc.getLikes(user.id);
  player.initialize(tracks);
})();