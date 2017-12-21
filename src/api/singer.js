import jsonp from 'common/js/jsonp' // 发送jsonp请求的方法封装(参数连接到URL后面)
import {commonParams, options} from './config' // 分离的公共参数和选项
import axios from 'axios'

// 获取歌手信息数据
export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'

  // 将公共参数和自己独有的参数合并到一个对象data里面
  // Object.assign({}, .., ..) 类似jQuery的extend方法
  const data = Object.assign({}, commonParams, {
    page: 'list',
    channel: 'singer',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    platform: 'yqq',
    needNewCode: 0,
    g_tk: 1959222474 // 默认参数中存在 但是会被该参数覆盖
  })

  // 所有请求的参数配置选项都是options
  return jsonp(url, data, options)
}

// 根据歌手ID来获取该歌手的信息
export function getSingerDetail(singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
  
  const data = Object.assign({}, commonParams, {
    g_tk: '287288585',
    hostUin: 0,
    notice: 0,
    platform: 'yqq',
    needNewCode: 0,
    singermid: singerId,
    order: 'listen',
    begin: 0,
    num: 100, // 获取该歌手100首歌曲的信息
    songstatus: 1
  })

  return jsonp(url, data, options)
}