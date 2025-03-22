chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getBackgroundUrl') {
      chrome.storage.local.get(['backgroundUrl'], (result) => {
        sendResponse({ backgroundUrl: result.backgroundUrl });
      });
    }
  });