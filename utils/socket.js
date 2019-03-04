let socket = {
  /**
   * _connect   websocket 连接
   */
  _connect: function () {
    let url = 'wss://wxapi.dsj.bjguocai.com/wss?username=13439963276&password=123456'
    let self = this
    self.connectSocket(url);
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
    })
    wx.onSocketMessage(function (msg) {
      console.log(JSON.parse(msg.data).data)
    })
    wx.onSocketClose(function () {
      console.log('WebSocket连接已经关闭!')
      self.connectSocket(url);
    })
  },
  connectSocket: function (url) {
    wx.connectSocket({
      url: url,
      method: "GET",
      fail: function () {
        this.connectSocket()
      }
    })
  }
}
export default socket