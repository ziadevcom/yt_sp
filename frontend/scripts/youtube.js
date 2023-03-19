const youtubePlaylistForm = document.querySelector('#yt-playlist-search form')

youtubePlaylistForm.onsubmit = async function getAllSongs (event) {
  event.preventDefault()

  // Disable form submit button
  const getAllSongsButton = youtubePlaylistForm.querySelector('input[type="submit"]')
  console.log(getAllSongsButton)
  getAllSongsButton.setAttribute('disabled', true)

  // Verify if URL is of a valid playlist
  const serverURL = event.srcElement.action
  const playlistURL = event.target.querySelector('input[type="text"]').value

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
}

function isValidPlaylistURL (url) {
  const queryParams = new URLSearchParams(url)
  if (!url.includes('youtube.com') && !queryParams.has('list')) return false
  return true
}

function getPlaylistID (url) {
  // return url.split('playlist?list=')[1]
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
  songs.forEach(songInfo => {
    songsUIWrapper.appendChild(createSongElement(songInfo))
  })
}

function createSongElement (songInfo) {
  console.log(songInfo)
  const div = document.createElement('div')
  div.classList = 'youtube-song'

  const img = document.createElement('img')
  img.classList = 'youtube-song--img'
  img.src = songInfo.thumbnail.url
  img.loading = 'lazy'
  div.append(img)

  const title = document.createElement('h3')
  title.classList = 'youtube-song--title'
  title.textContent = songInfo.title
  div.append(title)

  return div
}
