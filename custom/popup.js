// 背景更换功能
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

/**
 * 从数据库获取图片URL
 * 调用流程：
 * 1. 请求本地API接口: http://localhost:8080/images
 * 2. 参数说明:
 *    - type=img1: 图片类型
 *    - page=1: 页码
 *    - size=9: 获取9张图片
 *    - src=moehu_pic: 数据表名
 * 3. 返回图片URL数组
 */
async function fetchImageUrlsFromDB() {
  try {
    // 调用本地API接口获取图片数据
    const response = await fetch('http://localhost:8080/images?type=img1&page=1&size=9&src=moehu_pic');
    if (!response.ok) throw new Error('获取图片数据失败');
    
    // 解析返回的JSON数据
    const data = await response.json();
    
    // 提取图片URL并返回
    return data.map(item => item.src);
  } catch (error) {
    console.error('API调用错误:', error);
    throw error;
  }
}

// 更新背景图片
function updateBackgroundImages(urls) {
  const images = document.querySelectorAll('.gallery img');
  if (images.length === urls.length) {
    images.forEach((img, index) => {
      img.src = urls[index];
      // 同时更新背景存储
      chrome.storage.local.set({ backgroundUrl: urls[index] }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "updateBackground" });
        });
      });
    });
  }
}

// 本地备用图片URL
const LOCAL_IMAGE_URLS = [
  "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/a15b4afegy1fmvjaxjsaoj21hc0u0e65.jpg",
  "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/9bd9b167gy1g4lhdxdmbuj21hc0xcakc.jpg",
  "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/9bd9b167gy1g4lhhf0k7uj21hc0xc7fr.jpg",
  "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/9bd9b167gy1g4lhdxdmbuj21hc0xcakc.jpg",
  "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/9bd9b167gy1g2qkij35wzj21hc0u0ayx.jpg",
  "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/9bd9b167gy1fwsg0mf28wj21hc0u04qp.jpg",
  "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/87c01ec7gy1fs2mmxexj9j21hc0u0u0x.jpg",
  "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxlol5zqjj310p1hc7se.jpg",
  "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxlofvhqoj31hc0u0qhu.jpg"
];

// 一键替换所有图片功能
document.getElementById('replaceAll').addEventListener('click', async () => {
  const button = document.getElementById('replaceAll');
  const originalText = button.textContent;
  button.textContent = '加载中...';
  button.disabled = true;

  try {
    const imageUrls = await fetchImageUrlsFromDB();
    updateBackgroundImages(imageUrls);
    alert('背景图片已从数据库更新！');
  } catch (error) {
    console.error('使用数据库图片失败:', error);
    alert('使用本地备用图片替换');
    updateBackgroundImages(LOCAL_IMAGE_URLS);
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
});
