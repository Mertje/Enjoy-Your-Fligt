const list = document.querySelector("#movies");
const movieFrame = document.querySelector("#movieFrame");

getData();

async function getData() {
  const dataPromise = await fetch(`${window.location.origin}/movie_data`);
  const data = await dataPromise.json();

  document.querySelector("#closeBTN").onclick = () => {
    movieFrame.pause();

    document.getElementById("myDialog").close();
    document.getElementById("dialogOverlay").style.display = "none";
    document.querySelectorAll("#movies > div").forEach((el) => {
      el.style.backgroundColor = "var(--main-color-light)";
    });
  };

  data.forEach((element) => {
    if (!element.file || !element.Name) {
      return;
    }

    const holder = document.createElement("div");
    holder.innerHTML = `<p class="title">${element.Name}</p>`;

    const image = document.createElement("img");
    image.src = element.Image;
    holder.appendChild(image);

    holder.onclick = () => playMovie(element);

    list.appendChild(holder);
  });
}

function playMovie(dataMovie) {
  document.getElementById("myDialog").showModal();
  document.getElementById("dialogOverlay").style.display = "block";

  movieFrame.innerHTML = ``;
  if (dataMovie.subtitles && dataMovie.subtitles.length > 0) {
    dataMovie.subtitles.forEach((ele) => {
      addSubs(ele);
    });
  }

  movieFrame.src = dataMovie.file;

  list.querySelectorAll("div").forEach((ele) => {
    if (ele.querySelector(".title").innerHTML !== dataMovie.Name) {
      ele.style.backgroundColor = "var(--main-color-light)";
    } else {
      ele.style.backgroundColor = "var(--main-color-dark)";
    }
  });
}

function addSubs(element) {
  const sourceSing = document.createElement("track");
  sourceSing.src = element.file;
  sourceSing.kind = "subtitles";
  sourceSing.label = element.lan;

  movieFrame.appendChild(sourceSing);
}
