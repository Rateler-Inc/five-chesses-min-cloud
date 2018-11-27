//index.js
//获取应用实例
const app = getApp()
import {DataCtrlObj} from '../../utils/database.js'

Page({
  data: {
    canvasWidth: 0,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    me: true,
    over: false,
    sizeIndex: 0,
    sizeArray: [10, 12, 15, 18],
  },
  context: null,
  //赢法的统计数组
  myWin: [],
  computerWin: [],
  wins: [],
  winCounts: 0,
  over: false,
  me: true,
  chressBord: [],//棋盘
  perWidth: 0,
  steps: 0, // 到棋局结束一共下了多少步

  onLoad() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.setCanvasSize()
    this.iniWins()
    this.initChressBord()
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    app.globalData.userInfo.openId = app.globalData.openid
    DataCtrlObj.updateOrAddDate(app.globalData.userInfo)
  },
  /**
   * 根据屏幕大小，这只棋盘大小
   */
  setCanvasSize() {
    let that = this
    wx.getSystemInfo({
      success(res) {
        that.canvasWidth = res.windowWidth - 20  // 左右空格各10px          
        that.perWidth = Math.floor(that.canvasWidth / that.data.sizeArray[that.data.sizeIndex])
        that.canvasWidth = that.perWidth * that.data.sizeArray[that.data.sizeIndex]
        that.setData({
          canvasWidth: that.canvasWidth,
          canvasHeight: that.canvasWidth
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady(e) {
    this.context = wx.createCanvasContext('firstCanvas')
    this.drawChessBoard();
  },
  /**
   * 重新开始
   */
  reStart() {
    this.clearChessBoard()
    this.drawChessBoard()
    this.onLoad()
    this.setData({
      me: true,
      over: false,
    })
    this.steps = 0
  },

  /**
   * 落棋
   */
  setChess(e) {
   
    if (this.data.over) {
      return;
    }
    if (!this.data.me) {
      return;
    }
    var x = e.touches[0].x;
    var y = e.touches[0].y;
    if (x < 0) {
      x = 0
    }
    if (y < 0) {
      y = 0
    }
    var i = Math.round(x / this.perWidth);
    var j = Math.round(y / this.perWidth);
    // let size = this.data.sizeArray[this.data.sizeIndex]
    // if (i === 0 || j === 0 || i === size || j === size) {
    //   return
    // }
    this.steps++
    console.log(`第${this.steps}步`)
    if (this.chressBord[i][j] == 0) {
      this.oneStep(i, j, this.data.me);
      this.chressBord[i][j] = 1;//我        

      for (var k = 0; k < this.winCounts; k++) {
        if (this.wins[i][j][k]) {
          this.myWin[k]++;
          this.computerWin[k] = 6;//这个位置对方不可能赢了
          if (this.myWin[k] == 5) {
            let that = this
            wx.showModal({
              title: '提示',
              content: '你赢了,你牛逼。是否再来一局',
              success(res) {
                if (res.confirm) {
                  that.reStart()
                } else if (res.cancel) {

                }
              }
            })
            this.setData({
              over: true
            })
            this.updateGameResult({
              state: true,
              steps: this.steps
            })
          }
        }
      }
      if (!this.data.over) {
        this.setData({
          me: !this.data.me
        })
        setTimeout(() => {
          this.computerAI();
        }, 500)
      }
    }
  },

  /**
   * 画旗子
   */
  oneStep(i, j, me) {
    this.context.beginPath();
    this.context.arc(i * this.perWidth, j * this.perWidth, this.perWidth / 2, 0, 2 * Math.PI);//画圆
    this.context.closePath();

    if (this.data.me) {
      this.context.setFillStyle('#ffffff')
    } else {
      this.context.setFillStyle('#000000')
    }
    this.context.fill()

    this.context.draw(true)
  },

  /*
  **绘画棋盘*
  */
  drawChessBoard() {
    this.context.setFillStyle('#cea587')
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasWidth)
    this.context.setStrokeStyle("rgba(0,0,0,.5)") //边框颜色

    for (var i = 0; i <= this.data.sizeArray[this.data.sizeIndex]; i++) {
      this.context.setLineWidth(1)
      this.context.save()
      this.context.moveTo(i * this.perWidth, 0)
      this.context.lineTo(i * this.perWidth, this.canvasWidth)
      this.context.stroke()

      this.context.moveTo(0, i * this.perWidth)
      this.context.lineTo(this.canvasWidth, i * this.perWidth)
      this.context.stroke()
      this.context.restore()
    }
    this.context.draw()
  },
  /**
   * 清除棋盘
   */
  clearChessBoard() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasWidth)
    this.context.draw()
  },

  /**
   * 赢法统计
   */
  iniWins() {
    //赢法数组
    for (var i = 0; i <= this.data.sizeArray[this.data.sizeIndex]; i++) {
      this.wins[i] = [];
      for (var j = 0; j <= this.data.sizeArray[this.data.sizeIndex]; j++) {
        this.wins[i][j] = [];
      }
    }

    var count = 0; //赢法总数
    //横线赢法
    for (var i = 0; i <= this.data.sizeArray[this.data.sizeIndex]; i++) {
      for (var j = 0; j <= this.data.sizeArray[this.data.sizeIndex] - 4; j++) {
        for (var k = 0; k < 5; k++) {
          this.wins[i][j + k][count] = true;
        }
        count++;
      }
    }

    //竖线赢法
    for (var i = 0; i <= this.data.sizeArray[this.data.sizeIndex]; i++) {
      for (var j = 0; j <= this.data.sizeArray[this.data.sizeIndex] - 4; j++) {
        for (var k = 0; k < 5; k++) {
          this.wins[j + k][i][count] = true;
        }
        count++;
      }
    }

    //正斜线赢法
    for (var i = 0; i <= this.data.sizeArray[this.data.sizeIndex] - 4; i++) {
      for (var j = 0; j <= this.data.sizeArray[this.data.sizeIndex] - 4; j++) {
        for (var k = 0; k < 5; k++) {
          this.wins[i + k][j + k][count] = true;
        }
        count++;
      }
    }

    //反斜线赢法
    for (var i = 0; i <= this.data.sizeArray[this.data.sizeIndex] - 4; i++) {
      for (var j = this.data.sizeArray[this.data.sizeIndex]; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
          this.wins[i + k][j - k][count] = true;
        }
        count++;
      }
    }

    for (var i = 0; i < count; i++) {
      this.myWin[i] = 0;
      this.computerWin[i] = 0;
    }
    this.winCounts = count
    console.log(`全部:${count}`)
  },

  computerAI() {
    var myScore = [];
    var computerScore = [];
    var max = 0;
    var u = 0, v = 0;
    for (var i = 0; i <= this.data.sizeArray[this.data.sizeIndex]; i++) {
      myScore[i] = [];
      computerScore[i] = [];
      for (var j = 0; j <= this.data.sizeArray[this.data.sizeIndex]; j++) {
        myScore[i][j] = 0;
        computerScore[i][j] = 0;
      }
    }
    for (var i = 0; i <= this.data.sizeArray[this.data.sizeIndex]; i++) {
      for (var j = 0; j <= this.data.sizeArray[this.data.sizeIndex]; j++) {
        if (this.chressBord[i][j] == 0) {
          for (var k = 0; k < this.winCounts; k++) {
            if (this.wins[i][j][k]) {
              if (this.myWin[k] == 1) {
                myScore[i][j] += 200;
              } else if (this.myWin[k] == 2) {
                myScore[i][j] += 400;
              } else if (this.myWin[k] == 3) {
                myScore[i][j] += 2000;
              } else if (this.myWin[k] == 4) {
                myScore[i][j] += 10000;
              }

              if (this.computerWin[k] == 1) {
                computerScore[i][j] += 220;
              } else if (this.computerWin[k] == 2) {
                computerScore[i][j] += 420;
              } else if (this.computerWin[k] == 3) {
                computerScore[i][j] += 2100;
              } else if (this.computerWin[k] == 4) {
                computerScore[i][j] += 20000;
              }
            }
          }

          if (myScore[i][j] > max) {
            max = myScore[i][j];
            u = i;
            v = j;
          } else if (myScore[i][j] == max) {
            if (computerScore[i][j] > computerScore[u][v]) {
              u = i;
              v = j;
            }
          }

          if (computerScore[i][j] > max) {
            max = computerScore[i][j];
            u = i;
            v = j;
          } else if (computerScore[i][j] == max) {
            if (myScore[i][j] > myScore[u][v]) {
              u = i;
              v = j;
            }
          }
        }
      }
    }
    this.oneStep(u, v, false);
    this.chressBord[u][v] = 2;
    for (var k = 0; k < this.winCounts; k++) {
      if (this.wins[u][v][k]) {
        this.computerWin[k]++;
        this.myWin[k] = 6;//这个位置对方不可能赢了
        if (this.computerWin[k] == 5) {
          let that = this
          wx.showModal({
            title: '提示',
            content: '计算机赢了,你个渣渣。是否再来一局',
            success(res) {
              if (res.confirm) {
                that.reStart()
              } else if (res.cancel) {

              }
            }
          })
          this.setData({
            over: true
          })
          this.updateGameResult({
            state: false,
            steps: this.steps
          })
        }
      }
    }
    if (!this.data.over) {
      this.setData({
        me: !this.data.me
      })
    }
  },

  /**
   * 初始化棋盘内存信息
   */
  initChressBord() {
    for (var i = 0; i <= this.data.sizeArray[this.data.sizeIndex]; i++) {
      this.chressBord[i] = [];
      for (var j = 0; j <= this.data.sizeArray[this.data.sizeIndex]; j++) {
        this.chressBord[i][j] = 0;
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 调整棋盘大小
   */
  bindPickerChange(e) {
    if (e.detail.value == this.data.sizeIndex) {
      return
    }
    let that = this
    wx.showModal({
      title: '提示',
      content: '调整棋盘大小，棋局将会重新开始，是否调整？',
      success(res) {
        if (res.confirm) {
          that.setData({
            sizeIndex: e.detail.value
          })
          that.onLoad()
          that.reStart()
        } else if (res.cancel) {

        }
      }
    })

  },

  /**
   * 更新用户比赛信息
   */
  updateGameResult(gameResult) {
    app.globalData.userInfo.openId = app.globalData.openid
    DataCtrlObj.updateOrAddDate(app.globalData.userInfo, gameResult)
  }
})
