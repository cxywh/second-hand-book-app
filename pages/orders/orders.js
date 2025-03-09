// pages/orders/orders.js
Page({
  data: {
    orders: [] // 订单列表
  },

  onShow() {
    this.checkLoginStatus();
    this.loadOrders();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!userInfo || !isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return false;
    }
    return true;
  },

  // 加载订单（修复版）
  async loadOrders() {
    if (!this.checkLoginStatus()) return;

    try {
      const db = wx.cloud.database();
      const userInfo = wx.getStorageSync('userInfo'); // 新增：从缓存获取用户信息

      const res = await db.collection('orders')
        .where({
          buyerPhone: userInfo.phone // 使用缓存中的用户信息
        })
        .get();

      this.setData({
        orders: res.data.map(order => ({
          ...order,
          displayPrice: (order.totalFee / 100).toFixed(2)
        }))
      });
    } catch (err) {
      console.error('订单加载失败:', err);
      wx.showToast({ title: '订单加载失败', icon: 'none' });
    }
  }
});