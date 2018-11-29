// miniprogram/pages/introduction.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  start () {
    console.log(1)
    wx.switchTab({
      url: '/pages/game/game',
    })
  }
})