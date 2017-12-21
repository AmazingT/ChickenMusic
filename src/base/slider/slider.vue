<template>
	<div class="slider" ref="slider">
		<div class="slider-group" ref="slideGroup">
			<slot></slot>
		</div>
		<div class="dots">
			<span class="dot" v-for="(item, index) in dots" :class="{active: currentPageIndex === index}"></span>
		</div>
	</div>
</template>

<script>
	import BScroll from "better-scroll"
	import {addClass} from "common/js/dom"

	export default {
	  data() {
	  	return {
	  	  dots: [],
	  	  currentPageIndex: 0
	  	}
	  },
      props: {
      	loop: {
      	  type: Boolean,
      	  default: true
      	},
      	autoPlay: {
      	  type: Boolean,
      	  default: true
      	},
      	interval: {
      	  type: Number,
      	  default: 4000
      	}
      },
      mounted() {
        setTimeout(() => {
          this._setSlideWidth()
          this._initDots()
          this._initSlider()

          if (this.autoPlay) {
          	this._play()
          }
        }, 20)

        window.addEventListener('resize', () => {
          if (!this.slider) {
          	return
          }
          this._setSlideWidth(true)
          this.slider.refresh()
        })
      },
      methods: {
      	_setSlideWidth(isResize) {
          // 轮播图片数量
          this.children = this.$refs.slideGroup.children

          let width = 0 // 所有轮播图的宽度(slider-group)
          // 每一张图片宽度(视口)
          let sliderWidth = this.$refs.slider.clientWidth
          for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i]
            addClass(child, 'slider-item') // 给每张轮播图添加样式
            
            child.style.width = sliderWidth + 'px'
            width += sliderWidth // 轮播图数量 * 每一张的宽度
          }

          if (this.loop && !isResize) { // 循环轮播宽度为2倍
            width += 2 * sliderWidth
          }
          this.$refs.slideGroup.style.width = width + 'px'
      	},
      	_initSlider() {
      	  this.slider = new BScroll(this.$refs.slider, {
            scrollX: true,
            scrollY: false,
            momentum: false, // 快速滑动一段距离时,会根据滑动的距离和时间算出动量,并生成滚动动画
            snap: true, // 开启滚动
            snapLoop: this.loop,
            snapThreshold: 0.3,
            snapSpeed: 400
      	  })

      	  this.slider.on('scrollEnd', () => {
      	  	// pageX获取横轴方向上的页面数
      	  	let pageIndex = this.slider.getCurrentPage().pageX
      	  	
      	  	if (this.loop) {
      	      pageIndex -= 1
      	  	}
      	  	this.currentPageIndex = pageIndex

      	  	if (this.autoPlay) {
      	  	  clearTimeout(this.timer)
      	  	  this._play()
      	  	}
      	  })
      	},
      	_initDots() {
      	  this.dots = new Array(this.children.length)
      	},
      	_play() {
      	  let pageIndex = this.currentPageIndex + 1
      	  if (this.loop) {
      	  	pageIndex += 1
      	  }
      	  this.timer = setTimeout(() => {
      	  	this.slider.goToPage(pageIndex, 0, 400)
      	  }, this.interval)
      	}
      },
      // 组件切换时会调用destroy钩子函数
      destroyed() {
      	clearTimeout(this.timer) // 组件销毁时清除定时器(释放内存)
      }
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>