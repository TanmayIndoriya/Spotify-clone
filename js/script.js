let currentSong = new Audio();
let songs;
let currFolder;
let vol;

window.addEventListener("load", function() {
  currentSong.volume = 0.5;
  vol = currentSong.volume;
});

// convert seconds to minutes
function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Calculate minutes and remaining seconds
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  // Ensure two digits for minutes and seconds by padding with zeros if needed
  let minutesString = minutes.toString().padStart(2, "0");
  let secondsString = remainingSeconds.toString().padStart(2, "0");

  // Return the formatted string
  return `${minutesString}:${secondsString}`;
}

// get songs from songs folder url from local ip using fetch api
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(
    `http://127.0.0.1:5500/projects/spotifyClone/${currFolder}`
  );
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < anchors.length; index++) {
    const element = anchors[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${currFolder}/`)[1]);
    }
  }
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = "";

  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
        <img class="invert" src="icons/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>nintendo</div>
        </div>
        <div class="playnow">
            <span>play now</span>
            <img class="invert" src="icons/play.svg" alt="">
        </div>      
         </li>`;
  }

  // adding event listener to all songs in library section
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playBack(
        e.querySelector(".info").firstElementChild.innerHTML.trim(),
        false
      );
    });
  });
  return songs;
}

// play song
const playBack = (track, pause = flase) => {
  //let aud = new Audio(track);
  currentSong.src = `/projects/spotifyClone/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "icons/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

// display all folders as albums
async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/projects/spotifyClone/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  let cardContainer = document.querySelector(".cardContainer");
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      let a = await fetch(
        `http://127.0.0.1:5500/projects/spotifyClone/songs/${folder}/info.json`
      );
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${response.title.replaceAll(" ", "")}" class="card">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
              <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </div>
        <img src="https://i.scdn.co/image/ab67706f0000000280ec45ba487338b089483585" alt="">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
        </div>`;
    }
  }

  // load playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playBack(songs[0],false)
    });
  });
}

async function main() {
  songs = await getSongs(`songs/Pokemon`);
  playBack(songs[0], true);

  displayAlbums();

  // adding event listener to play
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "icons/pause.svg";
    } else {
      currentSong.pause();
      play.src = "icons/play.svg";
    }
  });

  // sync seekbar with song
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${convertSecondsToMinutes(
      currentSong.currentTime
    )}/${convertSecondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // function to make seekbar interactive
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector("#closer").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add function to previous button
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1]);
    if (index - 1 >= 0) {
      playBack(songs[index - 1], false);
    }
  });

  // add function to next button
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1]);
    if (index + 1 < songs.length) {
      playBack(songs[index + 1], false);
    }
  });

  // manipulate volume of song
  range.addEventListener("change", (e) => {
    currentSong.volume = e.target.value / 100;
    if(currentSong.volume == 0 && volumeImg.src == "http://127.0.0.1:5500/projects/spotifyClone/icons/volume.svg"){
      volumeImg.src = "icons/mute.svg";
    }
    else if(currentSong.volume > 0 && volumeImg.src == "http://127.0.0.1:5500/projects/spotifyClone/icons/mute.svg"){
      volumeImg.src = "icons/volume.svg";
    }
  });

  document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", e => {
    if(currentSong.volume > 0){
      vol = currentSong.volume;
      currentSong.volume = 0;
      range.value = 0;
      e.target.src = "icons/mute.svg";
    }
    else if(currentSong.volume == 0){
      currentSong.volume = vol;
      range.value = vol * 100;
      e.target.src = "icons/volume.svg";
    }
  })
  
}

main();
