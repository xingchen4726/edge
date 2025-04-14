
chrome.storage.local.get(['backgroundUrl'], (result) => {
  if (result.backgroundUrl) {
    setFixedBackground(result.backgroundUrl);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateBackground") {
    chrome.storage.local.get(['backgroundUrl'], (result) => {
      if (result.backgroundUrl) {
        setFixedBackground(result.backgroundUrl);
      }
    });
  }
});

function setFixedBackground(backgroundUrl) {
  document.body.style.backgroundImage = `url(${backgroundUrl})`;
  document.body.style.backgroundSize = 'cover'; // 背景图覆盖整个窗口
  document.body.style.backgroundPosition = 'center'; // 背景图居中
  document.body.style.backgroundAttachment = 'fixed'; // 背景图固定，不随滚动条移动
  document.body.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // 设置背景颜色为白色，透明度为20%
  document.body.style.backgroundBlendMode = 'overlay'; // 混合背景图和背景颜色
}