const db=wx.cloud.database();
var app=getApp();
Page({

  data: {
    dates: '',
		floor: '',
		room: '',
    seats: '',
    full_name:'',
    startTime: '08:00',
    nowTimeDate:'',
    endTime: '22:30',
    startAppointTime:'07:00',
    startSignTime:'08:45',
    signEndTime:'',
    tableList:[],
    table_index:0,
    seat_index:0,
    userinfo:{},
    nowTime:0,
    img_src:''
  },

  onLoad: function (e) {
    let full_name=e.full_name;
    let room=e.room;
    let floor=e.floor;
    let dates=e.dates;
    let seat=e.seat;
    let table=e.table;
    let table_index=e.table_index;
    let seat_index=e.seat_index;
    let img_src=e.img
    let tableList=wx.getStorageSync('seats').data[0];
    let userinfo=wx.getStorageSync('userInfo').data;
    let nowTime=Date.now();   //1天之后更新数据
    this.getHour();
    this.setData({
      room,floor,dates,seat_index,table_index,full_name,tableList,userinfo,nowTime,img_src,
      seats:table+'号桌 '+seat+'座'
    })
    
   
  },
  //点击确认
  handleConfirm(e){

    if(this.data.nowTimeDate<=this.data.endTime&&this.data.nowTimeDate>=this.data.startAppointTime){

      //再次请求数据库，看是否有人占上了
      db.collection('meeting_seat').where({
        full_name:this.data.full_name
      }).get().then(res=>{
        let seat_status=res.data[0].tableList[this.data.table_index].seatList[this.data.seat_index].status
        if(seat_status==1){
          wx.showToast({
            title: '预约成功',
            icon: 'success',
            duration: 2000,
            mask:true
          })
       
          // 修改座位表status,并更新meeting_seat数据
          let tableList=this.data.tableList;
          let table_index=this.data.table_index;
          let seat_index=this.data.seat_index;
          tableList[table_index].seatList[seat_index].status=2;
          
          this.setData({
            tableList:tableList
          })
                //缓存
          wx-wx.setStorageSync('seats', {time:Date.now(),data:tableList}); 
                //数据库
          db.collection('meeting_seat').where({
            full_name:this.data.full_name
          }).update({
            data:{
              'tableList':this.data.tableList,
              
            }
          })
          //修改数据库meeting_room的current
          const current = db.command
          db.collection('meeting_room').where({
            full_name:this.data.full_name
          }).update({
            data:{
              current:current.inc(-1),
              
            }
          }).then(res=>{
            //成功以后更新缓存
            db.collection('meeting_room').get().then(res=>{
              wx-wx.setStorageSync('rooms', {time:Date.now(),data:res.data});
              
          // 修改用户status，并添加数据
            // 缓存中
          this.data.userinfo.seats=this.data.seats;
          this.data.userinfo.full_name=this.data.full_name;
          this.data.userinfo.table_index=this.data.table_index;
          this.data.userinfo.seat_index=this.data.seat_index;
          this.data.userinfo.img_src=this.data.img_src;
          this.data.userinfo.status=1;    //已预约
          this.data.userinfo.startTime=this.data.dates+" "+this.data.startTime,
          this.data.userinfo.signEndTime=this.data.signEndTime,
          this.data.userinfo.nowTime=this.data.nowTime
          wx.setStorageSync('userInfo', {time:Date.now(),data:this.data.userinfo})
            // 数据库中
            db.collection('user').where({
              _openid: app.globalData.openid,
            }).update({
              data:{
                status:1,
                seats:this.data.seats,
                full_name:this.data.full_name,
                table_index:this.data.table_index,
                seat_index:this.data.seat_index,
                img_src:this.data.img_src,
                startTime:this.data.dates+" "+this.data.startTime,
                signEndTime:this.data.signEndTime,
                nowTime:this.data.nowTime
              }
            })
           
              wx.navigateTo({
                url: '/pages/myAppointment/myAppointment'
              })
            })    
          })
    
        }else{
          //已有人占上了
          wx.showToast({
            title: '您的位置已被预约',
            icon:'none',
            mask:true,
            duration:2000
          })
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }else{
      wx.showToast({
        title: '还未到预约时间',
        icon:'none',
        duration:2000
      })
    }
   
    

  },
  //获取时间
  getHour(){        
    let time=new Date();                                              
    let hour = time.getHours();
    let minute = time.getMinutes();
    let hour2=hour<10?'0'+hour:hour;
    let minute2=minute<10?'0'+minute:minute;   
    let nowTime= hour2+':'+minute2;
    this.setData({
      nowTimeDate:nowTime
    })
    if(nowTime>=this.data.startTime){
      this.setData({
        startTime:nowTime,
        
      })
    }

    let minute3=minute+45;
    let hour3=minute3>=60?hour+1:hour;
    hour3=hour3<10?'0'+hour3:hour3;
    minute3=minute3>=60?minute3-60:minute3;
    minute3=minute3<10?'0'+minute3:minute3;
    let signTime=hour3+":"+minute3;
    signTime=signTime>this.data.startSignTime?signTime:this.data.startSignTime;
    signTime=signTime<=this.data.endTime?signTime:this.data.endTime;
    this.setData({
      signEndTime:signTime
    })
  }

})