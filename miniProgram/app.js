
wx-App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    //初始化云环境
    wx.cloud.init({
      env:"test-3s14n",
      traceUser:true
    })
 
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    const db=wx.cloud.database();
  
      wx.cloud.callFunction({
        // 云函数名称
        name: 'getOpenid',
      }).then(res=>{
        this.globalData.openid=res.result.openid
      })
      wx.getSetting({
        success :res=>{
          if (!res.authSetting['scope.userInfo']){
             var userinfo=wx.getStorageSync('userInfo').data;
             if(userinfo){
              wx.removeStorage({
                key: 'userInfo',
              })
             
            }
         }
        }
        
      })
  },
  globalData:{
    openid:''
  }
  
})
