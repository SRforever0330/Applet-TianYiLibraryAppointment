const db=wx.cloud.database();
Page({
  data: {
    limitTime:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideHomeButton();
   this.setData({
     limitTime:Date.now()-1000*60*60*24  //1天
   })
   
  },
  Reset(){
  //房间
  db.collection('meeting_room').doc('60173c665f445755003aa7e3199ee2aa').update({
    data:{
      current:28
    }
  }),
  db.collection('meeting_room').doc('60173c665f445786003aa9d433841838').update({
    data:{
      current:28
    }
  }),
  db.collection('meeting_room').doc('65825b355f4457ad00363bc0593c51a7').update({
    data:{
      current:28
    }
  }),
  db.collection('meeting_room').doc('b5416b755f4457f7004c83ed680a174d').update({
    data:{
      current:28
    }
  }),
  db.collection('meeting_room').doc('65825b355f44581500363fa64668664d').update({
    data:{
      current:28
    }
  }),
  db.collection('meeting_room').doc('b5416b755f44587c004c8aac51724c13').update({
    data:{
      current:28
    }
  })
    var tableList=[{"id":31.0,"name":"01","seatList":[{"id":"1","name":"A","status":1.0},{"id":"2","name":"B","status":1.0},{"id":"3","name":"C","status":1.0},{"id":"4","name":"D","status":1.0}]},{"id":32.0,"name":"02","seatList":[{"id":"5","name":"A","status":1.0},{"id":"6","name":"B","status":1.0},{"id":"7","name":"C","status":1.0},{"id":"8","name":"D","status":1.0}]},{"id":33.0,"name":"03","seatList":[{"id":"9","name":"A","status":1.0},{"id":"10","name":"B","status":1.0},{"id":"11","name":"C","status":1.0},{"id":"12","name":"D","status":1.0}
   ]},{"id":34.0,"name":"04","seatList":[{"id":"13","name":"A","status":1.0},{"id":"14","name":"B","status":1.0},{"id":"15","name":"C","status":1.0},{"id":"16","name":"D","status":1.0}]},{"id":35.0,"name":"05","seatList":[{"id":"17","name":"A","status":1.0},{"id":"18","name":"B","status":1.0},{"id":"19","name":"C","status":1.0},{"id":"20","name":"D","status":1.0}]},{"id":36.0,"name":"06","seatList":[{"id":"21","name":"A","status":1.0},{"id":"22","name":"B","status":1.0},{"id":"23","name":"C","status":1.0},{"id":"24","name":"D","status":1.0}
   ]},{"id":37.0,"name":"07","seatList":[{"id":"25","name":"A","status":1.0},{"id":"26","name":"B","status":1.0},{"id":"27","name":"C","status":1.0},{"id":"28","name":"D","status":1.0}]}]
  //座位
   db.collection('meeting_seat').doc('b5416b755f45a3ea0063477a0b1fb6ab').update({
     data:{
       tableList:tableList
     }
   }),
   db.collection('meeting_seat').doc('aa133ce55f45a8150043881a62981e4b').update({
    data:{
      tableList:tableList
    }
  }),
  db.collection('meeting_seat').doc('7498b5fe5f45a81900577d2723a3f5a2').update({
    data:{
      tableList:tableList
    }
  }),
  db.collection('meeting_seat').doc('8a6c3bf65f45a81c0046561b5afea5c4').update({
    data:{
      tableList:tableList
    }
  }),
  db.collection('meeting_seat').doc('60173c665f45a81f004be2a4789328ea').update({
    data:{
      tableList:tableList
    }
  }),
  db.collection('meeting_seat').doc('aa133ce55f45a8220043888a5daafadb').update({
    data:{
      tableList:tableList
    }
  })
//未签到1天后重置
 
  
  const command1 = db.command
  db.collection('user').where({
    nowTime:command1.neq(0),
    status:1
 }).update({
   data:{
     status:3,
   }
 })
 const command2 = db.command
 db.collection('user').where({
  nowTime:command2.neq(0),
  status:2
}).update({
 data:{
   status:3,
 }
})
const command = db.command
  db.collection('user').where({
     nowTime:command.lt(this.data.limitTime),
     status:3
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
  
  wx.showToast({
    title: '重置成功',
    icon: 'success',
    duration: 2000
    })
  }
 
})