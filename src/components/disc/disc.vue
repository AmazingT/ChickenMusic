<template>
  <transition name="slide">
  	<music-list :title="title"
  	  			:bgImage="bgImage"
  	  			:songs="songs"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/musicList/musicList'
  import {mapGetters} from 'vuex'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default {
  	data() {
  	  return {
  	    songs: []
  	  }
  	},
  	computed: {
  	  title() {
  	  	return this.disc.dissname
  	  },
  	  bgImage() {
  	  	return this.disc.imgurl
  	  },
  	  ...mapGetters([
  	    'disc'
  	  ])
  	},
  	created() {
  	  this._getSongList()
  	},
  	methods: {
  	  _getSongList() {
  	  	// 当前页面刷新时回退
  	  	if (!this.disc.dissid) {
  	  	  this.$router.back()
  	  	  // this.$router.push('/recommend')
  	  	  return
  	  	}
  	  	getSongList(this.disc.dissid).then((res) => {
  	  	  if (res.code === ERR_OK) {
  	  	  	this.songs = this._normalizeSongs(res.cdlist[0].songlist)
  	  	  }
  	  	})
  	  },
  	  _normalizeSongs(list) {
  	  	let ret = []
  	  	list.forEach((musicData) => {
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