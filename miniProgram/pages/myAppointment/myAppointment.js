const db=wx.cloud.database();
var app=getApp();
Page({
  data: {
   full_name:'',  
  //  rooms:[],     //自习室
   seats:'',     //座位号
   img_src:'',   //自习室图片
   tableList:[],
   table_index:0,
   seat_index:0,
   userinfo:{},
   status:0,
   startTime:'',
   signEndTime:'',
   endTime:"22:30"
  },

  onShow: function () {   
    if(this.data.status==undefined){
      wx.showToast({
        title: '请重新登录',
        icon:'none',
        duration:2000
      })
    }
    
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let e = currentPage.options;
    wx.showLoading({
      title: '加载中',
    })
    
    
      //判断是否预约
     
        let status=wx.getStorageSync('userInfo').data.status;
        let userinfo=wx.getStorageSync('userInfo').data;
        let signEndTime=wx.getStorageSync('userInfo').data.signEndTime;
       
        this.setData({
          status,userinfo,signEndTime
        })
        
        if(status!=0){
          if(this.data.status!=3){
          this.judgeIfOutTime();
        }
          this.getData();
        }else{
          wx.hideLoading()
        }
    
  
  },
  onUnload(){
  var pages=getCurrentPages();
  if(pages.length>=4){
    wx.switchTab({
      url: '/pages/appointment/appointment',
    })
  }else{

    wx.switchTab({
      url: '/pages/user/user',
    })
  }
  },
  
//拿数据
  getData(){
    //从缓存中取
    const tableList=wx.getStorageSync('seats');
    const userinfo=wx.getStorageSync('userInfo');
    if(Date.now()-tableList.time>1000||Date.now()-userinfo.time>1000*300||!tableList||!userinfo){
      //请求数据库
      db.collection('user').where({
        _openid: app.globalData.openid,
      })
      .get().then(res=>{
        this.setData({
          userinfo:res.data[0],
          full_name:res.data[0].full_name,
          seats:res.data[0].seats,
          img_src:res.data[0].img_src,
          table_index:res.data[0].table_index,
          seat_index:res.data[0].seat_index,
          startTime:res.data[0].startTime,
          signEndTime:res.data[0].signEndTime
        })
          }).then(res=>{ 
          db.collection('meeting_seat').where({
            full_name:this.data.full_name
          })
          .get().then(result=>{
            let tableList=result.data[0].tableList
           this.setData({
             tableList
           })
   
        })
      })
      }else{
      this.setData({
        tableList:tableList.data[0],
        full_name:userinfo.data.full_name,
        seats:userinfo.data.seats,
        img_src:userinfo.data.img_src,
        table_index:userinfo.data.table_index,
        seat_index:userinfo.data.seat_index,
        startTime:userinfo.data.startTime,
        signEndTime:userinfo.data.signEndTime
      })
    }
    wx.hideLoading();
   
},
//点击签到事件
  handleSignIn(){
    if(getCurrentPages().length!=0){
      getCurrentPages()[getCurrentPages().length-1].onShow()
    }
    if(this.data.status!=3){
      wx.scanCode({
        onlyFromCamera: true,
        success :res=> {
          if(res.rawData=='562+5Yiw5oiQ5Yqf'){
            wx.showToast({
              title: '签到成功',
              icon:'success',
              duration:2000,
              mask:true
            })
            // setTimeout(function(){
            //   if(getCurrentPages().length!=0){
            //     getCurrentPages()[getCurrentPages().length-1].onShow()
            //   }
            // },2500)
            //修改用户状态
            if(this.data.status==1){
              //data中
              this.setData({
                status:2  //已签到
              })
              //缓存中
              const userinfo=wx.getStorageSync('userInfo').data;
              userinfo.status=2;
              wx.setStorageSync('userInfo', {time:Date.now(),data:userinfo})
              //数据库中
              db.collection('user').where({
                _openid: app.globalData.openid,
              }).update({
                data:{
                  status:2,  //已签到
                }
            })
          
            }
          }else{
           wx.showToast({
             title: '不是该二维码',
           })
          }
        }
      })

    }
    
},
//点击取消预约
  handleCancel(){
    if(getCurrentPages().length!=0){
      getCurrentPages()[getCurrentPages().length-1].onShow()
    }
    if(this.data.status!=3){
    
      if(this.data.userinfo.status==1){
        wx.showModal({
          title: '您确定要取消预约吗？',
          success :res=> {
            if (res.confirm) {
              wx.showToast({title:'取消成功',icon:'success',duration:2000,mask:true})
             
              // 修改座位表status,并更新meeting_seat数据
             let tableList=this.data.tableList;
             let table_index=this.data.table_index;
             let seat_index=this.data.seat_index;
             tableList[table_index].seatList[seat_index].status=1;
             this.setData({
               tableList:tableList
            })
             wx-wx.setStorageSync('seats', {time:Date.now(),data:this.data.tableList}); 
             db.collection('meeting_seat').where({
             full_name:this.data.full_name
             }).update({
             data:{
               'tableList':this.data.tableList
            }
            })
             // 修改用户status，并添加数据
            // 缓存中
            this.data.userinfo.seats='';
            this.data.userinfo.full_name='';
            this.data.userinfo.table_index=0;
            this.data.userinfo.seat_index=0;
            this.data.userinfo.img_src='';
            this.data.userinfo.status=0;    //未预约
            this.data.userinfo.startTime='';
            this.data.userinfo.signEndTime='';
            this.data.userinfo.nowTime=0
            wx.setStorageSync('userInfo', {time:Date.now(),data:this.data.userinfo})
            // 数据库中
            db.collection('user').where({
              _openid: app.globalData.openid,
            }).update({
              data:{
                status:0,
                seats:'',
                full_name:'',
                table_index:0,
                seat_index:0,
                img_src:'',
                startTime:'',
                signEndTime:'',
                nowTime:0
              }
          })
             //修改数据库meeting_room的current
             const current = db.command
             db.collection('meeting_room').where({
               full_name:this.data.full_name
             }).update({
               data:{
                 current:current.inc(1)
               }
             }).then(res=>{
               //成功以后更新缓存
               db.collection('meeting_room').get().then(res=>{
                 wx-wx.setStorageSync('rooms', {time:Date.now(),data:res.data});
               }) 
             })
            setTimeout(function(){
              if(getCurrentPages().length!=0){
                getCurrentPages()[getCurrentPages().length-1].onShow()
              }
            },2500)
            
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }
},
//点击签退事件
  handleSignOut(){
    if(getCurrentPages().length!=0){
      getCurrentPages()[getCurrentPages().length-1].onShow()
    }
    if(this.data.userinfo.status==3){
      return
    }else{
      wx.scanCode({
      onlyFromCamera: true,
      success :res=> {
        if(res.rawData=='562+6YCA5oiQ5Yqf'){
          wx.showToast({
            title: '签退成功',
            icon:'success',
            duration:2000,
            mask:true
          })
          setTimeout(function(){
            if(getCurrentPages().length!=0){
              getCurrentPages()[getCurrentPages().length-1].onShow()
            }
          },2500)
          
          //修改数据库meeting_room的current
          const current = db.command
          db.collection('meeting_room').where({
            full_name:this.data.full_name
          }).update({
            data:{
              current:current.inc(1)
            }
          }).then(res=>{
            //成功以后更新缓存
          
            db.collection('meeting_room').get().then(result=>{
              wx-wx.setStorageSync('rooms', {time:Date.now(),data:result.data});
            }) 
          })
          // 修改座位表status,并更新meeting_seat数据
         let tableList=this.data.tableList;
         let table_index=this.data.table_index;
         let seat_index=this.data.seat_index;
         tableList[table_index].seatList[seat_index].status=1;
         this.setData({
           tableList:tableList
        })
         wx-wx.setStorageSync('seats', {time:Date.now(),data:this.data.tableList}); 
         db.collection('meeting_seat').where({
         full_name:this.data.full_name
         }).update({
         data:{
           'tableList':this.data.tableList
        }
        })
        // 修改用户status，并添加数据
          // 缓存中
          this.data.userinfo.seats='';
          this.data.userinfo.full_name='';
          this.data.userinfo.table_index=0;
          this.data.userinfo.seat_index=0;
          this.data.userinfo.img_src='';
          this.data.userinfo.status=0;    //已预约
          this.data.userinfo.startTime='';
          this.data.userinfo.signEndTime='';
          this.data.userinfo.nowTime=0;
          wx.setStorageSync('userInfo', {time:Date.now(),data:this.data.userinfo})
          // 数据库中
          db.collection('user').where({
            _openid: app.globalData.openid,
          }).update({
            data:{
              status:0,
              seats:'',
              full_name:'',
              table_index:0,
              seat_index:0,
              img_src:'',
              startTime:'',
              signEndTime:'',
              nowTime:0
            }
        })
       
      }else{
        wx.showToast({
          title: '不是该二维码',
        })
       }
      }
      
    })
    }
    
    
},
  //判断是否过期
  judgeIfOutTime(){
   let signEndTime=this.data.signEndTime;
   let time=new Date();                                              
   let hour = time.getHours();
   let minute = time.getMinutes();
   hour=hour<10?'0'+hour:hour;
   minute=minute<10?'0'+minute:minute;
   let nowTime= hour+':'+minute;
   if(this.data.userinfo.status==1){

     if(nowTime>signEndTime||nowTime>this.data.endTime){
       this.setData({
         status:3
       })
       this.data.userinfo.status=3;
       wx.setStorageSync('userInfo', {time:Date.now(),data:this.data.userinfo});
       db.collection('user').where({
        _openid: app.globalData.openid,
      }).update({
        data:{
          status:3
        }
      })
        if(getCurrentPages().length!=0){
          getCurrentPages()[getCurrentPages().length-1].onShow()
        }
     }
   }
   if(this.data.userinfo.status==2){
     if(nowTime>this.data.endTime){
      this.setData({
        status:3
      })
      this.data.userinfo.status=3;
      wx.setStorageSync('userInfo', {time:Date.now(),data:this.data.userinfo});
      db.collection('user').where({
       _openid: app.globalData.openid,
     }).update({
       data:{
         status:3
       }
     })
       if(getCurrentPages().length!=0){
         getCurrentPages()[getCurrentPages().length-1].onShow()
       }
     }
   }
  },
 
})