import { toggleSong } from './spotify-playlist'
import notify, { removeAlert } from './alerts'

const tryDemoPlaylistButton = document.querySelector('#try-demo')
const youtubePlaylistForm = document.querySelector('#yt-playlist-search form')
const playlistURLInput = youtubePlaylistForm.querySelector('input[type="text"]')
const getAllSongsButton = youtubePlaylistForm.querySelector('input[type="submit"]')

youtubePlaylistForm.onsubmit = getAllSongs
tryDemoPlaylistButton.onclick = submitDemoForm

async function getAllSongs (event) {
  event.preventDefault()
  try {
    const playlistURL = playlistURLInput.value
    // Verify if URL is of a valid playlist
    const serverURL = event.srcElement.action

    if (!isValidPlaylistURL(playlistURL)) {
      notify('Please provide a valid Youtube playlist\'s URL.')
      return
    }

    // Disable form submit buttons so user can't send consecutive requests before server responded to previous request
    toggleForm('disable')

    // Slice playlist id from the url
    const playlistID = getPlaylistID(playlistURL)

    // Send API Request to server to fetch all songs from the list
    const playlist = await fetchSongsFromAPI(serverURL + playlistID)

    // Error checking
    if (playlist.error || playlist instanceof Error) {
      return notify(playlist.message)
    }

    removeAlert()

    // Add songs in the UI
    addSongsUI(playlist.items)
  } catch (error) {
    console.log(error)
    notify(error.message)
  } finally {
    // Enable form again
    toggleForm('enable')
  }
}

function isValidPlaylistURL (url) {
  const queryParams = new URLSearchParams(url)
  if (!url.includes('youtube.com') && !queryParams.has('list')) return false
  return true
}

function getPlaylistID (url) {
  const queryParamString = url.split('?')[1]
  const queryParams = new URLSearchParams(queryParamString)
  return queryParams.get('list')
}

async function fetchSongsFromAPI (playlistID) {
  try {
    const playlistResponse = await fetch(playlistID)
    const playlistSongs = await playlistResponse.json()
    return playlistSongs
  } catch (error) {
    console.log(error)
    return error
  }
}

function addSongsUI (songs) {
  // console.log(songs)
  const songsUIWrapper = document.querySelector('#yt-playlist-songs')
  songsUIWrapper.classList.remove('hidden')

  const songUIWrapperBody = songsUIWrapper.querySelector('#body')
  songUIWrapperBody.innerHTML = ''
  songs.forEach(songInfo => {
    songUIWrapperBody.appendChild(createSongElement(songInfo))
  })
  updateUIElements()
  songUIWrapperBody.scrollIntoView()
}

function createSongElement (songInfo) {
  const div = document.createElement('div')
  div.classList = 'yt-playlist-songs--item row'
  const action = `
  <div class="yt-playlist-song--action">
    <input checked class="yt-playlist-songs--checkbox" type="checkbox" name="${songInfo.title}" value="${songInfo.title}"/>
    <label class="visually-hidden" for="${songInfo.title}">Select Song</label>
  </div>`

  const status = '<div class="yt-playlist-song--status">Ready to go</div>'

  const title = `
  <div class="yt-playlist-song--song">
    ${songInfo.title}
  </div>`

  div.innerHTML = `
  ${action}
  ${title}
  ${status}
  `
  // Add toggleSong event listener which changes status of song when toggled
  div.querySelector('.yt-playlist-songs--checkbox').onchange = toggleSong
  return div
}

// Try Demo Playlist functionality
function submitDemoForm () {
  const demoPlaylistURL = 'https://www.youtube.com/playlist?list=PLSdoVPM5WnndLX6Ngmb8wktMF61dJirKl'

  youtubePlaylistForm.querySelector('input[type="text"]').value = demoPlaylistURL
  youtubePlaylistForm.requestSubmit(getAllSongsButton)
}

function updateUIElements () {
  const openPopup = document.querySelector('#open-popup')
  openPopup.classList.remove('hidden')
}

// Toggle form function
// Disable or enable form submit buttons so user can't send consecutive requests before server has responded to previous request
function toggleForm (state) {
  if (state === 'disable') {
    getAllSongsButton.setAttribute('disabled', true)
    tryDemoPlaylistButton.setAttribute('disabled', true)
  } else if (state === 'enable') {
    getAllSongsButton.removeAttribute('disabled')
    tryDemoPlaylistButton.removeAttribute('disabled')
  } else {
    throw new Error('Please provide one of the valid states. ( enable | disable )')
  }
}
