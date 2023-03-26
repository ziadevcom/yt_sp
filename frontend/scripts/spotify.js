const SERVER_URL = import.meta.env.VITE_SERVER_URL
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1'
const connectSpotify = document.getElementById('connectSpotify')
const spotifyProfile = document.querySelector('.spotify-profile--content')

// Redirect the user to Spotify login page when clicked on connect to spotify button
connectSpotify.onclick = () => {
  const scope = 'playlist-modify-private playlist-modify-public'
  const clientId = 'd4530bfc63064a4493176570357abb89'
  const redirectURI = location.protocol + '//' + location.host + '/'
  location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectURI}`
}

// Spotify Callback
// Request access token
export async function getAccessToken () {
  // Send authorization code from spotify callback to server to get access token
  const spotifyParams = new URLSearchParams(window.location.search)
  const authrorizationCode = spotifyParams.get('code')
  if (!authrorizationCode) return

  // Removing auth code from url without reloading the page to just make the url cleaner & avoid any potential edge cases
  history.pushState(null, '', '/')
  const accessTokenJSON = await fetch(
    `${SERVER_URL}spotify/${authrorizationCode}`
  )
  const accessTokenObj = await accessTokenJSON.json()
  saveAccessToken(accessTokenObj) // Save access token in localStorage
  return accessTokenObj
}

// Refresh Token Request to Server
export async function refreshAccessToken () {
  const { refresh_token: refreshToken } = JSON.parse(
    localStorage.getItem('accessToken')
  )

  // Send refresh access token request to the server
  const accessTokenJSON = await fetch(
    `${SERVER_URL}spotify/refresh/${refreshToken}`
  )
  const accessTokenObj = await accessTokenJSON.json()
  accessTokenObj.refresh_token = refreshToken
  saveAccessToken(accessTokenObj)
  return accessTokenObj
}

// Save access token in localStorage
export function saveAccessToken (accessToken) {
  accessToken.timestamp = Date.now()
  localStorage.setItem('accessToken', JSON.stringify(accessToken))
}

// Get Acess Token from Local Storage
export function getLocalAccessToken () {
  return JSON.parse(localStorage.getItem('accessToken')) || null
}

export function displaySpotifyUserUI (userInfo) {
  // Add user's name and image in the UI
  spotifyProfile.querySelector('h2 span').innerText = userInfo.display_name
  spotifyProfile.querySelector('img').src = userInfo.images[0].url
  spotifyProfile.style.display = 'flex'
  // Hide the spotify authentication section
  connectSpotify.parentElement.style.display = 'none'
  // Hide Preloader
  spotifyProfile.querySelector('img').onload = updateUIElements
}

// Get user information from spotify api and display user profile in UI
export async function getSpotifyUserInfo (accessToken) {
  if (accessToken?.error) {
    return
  }

  // If user previously fetched then don't make a network request
  // Instead load from locastorage
  const userFromLocalStorage = localStorage.getItem('userInfo')
  if (userFromLocalStorage) {
    return JSON.parse(userFromLocalStorage)
  }

  // Make request to spotify api to fetch user profile information
  const spotifyProfileJSON = await fetch(`${SPOTIFY_BASE_URL}/me`, {
    headers: {
      Authorization: 'Bearer ' + accessToken.access_token
    }
  })
  const spotifyProfileObj = await spotifyProfileJSON.json()

  localStorage.setItem('userInfo', JSON.stringify(spotifyProfileObj))

  return spotifyProfileObj
}

// Check if access token has expired by comparing creation time and current time
export function isExpiredAccessToken (accessToken) {
  const creationTime = accessToken.timestamp / 1000
  const now = Date.now() / 1000

  if (now - creationTime >= 3600) {
    return true
  }

  return false
}

// Function that updates ui elements after spotify profile is authorized

function updateUIElements () {
  // Hide Preloader
  document.querySelector('#preloader').classList.add('hidden')
  // Display youtube playlist search form
  document.querySelector('#yt-playlist-search').classList.remove('hidden')
}
