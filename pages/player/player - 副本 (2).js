const app = getApp();
const util = require('../../utils/util.js');
var socketOpen = false;
var SocketTask;
var url = 'wss://wxapi.dsj.bjguocai.com/wss?username=13439963276&password=123456';
// var socket = require('../../utils/socket.js');
// socket = socket.default;
var page = undefined;
Page({
  onShow() {
    // socketOpen = false;
    // this.webSocket()
    // if (!socketOpen) {
      this.webSocket()
    // }
  },
  onHide() {
    SocketTask.close(function(close) {
      console.log('关闭 WebSocket 连接。', close)
    })
  },
  onReady(res) {
    page = this;
    this.LivePlayerContext = wx.createLivePlayerContext('liveT')
    this.checkAuthorize();
    var that = this;
    SocketTask.onOpen(res => {
      socketOpen = true;
      console.log('监听 WebSocket 连接打开事件。', res)
      heartCheck.reset().start();   // 成功建立连接后，重置心跳检测
      // sendSocketMessage({
      //   'cmd': '7',
      //   'group_id': '100',
      // })
    })
    SocketTask.onClose(onClose => {
      console.log('监听 WebSocket 连接关闭事件。', onClose)
      socketOpen = false;
      this.webSocket()
    })
    SocketTask.onError(onError => {
      console.log('监听 WebSocket 错误。错误信息', onError)
      socketOpen = false
    })
    SocketTask.onMessage(onMessage => {
      heartCheck.reset().start();    // 如果获取到消息，说明连接是正常的，重置心跳检测
      console.log('监听WebSocket接受到服务器的消息事件。服务器返回的消息', JSON.parse(onMessage.data))
      var onMessage_data = JSON.parse(onMessage.data)
      if (onMessage_data.command == "9") {
        page.setData({
          userInfo: onMessage_data.data.user
        })
        console.log(page.data.userInfo)
      } else if (onMessage_data.command == "11") {
        var chatList_f = page.data.chatList
        chatList_f.push(onMessage_data.data)
        page.setData({
          chatList: chatList_f
        })
        if (page.data.chatScroll) {
          page.setData({
            scrollTop: page.data.chatList.length * 200
          })
        }
      }
    })


    setInterval(function() {
      if (!that.data.isFullScreen) {
        doommList.push(new Doomm(contentText, Math.ceil(Math.random() * 80), Math.ceil(Math.random() * 20), that.getRandomColor()));
        that.setData({
          doommData: doommList,
        })
      } else {
        doommList = [];
      }
    }, 3000)
    if (app.globalData.userInfo) {
      this.setData({
        isAuthorize: true
      })
    }
  },

  webSocket: function() {
    // 创建Socket
    SocketTask = wx.connectSocket({
      url: url,
      data: 'data',
      header: {
        'content-type': 'application/json'
      },
      method: 'get',
      success: function(res) {
        console.log('WebSocket连接创建', res)
      },
      fail: function(err) {
        wx.showToast({
          title: '网络异常！',
        })
        console.log(err)
      },
    })
  },

  // 提交文字
  submitTo: function(e) {
    console.log(e)
    if (socketOpen) {
      // 如果打开了socket就发送数据给服务器
      sendSocketMessage({
        'from': page.data.userInfo.id,
        'username': page.data.userInfo.id,
        'createTime': new Date().getTime(),
        'cmd': '11',
        'group_id': page.data.userInfo.groups[0].group_id,
        'chatType': '1',
        'msgType': '1',
        'content': e.detail.value,
        'imgUrl': page.data.userInfo.avatar,
        'leave': page.data.userInfo.leave,
        'nickName': page.data.userInfo.nick
      })
    }
    this.clearInputEvent();
  },
  LivePlayerContext: '',
  data: {
    isConnectSocket: false,
    isBotShow: true, //是否先是底边栏
    isAuthorize: false, // 是否授权
    isFullScreen: true, // 是否横屏
    isPlay: false, //是否在播放
    isPause: true, //是否为第一次进入并未播放状态
    inputValue: null, // 输入框内容
    tabIndex: 0, //tab位置
    scrollTop: '999', // scrollView滚动条高度
    isCheckNetworkType: true, //是否检查网络类型
    isWifi: true, // 是否是wifi网络
    doommData: [], //弹幕列表 
    isLive: 3, //直播状态 1无预告，2预告中，3直播中，4直播结束，5回放中
    chatScroll: true, // 聊天窗口是否自动滚动
    liveSystemTips: '系统消息：任何传播违法，违规，低俗，暴力等不良信息的行为均属违规，将会封停账号。', //简介内容
    startTouchX: 0,
    startTouchY: 0,
    endTouchX: 0,
    endTouchY: 0,
    userInfo: null,
    liveTabList: [ // tab内容
      {
        id: 1,
        val: "聊天"
      },
      {
        id: 2,
        val: "简介"
      },
      {
        id: 3,
        val: "回放"
      },
      {
        id: 4,
        val: "预告"
      },
      {
        id: 5,
        val: "下载"
      }
    ],
    chatList: [ // 聊天列表

    ],
    abstractData: {
      nick: '小张老师',
      title: '全国快3实战讲解，看懂走势无压力',
      time: '2019-01-11 14:30',
      hot: '9999+',
      detail: '本次讲解的重点是趋势的整理，反转形态的分类以及应用；很多除了最简单的数据统计和智能推荐，相信肯定还不能满足你的欲望，那如果继续本次讲解的重点是趋势的整理，反转形态的分类以及用；很多除了最简单的数据统计和智能推荐!'
    },
    backPlayData: [{
        backTime: "30:00",
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "小张老师"
      },
      {
        backTime: "30:00",
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "小张老师"
      },
      {
        backTime: "30:00",
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "小张老师"
      },
      {
        backTime: "30:00",
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "小张老师"
      },
      {
        backTime: "30:00",
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "小张老师"
      },
      {
        backTime: "30:00",
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "小张老师"
      },
      {
        backTime: "30:00",
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "小张老师"
      },
      {
        backTime: "30:00",
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "小张老师"
      }
    ],
    trailers: [{
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "1小张老师"
      },
      {
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "2小张老师"
      },
      {
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "3小张老师"
      },
      {
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "4小张老师"
      },
      {
        liveTime: "2019-01-11",
        title: "全国快3实战讲解，看懂走势无压力",
        nick: "5小张老师"
      }
    ]
  },
  /**
   * 发送通讯内容
   */
  sendSocketMessage(msg) {
    msg = JSON.stringify(msg)
    console.log(msg)
    wx.sendSocketMessage({
      'data': msg
    })
  },
  /**
   * 重新连接通讯
   */
  connectSocket() {
    if (this.data.isConnectSocket) {
      wx.closeSocket();
      app.onLaunch();
    }
  },
  /**
   * 获取用户信息
   */
  getUserInfo: function(e) {
    // console.log()
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        isAuthorize: true
      })
    }
  },
  /**
   * 检查用户是否授权
   */
  checkAuthorize() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          page.setData({
            isAuthorize: true
          })
        }
      }
    })
  },
  /**
   * 点击tab列表
   */
  tabSwitch(e) {
    this.setData({
      tabIndex: e.currentTarget.dataset.index
    })
  },
  /**
   * 滑动列表开始
   */
  touchStart(e) {
    this.setData({
      startTouchX: e.changedTouches[0].clientX,
      startTouchY: e.changedTouches[0].clientY
    })
  },
  /**
   * 滑动列表结束
   */
  touchEnd(e) {
    this.setData({
      endTouchX: e.changedTouches[0].clientX,
      endTouchY: e.changedTouches[0].clientY
    })
    let truns = util.getTouchData(this.data.endTouchX, this.data.endTouchY, this.data.startTouchX, this.data.startTouchY)
    if (truns.t == "left") {
      if (this.data.tabIndex != 4) {
        this.setData({
          tabIndex: this.data.tabIndex + 1
        })
      }
    } else if (truns.t == "right") {
      if (this.data.tabIndex != 0) {
        this.setData({
          tabIndex: this.data.tabIndex - 1
        })
      }
    } else if (truns.t == "bottom" && this.data.tabIndex == 0) {
      this.setData({
        chatScroll: false
      })
    }
  },
  /**
   * 聊天列表滑动到底部触发
   */
  scrollTolower(e) {
    this.setData({
      chatScroll: true
    })
  },
  // /**
  //  * 点击键盘发送按钮
  //  */
  // bindConfirm(e) {
  //   this.sendSocketMessage({
  //     'from': page.data.userInfo.id,
  //     'username': page.data.userInfo.id,
  //     'createTime': new Date().getTime(),
  //     'cmd': '11',
  //     'group_id': page.data.userInfo.groups[0].group_id,
  //     'chatType': '1',
  //     'msgType': '1',
  //     'content': e.detail.value,
  //     'imgUrl': page.data.userInfo.avatar,
  //     'leave': page.data.userInfo.leave,
  //     'nickName': page.data.userInfo.nick
  //   })
  //   this.clearInputEvent();
  // },
  /**
   * 清空输入框内容
   */
  clearInputEvent: function() {
    this.setData({
      'inputValue': ''
    })
  },
  /**
   * 直播网络监听
   */
  netstatus(e) {
    // console.log('netstatus code:', e.detail)
  },
  /**
   * 直播状态监听
   */
  statechange(e) {
    if (e.detail.code == "-2301") {
      this.LivePlayerContext.play()
      this.LivePlayerContext.resume()
    }
    if (this.data.isCheckNetworkType) {
      var that = this;
      wx.getNetworkType({
        success(res) {
          const networkType = res.networkType
          if (networkType != "wifi") {
            that.setData({
              isWifi: false
            })
            that.livePlayerPause();
          }
        }
      })
    }
  },
  /**
   * 直播error
   */
  error(e) {
    console.error('live-player error:', e.detail)
  },
  /**
   * 点击开始按钮直播开始
   */
  livePlayerStart() {
    this.setData({
      isPlay: true
    })
    this.LivePlayerContext.play()
    this.LivePlayerContext.resume()
  },
  /**
   * 网络为非wifi时的开始按钮
   */
  goPlayStart() {
    this.setData({
      isCheckNetworkType: false,
      isWifi: true
    })
    this.livePlayerStart();
  },
  /**
   * 直播暂停
   */
  livePlayerPause() {
    this.setData({
      isPlay: false,
      isPause: false,
      isBotShow: !this.data.isBotShow
    })
    this.LivePlayerContext.pause()
  },
  /**
   * 点击直播区域出现辅助按钮
   */
  clickPlayer: function() {
    this.setData({
      isBotShow: !this.data.isBotShow
    })
  },
  /**
   * 横屏
   */
  requestFullScreen: function() {
    this.LivePlayerContext.requestFullScreen({
      direction: 90
    })
    this.setData({
      doommData: [],
      isBotShow: !this.data.isBotShow,
      isFullScreen: false
    })
  },
  /**
   * 正常竖屏
   */
  exitFullScreen: function() {
    this.LivePlayerContext.exitFullScreen()
    this.setData({
      doommData: [],
      isBotShow: !this.data.isBotShow,
      isFullScreen: true
    })
    if (this.data.chatScroll) {
      this.setData({
        scrollTop: this.data.chatList.length * 200
      })
    }
    doommList = [];
    this.setData({
      doommData: doommList
    })
  },
  fullScreenChange(e) {
    if (!e.detail.fullScreen) {
      this.exitFullScreen();
    }
  },
  /**
   * input获得焦点
   */
  bindFocus: function(e) {
    let that = this;
    var timeInput = setTimeout(function() {
      that.setData({
        inputBtm: "bottom:" + Number(e.detail.height + 10) + "px;"
      })
      clearTimeout(timeInput);
    }, 10)
  },
  /**
   * input失去焦点
   */
  bindBlur: function() {
    this.setData({
      inputBtm: ""
    })
  },
  /**
   * 获取随机字体颜色
   */
  getRandomColor() {
    const rgb = []
    for (let i = 0; i < 3; ++i) {
      let color = Math.floor(Math.random() * 256).toString(16)
      color = color.length == 1 ? '0' + color : color
      rgb.push(color)
    }
    return '#' + rgb.join('')
  }
})
var doommList = [];
var i = 0; //用做唯一的wx:key
class Doomm {
  constructor(text, top, time, color) {
    this.text = text;
    this.top = top;
    this.time = time > 12 ? time : 12;
    this.color = color;
    this.display = true;
    let that = this;
    this.id = i++;
    setTimeout(function() {
      // doommList.splice(doommList.indexOf(that), 1); //动画完成，从列表中移除这项
      // page.setData({
      //   doommData: doommList
      // })
      if (doommList.length > 50) {
        doommList = [];
        page.setData({
          doommData: doommList
        })
      }
    }, this.time * 1000) //定时器动画完成后执行。
  }
}
//通过 WebSocket 连接发送数据，需要先 wx.connectSocket，并在 wx.onSocketOpen 回调之后才能发送。
function sendSocketMessage(msg) {
  var that = this;
  console.log('通过 WebSocket 连接发送数据', JSON.stringify(msg))
  SocketTask.send({
    data: JSON.stringify(msg)
  }, function(res) {
    console.log('已发送', res)
  })
}
// 心跳检测, 每隔一段时间检测连接状态，如果处于连接中，就向server端主动发送消息，来重置server端与客户端的最大连接时间，如果已经断开了，发起重连。
var heartCheck = {
  timeout: 40000, // 50s发一次心跳，比server端设置的连接时间稍微小一点，在接近断开的情况下以通信的方式去重置连接时间。
  serverTimeoutObj: null,
  reset: function() {
    clearTimeout(this.timeoutObj);
    clearTimeout(this.serverTimeoutObj);
    return this;
  },
  start: function() {
    var self = this;
    this.serverTimeoutObj = setInterval(function() {
      // if (websocket.readyState == 1) {
        console.log("-------------心跳检测------------------");
        sendSocketMessage({
          'cmd':13,
          'hbbyte':"ping"
        });
        heartCheck.reset().start(); // 如果获取到消息，说明连接是正常的，重置心跳检测
      // } else {
      //   console.log("断开状态，尝试重连");
      //   socketOpen = false;
      //   page.webSocket()
      // }
    }, this.timeout)
  }
}