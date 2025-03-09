Page({
  data: {
    searchKeyword: '',       // 搜索关键词
    selectedMajor: '',       // 当前选中的专业
    majors: ['全部', '经济学', '国际经济与贸易', '知识产权', '英语', '数学与应用数学', '信息与计算科学', '应用物理学', '材料成型及控制工程', '高分子材料与工程', '功能材料', '新能源材料与器件', '电子科学与技术', '物联网工程', '土木工程(装配式建筑方向)', '建筑环境与能源应用工程', '城市地下空间工程', '测绘工程', '遥感科学与技术', '工程造价', '化学工程与工艺', '资源勘查工程', '智能采矿工程', '纺织工程', '服装设计与工程', '非织造材料与工程', '轻化工程', '印刷工程(图像新媒体印刷)', '环境工程', '资源环境科学', '安全工程', '市场营销', '会计学', '会计学(注册会计师方向)', '财务管理', '人力资源管理', '审计学', '行政管理', '物流管理', '质量管理工程', '电子商务', '表演', '视觉传达设计', '环境设计', '产品设计', '服装与服饰设计', '数字媒体艺术', '视觉传达设计', '人工智能', '机器人工程', '软件工程', '数据科学与大数据技术', '软件工程(数字化设计及制造)', '软件工程(智慧电网)', '软件工程(智能物联)', '软件工程(智能制造信息化)', '软件工程(汽车部件设计与成型)', '软件工程(服装智能化设计)', '软件工程(智能半导体器件设计)', '软件工程(机器视觉)', '数据科学与大数据技术(商务数据分析)', '数据科学与大数据技术(数字生态)', '数据科学与大数据技术(金融大数据分析)', '机械设计制造及其自动化', '计算机科学与技术', '电气工程及其自动化', '车辆工程', '土木工程', '工业工程', '通信工程', '计算机网络技术', '数字媒体技术', '工程造价'], // 专业列表
    books: [],               // 书籍数据
    isLoading: false,        // 加载状态
    isLoggedIn: false        // 登录状态
  },

  onLoad() {
    this.initCloud();
    this.checkLoginStatus(); // 检查登录状态
    this.loadBooks();
  },
  onShow() {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus();
  },

  // 初始化云开发环境
  initCloud() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'cloud1-9g5d8pd00dcec2b4', // 替换为实际环境ID
      traceUser: true
    });
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      // 优先检查本地缓存
      const isLoggedIn = wx.getStorageSync('isLoggedIn');
      if (isLoggedIn) {
        this.setData({ isLoggedIn: true });
        return;
      }

      // 本地无缓存时调用云函数验证
      const res = await wx.cloud.callFunction({ name: 'checkLogin' });
      this.setData({ isLoggedIn: res.result.isLoggedIn });
      wx.setStorageSync('isLoggedIn', res.result.isLoggedIn); // 同步缓存
    } catch (err) {
      console.error('登录状态检查失败:', err);
    }
  },
  // 跳转至支付页面（最终版）
  navigateToPay(event) {
    // 双重验证：本地状态 + 云函数状态
    if (!this.data.isLoggedIn || !wx.getStorageSync('isLoggedIn')) {
      wx.showToast({ title: '请先登录后购物', icon: 'none' });
      return;
    }
    const bookId = event.currentTarget.dataset.bookId;
    wx.navigateTo({ url: `/pages/pay/pay?bookId=${bookId}` });
  },


  // 加载书籍数据
  async loadBooks(filter = {}) {
    try {
      this.setData({ isLoading: true });
      const db = wx.cloud.database();
      const _ = db.command;

      // 构建基础查询条件
      let query = db.collection('books')
        .where({
          status: 'onsale'
        });

      // 添加搜索条件
      if (filter.keyword) {
        query = query.where({
          title: db.RegExp({
            regexp: filter.keyword,
            options: 'i'
          })
        });
      }

      // 添加专业筛选条件
      if (filter.major && filter.major !== '全部') {
        query = query.where({
          major: filter.major
        });
      }

      // 执行查询
      const res = await query.get();

      // 格式化价格显示
      const books = res.data.map(book => ({
        ...book,
        displayPrice: (book.price / 100).toFixed(2)
      }));

      this.setData({
        books,
        isLoading: false
      });

    } catch (err) {
      console.error('数据加载失败:', err);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    }
  },

  // 搜索输入处理
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });
    this.loadBooks({
      keyword,
      major: this.data.selectedMajor
    });
  },

  // 专业选择处理
  onMajorChange(e) {
    const index = e.detail.value;
    const major = this.data.majors[index];
    this.setData({ selectedMajor: major });
    this.loadBooks({
      keyword: this.data.searchKeyword,
      major: major === '全部' ? '' : major
    });
  }


});