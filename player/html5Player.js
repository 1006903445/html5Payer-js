window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
var xwPlayer = function(obj){
    var defaultObj = {
        container: '', //id
        type: 'video',
        autoplay: false, //自动播放
        loop: false, //是否循环播放
        preload: 'meta', //是否预加载
        src: '', //视频地址
        poster: '', //海报图
        status: 0 //1 直播 点播
    }
    this.HLS = null;
    this.mouseXY = {is:false,x:null,y:null};
    this.xwH5PlayerMove = false;

    this.DEFAULT = Object.assign(defaultObj,obj);
    this.palyerBox = null;
    this.xwH5PlayerBox = null;
    this.xwH5Player = null; //video audio 标签
    this.xwH5PlayerControls = null;
    this.xwH5PlayerDuration = null;
    this.xwH5PlayerCurrentTime = null;
    this.xwH5PlayerProgressBox= null;
    this.xwH5PlayerProgress= null;
    this.xwH5PlayerProgressBar = null;
    this.xwH5PlayerAudio = null;
    this.xwH5PlayerProgressAudio = null;
    this.xwH5PlayerProgressAudioBar = null;

    this.isMobile = function(){ // 是否手机端
        if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
            return true;
        } else {
            return false;
        }
    };
    this.isWeixin = function(){ // 是否微信端
        var u = navigator.userAgent.toLowerCase();
        if(!!u.match(/MicroMessenger/i)){
            return true;
        }else{
            return false;
        }
    };
    this.formatTime = function(timestamp){ //格式化时间
        if(!timestamp || typeof(timestamp) == 'undefined'){
            return '';
        }
        timestamp = parseInt(timestamp);
        var H = parseInt(timestamp/60/60);
        var m = parseInt(timestamp/60%60) >= 10 ? parseInt(timestamp/60%60) : '0'+parseInt(timestamp/60%60);
        var s = parseInt(timestamp%60%60) >= 10 ? parseInt(timestamp%60%60) : '0'+parseInt(timestamp%60%60);
        if(H <= 0){
            return m + ':' + s;
        }else{
            return H + ':' + m + ':' + s;
        }
    };
    this.getStyle = function(el){
        return window.getComputedStyle(el);
    }
    this.formatVolume = function(v){
        if(v == 1){
            v = 1;
        }else if(v < 1 && v >= 0.9){
            v = 0.9;
        }else if(v < 0.9 && v >= 0.8){
            v = 0.8;
        }else if(v < 0.8 && v >= 0.7){
            v = 0.7;
        }else if(v < 0.7 && v >= 0.6){
            v = 0.6;
        }else if(v < 0.6 && v >= 0.5){
            v = 0.5;
        }else if(v < 0.5 && v >= 0.4){
            v = 0.4;
        }else if(v < 0.4 && v >= 0.3){
            v = 0.3;
        }else if(v < 0.3 && v >= 0.2){
            v = 0.2;
        }else if(v < 0.2 && v >= 0.1){
            v = 0.1;
        }else if(v < 0.1 && v >= 0){
            v = 0;
        }else{
            v = 0;
        }
        return v;
    };
    this.init();
};
// 初始化
xwPlayer.prototype.init = function(){
    var self = this;
    self.videoDom();
    self.BindingEvent();
    self.playProgress();
    self.audioProgress();
};
// dom渲染
xwPlayer.prototype.videoDom = function(){
    var self = this;
    var DEFAULT = self.DEFAULT;
    if(!DEFAULT.container || DEFAULT.container == ''){
        throw new Error('argument "container" is required !');
    }
    self.palyerBox = document.getElementById(DEFAULT.container);
    var loop = DEFAULT.loop ? 'loop' : '';
    var wxx5 = self.isWeixin() ? `x5-video-player-type="h5" x5-video-player-fullscreen="true"` : '';
    var player = '';
    var full = '';
    var title = DEFAULT.title;
    if(DEFAULT.type == 'video'){
        player = `<video class="xwH5Player" src="${DEFAULT.src}" ${wxx5} width="100%" height="100%" ${loop} preload="${DEFAULT.preload}" poster="${DEFAULT.poster}">
            您的浏览器不支持video标签
        </video>`;
        full = `style="display:block"`;
    }else if(DEFAULT.type == 'audio'){
        player = `<audio class="xwH5Player" src="${DEFAULT.src}" width="100%" height="100%" ${loop} preload="${DEFAULT.preload}" poster="${DEFAULT.poster}">
            您的浏览器不支持audio标签
        </audio>`;
        full = `style="display:none"`;
    }
    var playerHtml = `<div class="xwH5PlayerBox" style="background-image: url(${DEFAULT.poster})">
            <div class="xwH5Player-video-audio">
                ${player}
                <canvas width="1280" height="720"></canvas>
            </div>
            <div class="xwH5Player-controls-box">
                <div class="xwH5Player-top-box">
                    <div class="xwH5Player-title">${title}</div>
                </div>
                <div class="xwH5Player-left-box"></div>
                <div class="xwH5Player-right-box"></div>
                <div class="xwH5Player-bottom-box">
                    <div class="xwH5Player-progress-box">
                        <div class="xwH5Player-progress">
                            <div class="xwH5Player-progress-bar"><i></i></div>
                        </div>
                    </div>
                    <div class="xwH5Player-controls">
                        <div class="xwH5Player-hls">LIVE</div>
                        <div class="xwH5Player-play">
                            <svg viewBox="0 0 1024 1024"><path d="M384 752.288l299.68-231.552L384 289.152V752.32z m-64 65.152V224a32 32 0 0 1 51.552-25.312l384 296.704a32 32 0 0 1 0 50.656l-384 296.736A32 32 0 0 1 320 817.44z" fill="#ffffff"></path></svg>
                        </div>
                        <div class="xwH5Player-pause">
                            <svg viewBox="0 0 1024 1024"><path d="M352 192a32 32 0 0 0-32 32v608.832a32 32 0 1 0 64 0V224a32 32 0 0 0-32-32M672 192a32 32 0 0 0-32 32v608.832a32 32 0 1 0 64 0V224a32 32 0 0 0-32-32" fill="#ffffff"></path></svg>
                        </div>
                        <div class="xwH5Player-timeupdate-box">
                            <div class="xwH5Player-timeupdate">
                                <div class="xwH5Player-duration">00:00:00</div>
                                /
                                <div class="xwH5Player-currentTime">00:00:00</div>
                            </div>
                        </div>
                        <div class="xwH5Player-audio">
                            <svg class="xwH5Player-audio-v" viewBox="0 0 1024 1024"><path d="M640 1007.232l0-134.72c148.8-52.864 256-193.472 256-360.512 0-166.912-107.2-307.584-256-360.448L640 16.768c220.672 56.96 384 256.768 384 495.232C1024 750.528 860.672 950.336 640 1007.232zM192 768c-106.048 0-192-86.016-192-192L0 448c0-106.048 85.952-192 192-192l64 0 320-256 0 1024-320-256L192 768zM448 768 448 576 448 448 448 256 320 384 192 384C156.608 384 128 412.672 128 448l0 128c0 35.392 28.608 64 64 64l128 0L448 768zM832 512c0 119.104-81.728 218.368-192 246.912L640 622.272C678.144 600.064 704 559.232 704 512s-25.856-88.064-64-110.272L640 265.088C750.272 293.568 832 392.832 832 512z" fill="#ffffff"></path></svg>
                            <svg class="xwH5Player-audio-mute" viewBox="0 0 1024 1024"><path d="M1012.992 602.496l-90.496 90.496L832 602.496l-90.496 90.496-90.496-90.496L741.504 512l-90.496-90.496 90.496-90.56L832 421.504l90.496-90.56 90.496 90.56L922.496 512l90.496 90.496zM192 768c-106.048 0-192-86.016-192-192v-128a192 192 0 0 1 192-192h64L576 0v1024L256 768H192z m256 0V256l-128 128H192a64 64 0 0 0-64 64v128c0 35.392 28.608 64 64 64h128l128 128z" fill="#ffffff"></path></svg>
                            <div class="xwH5Player-progress-audio-box">
                                <div class="xwH5Player-progress-audio">
                                    <div class="xwH5Player-progress-audio-bar" data-v="100"></div>
                                    <div class="xwH5Player-progress-audio-bar" data-v="90"></div>
                                    <div class="xwH5Player-progress-audio-bar" data-v="80"></div>
                                    <div class="xwH5Player-progress-audio-bar" data-v="70"></div>
                                    <div class="xwH5Player-progress-audio-bar" data-v="60"></div>
                                    <div class="xwH5Player-progress-audio-bar" data-v="50"></div>
                                    <div class="xwH5Player-progress-audio-bar" data-v="40"></div>
                                    <div class="xwH5Player-progress-audio-bar" data-v="30"></div>
                                    <div class="xwH5Player-progress-audio-bar" data-v="20"></div>
                                    <div class="xwH5Player-progress-audio-bar" data-v="10"></div>
                                </div>
                            </div>
                        </div>
                        <div class="xwH5Player-full" ${full}>
                            <svg viewBox="0 0 1024 1024"><path d="M227.71 160.037l128.007-0.514c18.928 0.475 36.487-12.637 39.356-34.986v-24.135c-0.474-18.965-16.114-34.643-35.043-35.06l-244.422 1.443c-0.363-0.039-0.61-0.17-0.932-0.17l-17.14-0.382c-9.466-0.228-17.94 3.478-23.983 9.615-6.14 6.1-8.402 14.615-8.153 24.135l1.825 17.18c0 0.341-1.273 0.57-1.273 0.95l0.95 245.622c0.418 18.928 16.059 30.291 35.042 30.71h25.466c18.927 0.418 33.96-16.058 33.54-34.967l-1.064-133.575 168.526 165.826c18.317 18.357 47.964 18.357 66.283 0 18.263-18.358 18.263-48.024 0-66.4L227.71 160.036z m728.2 743.8l-0.988-241.84c-0.475-18.91-16.116-30.233-35.043-30.65l-24.077-0.04c-18.872-0.437-33.96 16.095-33.485 35.024l1.065 130.707-168.526-166.909c-18.318-18.359-47.926-18.359-66.247 0-18.298 18.358-18.298 48.022 0 66.38l168.505 166.776-127.836 0.513c-18.929-0.42-36.449 11.21-39.358 33.56v24.133c0.476 18.967 16.175 34.644 35.044 35.12l241.289-1.463c0.38 0 0.607 0.151 0.968 0.151l17.103 0.418c9.465 0.228 17.996-3.477 24.04-9.636 6.177-6.043 8.38-14.594 8.19-24.115l-1.881-17.14c-0.036-0.419 1.237-0.664 1.237-0.989zM394.638 630.13c-18.303-18.359-47.967-18.359-66.267 0L159.828 795.952l1.083-131.503c0.418-18.967-14.612-35.497-33.503-35.023h-25.466C82.96 629.9 67.32 641.17 66.9 660.136l-0.99 243.643c0 0.342 1.274 0.572 1.274 0.952l-1.825 17.142c-0.21 9.52 1.996 18.072 8.134 24.115 6.043 6.156 14.576 9.862 23.984 9.634l17.142-0.418c0.342 0 0.568-0.151 0.95-0.151l244.405 1.463c18.928-0.476 34.587-16.153 35.042-35.118v-24.135c-2.85-22.347-20.408-33.977-39.299-33.56l-129.472-0.417 168.393-166.778c18.28-18.3 18.28-48.021 0-66.379z m234.068-238.4c18.318 18.358 47.926 18.358 66.244 0l168.527-166.853-1.084 134.603c-0.455 18.909 14.633 35.442 33.503 35.023h24.076c18.93-0.475 34.569-11.799 35.044-30.71l0.968-245.678c0-0.38-1.254-0.609-1.254-0.95l1.862-17.18c0.19-9.52-2.014-18.035-8.19-24.134-6.044-6.138-14.576-9.844-24.021-9.579l-17.104 0.381c-0.38 0-0.609 0.134-0.987 0.19l-244.788-1.463c-18.927 0.438-34.566 16.116-35.04 35.081l-0.059 24.135c2.908 22.385 20.488 35.442 39.356 35.023l129.89 0.512-166.89 165.295c-18.355 18.281-18.355 47.947-0.053 66.305z" fill="#ffffff"></path></svg>
                        </div>
                    </div>
                </div>
                <div class="xwH5Player-core-box">
                    <div class="svg-play">
                        <svg viewBox="0 0 1024 1024"><path d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m0 981.333333C253.866667 981.333333 42.666667 770.133333 42.666667 512S253.866667 42.666667 512 42.666667s469.333333 211.2 469.333333 469.333333-211.2 469.333333-469.333333 469.333333z" fill="#ffffff"></path><path d="M672 441.6l-170.666667-113.066667c-57.6-38.4-106.666667-12.8-106.666666 57.6v256c0 70.4 46.933333 96 106.666666 57.6l170.666667-113.066666c57.6-42.666667 57.6-106.666667 0-145.066667z" fill="#ffffff"></path></svg>
                    </div>
                </div>
            </div>
        </div>`;
    self.palyerBox.innerHTML = playerHtml;
    self.xwH5PlayerBox = self.palyerBox.querySelector('.xwH5PlayerBox');
    self.xwH5Player = self.palyerBox.querySelector('.xwH5Player');
    self.xwH5PlayerCanvas = self.palyerBox.querySelector('canvas');
    self.xwH5PlayerControls = self.palyerBox.querySelector('.xwH5Player-controls');
    self.xwH5PlayerDuration = self.palyerBox.querySelector('.xwH5Player-duration');
    self.xwH5PlayerCurrentTime = self.palyerBox.querySelector('.xwH5Player-currentTime');
    self.xwH5PlayerProgressBox = self.palyerBox.querySelector('.xwH5Player-progress-box');
    self.xwH5PlayerProgress = self.palyerBox.querySelector('.xwH5Player-progress');
    self.xwH5PlayerProgressBar = self.palyerBox.querySelector('.xwH5Player-progress-bar');
    self.xwH5PlayerAudio = self.palyerBox.querySelector('.xwH5Player-audio');
    self.xwH5PlayerProgressAudio = self.palyerBox.querySelector('.xwH5Player-progress-audio');
    self.xwH5PlayerProgressAudioBar = self.palyerBox.getElementsByClassName('xwH5Player-progress-audio-bar');
    self.playerCallback();
    if(self.getStyle(self.xwH5Player).display == 'none'){
        self.audioAnimation();
        self.xwH5PlayerCanvas.style.display = 'block';
    }else{
        self.xwH5PlayerCanvas.style.display = 'none';
    }
    if(DEFAULT.src.indexOf('.m3u8') != -1){
        var Hls = window.Hls;
        if(Hls.isSupported()) {
            if(!self.HLS){
                self.HLS = new Hls();
            }
            self.HLS.loadSource(DEFAULT.src);
            self.HLS.attachMedia(self.xwH5Player);
        }else{
            alert('浏览器不支持.m3u8格式的视频');
        }
    }
    if(DEFAULT.autoplay){
        self.xwH5Player.play();
    }
};
// 标签回调
xwPlayer.prototype.playerCallback = function(){
    var self = this;
    self.xwH5Player.onerror  = function(){

    }
    self.xwH5Player.onemptied = function(){
        // console.log('资源错误')
    }
    self.xwH5Player.onloadstart = function(){
        // console.log('资源开始加载')
    }
    self.xwH5Player.onprogress = function(){
        // console.log('资源加载')
    }
    self.xwH5Player.ondurationchange = function(){
        // console.log('改变资源')
    }
    self.xwH5Player.onloadedmetadata = function(){
        // console.log('资源加载完')
    }
    self.xwH5Player.onloadeddata = function(){
        self.timeupdate(this.currentTime,this.duration);
        self.volumechange(100-parseInt(this.volume*100));
        // console.log('加载完当前帧播放就绪')
    }
    self.xwH5Player.onended = function(){
        // console.log('播放结束')
    }
    self.xwH5Player.onpause = function(){
        self.togglePlay('pause');
        // console.log('停止播放')
    }
    self.xwH5Player.onplay = function(){
        // console.log('准备开始播放')
    }
    self.xwH5Player.onplaying = function(){
        self.togglePlay('play');
        // console.log('开始播放')
    }
    self.xwH5Player.onratechange = function(){
        // console.log('改变播放速度',this.playbackRate)
    }
    self.xwH5Player.ontimeupdate = function(){
        // // console.log('播放当前进度' + this.currentTime, '速度' + this.playbackRate);
        if(!self.mouseXY.x){
            self.timeupdate(this.currentTime,this.duration)
        }
    }
    self.xwH5Player.onvolumechange = function(){  //音量
        if(!self.mouseXY.y){
            self.volumechange(100-parseInt(this.volume*100));
        }
        // console.log('当前音量' + this.volume)
    }
    self.xwH5Player.oncanplay = function(){
        // console.log('oncanplay')
    }
    self.xwH5Player.oncanplaythrough = function(){
        // console.log('oncanplaythrough')
    }
}
// 音量条
xwPlayer.prototype.volumechange = function(v){
    var self = this;
    if(v == 100){
        self.xwH5PlayerAudio.className = 'xwH5Player-audio z-mute';
    }else{
        self.xwH5PlayerAudio.className = 'xwH5Player-audio'
    }
    for(var i = 9; i >= 0; i--){
        if(i >= v/10){
            self.xwH5PlayerProgressAudioBar[i].className = 'xwH5Player-progress-audio-bar z-open';
        }else{
            self.xwH5PlayerProgressAudioBar[i].className = 'xwH5Player-progress-audio-bar';
        }
    }
};
// 进度条 时间
xwPlayer.prototype.timeupdate = function(nowTime,allTime){
    var self = this;
    var now = self.formatTime(nowTime) || '00:00';
    var all = self.formatTime(allTime) || '00:00';
    self.xwH5PlayerDuration.innerHTML = now;
    self.xwH5PlayerCurrentTime.innerHTML = all;
    if(!self.DEFAULT.status){
        self.xwH5PlayerControls.className = 'xwH5Player-controls';
        self.xwH5PlayerProgressBar.style.width = parseInt(nowTime/allTime*100) + '%';
    }else{
        self.xwH5PlayerControls.className = 'xwH5Player-controls z-hls';
        self.xwH5PlayerProgressBar.style.width = '100%';
    }
}
// 播放
xwPlayer.prototype.togglePlay = function(type){
    var self = this;
    if(!self.xwH5Player){
        return;
    }
    if(type){
        if(type == 'play'){
            self.xwH5Player.play();
            self.xwH5PlayerBox.className = 'xwH5PlayerBox z-play';
        }else if(type == 'pause'){
            self.xwH5Player.pause();
            self.xwH5PlayerBox.className = 'xwH5PlayerBox';
        }
    }else{
        if(self.xwH5Player.paused){
            self.xwH5Player.play();
            self.xwH5PlayerBox.className = 'xwH5PlayerBox z-play';
        }else{
            self.xwH5Player.pause();
            self.xwH5PlayerBox.className = 'xwH5PlayerBox';
        }
    }
};

