var app=getApp();
const db=wx.cloud.database();
wx-Page({
  data: {
   
  },

  onLoad(){
  
  },
  //点击进入按钮，获取用户信息
  handleGetUserInfo(e){
    
    if(e.detail.rawData){
          wx.showToast({
            icon:"loading",
            title: '加载中',
            duration:2000
          })
       const userinfo=e.detail.userInfo;
       //获取openID并上传数据库和缓存
         let openid=app.globalData.openid;
         //判断用户信息在云数据库中是否存在
         db.collection('user').where({
           _openid: openid,
         })
         .get().then(res=>{
           console.log(res);
           
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
               wx.switchTab({
                 url: '/pages/index/index',
               })
             })
           }else{
             //数据库中有用户信息,放入缓存中
               const userInfo=res.data[0];
               wx.setStorageSync('userInfo', {time:Date.now(),data:userInfo});
             
             wx.switchTab({
               url: '/pages/index/index',
             })
           }
         })
     }else{
      wx.switchTab({
        url: '/pages/index/index',
      })
     }
    }
    
    
  
})