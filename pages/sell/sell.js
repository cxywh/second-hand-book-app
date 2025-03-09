// pages/sell/sell.js
Page({
  data: {
    majors: [
      '经济学', '国际经济与贸易', '知识产权', '英语', '数学与应用数学', 
      '信息与计算科学', '应用物理学', '材料成型及控制工程', '高分子材料与工程', 
      '功能材料', '新能源材料与器件', '电子科学与技术', '物联网工程', 
      '土木工程(装配式建筑方向)', '建筑环境与能源应用工程', '城市地下空间工程', 
      '测绘工程', '遥感科学与技术', '工程造价', '化学工程与工艺', '资源勘查工程', 
      '智能采矿工程', '纺织工程', '服装设计与工程', '非织造材料与工程', 
      '轻化工程', '印刷工程(图像新媒体印刷)', '环境工程', '资源环境科学', 
      '安全工程', '市场营销', '会计学', '会计学(注册会计师方向)', '财务管理', 
      '人力资源管理', '审计学', '行政管理', '物流管理', '质量管理工程', 
      '电子商务', '表演', '视觉传达设计', '环境设计', '产品设计', 
      '服装与服饰设计', '数字媒体艺术', '人工智能', '机器人工程', '软件工程', 
      '数据科学与大数据技术', '软件工程(数字化设计及制造)', '软件工程(智慧电网)', 
      '软件工程(智能物联)', '软件工程(智能制造信息化)', '软件工程(汽车部件设计与成型)', 
      '软件工程(服装智能化设计)', '软件工程(智能半导体器件设计)', '软件工程(机器视觉)', 
      '数据科学与大数据技术(商务数据分析)', '数据科学与大数据技术(数字生态)', 
      '数据科学与大数据技术(金融大数据分析)', '机械设计制造及其自动化', 
      '计算机科学与技术', '电气工程及其自动化', '车辆工程', '土木工程', 
      '工业工程', '通信工程', '计算机网络技术', '数字媒体技术', '工程造价'
    ],
    selectedSellMajor: '', // 选择的专业
    bookName: '', // 书籍名称
    sellPrice: null, // 出售价格
    tempImageUrls: [], // 存储上传的图片URL
    showSellForm: false // 是否显示出售表单
  },

  onLoad() {
    // 初始化时检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!isLoggedIn || !userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.navigateTo({ url: '/pages/login/login' });
    }
  },

  // 启动出售流程
  async startSelling() {
    // 计算剩余可上传图片数量
    const remaining = 5 - this.data.tempImageUrls.length;
    if (remaining <= 0) {
      wx.showToast({ title: '已上传5张图片', icon: 'none' });
      return;
    }

    // 允许用户选择已有图片或拍摄新照片
    const res = await wx.chooseImage({
      count: remaining, // 限制剩余可上传数量
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'] // 允许从相册或相机选择
    });

    // 上传到云存储
    const uploadTasks = res.tempFilePaths.map(filePath => 
      wx.cloud.uploadFile({
        cloudPath: `books/${Date.now()}-${Math.random()}.jpg`,
        filePath
      })
    );

    const uploadRes = await Promise.all(uploadTasks);
    const fileIDs = uploadRes.map(item => item.fileID);

    // 更新图片列表
    this.setData({ 
      tempImageUrls: [...this.data.tempImageUrls, ...fileIDs],
      showSellForm: true // 确保弹窗显示
    });
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const tempImageUrls = this.data.tempImageUrls.filter((_, i) => i !== index);
    this.setData({ tempImageUrls });
  },

  // 表单输入处理
  onBookNameInput(e) {
    this.setData({ bookName: e.detail.value });
  },

  onMajorSelect(e) {
    this.setData({ selectedSellMajor: this.data.majors[e.detail.value] });
  },

  onPriceInput(e) {
    // 用户输入的价格以元为单位
    const priceInYuan = parseFloat(e.detail.value);
    this.setData({ sellPrice: priceInYuan });
  },

  // 提交出售信息
  async submitSellForm() {
    const { bookName, selectedSellMajor, sellPrice, tempImageUrls } = this.data;

    // 校验表单数据
    if (!bookName || !selectedSellMajor || !sellPrice) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    // 将元转换为分
    const priceInFen = Math.round(sellPrice * 100);

    // 校验照片数量
    if (tempImageUrls.length !== 5) {
      wx.showToast({ title: '请上传5张照片', icon: 'none' });
      return;
    }

    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.phone) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    // 写入数据库
    const db = wx.cloud.database();
    try {
      await db.collection('books').add({
        data: {
          title: bookName,
          major: selectedSellMajor,
          price: priceInFen, // 存储为分
          images: tempImageUrls,
          sellerId: userInfo.openId, // 卖家ID
          sellerPhone: userInfo.phone, // 卖家手机号
          status: 'onsale',
          createTime: db.serverDate()
        }
      });

      wx.showToast({ title: '发布成功' });
      this.closeSellForm();
    } catch (err) {
      console.error('发布失败:', err);
      wx.showToast({ title: '发布失败', icon: 'none' });
    }
  },

  // 关闭弹窗
  closeSellForm() {
    this.setData({ 
      showSellForm: false,
      bookName: '',
      selectedSellMajor: '',
      sellPrice: null,
      tempImageUrls: []
    });
  }
});