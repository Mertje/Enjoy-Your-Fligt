fetch("../components/nav.html")
  .then((res) => res.text())
  .then((html) => {
    if (html.includes("<title>Error</title>")) return;
    const nav = document.querySelector("nav");
    nav.innerHTML = html;

    const toggleBtn = document.querySelector(".toggle-menu");
    const sidenav = document.querySelector(".sidenav");
    const closeBtn = document.querySelector(".close-btn");
    const logOut = document.querySelector("#logOut");

    logOut.onclick = getAndDeleteTokenCookie;

    toggleBtn.onclick = () => sidenav.classList.toggle("show");
    closeBtn.onclick = () => sidenav.classList.remove("show");
  })
  .catch((err) => {
    console.log(`Failed to fetch nav.html. Error:`, err);
  });

function getAndDeleteTokenCookie() {
  const cookies = document.cookie.split(";");

  let tokenCookie = null;
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith("token=")) {
      tokenCookie = cookie;
      break;
    }
  }

  if (tokenCookie) {
    const token = tokenCookie.split("=")[1];
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
    return token;
  }

  return null;
}
