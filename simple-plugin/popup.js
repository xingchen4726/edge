document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('changeColor');
    
    button.addEventListener('click', function() {
      // 获取当前活动标签页
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        
        // 在控制台输出语句
        console.log('插件运行中，即将改变页面背景色...');
        
        // 改变页面背景色
        chrome.tabs.executeScript(activeTab.id, {
          code: 'document.body.style.backgroundColor = "#' + Math.floor(Math.random()*16777215).toString(16) + '";'
        }, function() {
          // 在控制台输出语句
          console.log('页面背景色已改变！');
        });
      });
    });
  });