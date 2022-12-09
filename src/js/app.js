/* global gtag */

const directionsEl = document.querySelector('.directions');
const consoleEl = document.querySelector('.console');

const logMessage = message => {
  const messageLoggingEvent = new CustomEvent('log', {
    detail: {
      message
    }
  });
  document.dispatchEvent(messageLoggingEvent);
};


const directionsButtonClickHandler = e => {
  const {target} = e;

  if (target.tagName === 'BUTTON') {
    const {dir} = target.dataset;

    gtag('event', 'direction_click', {
      direction: dir
    });

    logMessage(`Direction Event Clicked: ${dir}`);
  }
};

const consoleLogHandler = e => {

  const {detail} = e;

  const {message} = detail || {};

  if (message) {
    const logEntry = document.createElement('P');
    logEntry.innerHTML = message;
    consoleEl.appendChild(logEntry);
  }
};

directionsEl.addEventListener('click', directionsButtonClickHandler);
document.addEventListener('log', consoleLogHandler);
