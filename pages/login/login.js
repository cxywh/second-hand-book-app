// pages/login/login.js
Page({
  data: {
    phone: '', // 手机号
    password: '', // 密码
    rememberMe: false // 是否记住登录状态
  },
  onLoad() {
    // 仅在勾选过“记住我”时填充手机号
    const rememberMe = wx.getStorageSync('rememberMe');
    if (rememberMe) {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ 
          phone: userInfo.phone,
          rememberMe: true
        });
      }
    }
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  // 记住登录状态
  onRememberMeChange(e) {
    this.setData({ rememberMe: e.detail.value });
  },

  // 登录逻辑修改
  async login() {
    const { phone, password, rememberMe } = this.data;

    if (!phone || !password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: { phone, password }
      });

      if (res.result.code === 0) {
        const userData = res.result.data;

        // 更新全局登录状态
        wx.setStorageSync('isLoggedIn', true);
        wx.setStorageSync('userInfo', userData); // 新增
        if (rememberMe) {
          
          wx.setStorageSync('rememberMe', true);
        } else {
          
          wx.removeStorageSync('rememberMe');
        }

        // 强制更新所有页面的登录状态
        const pages = getCurrentPages();
        pages.forEach(page => {
          if (page.route === 'pages/index/index' || page.route === 'pages/user/user' || page.route === 'pages/orders/orders') {
            page.onShow(); // 触发页面的 onShow 生命周期
          }
        });
        wx.switchTab({
          url: '/pages/index/index',
        });

       
      } else {
        wx.showToast({ title: res.result.msg, icon: 'none' });
      }
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },


  // 跳转到注册页面
  navigateToRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  }
});