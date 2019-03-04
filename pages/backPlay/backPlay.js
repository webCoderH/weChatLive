const app = getApp();
const util = require('../../utils/util.js');
Page({
  onReady(e){
    this.getintroduction(2)
  },
  data: {
    detilBox: 0,
    recordList: '',
    height: '',
    src: '',
    isScroll: true,
    startTouchX: 0,
    startTouchY: 0,
    endTouchX: 0,
    endTouchY: 0,
    videoSrc:'',
    pagenum:1,
    noticenum:1,
    showView: true,
    notshow:true,
    itemwhole:false,
    nothole:false,
    liveTabList: [
      {
        id: 1,
        val: "简介"
      },
      {
        id: 2,
        val: "回放"
      },
      {
        id: 3,
        val: "预告"
      },
      {
        id: 4,
        val: "下载"
      }
    ],
    abstractData: {},
    backPlayData:undefined,
    trailers: []
  },
  onLoad(e) {
    // 获取回放列表信息
    this.playback(1)
    // 获取预告信息
    this.notice_list(1)
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    console.log(e.detail.userInfo)
  },
  //点击查看更多 回放
  
  viewmore(e){
    // 页 +1
    const { pagenum } = this.data
    this.setData({
      pagenum: pagenum + 1
    })
    this.playback(this.data.pagenum) 
  },
  //点击查看更多 预告页
  showmore(){
    const { noticenum } = this.data
    this.setData({
      noticenum: noticenum + 1
    })
    this.notice_list(this.data.noticenum) 
  },
  // 获取简介信息
  getintroduction:function(e){
    var that = this
    wx.request({
      url: 'https://xuan.vq8.net:15483/livebg/live/live_info',
      method: "POST",
      data: {
        "live_id": e
      },
      success: function (res) {
        // console.log(res.data.length)
        // console.log(res.data)
        res.data.live_time = util.tsFormatTime(res.data.live_time, 'Y-M-D h:m:s')
        that.setData({
          abstractData: res.data
        })
      },
    })
  },
  // 回放列表信息
  playback(count,e){
    var that = this
    if (that.data.pagenum != '1'){
      var arr = []
      for (var i = 0; i < that.data.backPlayData.length;i++){
        arr.push(that.data.backPlayData[i])
      }
    }
    
    wx.request({
      url: 'https://xuan.vq8.net:15483/livebg//live/live_list',
      method: "post",

      data: {
        "live_id": 2,
        "live_status": 5,
        "pageNo": count,
        "pageAmount": 20
      },
      success: function (res) {
        for(var i=0;i<res.data.data.length;i++){
          res.data.data[i]['live_time'] = util.tsFormatTime(res.data.data[i]['live_time'], 'Y-M-D h:m:s')
        }

        if (res.data.pageNo != '1'){
          for(var i = 0;i<res.data.data.length;i++){
            arr.push(res.data.data[i])
          }
        
          that.setData({
            backPlayData: arr
          })
        }else{
          that.setData({
            backPlayData: res.data.data
          })
        }
        
        // console.log(res.data.pageTotal)
        if (res.data.pageTotal == res.data.pageNo){
          that.setData({
            showView:false
          })
        }
        if (res.data.pageTotal == '1'){
          that.setData({
            showView: false
          })
        }
        if (res.data.pageTotal == '0'){
          that.setData({
            showView: false
          })
          that.setData({
            itemwhole: true
          })
        }
      },

    })
  },
  // 预告列表信息
  notice_list(notNum,e){
    var that = this
    if (that.data.noticenum != '1') {
      var notarr = []
      for (var i = 0; i < that.data.backPlayData.length; i++) {
        notarr.push(that.data.backPlayData[i])
      }

    }
    wx.request({
      url: 'https://xuan.vq8.net:15483/livebg//live/live_list',
      method:'post',
      data: {
        "live_status": 2,
        "pageNo": notNum,
        "pageAmount": 20
      },
      success:function(res){
        console.log(res)
        for (var i = 0; i < res.data.data.length; i++) {
          res.data.data[i]['live_time'] = util.tsFormatTime(res.data.data[i]['live_time'], 'Y-M-D h:m:s')
        }

        if (res.data.pageNo != '1') {
          for (var i = 0; i < res.data.data.length; i++) {
            notarr.push(res.data.data[i])
          }
          console.log(notarr)
          that.setData({
            trailers: notarr
          })
        } else {
          that.setData({
            trailers: res.data.data
          })
        }
       

        if (res.data.pageTotal == res.data.pageNo) {
          that.setData({
            notshow: false
          })
        }
        if (res.data.pageTotal == '1') {
          that.setData({
            notshow: false
          })
        }
        if (res.data.pageTotal == '0') {
          that.setData({
            notshow: false
          })
          that.setData({
            notwhole: true
          })
        }

      }
    })
  },
  tabSwitch(e) {
    this.setData({
      detilBox: e.currentTarget.dataset.index
    })
  },
  touchStart(e) {
    this.setData({
      startTouchX: e.changedTouches[0].clientX,
      startTouchY: e.changedTouches[0].clientY
    })
  },
  touchEnd(e) {
    this.setData({
      endTouchX: e.changedTouches[0].clientX,
      endTouchY: e.changedTouches[0].clientY
    })
    let truns = util.getTouchData(this.data.endTouchX, this.data.endTouchY, this.data.startTouchX, this.data.startTouchY)
    if (truns.t == "left") {
      if (this.data.detilBox != 3) {
        this.setData({
          detilBox: this.data.detilBox + 1
        })
      }
    } else if (truns.t == "right") {
      if (this.data.detilBox != 0) {
        this.setData({
          detilBox: this.data.detilBox - 1
        })
      }
    }
  },
  /**
   * 点击回放列表item
   */
  playBackItem(e) {
    var that = this
    wx.request({
      url: 'https://xuan.vq8.net:15483/livebg/live/live_info',
      method:'post',
      data:{
        "live_id":e.currentTarget.dataset.bean.live_id
      },
      success:function(res){
        console.log(res)
        that.setData({
          videoSrc: res.data.his_video_url
        })
    
      
      }
    })
    this.getintroduction(e.currentTarget.dataset.bean.live_id)
  }
})