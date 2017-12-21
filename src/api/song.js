import {commonParams} from './config'
import axios from 'axios'

// 抓取歌曲歌词(借用node服务器代理改变refer)
export function getLyric(mid) {
  const url = '/api/lyric'

  const data = Object.assign({}, commonParams, {
	pcachetime: +new Date(), // 时间戳(“+”转成数值类型)
	songmid: mid, // 歌曲的ID
	g_tk: 734129147,
	hostUin: 0,
	format: 'json',
	platform: 'yqq',
	needNewCode: 0
  })

  return axios.get(url, {
  	params: data
  }).then((res) => {
  	return Promise.resolve(res.data)
  })
}