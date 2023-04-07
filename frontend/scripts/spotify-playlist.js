import { getSpotifyUserInfo, getLocalAccessToken } from './spotify'
import notify from './alerts'
import updateSummary, { showSummaryUI } from './summary'

const closePopup = document.querySelector('#close-popup')
const addToSpotifyForm = document.querySelector('#add-playlist-spotify')

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

  // Create playlist in spotify account
  // Notify user & return if failed
  const playlist = await createPlaylistSpotify(formData)

  if (playlist?.error || playlist instanceof Error) {
    notify(playlist.message)
    return
  }

  // Holds all checkboxes inputs
  const allSongsInYoutubePlaylist = [...document.querySelectorAll('.yt-playlist-songs--checkbox[checked]')]

  // Loop over songs & fetch song uris from spotify
  // Return null for songs that are un-checked by the user
  const songsURIsPromises = allSongsInYoutubePlaylist.map(song => {
    if (!song.checked) return null
    // Change status of all songs in UI
    const status = song.parentElement.nextElementSibling.nextElementSibling
    changeSongStatusUI(status, 'loading')
    // Remove gibberish from song title
    const songTitle = song.value.replace(/[^\w\s]+|(Official|Audio|Video)/gi, '').replace(/\s+/g, ' ')
    return searchTrack(songTitle)
  })

  // Use promise all to retrieve the actual song uri's
  // Previous map just returned the promises, we are listening for resolve now with Promise.all
  const songsURIs = await Promise.all(songsURIsPromises)

  /*
  Remove null items from array before adding to spotify playlist.
  Remove the items right before adding to spotify because
  in previous step, we used null items as a reference to which songs to avoid updating their state but we can't pass "null" as uri to spotify api as that will throw errors
  */
  // Add songs in user's playlist
  const addedSongs = await addSongToPlaylist(playlist.id, songsURIs.filter(song => song))

  if (addedSongs.error) {
    notify('Could not add songs to playlist')
    console.log(addedSongs)
  }

  /*
  Change status of the songs successfully added in the playlist.
  Because we returned null for the un-checked songs by user
  We can check for null and ignore that song & not update it's state in UI
  */
  songsURIs.forEach((item, index) => {
    if (!item) return
    const song = allSongsInYoutubePlaylist[index].parentElement.nextElementSibling.nextElementSibling
    changeSongStatusUI(song, 'finished')
  })

  displayResults(songsURIs, allSongsInYoutubePlaylist)
}

async function createPlaylistSpotify (playlistInfo) {
  // User profile information and auth token
  const { id: userID } = await getSpotifyUserInfo()
  const { access_token: accessToken } = getLocalAccessToken()

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
    return error
  }
}

async function addSongToPlaylist (playlistID, songURI) {
  // User profile information and auth token
  const { access_token: accessToken } = getLocalAccessToken()

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
    return error
  }
}

async function searchTrack (query) {
  // User profile information and auth token
  const { access_token: accessToken } = getLocalAccessToken()
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
    return error
  }
}

// Pass an array of elements to change
// Pass state where state === "loading" || "finished"
function changeSongStatusUI (statusDiv, state) {
  let loader = null

  if (state === 'excluded') {
    loader = '<p>Not Selected</p>'
  }

  if (state === 'idle') {
    loader = '<p>Ready to go</p>'
  }

  if (state === 'loading') {
    loader = '<img src="/dots.svg" alt="" class="song-adding-in-process" />'
  }

  if (state === 'finished') {
    loader = '<img src="/check.svg" alt="" class="song-adding-in-process" />'
  }

  if (state === 'error') {
    loader = `<svg class="song-adding-in-process" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.009c0-.867.659-1.491 1.491-1.491.85 0 1.509.624 1.509 1.491 0 .867-.659 1.509-1.509 1.509-.832 0-1.491-.642-1.491-1.509zM11.172 6a.5.5 0 0 0-.499.522l.306 7a.5.5 0 0 0 .5.478h1.043a.5.5 0 0 0 .5-.478l.305-7a.5.5 0 0 0-.5-.522h-1.655z" fill="red"/></svg>
    <p>Could not find the song</p>
    `
  }

  statusDiv.innerHTML = loader
}

function displayResults (songsURIs, allSongsInYoutubePlaylist) {
  const success = []
  const failures = []
  songsURIs.forEach((song, index) => {
    if (!song) {
      failures.push(allSongsInYoutubePlaylist[index])
      return
    }
    success.push(allSongsInYoutubePlaylist[index])
  })

  updateSummary(success, failures)
  showSummaryUI()
}
