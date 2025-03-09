Page({
  data: {
    messageList: [], // 消息列表
    currentUserPhone: '' // 当前用户手机号
  },

  onLoad() {
    this.checkLoginStatus();
    
    // 先设置 currentUserPhone
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ currentUserPhone: userInfo.phone }, () => {
      // 再加载消息列表
      this.loadMessages();
      this.listenForNewMessages();
    });
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!userInfo || !isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.navigateBack(); // 返回上一页
      return false;
    }
    return true;
  },

  // 加载消息列表
  async loadMessages() {
    if (!this.checkLoginStatus()) return;

    const db = wx.cloud.database();
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ currentUserPhone: userInfo.phone }, () => {
      console.log('[调试] currentUserPhone 已设置:', this.data.currentUserPhone);
    });
    try {
      const res = await db.collection('messages')
        .where({
          // 查询当前用户作为卖家或买家的消息
          participants: db.command.all([userInfo.phone])
        })
        .orderBy('timestamp', 'desc') // 按时间倒序排列
        .get();

      this.setData({ messageList: res.data });
    } catch (err) {
      console.error('加载消息列表失败:', err);
      wx.showToast({ title: '加载消息失败', icon: 'none' });
    }
  },

  // 监听新消息
  listenForNewMessages() {
    const db = wx.cloud.database();
    const userInfo = wx.getStorageSync('userInfo');
    db.collection('messages')
      .where({
        participants: db.command.all([userInfo.phone])
      })
      .watch({
        onChange: (snapshot) => {
          // 当有新消息时，更新消息列表
          this.setData({ messageList: snapshot.docs });
        },
        onError: (err) => {
          console.error('监听消息失败:', err);
        }
      });
  },

  // 跳转到聊天页面
  navigateToChat(e) {
    console.log('[调试] 事件对象 dataset:', e.currentTarget.dataset);
    const otheruserphone = e.currentTarget.dataset.otheruserphone;
    console.log('[调试] 对方手机号:', otheruserphone);
    if (!otheruserphone) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/chat/chat?otherUserPhone=${otheruserphone}`
    });
  }
});