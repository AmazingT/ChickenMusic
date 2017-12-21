<template>
  <div class="rank" ref="rank">
    <scroll class="toplist" ref="toplist" :data="topList">
      <ul>
        <li class="item" v-for="item in topList" @click="selectItem(item)">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl"/>
          </div>

          <ul class="songlist">
          	<h3>{{item.topTitle}}</h3>
            <li class="song" v-for="(list, index) in item.songList">
              <span>{{index + 1}}</span>
              <span>{{list.songname}}-{{list.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>

      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>

    <router-view></router-view>
  </div>
</template>

<script>
  import {getTopList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

  export default {
  	mixins: [playlistMixin],
  	data() {
  	  return {
  	  	topList: []
  	  }
  	},
    created() {
      this._getTopList()
    },
    methods: {
      // 组件必须实现该方法(否则执行mixin.js中的该方法抛出异常)
      handlePlaylist(playlist) {
      	const bottom = playlist.length > 0 ? '60px' : ''
      	this.$refs.rank.style.bottom = bottom
      	this.$refs.toplist.refresh()
      },
      _getTopList() {
      	getTopList().then((res) => {
      	  console.log(res)
      	  if (res.code === ERR_OK) {
      	  	this.topList = res.data.topList
      	  }
      	})
      },
      selectItem(item) {
      	// 子路由
      	this.$router.push({
      	  path: `/rank/${item.id}`
      	})

      	// 上级路由把数据赋值给state的属性,子路由来获取该属性的值
      	this.setRankList(item)
      },
      // 赋值(mutations是一个方法,使用了ES6的扩展表达式)
      ...mapMutations({
      	setRankList: 'SET_RANK_LIST'
      })
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        margin: 0 20px
        padding-top: 20px
        height: 100px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .songlist
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          padding: 0 20px
          height: 100px
          overflow: hidden
          background: $color-highlight-background
          color: $color-text-d
          font-size: $font-size-small
          h3
          	font-size: 16px
          	padding: 5px 0
          .song
            no-wrap()
            font-size: 14px
            line-height: 26px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>