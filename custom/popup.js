document.getElementById('changeBg').addEventListener('click', () => {
  const url = document.getElementById('bgUrl').value;
  if (url) {
    chrome.storage.local.set({ backgroundUrl: url }, () => {
      alert('背景已更新！');
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateBackground" });
      });
    });
  }
});
