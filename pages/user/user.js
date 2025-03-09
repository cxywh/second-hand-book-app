// pages/user/user.js
Page({
  data: {
    userInfo: null, // 用户信息
    isLoggedIn: false, // 登录状态
    unreadCount: 0 // 未读消息数量
  },

  onLoad() {
    this.checkLoginStatus(); // 初始化时检查登录状态
  },

  onShow() {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus();
    this.loadUnreadMessages(); // 加载未读消息
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    this.setData({ 
      userInfo: userInfo || null,
      isLoggedIn: !!isLoggedIn
    });
    // 调试日志
    console.log('[我的页面] 登录状态:', isLoggedIn, '用户信息:', userInfo);
  },

  // 加载未读消息
  async loadUnreadMessages() {
    if (!this.data.isLoggedIn) return;

    const db = wx.cloud.database();
    const userInfo = wx.getStorageSync('userInfo');
    try {
      const res = await db.collection('messages')
        .where({
          sellerPhone: userInfo.phone,
          unreadCount: db.command.gt(0) // 未读消息数量大于0
        })
        .get();

      const unreadCount = res.data.reduce((sum, item) => sum + item.unreadCount, 0);
      this.setData({ unreadCount });
    } catch (err) {
      console.error('加载未读消息失败:', err);
      wx.showToast({ title: '加载消息失败', icon: 'none' });
    }
  },

  // 检查登录状态后再跳转
  checkLoginBeforeNavigate() {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/messages/messages'
    });
  },

  // 跳转到登录页面
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除全局状态
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('isLoggedIn');
          wx.removeStorageSync('rememberMe');
          this.setData({ 
            userInfo: null,
            isLoggedIn: false // 同步更新页面状态
          });
          wx.showToast({ title: '退出成功' });
          // 强制刷新页面
          this.onShow();
        }
      }
    });
  },

  // 跳转订单页面
  navigateToOrders() {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/orders/orders' });
  },

  // 跳转到出售页面
  navigateToSell() {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/sell/sell' });
  }
});