// 替换地址
xwPlayer.prototype.changePlayer = function(src,liveStatus){
    var self = this;
    if(!src || src == ''){
        throw new Error('argument "src" is required !');
    }
    self.DEFAULT.src= src;
    self.DEFAULT.status= liveStatus;
    self.xwH5Player.src = src;
    if(src.indexOf('.m3u8') != -1){
        var Hls = window.Hls;
        if(Hls.isSupported()) {
            self.HLS = new Hls();
            self.HLS.loadSource(src);
            self.HLS.attachMedia(self.xwH5Player);
        }else{
            alert('浏览器不支持.m3u8格式的视频');
        }
    }
    self.togglePlay('pause')
    if(self.DEFAULT.autoplay){
        self.xwH5Player.play();
    }
};
// 替换背景图片
xwPlayer.prototype.changePoster = function(img){
    var self = this;
    self.DEFAULT.poster = img;
    self.xwH5PlayerBox.style.backgroundImage = `url(${img})`;
    self.xwH5Player.setAttribute('poster',img)
};
// 全屏
xwPlayer.prototype.fullScreen = function(){
    console.log('全屏')
};
// 事件绑定
xwPlayer.prototype.BindingEvent = function(){
    var self = this;
    self.palyerBox.querySelector('.svg-play').onclick = function(){
        self.togglePlay()
    }
    self.palyerBox.querySelector('.xwH5Player-play').onclick = function(){
        self.togglePlay()
    }
    self.palyerBox.querySelector('.xwH5Player-pause').onclick = function(){
        self.togglePlay()
    }
    self.palyerBox.querySelector('.xwH5Player-full').onclick = function(){
        self.fullScreen()
    }
}

