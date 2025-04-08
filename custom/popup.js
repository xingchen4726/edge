
let currentPage = 1; // 当前页码
const pageSize = 9; // 每页显示的图片数量
// 背景更换功能
document.getElementById('changeBg').addEventListener('click', async () => {
  const url = document.getElementById('bgUrl').value.trim();
  if (!url) {
    alert('请输入背景图片URL！');
    return;
  }

  chrome.storage.local.set({ backgroundUrl: url }, async () => {
    alert('背景已更新！');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "updateBackground" });
    });

    // 添加到历史记录
    try {
      await fetch('http://localhost:8080/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src: url })
      });
      console.log('输入的背景图已添加到历史记录');
    } catch (error) {
      console.error('添加到历史记录失败:', error);
    }
  });
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
// 获取数据库总页数
async function getTotalPages() {
  try {
    const response = await fetch('http://localhost:8080/images/info?src=moehu_pic');
    if (!response.ok) throw new Error('获取页数失败');
    const data = await response.json();
    return data.totalPages || 10; // 默认10页
  } catch (error) {
    console.error('获取总页数失败:', error);
    return 10; // 默认10页
  }
}

async function fetchImageUrlsFromDB() {
  try {
    // 获取随机页码
    const totalPages = await getTotalPages();
    const randomPage = Math.floor(Math.random() * totalPages) + 1;
    
    // 调用本地API接口获取图片数据
    const response = await fetch(`http://localhost:8080/images?type=img1&page=${randomPage}&size=9&src=moehu_pic`);
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

// 设置图片点击事件处理程序
function setupImageClickHandlers() {
  const images = document.querySelectorAll('.gallery img');
  images.forEach(img => {
    img.addEventListener('click', () => {
      chrome.storage.local.set({ backgroundUrl: img.src }, () => {
        alert('背景已更新！');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "updateBackground" });
        });
      });
    });
  });
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

// 页面切换功能
function showPage(pageId) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // 显示目标页面
  const targetPage = document.getElementById(`${pageId}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
}

// 初始化图片点击事件和导航
document.addEventListener('DOMContentLoaded', () => {
  setupImageClickHandlers();
  
  // 修改导航方式，阻止a标签默认行为
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      if (pageId) {
        showPage(pageId);
      }
    });
  });
});

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
document.getElementById('generateAIImage').addEventListener('click', async () => {
  const prompt = document.getElementById('aiPrompt').value.trim();
  if (!prompt) {
    alert('请输入AI绘图描述！');
    return;
  }

  const button = document.getElementById('generateAIImage');
  const originalText = button.textContent;
  button.textContent = '生成中...';
  button.disabled = true;

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-zjnqimadckntkhndvxdoqijbseslfkszxaannqpbmbstsnxz' // 替换为你的API密钥
      },
      body: JSON.stringify({
        model: 'Kwai-Kolors/Kolors',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      })
    });

    if (!response.ok) {
      throw new Error('AI绘图API请求失败');
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    // 将生成的图像URL存储到本地存储
    chrome.storage.local.set({ backgroundUrl: imageUrl }, async () => {
      alert('AI背景已生成并应用！');
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateBackground" });
      });

      // 添加到历史记录
      try {
        await fetch('http://localhost:8080/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ src: imageUrl })
        });
        console.log('AI生成的背景图已添加到历史记录');
      } catch (error) {
        console.error('添加到历史记录失败:', error);
      }
    });
  } catch (error) {
    console.error('生成AI背景失败:', error);
    alert('生成AI背景失败，请稍后重试');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
});
document.addEventListener('click', async function (e) {
  if (e.target.tagName === 'IMG') {
    const src = e.target.src;

    try {
      await fetch('http://localhost:8080/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src })
      });
    } catch (error) {
      console.error('Error adding history:', error);
    }
  }

  if(contextMenu) {
    contextMenu.remove();
    contextMenu = null;
  }
});
 // 历史记录功能
 let history = JSON.parse(localStorage.getItem('history') || '[]');
 async function loadHistory(page = 1) {
  try {
    const response = await fetch(`http://localhost:8080/api/history?page=${page}&size=${pageSize}`);
    const result = await response.json();

    console.log('API 返回的数据:', result); // 调试日志

    const historyData = result.data || [];
    const total = result.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    const container = document.getElementById('history-gallery');
    container.innerHTML = historyData.map(item => `
      <img src="${item.src}" alt="历史图片">
    `).join('');

    // 更新分页按钮状态
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    prevButton.disabled = page <= 1;
    nextButton.disabled = page >= totalPages;

    // 更新当前页码
    currentPage = page;

    // 为历史图片绑定点击事件
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('click', () => {
        const url = img.src;
        chrome.storage.local.set({ backgroundUrl: url }, () => {
          alert('背景已更新！');
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateBackground" });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error loading history:', error);
  }
}
 // 页面切换功能
 function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(`${pageId}-page`).classList.add('active');

  if (pageId === 'favorites') loadFavorites();
  if (pageId === 'history') loadHistory(1); // 切换到历史页面时加载第一页
}
  // 收藏功能
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  let contextMenu = null;

  // 右键菜单
  document.addEventListener('contextmenu', e => {
    if(e.target.tagName === 'IMG') {
      e.preventDefault();
      showContextMenu(e, e.target.src);
    }
  });

  function showContextMenu(e, imgSrc) {
    if(contextMenu) contextMenu.remove();
    
    contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    
    const menuItem = document.createElement('div');
    menuItem.className = 'context-menu-item';
    menuItem.textContent = favorites.includes(imgSrc) ? '取消收藏' : '收藏图片';
    menuItem.onclick = () => toggleFavorite(imgSrc);
    
    contextMenu.appendChild(menuItem);
    document.body.appendChild(contextMenu);
  }

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      loadHistory(currentPage - 1);
    }
  });
  
  document.getElementById('nextPage').addEventListener('click', () => {
    loadHistory(currentPage + 1);
  });

  function toggleFavorite(imgSrc) {
    const index = favorites.indexOf(imgSrc);
    if(index === -1) {
      favorites.push(imgSrc);
    } else {
      favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    if(document.getElementById('favorites-page').classList.contains('active')) {
      loadFavorites();
    }
  }

  function loadFavorites() {
    const container = document.getElementById('favorites-gallery');
    container.innerHTML = favorites.map(url => `
      <img src="${url}" alt="收藏的图片">
    `).join('');
  }

 
  // 初始化页面
  window.onload = function () {
    chrome.windows.getCurrent(function (win) {
      chrome.windows.update(win.id, {
        width: screen.availWidth,
        height: screen.availHeight
      });
    });
  };

  // 预设替换功能
  const PRESET_REPLACE_URL = "https://image.baidu.com/search/down?url=https://tvax3.sinaimg.cn/large/9bd9b167gy1g4lhdxdmbuj21hc0xcakc.jpg";

