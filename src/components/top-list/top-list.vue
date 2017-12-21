<template>
  <transition name="slide">
    <music-list :title="title"
                :bgImage="bgImage"
                :songs="songs"
                :rank="rank"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/musicList/musicList'
  import {ERR_OK} from 'api/config'
  import {mapGetters} from 'vuex'
  import {getMusicList} from 'api/rank'
  import {createSong} from 'common/js/song'

  export default {
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    created() {
      this._getMusicList()
    },
    computed: {
      title() {
        return this.rankList.topTitle
      },
      bgImage() {
        if (this.songs.length) {
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters([
        'rankList'
      ])
    },
    methods: {
      _getMusicList() {
        // 刷新时返回上一页
        if (!this.rankList.id) {
          this.$router.back()
          return
        }
        getMusicList(this.rankList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.songlist)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
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
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>