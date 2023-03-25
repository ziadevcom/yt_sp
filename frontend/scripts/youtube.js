const tryDemoPlaylistButton = document.querySelector('#try-demo')
const youtubePlaylistForm = document.querySelector('#yt-playlist-search form')
const playlistURLInput = youtubePlaylistForm.querySelector('input[type="text"]')
const getAllSongsButton = youtubePlaylistForm.querySelector('input[type="submit"]')

youtubePlaylistForm.onsubmit = getAllSongs
tryDemoPlaylistButton.onclick = submitDemoForm

async function getAllSongs (event) {
  event.preventDefault()

  // Disable form submit buttons so user can't send consecutive requests before server responded to previous request
  getAllSongsButton.setAttribute('disabled', true)
  tryDemoPlaylistButton.setAttribute('disabled', true)
  const playlistURL = playlistURLInput.value
  // Verify if URL is of a valid playlist
  const serverURL = event.srcElement.action

  if (!isValidPlaylistURL(playlistURL)) {
    console.log('is not a valid url')
    return
  }

  // Slice playlist id from the url
  const playlistID = getPlaylistID(playlistURL)

  // Send API Request to server to fetch all songs from the list
  const playlistSongs = await fetchSongsFromAPI(serverURL + playlistID)

  // Add songs in the UI
  addSongsUI(playlistSongs)

  // Enable button again
  getAllSongsButton.removeAttribute('disabled')
  tryDemoPlaylistButton.removeAttribute('disabled')
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
    if (playlistSongs.error) {
      console.log(playlistSongs)
      throw Error('Something wrong with your playlist id.')
    }
    return playlistSongs
  } catch (error) {
    console.log(error)
  }
}

function addSongsUI (songs) {
  const songsUIWrapper = document.getElementById('yt-playlist-songs')
  songsUIWrapper.classList.remove('hidden')
  songs.forEach(songInfo => {
    songsUIWrapper.appendChild(createSongElement(songInfo))
  })
}

function createSongElement (songInfo) {
  const statusImg = '💫'
  const div = document.createElement('div')
  div.classList = 'yt-playlist-songs--item   row'
  const action = `
  <div class="yt-playlist-song--action">
            <input checked="true" type="checkbox" name="${songInfo.title}" />
            <label class="visually-hidden" for="${songInfo.title}">Select Song</label>
  </div>`

  const status = `
  <div class="yt-playlist-song--status">
  ${statusImg}
  </div>`

  const title = `
  <div class="yt-playlist-song--song">
          ${songInfo.title}
    </div>`

  div.innerHTML = `
  ${action}
  ${title}
  ${status}
  `
  // console.log(div)
  return div
}

// Try Demo Playlist functionality
function submitDemoForm () {
  const demoPlaylistURL = 'https://www.youtube.com/playlist?list=PLSdoVPM5WnndLX6Ngmb8wktMF61dJirKl'

  youtubePlaylistForm.querySelector('input[type="text"]').value = demoPlaylistURL
  youtubePlaylistForm.requestSubmit(getAllSongsButton)
}
