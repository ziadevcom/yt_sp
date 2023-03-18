const SERVER_URL = "http://localhost:3000/";
const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";
const connectSpotify = document.getElementById("connectSpotify");
const spotifyProfile = document.getElementById("spotify-profile");

// Redirect the user to Spotify login page when clicked on connect to spotify button
connectSpotify.onclick = () => {
  let scope = "playlist-modify-public";
  let clientId = "d4530bfc63064a4493176570357abb89";
  let url = "http://127.0.0.1:5500/frontend/";
  location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${url}`;
};

// Spotify Callback
// Request access token
export default async function getAccessToken() {
  // Send authorization code from spotify callback to server to get access token
  const spotifyParams = new URLSearchParams(window.location.search);
  const authrorizationCode = spotifyParams.get("code");
  if (!authrorizationCode) return;

  const accessTokenJSON = await fetch(
    `http://127.0.0.1:3000/spotify/${authrorizationCode}`
  );
  const accessTokenObj = await accessTokenJSON.json();
  displaySpotifyUserUI(accessTokenObj);
  return accessTokenObj;
}

async function displaySpotifyUserUI(accessToken) {
  if (accessToken.error) {
    return;
  }

  console.log("Bearer " + accessToken.access_token);
  // Make request to spotify api to fetch user profile information
  const spotifyProfileJSON = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: "Bearer " + accessToken.access_token,
    },
  });
  const spotifyProfileObj = await spotifyProfileJSON.json();
  // Add user's name and image in the UI
  spotifyProfile.querySelector(
    "h2"
  ).innerText = `Welcome ${spotifyProfileObj.display_name}`;
  spotifyProfile.querySelector("img").src = spotifyProfileObj.images[0].url;
  spotifyProfile.style.display = "flex";
  // Hide the spotify authentication section
  connectSpotify.parentElement.style.display = "none";
}
