Page({
  data: {
    userInfo: null, // 用户信息
    orders: [] // 订单列表
  },

  onShow() {
    this.loadUserInfo();
    this.loadOrders();
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo'
      });
      this.setData({ userInfo: res.result.userInfo });
    } catch (err) {
      console.error('用户信息加载失败:', err);
    }
  },

  // 加载订单列表
  async loadOrders() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserOrders'
      });
      this.setData({ orders: res.result.orders });
    } catch (err) {
      console.error('订单加载失败:', err);
    }
  },

  // 退出登录
  async logout() {
    try {
      // 清除本地缓存
      wx.clearStorageSync();

      // 调用云函数退出登录
      await wx.cloud.callFunction({
        name: 'logout'
      });

      // 提示用户已退出
      wx.showToast({ title: '退出登录成功', icon: 'none' });

      // 跳转到首页
      wx.reLaunch({ url: '/pages/index/index' });
    } catch (err) {
      console.error('退出登录失败:', err);
      wx.showToast({ title: '退出登录失败', icon: 'none' });
    }
  }
});