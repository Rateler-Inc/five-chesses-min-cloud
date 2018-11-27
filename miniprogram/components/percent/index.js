Component({
  properties: {
    // 获胜
    win: {
      type: Number,
      value: 0,
    },
    // 总数
    total: {
      type: Number,
      value: 1,
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {}
  },
  ready() {
    this.percentFormat()
  },
  methods: {
    percentFormat () {
      if (this.data.total === 0) {
        this.data.total = 1
      }
      let result = Math.round((this.data.win / this.data.total) * 100) + '%'
      this.setData({
        percent: result
      })
    }
  }
})