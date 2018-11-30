const cloud = require('wx-server-sdk')
cloud.init()
// 或者传入自定义配置
cloud.init({
  env: 'test-26a0c9'
})
// 云函数入口函数
exports.main = async (event, context) => {
  const fileIDs = [event.fileId]
  const result = await cloud.getTempFileURL({
    fileList: fileIDs,
  })
  return result.fileList
}