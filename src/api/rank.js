import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

// 抓取排行榜数据
export function getTopList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'

  const data = Object.assign({}, commonParams, {
  	g_tk: 355318028,
  	uin: 0,
	notice: 0,
	platform: 'h5',
	needNewCode: 1
  })

  return jsonp(url, data, options)
}

// 抓取排行榜具体排行歌曲数据(本身是一个ajax请求(不能跨域))
export function getMusicList(id) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'

  const data = Object.assign({}, commonParams, {
  	g_tk: 355318028,
	notice: 0,
	platform: 'h5',
	needNewCode: 1,
	tpl: 3,
	page: 'detail',
	type: 'top',
	topid: id
  })

  return jsonp(url, data, options)
}