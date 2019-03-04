const app = getApp();
const util = require('../../utils/util.js');
var heartCheck;
var pChat = undefined;
var url = 'wss://wxapi.dsj.bjguocai.com/wss?username=13439963276&password=123456';
var page = undefined;
Page({
  onShow() {

  },
  onHide() {

  },
  onReady(res) {
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 3000)
    page = this;
    this.LivePlayerContext = wx.createLivePlayerContext('liveT')
    this.checkAuthorize();
    var that = this;
    if (app.globalData.userInfo) {
      this.setData({
        isAuthorize: true
      })
    }
  },
  onLoad() {
    page = this;
    this.request({ // 获取直播信息 简介
      url: 'https://xuan.vq8.net:15483/livebg/live/live_info',
      data: {
        live_id: '1',
        busiCode: '10500101'
      },
      callback: function(res) {
        page.setData({
          abstractData: res,
          liveStatus: res.live_status,  // todo  res.live_status
          liveSystemTips: res.live_system_tips
        })
        // 连接socket
        this.linkSocket()
      }
    })
    this.request({ // 获取回放列表
      url: 'https://xuan.vq8.net:15483/livebg/live/live_list',
      data: {
        live_id: '2',
        live_status: '5',
        pageNo: this.data.backPageNo,
        pageAmount: '20',
        busiCode: '10500102'
      },
      callback: function(res) {
        if (res.resCode == "000000") {
          if (page.data.backPageNo < res.pageTotal) {
            page.setData({
              backSeeMore: ''
            })
          } else {
            page.setData({
              backSeeMore: 'display:none;'
            })
          }
          page.setData({
            backPlayData: res.data
          })
        }
      }
    })
    this.request({ // 获取预告列表
      url: 'https://xuan.vq8.net:15483/livebg/live/live_list',
      data: {
        live_status: '2',
        pageNo: this.data.backPageNo,
        pageAmount: '20',
        busiCode: '10500102'
      },
      callback: function(res) {
        if (res.resCode == "000000") {
          if (page.data.backPageNo < res.pageTotal) {
            page.setData({
              trailerSeeMore: ''
            })
          } else {
            page.setData({
              trailerSeeMore: 'display:none;'
            })
          }
          page.setData({
            trailers: res.data
          })
        }
      }
    })
  },
  // 初始化socket的回调事件
  initSocketCallback() {
    wx.onSocketMessage((onMessage) => {
      heartCheck.reset().start(); // 如果获取到消息，说明连接是正常的，重置心跳检测
      // console.log('服务器返回', JSON.parse(onMessage.data))
      var onMessage_data = JSON.parse(onMessage.data)
      if (onMessage_data.command == 9) {
        page.setData({
          userInfo: onMessage_data.data.user
        })
      } else if (onMessage_data.command == 12) {  
        if (onMessage_data.code == 10000){
          
        } else {
          wx.showToast({
            title: onMessage_data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      } else if (onMessage_data.command == 11) {
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
        var content = onMessage_data.data.from + '对' + onMessage_data.data.to + '说：' + onMessage_data.data.content;
        // console.log(onMessage_data.data.chatType)
        if (onMessage_data.data.chatType == 2) {
          doommList.push(new Doomm(content, Math.ceil(Math.random() * 80), Math.ceil(Math.random() * 20), page.getRandomColor()));
          page.setData({
            doommData: doommList,
          })
        } else {
          doommList.push(new Doomm(onMessage_data.data.content, Math.ceil(Math.random() * 80), Math.ceil(Math.random() * 20), page.getRandomColor()));
          page.setData({
            doommData: doommList,
          })
        }
      }
    })
    wx.onSocketOpen(() => {
      // console.log('WebSocket连接打开')
      heartCheck.reset().start()
      this.sendSocketMessage({
        'cmd': 7,
        'group_id': 100
      })
    })
    wx.onSocketError((res) => {
      // console.log('WebSocket连接打开失败', res)
      this.reconnect()
    })
    wx.onSocketClose((res) => {
      // console.log('WebSocket 已关闭！', res)
      this.reconnect()
    })
  },
  // 连接socket
  linkSocket() {
    let self = this
    wx.connectSocket({
      url: url,
      header: {
        'content-type': 'applicatioplayBackItemn/json',
        'Authorization': null
      },
      success(res) {
        // console.log('连接成功', res)
        // 在这里初始化socket的回调事件们（第二步）
        self.initSocketCallback()
      },
      fail(res) {
        // console.log('连接失败', res)
        // 在这里重连socket的事件（第三步）
        this.reconnect()
      }
    })
  },
  //通过 WebSocket 连接发送数据，需要先 wx.connectSocket，并在 wx.onSocketOpen 回调之后才能发送。
  sendSocketMessage(msg) {
    // console.log('发送数据', JSON.stringify(msg))
    wx.sendSocketMessage({
      data: JSON.stringify(msg)
    }, function(res) {
      // console.log('已发送', res)
    })
  },
  // 重新连接事件 我设置的5秒后重连一次
  reconnect() {
    if (this.reconnectFlag) return
    this.reconnectFlag = true
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.linkSocket()
      this.reconnectFlag = false
      // this.$apply()
    }, 5000)
  },
  // 提交文字
  submitTo: function(e) {
    if (e.detail.value && e.detail.value != "") {
      if (page.data.checkBox == 1) {
        // 如果打开了socket就发送数据给服务器
        this.sendSocketMessage({
          'from': page.data.userInfo.id,
          'to': page.data.toWhom,
          'username': page.data.userInfo.id,
          'createTime': new Date().getTime(),
          'cmd': 11,
          'group_id': page.data.userInfo.groups[0].group_id,
          'chatType': page.data.checkBox,
          'msgType': page.data.msgType,
          'content': e.detail.value,
          'imgUrl': page.data.userInfo.avatar,
          'leave': page.data.userInfo.leave,
          'nickName': page.data.userInfo.nick
        })
      } else {
        // 如果打开了socket就发送数据给服务器
        var msg = {
          'from': page.data.userInfo.id,
          'to': page.data.toWhom,
          'createTime': new Date().getTime(),
          'cmd': 11,
          'chatType': page.data.checkBox,
          'msgType': page.data.msgType,
          'content': e.detail.value,
          'imgUrl': page.data.userInfo.avatar,
          'leave': page.data.userInfo.leave,
          'nickName': page.data.userInfo.nick
        }
        this.sendSocketMessage(msg)
        // var chatList_f = page.data.chatList
        // chatList_f.push(msg)
        // page.setData({
        //   chatList: chatList_f
        // })
        // if (page.data.chatScroll) {
        //   page.setData({
        //     scrollTop: page.data.chatList.length * 200
        //   })
        // }
        // doommList.push(new Doomm(msg.from + '对' + msg.to+'说：'+msg.content, Math.ceil(Math.random() * 80), Math.ceil(Math.random() * 20), page.getRandomColor()));
        // page.setData({
        //   doommData: doommList,
        // })
      }

    } else {
      wx.showToast({
        title: '输入不能为空',
        icon: 'none',
        duration: 2000
      })
    }
    this.setData({
      inputBtm: "",
      inputBtmT: ""
    })
    this.clearInputEvent();
  },
  LivePlayerContext: '',
  data: {
    toWhom: '15896585878', // 私聊给谁  默认为空是群聊
    loadingShow: false, //是否显示loading
    checkBox: 1, // 默认群聊
    msgType: 1, // 默认消息
    backPageNo: 1, // 回放默认页数
    trailerPageNo: 1, // 预告默认页数
    backSeeMore: 'display:none;', // 是否隐藏回放查看更多
    trailerSeeMore: 'display:none;', // 是否隐藏预告查看更多
    reconnectFlag: false, // 是否重连接口
    timer: {}, //心跳检测间隔
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
    liveStatus: 1, //直播状态 1无预告，2预告中，3直播中，4直播结束，5回放中
    chatScroll: true, // 聊天窗口是否自动滚动
    liveSystemTips: '系统消息：任何传播违法，违规，低俗，暴力等不良信息的行为均属违规，将会封停账号。', //简介内容
    placeholder: '说点什么吧~',
    isGag: false,
    inputBtmT: "",
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
    chatList: [],
    abstractData: {},
    backPlayData: [],
    trailers: []
  },
  /**
   * 获取用户信息
   */
  getUserInfo: function(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        isAuthorize: true
      })
    }
  },
  /** 
   * 点击查看更多
   */
  seeMoreFn(e) {
    if (e.currentTarget.dataset['index'] == "5") {
      this.data.backPageNo++;
      this.request({ // 获取回放列表
        url: 'https://xuan.vq8.net:15483/livebg/live/live_list',
        data: {
          live_id: '2',
          live_status: '5',
          pageNo: this.data.backPageNo,
          pageAmount: '20',
          busiCode: '10500102'
        },
        callback: function(res) {
          if (res.resCode == "000000") {
            if (page.data.backPageNo < res.pageTotal) {
              page.setData({
                backSeeMore: ''
              })
            } else {
              page.setData({
                backSeeMore: 'display:none;'
              })
            }
            var tArr = page.data.backPlayData;
            tArr = tArr.concat(res.data)
            page.setData({
              backPlayData: tArr
            })
          }
        }
      })
    } else {
      this.data.trailerPageNo++;
      console.log(this.data.trailerPageNo)
      this.request({ // 获取预告列表
        url: 'https://xuan.vq8.net:15483/livebg/live/live_list',
        data: {
          live_id: '2',
          live_status: '2',
          pageNo: this.data.trailerPageNo,
          pageAmount: '20',
          busiCode: '10500102'
        },
        callback: function(res) {
          if (res.resCode == "000000") {
            if (page.data.trailerPageNo < res.pageTotal) {
              page.setData({
                trailerSeeMore: ''
              })
            } else {
              page.setData({
                trailerSeeMore: 'display:none;'
              })
            }
            var rArr = page.data.trailers;
            rArr = rArr.concat(res.data)
            page.setData({
              trailers: rArr
            })
          }
        }
      })
    }

  },
  /**
   * 点击回放列表进入回放页
   */
  playBackItem(e) {
    wx.navigateTo({
      url: '/pages/backPlay/backPlay?liveId=' + e.currentTarget.dataset['liveid'],
    })
  },
  /**
   * 公共请求接口方法
   */
  request(dataObj) {
    wx.request({
      method: 'POST',
      url: dataObj.url, // 仅为示例，并非真实的接口地址
      data: dataObj.data,
      success(res) {
        dataObj.callback(res.data)
      }
    })
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
    // console.log(e.detail)
    if (e.detail.code == "2003") {
      this.setData({
        loadingShow: false
      })
    }
    if (e.detail.code == "-2301" || e.detail.code == "-2302") {
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
    this.setData({
      loadingShow: true
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
        inputBtm: "bottom:" + Number(e.detail.height + 10) + "px;",
        inputBtmT: "display:none;"
      })
      clearTimeout(timeInput);
    }, 10)
  },
  /**
   * input失去焦点
   */
  bindBlur: function() {
    this.setData({
      inputBtm: "",
      inputBtmT: ""
    })
  },
  checkboxChange(e) {
    if (e.detail.value[0] == "2") {
      this.setData({
        checkBox: 2,
        msgType: 4
      })
    } else {
      this.setData({
        checkBox: 1
      })
    }
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
    // console.log(text)
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
// 声明心跳对象
heartCheck = {
  timeout: 5000, // 心跳频率
  timeoutObj: null, // 向服务器发送消息定时器
  serverTimeoutObj: null, // 关闭socket的定时器
  reset: function() {
    clearTimeout(this.timeoutObj)
    clearTimeout(this.serverTimeoutObj)
    return this
  },
  start: function() {
    this.timeoutObj = setTimeout(() => {
      page.sendSocketMessage({
        'cmd': 13,
        'hbbyte': 'ping',
      })
      this.serverTimeoutObj = setTimeout(() => {
        wx.closeSocket()
      }, this.timeout)
    }, this.timeout)
  }
}