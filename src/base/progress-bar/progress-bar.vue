<template>
	<div class="progress-bar" ref="progressBar" @click="progressClick">
		<div class="bar-inner">
      <!-- 内层进度条(开始宽度为0) -->
			<div class="progress" ref="progress"></div>
      <!-- 移动小球 -->
			<div @touchstart.prevent="progressTouchStart"
			     @touchmove.prevent="progressTouchMove"
			     @touchend="progressTouchEnd"
           class="progress-btn-wrapper"
				   ref="progressBtn">
				<div class="progress-btn"></div>
			</div>
		</div>
	</div>
</template>

<script>
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16 // 小球的宽度
  const transform = prefixStyle('transform')

  export default {
  	props: {
  	  percent: { // 播放进度百分比
  	  	type: Number,
  	  	default: 0
  	  }
  	},
  	created() {
  	  this.touch = {} // 不同回调函数共享数据
  	},
  	methods: {
  	  progressTouchStart(e) {
  	  	this.touch.initiated = true // 已初始化(开始拖动)
  	  	this.touch.startX = e.touches[0].pageX // 横坐标
  	  	this.touch.left = this.$refs.progress.clientWidth // 内层进度条宽度
  	  },
  	  progressTouchMove(e) {
  	  	if (!this.touch.initiated) {
  	  	  return
  	  	}

  	  	const deltaX = e.touches[0].pageX - this.touch.startX // 手指移动的距离
  	  	// 最大移动距离(progressBar的宽度)、最小移动距离0
  	  	const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))

  	  	this._offset(offsetWidth)
  	  },
  	  progressTouchEnd(e) {
  	  	this.touch.initiated = false // 拖放结束
  	  	// 拖动结束告诉父组件改变播放进度
  	  	this._triggerPercent()
  	  },
  	  _triggerPercent() {
  	  	const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
  	  	const percent = this.$refs.progress.clientWidth / barWidth
  	  	
        this.$emit('percentChange', percent)
  	  },
      progressClick(e) {
        // this._offset(e.offsetX)
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        this._triggerPercent()
      },
  	  // 小球和进度条同时偏移
  	  _offset(offsetWidth) {
  	  	this.$refs.progress.style.width = `${offsetWidth}px` // 进度条
  	  	this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`// 小球移动
  	  }
  	},
  	// percent是不断改变的(监听变化)
  	watch: {
  	  percent(newPercent) {
        // 当拖动时的优先级更高(拖动时不会改变offsetWidth值)
  	  	if (newPercent >= 0 && !this.touch.initiated) {
  	  	  const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
  	  	  const offsetWidth = newPercent * barWidth

  	  	  this._offset(offsetWidth)
  	  	}
  	  }
  	}
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      border-radius: 5px
      .progress
        position: absolute
        height: 100%
        background: $color-theme
        border-radius: 5px
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>

