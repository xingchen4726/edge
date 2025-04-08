chrome.runtime.onInstalled.addListener(() => {
  console.log('自定义背景插件已安装！');
  
  // 初始化背景设置，默认背景URL
  chrome.storage.local.get(['backgroundUrl'], (result) => {
    if (!result.backgroundUrl) {
      chrome.storage.local.set({ backgroundUrl: 'https://example.com/default-background.jpg' });
    }
  });
});
