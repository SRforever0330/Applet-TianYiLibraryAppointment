// pages/appointment/appointment.js
const db=wx.cloud.database();
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
   meeting_room:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.getRooms();
  },
  onShow(){
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let e = currentPage.options;
    let isActive=false;
    const rooms=wx.getStorageSync('rooms');
    if(!rooms){
      this.getRooms();
    }else{
        //有旧的数据 定义过期时间 
        if(Date.now()-rooms.time>1000*60){
          this.getRooms();
        }else{
          this.setData({
            meeting_room:rooms.data
          })
        }
    }
    this.setData({
      isActive
    }) 
  },
  //获取房间信息
  getRooms(){
    wx.showLoading({
      title: '加载中',
    })
    let that=this;
    db.collection('meeting_room').get({
      success:res=>{
        that.setData({
          meeting_room:res.data
        })
        wx.hideLoading();
        //数据存储到缓存中
        wx-wx.setStorageSync('rooms', {time:Date.now(),data:res.data});
        }
      })
      //关闭下拉刷新的窗口
      wx.stopPullDownRefresh();
  },
  //点击预约按钮事件
  handleReserveTap(e){
    let floor=e.currentTarget.dataset.floor;
    let name=e.currentTarget.dataset.name;
    let full_name=e.currentTarget.dataset.full;
    let current=e.currentTarget.dataset.current;
    let img=e.currentTarget.dataset.img;
    if(!current==0){
      wx.navigateTo({
        url: '/pages/seat/seat?floor='+floor+'&name='+name+'&full_name='+full_name+'&img='+img
      })
    }
    
  },
  //点击图片放大预览事件
  handlePreviewImg(e){
    let that=this;
    wx.previewImage({
      urls: e.currentTarget.dataset.imgs,
      current:'e.currentTarget.dataset.imgs[0]'
    })
  },
  //下拉刷新
  onPullDownRefresh(){
    this.setData({
      meeting_room:[]
    })
    this.getRooms();
  }
})