import { getSpotifyUserInfo, getLocalAccessToken } from './spotify'

const closePopup = document.querySelector('#close-popup')
const addToSpotifyForm = document.querySelector('#add-playlist-spotify')

// User profile information and auth token
// Used .then method because vite was giving "top level not availble in build target environment"
let userID = null
getSpotifyUserInfo().then(userInfo => {
  userID = userInfo.id
})
const { access_token: accessToken } = getLocalAccessToken()

addToSpotifyForm.onsubmit = AddToSpotifyOnSubmit

// Change status of the song when checkbox toggled
// onChange event attached in HTML via 'onclick' attribute in the file './youtube.js'
export function toggleSong ({ target }) {
  const statusOfToggledSong = target.parentElement.nextElementSibling.nextElementSibling
  if (target.checked) {
    changeSongStatusUI(statusOfToggledSong, 'idle')
    return
  }
  changeSongStatusUI(statusOfToggledSong, 'excluded')
}

// Get form data & make network requests to
// create a playlist, find each song on spotify
// then add songs in that playlist
async function AddToSpotifyOnSubmit (event) {
  event.preventDefault()
  closePopup.click() // Close popup

  let formData = new FormData(event.target)
  formData = {
    name: formData.get('playlist-name'),
    description: '',
    public: formData.get('playlist-visibility')
  }

  // Form validation
  if (!formData.name || formData.name === '' || formData.public === null) {
    return
  }

  const playlist = await createPlaylistSpotify(formData)

  if (playlist?.error) {
    console.log('Could not create playlist.')
  }

  const allSongsInYoutubePlaylist = [...document.querySelectorAll(".yt-playlist-songs--checkbox[checked='true']")]

  // Loop over songs & fetch song uris from spotify
  const songsURIs = []
  for (const song of allSongsInYoutubePlaylist) {
    const status = song.parentElement.nextElementSibling.nextElementSibling
    // Change status current  songs in UI to be loading....
    changeSongStatusUI(status, 'loading')

    let title = song.value
    // Remove gibberish from song title
    title = title.replace(/[^\w\s]+|(Official|Audio|Video)/gi, '')
    title = title.replace(/\s+/g, ' ')

    const songURI = await searchTrack(title)

    if (!songURI) {
      console.log('Could not find the song on spotify.')
      // Change status of the song that is not available on spotify to be error / failed
      changeSongStatusUI(status, 'error')
      continue
    }
    songsURIs.push(songURI)
  }

  // Add found songs in user's playlist
  const addedSongs = await addSongToPlaylist(playlist.id, songsURIs)

  console.log(addedSongs)

  // Change status of the songs successfully added in the playlist
  allSongsInYoutubePlaylist.forEach(song => {
    song = song.parentElement.nextElementSibling.nextElementSibling
    changeSongStatusUI(song, 'finished')
  })
}
async function createPlaylistSpotify (playlistInfo) {
  try {
    const playlistJSON = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(playlistInfo)
    })

    const playlist = await playlistJSON.json()

    return playlist
  } catch (error) {
    console.log(error)
  }
}

async function addSongToPlaylist (playlistID, songURI) {
  try {
    const addedSongJSON = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(songURI)
    })

    const addedSong = await addedSongJSON.json()

    return addedSong
  } catch (error) {
    console.log(error)
  }
}

async function searchTrack (query) {
  try {
    const songJSON = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })

    const song = await songJSON.json()

    const songsArr = song.tracks.items

    // If did not find a track on spoitfy return null
    if (songsArr.length === 0) {
      return null
    }

    // return the first track if results found
    return songsArr[0].uri
  } catch (error) {
    console.log(error)
  }
}

// Pass an array of elements to change
// Pass state where state === "loading" || "finished"
function changeSongStatusUI (statusDiv, state) {
  let loader = null

  if (state === 'excluded') {
    loader = '<p>🟡 Not Selected</p>'
  }

  if (state === 'idle') {
    loader = '<p>Ready to go</p>'
  }

  if (state === 'loading') {
    loader = '<img src="./img/dots.svg" alt="" class="song-adding-in-process" />'
  }

  if (state === 'finished') {
    loader = '<img src="./img/check.svg" alt="" class="song-adding-in-process" />'
  }

  if (state === 'error') {
    loader = `<svg class="song-adding-in-process" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.009c0-.867.659-1.491 1.491-1.491.85 0 1.509.624 1.509 1.491 0 .867-.659 1.509-1.509 1.509-.832 0-1.491-.642-1.491-1.509zM11.172 6a.5.5 0 0 0-.499.522l.306 7a.5.5 0 0 0 .5.478h1.043a.5.5 0 0 0 .5-.478l.305-7a.5.5 0 0 0-.5-.522h-1.655z" fill="red"/></svg>
    <p>Could not find the song</p>
    `
  }

  statusDiv.innerHTML = loader
}
