Page({
  data: {
    images: [],
    majors: ['经济学', '国际经济与贸易', '知识产权', '英语', '数学与应用数学', '信息与计算科学', '应用物理学', '材料成型及控制工程	', '高分子材料与工程', '功能材料', '新能源材料与器件', '电子科学与技术', '物联网工程', '土木工程(装配式建筑方向	)', '建筑环境与能源应用工程', '城市地下空间工程', '测绘工程', '遥感科学与技术', '工程造价', '化学工程与工艺', '资源勘查工程', '智能采矿工程', '纺织工程', '服装设计与工程', '非织造材料与工程', '轻化工程', '印刷工程(图像新媒体印刷)', '环境工程', '资源环境科学', '安全工程', '市场营销', '会计学', '会计学(注册会计师方向)', '财务管理', '人力资源管理', '审计学', '行政管理', '物流管理', '质量管理工程', '电子商务', '表演', '视觉传达设计', '环境设计', '产品设计', '服装与服饰设计', '数字媒体艺术', '视觉传达设计', '人工智能', '机器人工程', '软件工程', '数据科学与大数据技术', '软件工程(数字化设计及制造)', '软件工程(智慧电网)', '软件工程(智能物联)', '软件工程(智能制造信息化)', '软件工程(汽车部件设计与成型)', '软件工程(服装智能化设计)', '软件工程(智能半导体器件设计)', '软件工程(机器视觉)', '数据科学与大数据技术(商务数据分析)', '数据科学与大数据技术(数字生态)', '数据科学与大数据技术(金融大数据分析)', '机械设计制造及其自动化', '计算机科学与技术', '电气工程及其自动化', '车辆工程', '土木工程', '工业工程', '通信工程', '计算机网络技术', '数字媒体技术','工程造价'],
    formData: {
      title: '',
      price: '',
      major: ''
    }
  },

  // 上传图片
  uploadImages() {
    wx.chooseImage({
      count: 5,
      sizeType: ['compressed'],
      success: res => {
        if (res.tempFiles.length !== 5) {
          wx.showToast({ title: '请上传5张图片', icon: 'none' })
          return
        }
        this.setData({ images: res.tempFilePaths })
      }
    })
  },

  // 表单提交
  submitForm() {
    const { title, price, major } = this.data.formData
    if (!title || !price || !major || this.data.images.length !==5) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    
    wx.cloud.callFunction({
      name: 'publishBook',
      data: {
        ...this.data.formData,
        images: this.data.images
      },
      success: res => {
        wx.navigateBack()
      }
    })
  }
})