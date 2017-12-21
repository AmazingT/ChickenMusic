<template>
  <!-- 歌曲列表组件 -->
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <!-- 播放全部 -->
      <div class="play-wrapper">
        <div class="play" v-show="songs.length > 0" ref="playBtn" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div><!-- 遮罩层 -->
    </div>

    <div class="bg-layer" ref="layer"></div>

    <scroll @scroll="scroll"
            :data="songs"
            :probe-type="probeType"
            :listen-scroll="listenScroll"
            class="list"
            ref="list">
      <div class="song-list-wrapper">
        <song-list :rank="rank" @select="selectItem" :songs="songs"></song-list>
      </div>

      <!-- loading -->
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Loading from 'base/loading/loading'
  import {prefixStyle} from 'common/js/dom'
  import {mapActions} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  const RESERVED_HEIGHT = 40
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')

  export default {
    mixins: [playlistMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted() {
      this.imageHeight = this.$refs.bgImage.clientHeight
      this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
      // 歌曲列表距离顶部的距离就是图片的撑开的高度(图片高度未固定)
      // console.log(this.$refs.list) => VueComponent
      // console.log(this.$refs.list.$el) => DOM Element
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    computed: {
      bgStyle() {
        return  `background-image:url(${this.bgImage})`
      }
    },
    methods: {
      // 必须实现该方法(没有实现时执行mixin.js时中的handlePlaylist方法(抛出异常))
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      back() {
        this.$router.back()
      },
      // song-list组件歌曲点击派发事件(@return 歌曲信息,歌曲索引)
      // 此次使用了Vuex共享歌曲相关数据的状态(歌曲组件和播放组件没有关系)
      // 所以不适用父子组件通信间的props和事件派发(this.$emit())
      selectItem(item, index) {
        this.selectPlay({
          list: this.songs, //把抓取的歌曲数据赋给state对象中的sequenceList属性(顺序歌曲播放列表)
          index: index //当前点击播放的歌曲索引(用于播放上一首/下一首)
        })
      },
      // 随机播放全部
      random() {
        this.randomPlay({
          list: this.songs
        })
      },
      // ...是ES6的展开函数
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      scrollY(newY) {
        // bg-layer底层滚动高度达到图片高度时就不再滚动
        let translateY = Math.max(this.minTranslateY, newY)
        let zIndex = 0
        let scale = 1 // 下拉时图片的放大值
        let blur = 0 // 上拉时图片的模糊程度

        this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
       
        // 下拉时图片跟随放大效果(放大比例为newY/this.imageHeight)
        const percent = Math.abs(newY / this.imageHeight) // 绝对值(<1)
        
        if (newY > 0) { // 下拉时
          scale = 1 + percent // 图片的高度拉升newY
          zIndex = 10
        } else { // 上拉时(越往上拉percent越大,最大为1,模糊程度越高)
          blur = Math.min(20 * percent, 20) // newY(0->this.imageHeight)
        }

        // 高斯模糊的效果
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`

        if (newY < this.minTranslateY) { // 上拉至顶部时隐藏
          zIndex = 10 // 调整图片的层级并固定图片高度
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none' // 隐藏播放按钮
        } else {
          // 上拉未至顶部和下拉时还原图片的padding-top和height,并且此时图片的层级为0
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = '' // 显示播放按钮
        }
        this.$refs.bgImage.style.zIndex = zIndex
        // 下拉时实现图片的放大效果(放大的基点是top)
        this.$refs.bgImage.style[transform] = `scale(${scale})`
      }
    },
    components: {
      Scroll,
      SongList,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70% /* 控制宽高比10:7(根据宽度) */
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>