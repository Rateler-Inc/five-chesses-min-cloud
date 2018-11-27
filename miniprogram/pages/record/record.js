// pages/record/index.js
//获取应用实例
const app = getApp()
import { DataCtrlObj } from '../../utils/database.js'
const { $Message } = require('../../components/iview/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: [],
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 获取排行
   */
  getRecords (callback) {
    DataCtrlObj.getList((res) => {
      //排序，按照获胜次数排序
      // let tempArr = res.sort((a, b)=>{
      //   return b.winTimes - a.winTimes
      // })
      res.forEach((item) => {
        if (item.playTimes === 0) {
          item.playTimes = 1
        }
        item.percent = Math.round((item.winTimes / item.playTimes) * 100) + '%'
      })
      this.setData({
        array: res,
        loading: false
      })
      callback && callback()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getRecords()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if(this.data.loading){
      return
    }
    this.setData({
      loading: true
    })
    this.getRecords(() => {
      wx.stopPullDownRefresh();
      $Message({
        content: '数据更新成功',
        type: 'success'
      });
    });
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})