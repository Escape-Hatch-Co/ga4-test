/* global gtag */

const directionsEl = document.querySelector('.directions');

const directionsButtonClickHandler = e => {
  const {target} = e;

  if (target.tagName === 'BUTTON') {
    const {dir} = target.dataset;

    gtag('event', 'direction_click', {
      direction: dir
    });
  }
};

directionsEl.addEventListener('click', directionsButtonClickHandler);
