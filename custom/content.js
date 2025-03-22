chrome.runtime.sendMessage({ action: 'getBackgroundUrl' }, (response) => {
    if (response.backgroundUrl) {
      document.body.style.backgroundImage = `url(${response.backgroundUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    }
  });