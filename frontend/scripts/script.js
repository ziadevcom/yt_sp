import {
  getLocalAccessToken,
  displaySpotifyUserUI,
  getSpotifyUserInfo,
  getAccessToken,
  refreshAccessToken,
  isExpiredAccessToken
} from './spotify.js'

window.onload = setupUI

function setupUI () {
  const token = getLocalAccessToken()

  // Spotify callback redirect
  // User redirected back to website after connecting their account
  // We check that by looking for "code" query parameter in URL
  if (location.href.includes('?code=')) {
    updateUserProfile()
    return
  }

  // User already logged in, so we just update profile
  if (token) {
    updateUserProfile()
    return
  }

  // First time website visit, so we show authentication box
  if (!token) {
    document.querySelector('#spotify-profile').style.display = 'none'
    document.querySelector('#spotify-authentication').style.display = 'flex'
  }
}

// Add user profile in page when website loads
// If accessToken already in localStorage, user that.
// Otherwise request a new one from the server
async function updateUserProfile () {
  let accessToken = getLocalAccessToken()

  if (
    !accessToken ||
    accessToken.error ||
    accessToken.error_description === 'Authorization code expired'
  ) {
    accessToken = await getAccessToken()
  } else if (isExpiredAccessToken(accessToken)) {
    accessToken = await refreshAccessToken()
    console.log('refresh')
  }
  const userInfo = await getSpotifyUserInfo(accessToken)

  // Added some delay before making user profile visible to give a "Loading effect"
  setTimeout(() => displaySpotifyUserUI(userInfo), 500)
}
