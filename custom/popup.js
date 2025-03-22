document.getElementById('changeBg').addEventListener('click', () => {
    const url = document.getElementById('bgUrl').value;
    if (url) {
      chrome.storage.local.set({ backgroundUrl: url }, () => {
        alert('背景已更新！');
      });
    }
  });