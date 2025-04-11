let currentPage = 1; // 当前页码
const pageSize = 9; // 每页显示的图片数量
let contextMenu = null; // 右键菜单
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); // 收藏列表

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

// 从数据库获取图片URL
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
    const totalPages = await getTotalPages();
    const randomPage = Math.floor(Math.random() * totalPages) + 1;
    
    const response = await fetch(`http://localhost:8080/images?type=img1&page=${randomPage}&size=9&src=moehu_pic`);
    if (!response.ok) throw new Error('获取图片数据失败');
    
    const data = await response.json();
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

// AI生成图片功能
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
        'Authorization': 'Bearer sk-zjnqimadckntkhndvxdoqijbseslfkszxaannqpbmbstsnxz'
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

    chrome.storage.local.set({ backgroundUrl: imageUrl }, async () => {
      alert('AI背景已生成并应用！');
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateBackground" });
      });

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

// 收藏功能实现
// 在popup.js中找到setupFavoriteHandlers函数，替换为以下内容：

function setupFavoriteHandlers() {
  // 先移除所有已存在的星星按钮
  document.querySelectorAll('.favorite-star').forEach(star => star.remove());
  
  // 为每个图片容器添加一个星星按钮
  document.querySelectorAll('.image-container').forEach(container => {
    const img = container.querySelector('img');
    if (!img) return;
    
    // 创建星星按钮
    const star = document.createElement('button');
    star.className = 'favorite-star';
    star.innerHTML = '★';
    
    // 设置初始状态
    star.classList.toggle('active', favorites.includes(img.src));
    
    // 添加到容器
    container.appendChild(star);
    
    // 绑定点击事件
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(img.src, star);
    });
  });
}
function toggleFavorite(imgSrc, starElement) {
  const index = favorites.indexOf(imgSrc);
  if (index === -1) {
    favorites.push(imgSrc);
    starElement.classList.add('active');
  } else {
    favorites.splice(index, 1);
    starElement.classList.remove('active');
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // 如果当前在收藏页面，刷新显示
  if (document.getElementById('favorites-page').classList.contains('active')) {
    loadFavorites();
  }
}

function loadFavorites() {
  const container = document.getElementById('favorites-gallery');
  container.innerHTML = favorites.map(url => `
    <div class="image-container">
      <img src="${url}" alt="收藏的图片">
      <button class="favorite-star active">★</button>
    </div>
  `).join('');
  
  // 为收藏页的图片重新绑定事件
  setupFavoriteHandlers();
}

// 历史记录功能
async function loadHistory(page = 1) {
  try {
    const response = await fetch(`http://localhost:8080/api/history?page=${page}&size=${pageSize}`);
    const result = await response.json();

    const historyData = result.data || [];
    const total = result.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    const container = document.getElementById('history-gallery');
    container.innerHTML = historyData.map(item => `
      <div class="image-container">
        <img src="${item.src}" alt="历史图片">
        <button class="favorite-star">★</button>
      </div>
    `).join('');

    document.getElementById('prevPage').disabled = page <= 1;
    document.getElementById('nextPage').disabled = page >= totalPages;

    currentPage = page;
    
    // 为历史图片绑定事件
    setupFavoriteHandlers();
    setupImageClickHandlers();
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

// 右键菜单功能
function showContextMenu(e, imgSrc) {
  if (contextMenu) contextMenu.remove();
  
  contextMenu = document.createElement('div');
  contextMenu.className = 'context-menu';
  contextMenu.style.left = `${e.pageX}px`;
  contextMenu.style.top = `${e.pageY}px`;
  
  const menuItem = document.createElement('div');
  menuItem.className = 'context-menu-item';
  menuItem.textContent = favorites.includes(imgSrc) ? '取消收藏' : '收藏图片';
  menuItem.onclick = () => {
    const star = document.querySelector(`.image-container img[src="${imgSrc}"]`)?.nextElementSibling;
    if (star) toggleFavorite(imgSrc, star);
    contextMenu.remove();
    contextMenu = null;
  };
  
  contextMenu.appendChild(menuItem);
  document.body.appendChild(contextMenu);
}

// 页面切换功能
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(`${pageId}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
    
    if (pageId === 'favorites') {
      loadFavorites();
    } else if (pageId === 'history') {
      loadHistory(1);
    } else if (pageId === 'home') {
      setupFavoriteHandlers();
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 设置事件处理器
  setupFavoriteHandlers();
  setupImageClickHandlers();
  
  // 导航菜单
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      showPage(pageId);
    });
  });
  
  // 历史记录分页
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) loadHistory(currentPage - 1);
  });
  
  document.getElementById('nextPage').addEventListener('click', () => {
    loadHistory(currentPage + 1);
  });
  
  // 右键菜单
  document.addEventListener('contextmenu', e => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      showContextMenu(e, e.target.src);
    }
  });
  
  document.addEventListener('click', () => {
    if (contextMenu) {
      contextMenu.remove();
      contextMenu = null;
    }
  });
});
// 背景图片轮换功能
// 使用稳定的图片URL数组
const backgroundImages = [
  "https://img.freepik.com/free-photo/beautiful-scenery-summit-mount-everest-covered-with-snow-white-clouds_181624-21317.jpg",
  "https://img.freepik.com/free-photo/beautiful-view-greenery-bridge-forest-perfect-background_181624-17827.jpg",
  "https://img.freepik.com/free-photo/wide-angle-shot-single-tree-growing-clouded-sky-during-sunset-surrounded-by-grass_181624-22807.jpg",
  "https://img.freepik.com/free-photo/cityscape-with-modern-skyscrapers_1262-1919.jpg",
  "https://img.freepik.com/free-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-63452.jpg"
];

// 添加备用图片URL
const fallbackImages = [
  "https://via.placeholder.com/1920x1080/333/666?text=Background+1",
  "https://via.placeholder.com/1920x1080/444/777?text=Background+2",
  "https://via.placeholder.com/1920x1080/555/888?text=Background+3"
];

let currentBgIndex = 0;
let retryCount = 0;
const MAX_RETRIES = 2;

function initBackgroundRotation() {
  const bgContainer = document.getElementById('background-container');
  const layers = document.querySelectorAll('.bg-layer');
  
  // 预加载图片并处理错误
  function preloadImage(url, index) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (index < layers.length) {
          layers[index].style.backgroundImage = `url(${url})`;
        }
        resolve(true);
      };
      img.onerror = () => {
        console.warn(`Failed to load background image: ${url}`);
        resolve(false);
      };
      img.src = url;
    });
  }

  // 尝试加载一组图片
  async function tryLoadImages(imageList) {
    const results = await Promise.all(
      imageList.slice(0, layers.length).map((url, i) => preloadImage(url, i))
    );
    return results.some(success => success);
  }

  // 加载策略：先尝试主列表，失败后尝试备用列表
  async function loadBackgrounds() {
    let success = await tryLoadImages(backgroundImages);
    if (!success && retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying with fallback images (attempt ${retryCount})`);
      success = await tryLoadImages(fallbackImages);
    }
    
    if (!success) {
      console.error('All background image loading attempts failed');
      // 设置纯色背景作为最终回退
      bgContainer.style.backgroundColor = '#1a1a2e';
      return;
    }

    // 初始显示第一张可用的背景
    const firstAvailableLayer = Array.from(layers).find(layer => layer.style.backgroundImage);
    if (firstAvailableLayer) {
      firstAvailableLayer.classList.add('active');
    }

    // 启动轮换
    startRotation();
  }

  function startRotation() {
    setInterval(() => {
      const currentLayer = document.querySelector('.bg-layer.active');
      if (!currentLayer) return;
      
      currentLayer.classList.remove('active');
      
      // 找到下一张可用的背景
      let nextIndex;
      for (let i = 1; i <= layers.length; i++) {
        const testIndex = (currentBgIndex + i) % layers.length;
        if (layers[testIndex].style.backgroundImage) {
          nextIndex = testIndex;
          break;
        }
      }
      
      if (nextIndex !== undefined) {
        currentBgIndex = nextIndex;
        layers[nextIndex].classList.add('active');
      }
    }, 5000); // 每10秒切换一次
  }

  loadBackgrounds();
}

// 在DOMContentLoaded事件中初始化
document.addEventListener('DOMContentLoaded', () => {
  // ...其他初始化代码...
  initBackgroundRotation();
});