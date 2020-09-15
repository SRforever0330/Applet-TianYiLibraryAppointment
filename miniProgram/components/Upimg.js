// components/Upimg.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
   src:{
     type:String,
     value:""
   },
   chooseImgs:{
     type:Array,
     value:[]
   }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTap(e){
      const {src}=e.currentTarget.dataset;
      let index=this.data.chooseImgs.findIndex(v=>v===src);
      this.triggerEvent("imgDel",{index});
      
      
    }
  }
})