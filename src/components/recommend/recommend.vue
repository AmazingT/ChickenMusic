<template>
	<div class="recommend" ref="recommend">
		<!-- scroll组件使用了插槽(slot) -->
		<scroll ref="scroll" class="recommend-content" :data="discList">
			<div>
				<div v-if="recommends.length" class="slider-wrapper">
					<slider>
						<div v-for="item in recommends">
							<a :href="item.linkUrl">
								<img class="needsclick" @load="loadImage" :src="item.picUrl" />
							</a>
						</div>
					</slider>
				</div>
				<div class="recommend-list">
					<h1 class="list-title">热门歌单推荐</h1>
					<ul>
						<li @click="selectItem(item)" v-for="item in discList" class="item">
							<div class="icon">
								<img v-lazy="item.imgurl" width="60" height="60" />
							</div>
							<div class="text">
								<h2 class="name" v-html="item.creator.name"></h2>
								<p class="desc" v-html="item.dissname"></p>
							</div>
						</li>
					</ul>
				</div>
			</div>

			<div class="loading-container" v-show="!discList.length">
				<loading></loading>
			</div>
		</scroll>
  
    <!-- 推荐歌曲详情页 -->
    <router-view></router-view>
	</div>
</template>

<script>
  import Loading from 'base/loading/loading'
  import Scroll from 'base/scroll/scroll'
  import Slider from 'base/slider/slider'
  import {getRecommend, getDiscList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import axios from 'axios'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
  	data() {
  	  return {
  	  	recommends: [],
  	  	discList: []
  	  }
  	},
    created() {
  	  this._getRecommend()
  	  setTimeout(() => {
  	  	this._getDiscList()
  	  }, 500)
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      // 歌曲点击后进入详情页
      selectItem(item) {
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        // 歌曲信息写到state的disc里面(然后在子路由disc中通过mapGetters来获取该歌曲的数据)
        this.setDisc(item)
      },
      // 这里是一个异步操作的过程(可能数据没有获取到就到mounted阶段)
      // 故添加一个v-if来判断 没有数据时就不渲染
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider;
          }
        })
      },
      _getDiscList() {
      	getDiscList().then((res) => {
      	  if (res.code === ERR_OK) {
      	  	this.discList = res.data.list
      	  }
      	})

      	// axios.get('/api/getPlaylist').then((res) => {

      	//   if(res.data.errno === ERR_OK) {
      	//   	this.discList = res.data.list
      	//   }
      	// }).catch((err) => {
      	//   console.log(err)
      	// })
      },
      loadImage() {
      	if (!this.checkLoaded) {
      	  this.$refs.scroll.refresh()
      	  this.checkLoaded = true	
      	}	
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    },
    components: {
      Slider,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "recommend.styl";
</style>