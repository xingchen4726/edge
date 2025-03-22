// content.js
// 设置背景图片
const setBackgroundImage = () => {
    const imageUrl = 'image.jpg'; // 替换为你的图片地址
    const style = document.createElement('style');
    style.textContent = `
      body {
        background-image: url(${imageUrl});
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
      }
    `;
    document.head.appendChild(style);
  };
  
  // 确保在页面加载完成后执行
  if (document.readyState === 'complete') {
    setBackgroundImage();
  } else {
    window.addEventListener('load', setBackgroundImage);
  }