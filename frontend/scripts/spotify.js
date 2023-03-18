const SERVER_URL = "http://localhost:3000/";
const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";
const connectSpotify = document.getElementById("connectSpotify");
const spotifyProfile = document.getElementById("spotify-profile");

// Redirect the user to Spotify login page when clicked on connect to spotify button
connectSpotify.onclick = () => {
  let scope = "playlist-modify-public";
  let clientId = "d4530bfc63064a4493176570357abb89";
  let redirectURI = "http://127.0.0.1:5500/frontend/";
  location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectURI}`;
};

// Spotify Callback
// Request access token
export async function getAccessToken() {
  // Send authorization code from spotify callback to server to get access token
  const spotifyParams = new URLSearchParams(window.location.search);
  const authrorizationCode = spotifyParams.get("code");
  if (!authrorizationCode) return;

  const accessTokenJSON = await fetch(
    `${SERVER_URL}spotify/${authrorizationCode}`
  );
  const accessTokenObj = await accessTokenJSON.json();
  console.log(accessTokenObj);
  saveAccessToken(accessTokenObj); // Save access token in localStorage
  return accessTokenObj;
}

// Refresh Token Request to Server
async function refreshAccessToken() {
  // Send authorization code from spotify callback to server to get access token
  const spotifyParams = new URLSearchParams(window.location.search);
  const authrorizationCode = spotifyParams.get("code");
  if (!authrorizationCode) return;

  const accessTokenJSON = await fetch(
    `${SERVER_URL}spotify/refresh?authorizationCode=${authrorizationCode}&refreshToken=${refreshToken}`
  );
  const accessTokenObj = await accessTokenJSON.json();
  displaySpotifyUserUI(accessTokenObj);
  return accessTokenObj;
}

// Save access token in localStorage
export function saveAccessToken(accessToken) {
  localStorage.setItem("accessToken", JSON.stringify(accessToken));
}

// Get Acess Token from Local Storage
export function getLocalAccessToken() {
  return JSON.parse(localStorage.getItem("accessToken")) || null;
}

export function displaySpotifyUserUI(userInfo) {
  // Add user's name and image in the UI
  spotifyProfile.querySelector(
    "h2"
  ).innerText = `Welcome ${userInfo.display_name}`;
  spotifyProfile.querySelector("img").src = userInfo.images[0].url;
  spotifyProfile.style.display = "flex";
  // Hide the spotify authentication section
  connectSpotify.parentElement.style.display = "none";
}

// Get user information from spotify api and display user profile in UI
export async function getSpotifyUserInfo(accessToken) {
  if (accessToken.error) {
    return;
  }

  // Make request to spotify api to fetch user profile information
  const spotifyProfileJSON = await fetch(`${SPOTIFY_BASE_URL}/me`, {
    headers: {
      Authorization: "Bearer " + accessToken.access_token,
    },
  });
  const spotifyProfileObj = await spotifyProfileJSON.json();
  return spotifyProfileObj;
}
