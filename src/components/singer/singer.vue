<template>
  <!-- 一个歌手的大组件包括了2个小组件(歌手列表组件和其子组件-歌手详情组件) -->
	<div class="singer" ref="singer">
    <!-- 歌手列表组件 -->
		<list-view @select="selectSinger" :data="singers" ref="list"></list-view>

    <!-- 歌手详情组件(子路由) -->
    <router-view></router-view>
	</div>
</template>

<script>
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/listview/listview'
  import {mapMutations} from 'vuex' // vuex语法糖
  import {playlistMixin} from 'common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10

  export default {
    mixins: [playlistMixin],
  	data() {
  	  return {
  	  	singers: []
  	  }
  	},
  	created() {
  	  this._getSingerList()
  	},
  	methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      // 歌手列表组件派发的点击事件(进入某个歌手详情页)
      // @params:singer(点击某个歌手的图片和名字)
      selectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        this.setSinger(singer) // 用mutations来把某个歌手的信息存入state的singer属性内
      },
  	  _getSingerList() {
  	  	// getSingerList()方法返回的是一个Promise对象
  	  	// @return new Promise((resolve, reject) => { resolve(data) / reject(err) })
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
          	this.singers = this._normalizeSinger(res.data.list)
          }
        })
  	  },
  	  // 过滤数组,把相同名字字母开头的放到一个数组里面,取前10个作为热门数据
  	  _normalizeSinger(list) {
  	  	// '热门'歌手数组(聚合?)
  	  	let map = {
  	  	  hot: {
  	  	  	title: HOT_NAME, // 热门
  	  	  	items: [] // 前10个歌手
  	  	  }
  	  	}

  	  	list.forEach((item, index) => {
  	  	  // 获取前10条作为热门
  	  	  // 使用了ES6的类
          if (index < HOT_SINGER_LEN) {
          	// 使用了Singer类来避免了重复的avatar
          	map.hot.items.push(new Singer({
          	  id: item.Fsinger_mid, // 头像地址后面的mid(获取头像地址)
          	  name: item.Fsinger_name
          	}))
          }

          const key = item.Findex // 名字字母开头大写(作为键)
          if (!map[key]) {
          	map[key] = {
          	  title: key,
          	  items: [] // 所有首字母相同的歌手数组
          	}
          }

          map[key].items.push(new Singer({
          	id: item.Fsinger_mid,
      	    name: item.Fsinger_name
          }))
  	  	})
  	  	// console.log(map)
  	  	// 遍历map对象可能得到的数据不是有序的,为了得到有序列表,我们需要去处理map
  	  	let hot = []
  	  	let ret = []

  	  	for (let key in map) {
          let val = map[key]
          // 用title来划分'热门'和剩下的歌手为2个数组
          if (val.title.match(/[a-zA-Z]/)) {
          	ret.push(val)
          }
          if (val.title === HOT_NAME) {
          	hot.push(val)
          }
  	  	}
  	  	// 数组排序
  	  	ret.sort((a, b) => {
  	  	  // charCodeAt返回某个具体字符的Unicode编码。charAt返回字符串
  	  	  // 两两比较Unicode编码值,返回的值如果小于0,则a在b之前。
  	  	  return a.title.charCodeAt(0) - b.title.charCodeAt(0)
  	  	})

  	  	// concat用于连接两个或多个数组。(hot排第一个)
  	  	return hot.concat(ret)
  	  },
      // 扩展运算符
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
  	},
  	components: {
  	  ListView
  	}
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    width: 100%
    position: fixed
    top: 88px
    bottom: 0
</style>