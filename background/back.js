document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('replaceButton');
  
  button.addEventListener('click', function() {
      // 获取当前活动标签页
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const activeTab = tabs[0];
          
          // 在控制台输出语句
          console.log('插件运行中，即将替换视频元素...');
          
          // 替换视频元素为图片
          chrome.tabs.executeScript(activeTab.id, {
              code: `
                  (function() {
                      'use strict';
                      
                      console.log('DOM 完全加载，页面已就绪');
                      
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
                          imgElement.src = "image.jpg";
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
                  })();
              `
          }, function() {
              // 在控制台输出语句
              console.log('视频元素替换完成！');
          });
      });
  });
});