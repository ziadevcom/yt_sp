export const summaryUI = document.querySelector('#summary')
const successUI = summaryUI.querySelector('#summary-success__count span')
const failurUI = summaryUI.querySelector('#summary-failure__count span')

function updateSummaryCount (successCount, failureCount = 0) {
  if (isNaN(successCount) || isNaN(failureCount)) {
    throw new Error('Please pass a valid number for success or failure.')
  }
  successUI.textContent = successCount
  failurUI.textContent = failureCount
}

export default function updateSummary (successArr, failureArr) {
  updateSummaryCount(successArr.length, failureArr.length)
}

export function removeSummaryUI () {
  summaryUI.classList.add('hidden')
}

export function showSummaryUI () {
  summaryUI.classList.add('animated', 'fadeInDown')
  summaryUI.classList.remove('hidden')
}
