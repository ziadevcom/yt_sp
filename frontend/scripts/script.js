import {
  getLocalAccessToken,
  displaySpotifyUserUI,
  getSpotifyUserInfo,
  getAccessToken,
  refreshAccessToken,
  isExpiredAccessToken,
} from "./spotify.js";

// Add user profile in page when website loads
// If accessToken already in localStorage, user that.
// Otherwise request a new one from the server
async function updateUserProfile() {
  let accessToken = getLocalAccessToken();

  if (
    !accessToken ||
    accessToken.error ||
    accessToken.error_description === "Authorization code expired"
  ) {
    accessToken = await getAccessToken();
  } else if (isExpiredAccessToken(accessToken)) {
    accessToken = await refreshAccessToken();
    console.log("refresh");
  }
  console.log(accessToken);
  const userInfo = await getSpotifyUserInfo(accessToken);

  // Added some delay before making user profile visible to give a "Loading effect"
  setTimeout(() => displaySpotifyUserUI(userInfo), 1000);
}

window.onload = function setupUI() {
  const token = getLocalAccessToken();

  if (token) {
    // Conditional for consecutive user website visits
    // Consecutive website visits conditional comes before
    // authorization code check after connecting spotify
    // because if user connects spotify account &
    // reloads the page while there is still "code"
    // query is present in the url
    // We don't want to fire the functionality for getting access token again
    // becasue we will be using old / used authorization code to
    // get a new access token and that will end in a error 401 from spotify
    // saying that auth code has expired.
    // Wrote it down because i had a lot of trouble figuring out this bug.
    updateUserProfile();
    return;
  }
  if (location.href.includes("?code=")) {
    // When user has connected spotify account
    // We check for authorizatoin code in the URL
    updateUserProfile();
    return;
  }

  if (!token) {
    // First time website visit, we just show authentication box
    document.querySelector("#spotify-profile").style.display = "none";
    document.querySelector("#spotify-authentication").style.display = "flex";
    return;
  }
};

// anime({
//   targets: "#preloader",
//   // translateX: [100, 250],
//   opacity: [0, 1],
//   easing: "easeInOutQuad",
// });

// anime.remove
// anime({
//   targets: ".hidden",
//   // translateX: [100, 250],
//   opacity: [1, 0],
//   easing: "easeInOutQuad",
// });
