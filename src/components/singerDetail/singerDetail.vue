<template>
	<transition name="slide">
		<music-list :songs="songs"
                :title="title"
                :bg-image="bgImage"></music-list>
	</transition>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import MusicList from 'components/musicList/musicList'

  export default {
    data() {
      return {
        songs: []
      }
    },
  	computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      // 父组件singer的setSinger()将点击获取的singer数据赋给了singer
  	  ...mapGetters([
  	    'singer'
  	  ])
  	},
  	created() {
  	  this._getDetail()
  	},
  	methods: {
  	  _getDetail() {
  	  	// 歌手详情页刷新时返回歌手列表页
  	  	if (!this.singer.id) {
  	  	  this.$router.push('/singer')
  	  	  // this.$router.go(-1)
  	  	  return
  	  	}
        // 通过歌手ID获取该歌手的歌曲列表并做处理
  	  	getSingerDetail(this.singer.id).then((res) => {
  	  	  if (res.code === ERR_OK) {
  	  	  	this.songs = this._normalizeSongs(res.data.list)
  	  	  }
  	  	})
  	  },
      // 对接收到的歌曲数据做处理
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
  	},
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

  .slide-enter-active, .slide-leave-active
  	transition: all 0.3s
  .slide-enter, .slide-leave-to
  	transform: translate3d(100%, 0, 0)
</style>