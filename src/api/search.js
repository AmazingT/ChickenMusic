import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

// 获取搜索最热的关键词
export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
  	g_tk: 355318028,
	notice: 0,
	platform: 'h5',
	needNewCode: 1
  })

  return jsonp(url, data, options)
}

// 获取关键词的歌曲列表(关键词, 页数, 是否显示歌手, 每页显示歌曲数)
export function getSearchList(key, page, zhida, perpage) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

  const data = Object.assign({}, commonParams, {
  	w: key, // 关键词
  	catZhida: zhida ? 1 : 0, // 是否检索歌手
  	p: page, // 第一页
  	perpage: perpage,
  	g_tk: 355318028,
	notice: 0,
	platform: 'h5',
	needNewCode: 1,
	zhidaqu: 1,
	t: 0,
	flag: 1,
	ie: 'utf-8',
	sem: 1,
	aggr: 0,
	n: 20,
	remoteplace: 'txt.mqq.all'
  })

  return jsonp(url, data, options)
}