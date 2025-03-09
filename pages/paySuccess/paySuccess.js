Page({
  data: {
    orderId: '',       // 订单号
    amount: 0,         // 支付金额（单位：元）
    paymentTime: '',    // 支付时间
    orderDetail: null   // 订单详情
  },

  onLoad(options) {
    // 从路由参数中获取订单信息
    const { bookId, amount } = options;

    // 设置页面数据
    this.setData({
      amount: (amount / 100).toFixed(2), // 将分转换为元
      paymentTime: this.formatTime(new Date())
    });

    // 创建订单
    this.createOrder(bookId, amount);
  },

  // 创建订单
  async createOrder(bookId, amount) {
    try {
      const orderRes = await wx.cloud.callFunction({
        name: 'createOrder',
        data: {
          bookId,
          totalFee: amount , // 转换为分
          buyerId: wx.getStorageSync('openid') // 获取当前用户的 openid
        }
      });

      // 设置订单 ID
      this.setData({ orderId: orderRes.result.orderId });

      // 加载订单详情
      this.loadOrderDetail(orderRes.result.orderId);
    } catch (err) {
      console.error('订单创建失败:', err);
      wx.showToast({ title: '订单创建失败', icon: 'none' });
    }
  },

  // 加载订单详情
  async loadOrderDetail(orderId) {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOrderDetail',
        data: { orderId }
      });

      if (result.code === 0) {
        this.setData({ orderDetail: result.data });
      } else {
        wx.showToast({ title: result.message, icon: 'none' });
      }
    } catch (err) {
      console.error('订单详情加载失败:', err);
      wx.showToast({ title: '订单详情加载失败', icon: 'none' });
    }
  },

  // 格式化时间
  formatTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 返回首页
  navigateToHome() {
    wx.switchTab({
      url: '/pages/index/index' // 替换为你的首页路径
    });
  },

  // 查看订单列表
  navigateToOrders() {
    wx.navigateTo({
      url: '/pages/orders/orders' // 替换为你的订单列表页路径
    });
  }
});