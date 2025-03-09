// pages/register/register.js
Page({
  data: {
    phone: '', // 手机号
    password: '' // 密码
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  // 注册
  async register() {
    const { phone, password } = this.data;

    // 校验输入
    if (!phone || !password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    // 调用云函数注册
    try {
      const res = await wx.cloud.callFunction({
        name: 'register',
        data: { phone, password }
      });

      if (res.result.code === 0) {
        wx.showToast({ title: '注册成功' });
        wx.navigateTo({ url: '/pages/login/login' }); // 跳转到登录页面
      } else {
        wx.showToast({ title: res.result.msg, icon: 'none' });
      }
    } catch (err) {
      console.error('注册失败:', err);
      wx.showToast({ title: '注册失败', icon: 'none' });
    }
  }
});