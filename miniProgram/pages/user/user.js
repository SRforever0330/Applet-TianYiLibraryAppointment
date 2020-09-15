var app=getApp();
const db=wx.cloud.database();
Page({

  data: {
   userinfo:{},
   logged:false
  },
  onShow: function (options) {
    wx.getSetting({
      success :res=>{
        if (!res.authSetting['scope.userInfo']){
           var userinfo=wx.getStorageSync('userInfo').data;
           if(userinfo){
            wx.removeStorage({
              key: 'userInfo',
            })
          }
           this.setData({
             logged:false
           })
          }else{
          let userinfo=wx.getStorageSync('userInfo').data;
          if(userinfo){
          
           this.setData({
           userinfo,
           logged:true
      })
    }
          }
       
      }
      
    })
   
  },
  //我的预约
  handleApp(){
    let userinfo=wx.getStorageSync('userInfo').data;
    if(userinfo){
      wx.navigateTo({
        url: '/pages/myAppointment/myAppointment',
      })
    }else{
      wx.showToast({
        title: '请先登录',
        icon:'none'
      })
    }
  },
  //反馈按钮
  handleFb(){
   wx.navigateTo({
     url: '/pages/feedback/feedback',
   })
  },
  handleGetUserInfo(e){
    
    if(e.detail.rawData){
        
       const userinfo=e.detail.userInfo;
       //获取openID并上传数据库和缓存
         let openid=app.globalData.openid;
         //判断用户信息在云数据库中是否存在
         db.collection('user').where({
           _openid: openid,
         })
         .get().then(res=>{
           //没有用户信息 新建一个
           if(res.data.length==0){
             db.collection('user').add({
               // data 字段表示需新增的 JSON 数据
               data: {
                 userinfo: userinfo,
                 status:0    //未预约              
               }
             })
             .then(result => {
               let userInfo={};
               userInfo.userinfo=userinfo;
               userInfo._openid=openid;
               userInfo.status=0//未预约
               wx.setStorageSync('userInfo', {time:Date.now(),data:userInfo})
               this.onShow();
             })
           }else{
             //数据库中有用户信息,放入缓存中
               const userInfo=res.data[0];
               wx.setStorageSync('userInfo', {time:Date.now(),data:userInfo});
               this.onShow();
           }
        
         })
     }
  },
  //退出登录按钮
  exit(){
    
    wx.showModal({
      title: '您确定要退出登录吗？',
      success :res=> {
        if (res.confirm) {
          wx.removeStorage({
            key: 'userInfo',
            success :res=> {
              this.setData({
                logged:false
              })
              this.onShow();
        
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '天翊图书馆预约',
      path: '/pages/start/start',
      imageUrl:'cloud://test-3s14n.7465-test-3s14n-1302908829/start.jpg'	

    }
  }
})