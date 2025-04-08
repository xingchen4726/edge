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
    chrome.storage.local.set({ backgroundUrl: imageUrl }, () => {
      alert('AI背景已生成并应用！');
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateBackground" });
      });
    });
  } catch (error) {
    console.error('生成AI背景失败:', error);
    alert('生成AI背景失败，请稍后重试');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
});

// 页面切换功能
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(`${pageId}-page`).classList.add('active');
  
  if(pageId === 'favorites') loadFavorites();
  if(pageId === 'history') loadHistory();
}

 // 修改后的收藏功能
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// 背景轮换功能
document.addEventListener('DOMContentLoaded', () => {
  // 收集首页图片作为背景源
  const backgroundImages = Array.from(
    document.querySelectorAll('#home-page .image-container img')
  ).map(img => img.src);

  // 预加载图片
  function preloadImages(urls) {
    urls.forEach(url => new Image().src = url);
  }
  preloadImages(backgroundImages);

  // 初始化轮换逻辑
  let currentImageIndex = 0;
  const layers = document.querySelectorAll('.bg-layer');
  let activeLayerIndex = 0;

  function changeBackground() {
    const nextImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    const inactiveLayerIndex = activeLayerIndex === 0 ? 1 : 0;

    layers[inactiveLayerIndex].style.backgroundImage = `url('${backgroundImages[nextImageIndex]}')`;
    layers[activeLayerIndex].classList.remove('active');
    layers[inactiveLayerIndex].classList.add('active');
    
    activeLayerIndex = inactiveLayerIndex;
    currentImageIndex = nextImageIndex;
  }

  // 初始化背景
  if (backgroundImages.length > 0) {
    layers[0].style.backgroundImage = `url('${backgroundImages[0]}')`;
    layers[0].classList.add('active');
    setInterval(changeBackground, 2000); // 2秒切换一次
  }
});

document.addEventListener('click', function(event) {
  const starButton = event.target.closest('.favorite-star');
  if (starButton) {
    // 添加边界检查
    const imageContainer = starButton.closest('.image-container');
    if (!imageContainer) return;
    
    const imgElement = imageContainer.querySelector('img');
    if (!imgElement) return;

    const imageUrl = imgElement.src;
    const currentIndex = favorites.indexOf(imageUrl);

    // 更新收藏状态
    if (currentIndex === -1) {
      favorites.push(imageUrl);
      starButton.classList.add('active');
    } else {
      favorites.splice(currentIndex, 1);
      starButton.classList.remove('active');
    }
    
    // 强制更新本地存储
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // 立即更新收藏页面
    if (document.getElementById('favorites-page').classList.contains('active')) {
      loadFavorites(true); // 添加强制刷新参数
    }
    return;
  }

  // 修改页面切换处理
  const navLink = event.target.closest('a[data-page]');
  if (navLink) {
    event.preventDefault();
    const pageId = navLink.dataset.page;
    showPage(pageId);
    // 添加页面切换后的强制重绘
    setTimeout(() => {
      if(pageId === 'favorites') loadFavorites(true);
    }, 50);
  }
});

  // 增强的加载收藏方法
  function loadFavorites(forceUpdate = false) {
  const favoritesGallery = document.getElementById('favorites-gallery');
  // 检查数据有效性
  const validFavorites = favorites.filter(url => 
    url && url.startsWith('http') && 
    !url.includes('undefined') && 
    !url.includes('null')
  );
  
  // 数据过滤
  if (JSON.stringify(validFavorites) !== JSON.stringify(favorites)) {
    favorites = validFavorites;
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  // DOM对比更新
  const currentUrls = [...favoritesGallery.querySelectorAll('img')].map(img => img.src);
  if (!forceUpdate && JSON.stringify(currentUrls) === JSON.stringify(favorites)) return;

  // 重新生成收藏内容
  favoritesGallery.innerHTML = favorites.map(url => `
    <div class="image-container">
      <img src="${url}" alt="收藏图片" onerror="this.remove()">
      <button class="favorite-star active"></button>
    </div>
  `).join('');

  // 添加图片加载失败处理
  favoritesGallery.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
      const index = favorites.indexOf(img.src);
      if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        img.parentElement.remove();
      }
    }
  });
};

  // 增强的初始化方法
window.addEventListener('DOMContentLoaded', () => {
  // 清理无效收藏
  favorites = favorites.filter(url => 
    url && url.startsWith('http') && 
    !url.includes('undefined') && 
    !url.includes('null')
  );
  
  // 初始化按钮状态
  document.querySelectorAll('.image-container').forEach(container => {
    const img = container.querySelector('img');
    const star = container.querySelector('.favorite-star');
    if (img && star) {
      star.classList.toggle('active', favorites.includes(img.src));
      // 添加图片加载失败处理
      img.onerror = function() {
        container.remove();
      }
    }
  });

  // 初始化收藏页面
  if (document.getElementById('favorites-page').classList.contains('active')) {
    loadFavorites(true);
  }
});


// 历史记录功能
let history = JSON.parse(localStorage.getItem('history') || '[]');
function loadHistory() {
  const container = document.getElementById('history-gallery');
  container.innerHTML = history.map(url => `
    <div class="image-container">
      <img src="${url}" alt="历史图片">
    </div>
  `).join('');
}

// 窗口初始化
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