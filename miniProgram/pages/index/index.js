const db=wx.cloud.database();
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
   img:['../../resource/img/index/library1.jpg','../../resource/img/index/library2.jpg'],
   status:0,
   signEndTime:'',
   endTime:"22:30",
   userinfo:{},
   tableList:[],
   table_index:0,
   seat_index:0,
   full_name:"",
   noticeList: [{
    id: 1,
    content: '1.用馆规则：来馆选座，到馆签到，离馆退座。'
  },{
    id: 2,
    content: '2.时间安排：图书馆开放时间为8：00-22：30，上午7：00开始选座，若在8：00之前预约，请于8：45前完成签到；若之后，请于45分钟之内完成签到。离馆请签退，请于预约当天22:30之前完成签退。'
  },
  {
    id: 3,
    content: '3.违纪处理：签到/签退只允许在图书馆内扫二维码完成，若未按时签到或签退，该账户禁用1天。'
  }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let e = currentPage.options;
    let userinfo=wx.getStorageSync('userInfo').data;
    if(userinfo){
      const tableList=wx.getStorageSync('seats').data;
      let full_name=wx.getStorageSync('userInfo').data.full_name;
      let table_index=wx.getStorageSync('userInfo').data.table_index;
      let seat_index=wx.getStorageSync('userInfo').data.seat_index;
      let status=wx.getStorageSync('userInfo').data.status;
      let signEndTime=wx.getStorageSync('userInfo').data.signEndTime;
      
      this.setData({
        status,signEndTime,userinfo,full_name,table_index,seat_index,tableList
      })
    }
  },
  // handlePreviewImage(e){
  //   const current=e.currentTarget.dataset.url;
  //   const urls=this.data.img;
  //   wx-wx.previewImage({
  //     urls,
  //     current
  //   })
  // },
  //扫一扫 签到
  handleScan(){
    let userinfo=wx.getStorageSync('userInfo').data;
    if(userinfo){
      let time=new Date();                                              
      let hour = time.getHours();
      let minute = time.getMinutes();
      hour=hour<10?'0'+hour:hour;
      minute=minute<10?'0'+minute:minute;   
      let nowTime= hour+':'+minute;
      if(this.data.status==0){
        wx.showToast({
          icon:"none",
          title: '您还未预约座位',
        })
      }
      if(this.data.status==3){
        wx.showToast({
          icon:"none",
          title: '您已超时',
        })
      }
      //签到
      if(this.data.status==1){  //再判断一下是否超时
        if(nowTime<=this.data.signEndTime||nowTime<=this.data.endTime){
          wx.scanCode({
            onlyFromCamera: true,
            success :res=> {
              if(res.rawData=='562+5Yiw5oiQ5Yqf'){
                //修改用户状态
                if(this.data.status==1){
                  //data中
                  this.setData({
                    status:2  //已签到
                  })
                  wx.showToast({
                    title: '签到成功',
                    icon:'success',
                    duration:2000,
                    mask:true
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
               
                setTimeout(function(){
                  if(getCurrentPages().length!=0){
                    getCurrentPages()[getCurrentPages().length-1].onShow()
                  }
                },2500)
                }
              }else{
               wx.showToast({
                 title: '不是该二维码',
               })
              }
            }
          })
        }else{
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
         wx.showToast({
          title: '您已超时',
        })
        }
      }
      //签退
      if(this.data.status==2){
        if(nowTime<=this.data.endTime){
          wx.scanCode({
            onlyFromCamera: true,
            success :res=> {
              if(res.rawData=='562+6YCA5oiQ5Yqf'){
                //修改用户状态
                if(this.data.status==2){
                  //data中
                  this.setData({
                    status:0  //已签退
                  })
                  wx.showToast({
                    title: '签退成功',
                    icon:'success',
                    duration:2000,
                    mask:true
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
            this.data.userinfo.status=0;    
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
               
                setTimeout(function(){
                  if(getCurrentPages().length!=0){
                    getCurrentPages()[getCurrentPages().length-1].onShow()
                  }
                },2500)
                }
              }else{
               wx.showToast({
                 title: '不是该二维码',
               })
              }
            }
          })
        }else{
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
         wx.showToast({
          title: '您已超时',
        })
        }
      }
    }else{
      wx.showToast({
        title: '请先登录',
        icon:'none'
      })
    }
  }
  
})