// 播放进度控制
xwPlayer.prototype.playProgress = function(){
    var self = this;
    var xwH5Player = self.xwH5Player;
    function jumpPlaye(event){
        event.preventDefault();
        if(self.DEFAULT.status){
            return false
        }
        var left = event.offsetX / self.palyerBox.clientWidth;
        left = left <= 0 ? 0 : left >= 1 ? 1 : left;
        var currentTime = left * xwH5Player.duration;
        var progress = left * 100;
        self.xwH5PlayerProgressBar.style.width = progress + '%';
        xwH5Player.currentTime = currentTime;
    }
    function startBar(event){
        if(self.DEFAULT.status){
            return false
        }
        event = event.changedTouches ? event.changedTouches[0] : event;
        self.mouseXY.is = true;
        self.mouseXY.x = event.clientX;
    }
    function moveBar(event){
        event.preventDefault();
        if(self.DEFAULT.status){
            return false
        }
        event = event.changedTouches ? event.changedTouches[0] : event;
        if(self.mouseXY.is){
            var width = self.xwH5PlayerProgressBar.clientWidth + (event.clientX-self.mouseXY.x);
            var left = width / self.palyerBox.clientWidth;
            left = left <= 0 ? 0 : left >= 1 ? 1 : left;
            var progress = left * 100;
            self.xwH5PlayerProgressBar.style.width = progress + '%';
            self.mouseXY.x = event.clientX;
        }
    }
    function leaveBox(event){
        event = event.changedTouches ? event.changedTouches[0] : event;
        if(self.mouseXY.is && self.mouseXY.x){
            var width = self.xwH5PlayerProgressBar.clientWidth + (event.clientX-self.mouseXY.x);
            var left = width / self.palyerBox.clientWidth;
            left = left <= 0 ? 0 : left >= 1 ? 1 : left;
            var currentTime = left * xwH5Player.duration;
            var progress = left * 100;
            self.xwH5PlayerProgressBar.style.width = progress + '%';
            xwH5Player.currentTime = currentTime;
        }
        self.mouseXY.is = false;
        self.mouseXY.x = null;
        self.mouseXY.y = null;
    }
    self.xwH5PlayerProgress.addEventListener('click',jumpPlaye, false);
    self.xwH5PlayerProgress.addEventListener('mousedown',startBar, false);
    self.xwH5PlayerBox.addEventListener('mousemove',moveBar, false);
    self.xwH5PlayerBox.addEventListener('mouseleave',leaveBox, false);
    self.xwH5PlayerBox.addEventListener('mouseup',leaveBox, false);
    self.xwH5PlayerProgress.addEventListener('mouseup',leaveBox, false);

    self.xwH5PlayerBox.addEventListener('touchstart',startBar, false);
    self.xwH5PlayerBox.addEventListener('touchmove',moveBar, false);
    self.xwH5PlayerBox.addEventListener('touchend',leaveBox, false);
    
    // self.xwH5PlayerProgress.onclick = jumpPlaye;
    // self.xwH5PlayerProgress.onmousedown = startBar;
    // self.xwH5PlayerBox.onmousemove = moveBar;
    // self.xwH5PlayerBox.onmouseleave = leaveBox;
    // self.xwH5PlayerBox.onmouseup = leaveBox;
    // self.xwH5PlayerProgress.onmouseup = leaveBox;
    // self.xwH5PlayerBox.ontouchstart = startBar;
    // self.xwH5PlayerBox.ontouchmove = moveBar;
    // self.xwH5PlayerBox.ontouchend = leaveBox;
}
// 音量
xwPlayer.prototype.audioProgress = function(){
    var self = this;
    var xwH5Player = self.xwH5Player;
    self.palyerBox.querySelector('.xwH5Player-audio-mute').onclick = function(){
        xwH5Player.volume = 1
    }
    self.palyerBox.querySelector('.xwH5Player-audio-v').onclick = function(){
        xwH5Player.volume = 0
    }
    for(var i = 0; i < 10; i++){
        self.xwH5PlayerProgressAudioBar[i].onclick = function(){
            xwH5Player.volume = this.getAttribute('data-v')/100
        }
    }
}
// 声音动画
xwPlayer.prototype.audioAnimation = function(){
    var self = this;
    var audio = self.xwH5Player;
    var canvas = self.xwH5PlayerCanvas;
    var xwH5PlayerBox = self.xwH5PlayerBox;
    var p = xwH5PlayerBox.clientWidth*3 / 640;
    var atx = new AudioContext();
    var analyser = atx.createAnalyser();
    var audioSrc = atx.createMediaElementSource(audio);
    // we have to connect the MediaElementSource with the analyser
    audioSrc.connect(analyser);
    analyser.connect(atx.destination);
    // we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)
    // analyser.fftSize = 64;
    // frequencyBinCount tells you how many valueschangePlayer you'll receive from the analyser
    // var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    // we're ready to receive some data!
    var meterNum = 30; //count of the meters
    var meterWidth = parseInt(xwH5PlayerBox.clientWidth*3 / meterNum); //width of the meters in the spectrum
    var gap = parseInt(2 * p); //gap between meters
    var cwidth = xwH5PlayerBox.clientWidth*3;
    var cheight = xwH5PlayerBox.clientHeight*3 - 2;
    var capHeight = 2;
    var capStyle = '#fff';
    var capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
    var ctx = canvas.getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, 0, cheight);
    canvas.width = cwidth;
    canvas.height = cheight+2;
    gradient.addColorStop(1, '#60274D');
    gradient.addColorStop(0.5, '#4D883A');
    gradient.addColorStop(0, '#39371D');
    // loop
    function renderFrame(){
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var step = Math.round(array.length / (meterNum*2)); //sample limited data from the total array
        ctx.clearRect(0, 0, cwidth, cheight);
        for (var i = 0; i < meterNum; i++) {
            var value = array[i * step]  * p;
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value);
            }
            ctx.fillStyle = capStyle;
            //draw the cap, with transition effect
            if (value < capYPositionArray[i]) {
                ctx.fillRect(i * (meterWidth + gap), cheight - (--capYPositionArray[i]), meterWidth, capHeight);
            } else {
                ctx.fillRect(i * (meterWidth + gap), cheight - value, meterWidth, capHeight);
                capYPositionArray[i] = value;
            }
            ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
            ctx.fillRect(i * (meterWidth + gap) /*meterWidth+gap*/ , cheight - value + capHeight, meterWidth, cheight); //the meter
        }
        requestAnimationFrame(renderFrame);
    }
    renderFrame();
}
// export default xwPlayer;