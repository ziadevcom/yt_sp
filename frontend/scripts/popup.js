const popup = document.querySelector('#popup')
const openPopup = document.querySelector('#open-popup')
const closePopup = document.querySelector('#close-popup')
const addToSpotifyForm = document.querySelector('#add-playlist-spotify')

addToSpotifyForm.onsubmit = function (event) {
  event.preventDefault()
  // Todo
}

closePopup.onclick = togglePopup
openPopup.onclick = togglePopup

function togglePopup () {
  popup.classList.toggle('hidden')
}
