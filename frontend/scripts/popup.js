const popup = document.querySelector('#popup')
const openPopup = document.querySelector('#open-popup')
const closePopup = document.querySelector('#close-popup')

closePopup.onclick = togglePopup
openPopup.onclick = togglePopup

function togglePopup () {
  popup.classList.toggle('hidden')
}
