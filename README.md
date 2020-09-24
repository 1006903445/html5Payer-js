# html5Payer-js

// 都是自己的学习 demo 写的不好 如想深度学请前往对应模块官方文档学习<br>
// 百度是万能的,如若不行就去 google

- 结构

  - DEMO

  ```javascript
          <!DOCTYPE html>
          <html>
              <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">
                  <title>播放器</title>
                  <style type="text/css">
                      body,html{margin: 0;padding: 0;}
                      #playerDom{width: 640px;height: 360px;margin: 50px auto;}
                      #playerDom2{width: 640px;height: 360px;margin: 50px auto;}
                  </style>
              </head>
              <body>
                  <div id="playerDom">

                  </div>
                  <div id="playerDom2">

                  </div>
                  <script type="text/javascript" src="./player/hls.js"></script>
                  <script type="text/javascript" src="./player/html5Player.js"></script>
                  <script type="text/javascript">
                      var player = new xwPlayer({
                          container: 'playerDom',
                          title: '这是个demo',
                          type: 'video',
                          src: './1.webm',
                          poster: './demo.jpg'
                      })
                      var player = new xwPlayer({
                          container: 'playerDom2',
                          title: '这是个demo',
                          type: 'audio',
                          src: './1.mp3',
                          poster: './demo.jpg'
                      })
                  </script>
              </body>
          </html>
  ```

  - 资源

  ```javascript
  <style type="text/css">
  body,html{margin: 0;padding: 0;}
  #playerDom{width: 640px;height: 360px;margin: 50px auto;}
  #playerDom2{width: 640px;height: 360px;margin: 50px auto;}
  </style>
      // 容器大小用户自己控制

  <script type="text/javascript" src="./player/hls.js"></script> // 处理pc端video不能播放.m3u8格式
  <script type="text/javascript" src="./player/html5Player.js"></script>  // 主 js

  ./main.js //音频可视化文件  html5Player.js 中已集成 无须重复引用
  ./html5Player2.js //废弃js

  ```

  - js

  ```javascript
  new xwPlayer({
    container: '', // 节点ID 必填*
    title: '', // title
    type: '', // 播放器类型 video audio 必填*
    src: '', // 资源地址 必填* 格式.m3u8、.mp4、.webm、.mp3（其他格式未测试过暂时不知道兼容性如何）
    poster: '' // 海报图
  });
  ```
