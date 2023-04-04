const alert = document.querySelector('.alert')
const alertMessage = alert.querySelector('p')
const alertCloseButton = alert.querySelector('button')

// Remove alert on close button click
alertCloseButton.onclick = removeAlert

export default function notify (message) {
  alertCloseButton.disabled = true
  let animationClasses = ['animated', 'fadeInDown']
  // Animate the alert
  // Add different animations for entrance & consecutive errors
  if (alert.classList.contains('hidden')) {
    alert.classList.add(...animationClasses)
  } else {
    animationClasses = ['animated', 'shake']
    alert.classList.add(...animationClasses)
  }
  // Show the alert in UI
  alert.classList.remove('hidden')
  alertMessage.textContent = message // Update the alert message
  // Remove the alert animation classes after animation ends
  // This is necessary because otherwise, we can't animate on
  // consecutive alerts
  alert.onanimationend = () => {
    alertCloseButton.disabled = false
    alert.classList.remove(...animationClasses)
  }
}

export function removeAlert () {
  // Check if there is an alert in the UI before removing it
  if (alert.classList.contains('hidden')) return
  // Remove alert with fadeout animation
  const animationClasses = ['animated', 'fadeOutUp']
  alert.classList.add(...animationClasses)
  alert.onanimationend = () => {
    alert.classList.remove(...animationClasses)
    alert.classList.add('hidden')
  }
}
