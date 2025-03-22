// 加载当前保存的背景URL
chrome.storage.local.get(['backgroundUrl'], (result) => {
    document.getElementById('bgUrlInput').value = result.backgroundUrl || '';
  });
  
  // 保存新的背景URL
  document.getElementById('saveBg').addEventListener('click', () => {
    const url = document.getElementById('bgUrlInput').value;
    if (url) {
      chrome.storage.local.set({ backgroundUrl: url }, () => {
        alert('背景设置已保存！');
      });
    }
  });