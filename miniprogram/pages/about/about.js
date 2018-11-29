// var CartObj = require('cart-model.js');

//获取应用实例
const app = getApp()
Page({
    data: {
      version: app.version,
      logoUrl: ''
    },

    onLoad: function () {
      // 调用云函数,h获取openid
      wx.cloud.callFunction({
        name: 'files',
        data: {
          fileId: 'cloud://jimmy-26a0c9.6a69-jimmy-26a0c9/five-chesses/avatar.jpg'
        },
        success: res => {
          this.setData({
            logoUrl: res.result[0].tempFileURL
          })
        },
        fail: err => {
          console.error('[云函数] [files] 调用失败', err)
          // wx.navigateTo({
          //   url: '../deployFunctions/deployFunctions',
          // })
        }
      })
    },
})