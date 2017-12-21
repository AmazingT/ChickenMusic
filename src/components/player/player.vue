<template>
  <!-- 播放器组件 -->
  <div class="player" v-show="playlist.length > 0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image"/>
        </div>

        <!-- 返回、歌手、歌曲 -->
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
          
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <!-- 唱片图片 -->
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image"/>
              </div>
            </div>

            <!-- 显示正在播放的歌词 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!-- 歌词 -->
          <scroll class="middle-r"
                  ref="lyricList"
                  :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   v-for="(line,index) in currentLyric.lines"
                   :class="{'current':currentLineNum === index}"
                   class="text">{{line.txt}}</p>
              </div>
            </div>
          </scroll>

        </div>

        <!-- 底部播放按钮(flex布局) -->
        <div class="bottom">
          <!-- 切换歌词的圆点 -->
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>

          <!-- 歌曲播放进度条 -->
          <div class="progress-wrapper">
            <!-- 调用方法(也可以用过滤filters) -->
            <span class="time time-l">{{format(currentTime)}}</span>
            <!-- 播放进度条 -->
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent"
                            @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <!-- 总时长(格式化) -->
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>

          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <!-- 播放按钮 -->
            <div class="icon i-center" :class="disableCls">
              <!-- 这里用计算属性来实现播放暂停的icon变化 -->
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 小窗口播放 -->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image"/><!-- 唱片 -->
        </div>

        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>

        <div class="control">
          <!-- 小播放器进度条 -->
          <!-- 固定值可以不用v-bind(:radius) -->
          <progress-circle 
              :radius="radius"
              :percent="percent">
            <i class="icon-mini" :class="miniIcon" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div><!-- 播放按钮 -->

        <div class="control"><!-- 歌曲列表 -->
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>

    <!-- 播放功能 -->
    <audio :src="currentSong.url" 
           @play="ready" 
           @error="error"
           @timeupdate="updateTime"
           @ended="end"
           ref="audio"></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playMode} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    data() {
      return {
        songReady: false,
        currentTime: 0, // 播放时间(时间戳)
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    computed: {
      cdCls() { // 播放时图片旋转
        return this.playing ? 'play' : 'play pause'
      },
      playIcon() {// 播放暂停图标切换(根据播放状态)
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      // 播放模式
      iconMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      // 播放进度条
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      // 这样就能通过this.mode访问到我们当前的播放模式
      // getters.js可以看做store.js的计算属性(将抓取的数据赋值给state里面的属性操作)
      // 这里只是做了一层映射(在mutations中已经把抓取的数据赋值给state中的属性,这里是把state对象中的每个属性做一个映射)
      ...mapGetters([
        'fullScreen',
        'playlist',
        'currentSong',
        'playing',
        'currentIndex',
        'mode',
        'sequenceList'
      ])
    },
    created() {
      // 在created中定义是因为不用添加setter和getter！
      this.touch = {}
    },
    methods: {
      back() {
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      // JavaScript钩子
      // 在enter和leave中，回调函数done是必须的。否则，它们会被同步调用，过渡会立即完成。
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale() // ES6语法？

        // 使用了create-keyframe-animation插件
        let animation = {
          0: { // 左下角位置
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        }

        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })

        // done函数执行后会跳至afterEnter
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        // 执行完所有动画后清除所有的动画样式
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      // 获取图片位置
      _getPosAndScale() {
        const targetWidth = 40 // 小播放器的图片宽度
        const paddingLeft = 40 // 小播放器的图片距离左侧距离
        const paddingBottom = 30 // 小播放器的图片距离底部距离
        const paddingTop = 80 // 大播放器图片距离顶部距离
        const width = window.innerWidth * 0.8 // 大播放器的图片宽度
        const scale = targetWidth / width
        const x = - (window.innerWidth / 2 - paddingLeft) // 小图片的x轴偏移
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom

        return {
          x,
          y,
          scale
        }
      },
      // 播放暂停歌曲
      togglePlaying() {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        // 歌曲滚动和暂停
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      // 歌曲播放完毕后切换至下一首
      end() {
        // 单曲循环
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }   
      },
      // 单曲循环
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if (this.currentLyric) {
          this.currentLyric.seek(0) // 歌曲偏移到顶部
        }
      },
      next() {
        if (!this.songReady) {
          return
        }

        // 只有一首歌时
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          // 最后一首歌时(顺序播放时)
          if (index === this.playlist.length) {
            index = 0
          }
          // 修改currentIndex
          this.setCurrentIndex(index)

          // 当前歌曲暂停切换至下一首时图标未切换
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        
        this.songReady = false
      },
      prev() {
        if (!this.songReady) {
          return
        }

        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)

          if (!this.playing) {
            this.togglePlaying()
          }
        }
        
        this.songReady = false
      },
      ready() {
        // 快速点击导致DOM异常
        this.songReady = true
      },
      error() {
        this.songReady = true
      },
      // 播放时间戳格式化
      format(interval) {
        interval = interval | 0 // 向下取整(Math.floor())
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)

        return `${minute}:${second}`
      },
      _pad(num, n = 2) { // 补0 字符串长度
        let len = num.toString().length
        while(len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      // 歌曲播放时间
      updateTime(e) {
        // currentTime(H5 设置或返回音频/视频中的当前播放位置(以秒计))
        this.currentTime = e.target.currentTime
      },
      // 进度条子组件拖动时派发的事件
      onProgressBarChange(percent) {
        const currentTime = this.currentSong.duration * percent

        this.$refs.audio.currentTime = currentTime

        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          // 点击改变歌曲播放时间时,歌词滚动至该时间处
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      // 改变播放模式
      changeMode() {
        const mode = (this.mode + 1) % 3 // 0,1,2
        this.setPlayMode(mode)
        let list = null
        if (mode === playMode.random) {
          // 打乱歌曲播放列表数组方法
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }

        this.resetCurrentIndex(list)
        this.setPlaylist(list)
      },
      resetCurrentIndex(list) {
        // findIndex => ES6语法
        let index = list.findIndex((item) => {
          return item.id === this.currentSong.id
        })

        this.setCurrentIndex(index)
      },
      // 获取当前歌曲的歌词
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            // 歌词根据延迟时间来高亮
            this.currentLyric.play()
          }
        }).catch(() => { // 歌词获取失败时
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      // 歌词滚动效果
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum // 当前高亮(播放)的歌词的行数

        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5] // 取下标>5的数组成员
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          // 前5行时不用滚动
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }

        this.playingLyric = txt // 当前播放的歌词
      },
      // 移动端判断左滑右滑(切换歌词)
      middleTouchStart(e) {
        this.touch.initiated = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }

        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY

        // 当纵向滚动距离大于横向滚动距离时,认为是纵向滚动
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }

        const screenWidth = window.innerWidth
        const left = this.currentShow === 'cd' ? 0 : -screenWidth
        const offsetWidth = Math.min(0, Math.max(-screenWidth, left + deltaX))
        // 滑动距离的比例
        this.touch.percent = Math.abs(offsetWidth / screenWidth)
        // this.$refs.lyricList是一个scroll的Vue组件,无法操作其DOM(获取$el)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0

        // cd的透明度改变
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd() {
        console.log('end')
        let offsetWidth
        let opacity
        const screenWidth = window.innerWidth

        if (this.currentShow === 'cd') {
          // 从右向左滑(滑动比例的范围[0, 1])
          if (this.touch.percent > 0.1) {
            offsetWidth = -screenWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          // 从左向右滑(滑动比例范围[1, 0])
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -screenWidth
            opacity = 0
          }
        }

        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`

        // cd的透明度改变
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
      },
      // 对state中的数据进行某些改变(操作),将抓取的数据赋值给state中的属性
      ...mapMutations({
        // 修改状态
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',
        setPlaylist: 'SET_PLAYLIST'
      })
    },
    watch: {
      currentSong(newSong, oldSong) {
        // 暂停切换播放模式时不会自动播放
        if (newSong.id === oldSong.id) {
          return
        }

        if (this.currentLyric) {
          this.currentLyric.stop()
        }

        // 注意：未加this.$nextTick()方法时报错。原因是DOM未渲染完毕(url未获取到数据时)就调用了audio的play方法(延时调用)
        setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>