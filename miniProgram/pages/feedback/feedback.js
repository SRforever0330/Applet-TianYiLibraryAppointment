const db=wx.cloud.database();
var app=getApp();
Page({

  data: {
   //被选中的图片路径数组
   chooseImgs:[],
   //文本域的内容
   textVal:"",
   //云存储路径数组
   Imgs:[],
  },
  //点击加号选择图片事件
  handleChooseImg(){
    wx-wx.chooseImage({
      //最多上传几张
      count: 9,
      //图片格式 原图 压缩
      sizeType: ['original','compressed'],
      //图片来源 相册 相机
      sourceType: ['album','camera'],
      success: (result) => {
        this.setData({
          chooseImgs:[...this.data.chooseImgs,...result.tempFilePaths]
        })
        
      }
    })
  },
  //子向父传递
  handleImgDel(e){
    const {index}=e.detail;
    let {chooseImgs}=this.data;
    chooseImgs.splice(index,1);
    this.setData({
      chooseImgs
    })
  },
  //文本域的输入事件
  handleTextInput(e){
    this.setData({
      textVal:e.detail.value
    })
  },
  //提交按钮的点击事件
  handleFormSubmit(){
   const {textVal}=this.data;
   if(!textVal.trim()){
    wx-wx.showToast({
      title: '输入不合法',
      icon:"none",
      mask: true,
      duration:2000
    });
    return;
  }
  else{
    wx-wx.showToast({
      title: '提交成功',
      duration:2000,
      icon: 'success',
      mask: true
    })
    this.data.chooseImgs.forEach((v,i)=>{
       wx.cloud.uploadFile({// 上传到云存储
        cloudPath:"feedback/"+this.data.textVal+"-"+i+'.png',
        filePath:v,
       }).then(res => {
         this.data.Imgs.push(res.fileID)
      }).catch(error => {
        console.log(error);
      })
    })
    let that=this;
    setTimeout(function(){
        db.collection('feedback').add({
           data: {
           Imgs:that.data.Imgs,
           textVal:that.data.textVal
         }
        })
        //清空
         that.setData({
           chooseImgs:[],
           textVal:""
         })
         wx-wx.navigateBack({
           delta: 1
         })
      },2500)
   }
  }
  
})