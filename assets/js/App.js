/**
 * Created by Profesor08 on 04.04.2017.
 */

function require(modules, callback)
{
  function createScript(src, callback)
  {
    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.src = src;
    script.addEventListener("load", () =>
    {
      callback();
    });
    document.head.appendChild(script);
  }

  if (modules instanceof Array)
  {
    let count = modules.length;

    modules.forEach((module) =>
    {
      createScript(module, () =>
      {
        if (!--count)
        {
          callback();
        }
      });
    });
  }
  else
  {
    createScript(modules, callback);
  }
}

require([
  "assets/js/Utils.js",
  "assets/js/Draggable.js",
  "assets/js/Http.js",
  "assets/js/Url.js",
  "assets/js/TrackArray.js",
  "assets/js/Waveform.js",
  "assets/js/SoundCloud.js",
  "assets/js/Player.js"
], () =>
{

  // const CLIENT_ID = "e9f897e4636fc2682a1c243b511d30b8";
  const CLIENT_ID = "2t9loNQH90kzJcsFCODdigxfp325aq4z";

  const player = new Player(CLIENT_ID);

  player.initializeControls({
    "artwork-500": document.body,
    playTime: document.querySelector(".aimp .play-time"),
    durationTime: document.querySelector(".aimp .track-length"),
    playList: document.querySelector(".aimp #playlist-123"),

    progressControl: {
      container: document.querySelector(".aimp .time-line"),
      bar: document.querySelector(".aimp .progress-bar"),
      point: document.querySelector(".aimp .progress-point"),
      handle: document.querySelector(".aimp .progress-point-handle")
    },

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

    waveformContainer: document.querySelector(".waveform"),

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
    player.setTracks(tracks);



    let waveData = await getJSON("https://w1.sndcdn.com/xVZOcTTWrxao_m.json");




  })();


});