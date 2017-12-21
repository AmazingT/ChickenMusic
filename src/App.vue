<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <!-- 播放器组件(与路由没关系,与应用相关,任何路由下(切换路由)都能播放) -->
    <player></player>
  </div>
</template>

<script>
  import MHeader from './components/m-header/m-header'
  import Tab from './components/tab/tab'
  import Player from './components/player/player'

  export default {
    components: {
      MHeader,
      Tab,
      Player
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "common/stylus/variable"
</style>
