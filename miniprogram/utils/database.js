
const db = wx.cloud.database()
const testDB = wx.cloud.database({
  env: 'test-26a0c9'
})
const dataSet = db.collection('users')

const DataCtrlObj = {
  /**
   * 更新或者添加数据
   */
  updateOrAddDate(userInfo, gameResult) {
    this.getOne(userInfo.openId, (data) => {
      console.log(data)
      if(data.length == 0) {
        this.add(userInfo)
      } else {
        this.update(data[0], gameResult)
      }
    })
  },

  /**
   * 添加数据
   */
  add (userInfo) {
    dataSet.add({
      data: {
        failTimes: 0,
        winTimes: 0,
        nickName: userInfo.nickName,
        playTimes: 0,
        winMinSteps: 9999
      },
      success: function (res) {
        console.log(res)
      }
    })
  },
  /**
   * 获取某个数据
   */
  getOne (openId, callback) {
    return dataSet.where({
      _openid: openId
    }).get().then(res => {
      callback(res.data)
    })
  },
  /**
   * 获取列表数据
   */
  getList (callback) {
    return dataSet.orderBy('winTimes', 'desc').get().then(res => {
      callback(res.data)
    })
  },
  /**
   * 更新数据
   */
  update (data, gameResult) {
    data.playTimes++
    if (gameResult.state) {
      data.winTimes ++
      data.winMinSteps = Math.min(gameResult.steps, data.winMinSteps)
    }else{
      data.failTimes ++
    }
    dataSet.doc(data._id).update({
        // data 传入需要局部更新的数据
        data: {
          // 表示将 done 字段置为 true
          winTimes: data.winTimes,
          winMinSteps: data.winMinSteps,
          playTimes: data.playTimes,
          failTimes: data.failTimes
        },
        success: function (res) {
          console.log(res.data)
        }
      })
  }
}

export { DataCtrlObj }