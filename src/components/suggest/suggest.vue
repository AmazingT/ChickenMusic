<template>
  <scroll class="suggest"
          :data="result"
          :pullup="pullup"
          @scrollToEnd="searchMore">
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>

      <loading v-show="hasMore" title="正在加载更多..."></loading>
      <p class="underline" v-show="!hasMore && result.length">我也是有底线的...</p>
    </ul>
  </scroll>
</template>

<script>
  import {getSearchList} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'

  const TYPE_SINGER = 'singer'
  const PERPAGE = 20 // 每页显示歌曲数

  export default {
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: { // 是否显示歌手
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        page: 1, // 当前页数
        result: [], // 搜索歌曲列表
        pullup: true,
        hasMore: true // 标志位(是否还有数据)
      }
    },
    methods: {
      // 向服务器发送关键词,获取歌曲列表渲染到列表里面
      search() {
        this.hasMore = true
        getSearchList(this.query, this.page, this.showSinger, PERPAGE).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
            this._checkMore(res.data)
          }
        })
      },
      // 监听滚动组件的scrollToEnd事件来加载更多数据
      searchMore() {
        // 没有更多数据了
        if (!this.hasMore) {
          return
        }
        // 请求下一页数据
        this.page++
        // 如果有更多数据,继续请求
        getSearchList(this.query, this.page, this.showSinger, PERPAGE).then((res) => {
          if (res.code === ERR_OK) {
            // 将第二页的数据加入到第一页数组的后面
            this.result = this.result.concat(this._genResult(res.data))
            this._checkMore(res.data)
          }
        })
      },
      _checkMore(data) {
        const song = data.song
        if (!song.list.length || (song.curnum + song.curpage * 20) >= song.totalnum) {
          this.hasMore = false
        }
      },
      // 处理数据结构
      _genResult(data) {
        let ret = []
        // 如果有歌手信息
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        // 如果有关于该关键词的歌曲
        if (data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list))
        }

        return ret
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })

        return ret
      },
      getIconCls(item) {
        // 如果搜索结果中有歌手信息
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      }
    },
    components: {
      Scroll,
      Loading
    },
    // query关键词变化时要发送请求检索
    watch: {
      query() {
        this.search()
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
      .underline
        text-align: center
        font-size: 14px
        color: $color-text-d
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>