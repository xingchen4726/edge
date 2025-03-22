
(function() {
    'use strict';
  
    console.log('脚本开始加载');
  
    // 等待 DOM 完全加载
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM 完全加载，开始执行脚本');
  
      // 获取 video 元素
      var videoElement = document.querySelector('video.video');
      console.log('尝试查找 video 元素:', videoElement);
      
      // 检查是否找到了 video 元素
      if (videoElement) {
        console.log('找到 video 元素，开始替换为 img 元素');
  
        // 创建新的 img 元素
        var imgElement = document.createElement('img');
        imgElement.className = "picture";
        imgElement.id = "backgroundImage Picture";
        imgElement.src = "https://ts3.tc.mm.bing.net/th?id=OIP-C.lX464drKbSGpbINpNLN9swHaFP&w=297&h=210&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2";
        imgElement.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
  
        // 替换 video 元素为 img 元素
        if (videoElement.parentNode) {
          console.log('替换 video 元素为 img 元素');
          videoElement.parentNode.replaceChild(imgElement, videoElement);
          console.log('替换成功');
        } else {
          console.log('video 元素没有父节点，无法替换');
        }
      } else {
        console.log('未找到符合条件的 video 元素');
      }
  
      console.log('脚本执行完成');
    });
  })();
