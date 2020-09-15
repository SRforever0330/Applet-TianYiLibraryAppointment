const db=wx.cloud.database();

Page({
  data: {
    floor: '',
    room: '',
    full_name:'',
    tableList: [],
    dates: '',
    year: '',                                              // 当前年
    month: '',                                             // 当前月
    day: '',                                               // 选中日
    today: '',                                             // 当前日
    storeTableList:[],
    userinfo:{}
  },
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let e = currentPage.options;
    const seats=wx.getStorageSync('seats').data;
    const userinfo=wx.getStorageSync('userInfo').data;
    
    //name和floor赋值
    let img=e.img;
    let room=e.name;
    let floor=e.floor;
    let full_name=e.full_name;
    this.setData({
      room,floor,full_name,userinfo,img
    })
 
    if(!seats){
      this.getList();//获取座位
    
    }else{
      //有旧的数据 定义过期时间 并判断缓存中数据是否符合
      if(Date.now()-seats.time<=1000*60&&full_name===seats.data[1]){
           
        this.data.tableList=seats.data[0];
        let arr = this.data.tableList;
          arr.forEach((item, index) => {
            var arr1 = [],
              arr2 = [];
            if(item.seatList && item.seatList.length){
              item.seatList.forEach((ele,i)=>{
                if(i< item.seatList.length/2){
                  arr1.push(ele)
                }else{
                  arr2.push(ele)
                }
              })
            }  
            item.arr1 = arr1
            item.arr2 = arr2
          });
          console.log('arr:',arr)
         
          this.setData({
            tableList: arr
        
          })
      }else{
        this.getList()
        
      }
    }
    
      var today = new Date();                                // 获取当日日历
      var year = today.getFullYear(),
          month = today.getMonth() + 1,
          day = today.getDate();

      this.setData({
      year: year,
      month: month,
      currentMonth: month,
      day: day,
          today: day,
          dates: year + '-' + month + '-' + day
  })
     
      },
  //获取tablelist数组
  getList(){
  
    wx.showLoading({
      title: '加载中',
    })
    let full_name=this.data.full_name
    
      db.collection('meeting_seat').where({
        full_name:full_name
      })
      .get().then(res=>{
          this.setData({
          tableList:res.data[0].tableList,
        })
        this.data.storeTableList.push(this.data.tableList);
        this.data.storeTableList.push(full_name); 
        wx.hideLoading()
        wx.stopPullDownRefresh();
        wx-wx.setStorageSync('seats', {time:Date.now(),data:this.data.storeTableList});
      }).then(result=>{
        let arr = this.data.tableList;
          arr.forEach((item, index) => {
            var arr1 = [],
              arr2 = [];
            if(item.seatList && item.seatList.length){
              item.seatList.forEach((ele,i)=>{
                if(i< item.seatList.length/2){
                  arr1.push(ele)
                }else{
                  arr2.push(ele)
                }
              })
            }  
            item.arr1 = arr1
            item.arr2 = arr2
          });
          
          this.setData({
            tableList: arr
        
          })
      })
  },
  handleSeat(e){
    let userinfo=wx.getStorageSync('userInfo').data;
    if(userinfo){
    //用户未预约
    if(this.data.userinfo.status==0){
      let floor=e.currentTarget.dataset.floor;
      let room=e.currentTarget.dataset.room;
      let dates=e.currentTarget.dataset.date;
      let seat=e.currentTarget.dataset.seat;
      let table=e.currentTarget.dataset.table;
      let status=e.currentTarget.dataset.status;
      let full_name=e.currentTarget.dataset.full_name;
      const table_index=e.currentTarget.dataset.table_index;
      let img=this.data.img;
      if(e.currentTarget.dataset.seat_index2==undefined){   
        var seat_index=e.currentTarget.dataset.seat_index1;
      }else{
        var seat_index=e.currentTarget.dataset.seat_index2+2;
      }
      //座位status
      if(status===1){

         wx.navigateTo({ 
         url: '/pages/confirm/confirm?floor='+floor+'&room='+room+'&dates='+dates
         +'&seat='+seat+'&table='+table+'&full_name='+full_name+'&table_index='+table_index
         +'&seat_index='+seat_index+'&img='+img
        })
      }
    }else{
      if(this.data.userinfo.status==1||this.data.userinfo.status==2){
        
        wx.showToast({
          title: '您已预约座位',
          icon: 'none',
          duration: 2000
        })
      }else{
        wx.showToast({
          title: '您已超时请择日再来',
          icon:'none',
          duration:2000
        })
      }
    }

  }else{
    wx.showToast({
      title: '请先登录',
      icon:'none'
    })
    
  }
    
  },
  onPullDownRefresh(){
    this.setData({
      tableList:[]
    })
    this.getList()
   
  }
  
})