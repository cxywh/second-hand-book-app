Page({
  data: {
    currentUserPhone: '',
    otherUserPhone: '',
    messages: [],
    inputValue: '',
    isSeller: false
  },

  onLoad(options) {
    this.checkLoginStatus();

    const otherUserPhone = options.otherUserPhone;
    const userInfo = wx.getStorageSync('userInfo');

    if (!otherUserPhone || !userInfo?.phone) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
      return;
    }

    this.setData({
      currentUserPhone: userInfo.phone,
      otherUserPhone: otherUserPhone
    });

    this.checkUserIdentity().then(isSeller => {
      this.setData({ isSeller });
      this.loadChatHistory();
      this.listenForNewMessages();
    });
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!userInfo || !isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.navigateBack();
      return false;
    }
    return true;
  },

  async checkUserIdentity() {
    const { currentUserPhone, otherUserPhone } = this.data;
    const db = wx.cloud.database();
    try {
      const res = await db.collection('users')
        .where({ phone: otherUserPhone })
        .get();
      return res.data[0]?.role === 'buyer';
    } catch (err) {
      console.error('查询用户角色失败:', err);
      return false;
    }
  },

  async loadChatHistory() {
    const db = wx.cloud.database();
    const _ = db.command;
    // 关键修改：对参与者排序
    const sortedParticipants = [this.data.currentUserPhone, this.data.otherUserPhone].sort();
    try {
      const res = await db.collection('chats')
        .where({
          participants: _.all(sortedParticipants) // 使用排序后的数组
        })
        .get();
      if (res.data.length > 0) {
        this.setData({ messages: res.data[0].messages });
      }
    } catch (err) {
      console.error('加载聊天记录失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  listenForNewMessages() {
    const db = wx.cloud.database();
    const _ = db.command;
    // 关键修改：对参与者排序
    const sortedParticipants = [this.data.currentUserPhone, this.data.otherUserPhone].sort();
    db.collection('chats')
      .where({
        participants: _.all(sortedParticipants) // 使用排序后的数组
      })
      .watch({
        onChange: (snapshot) => {
          if (snapshot.docs.length > 0) {
            this.setData({ messages: snapshot.docs[0].messages });
          }
        },
        onError: (err) => console.error('监听失败:', err)
      });
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  async sendMessage() {
    if (!this.checkLoginStatus()) return;
  
    const { inputValue, currentUserPhone, otherUserPhone, messages, isSeller } = this.data;
    if (!inputValue.trim()) return;
  
    const newMessage = {
      sender: isSeller ? 'seller' : 'buyer',
      senderPhone: currentUserPhone,
      receiverPhone: otherUserPhone,
      content: inputValue,
      timestamp: new Date().toLocaleString()
    };
  
    const sortedParticipants = [currentUserPhone, otherUserPhone].sort();
  
    try {
      // 调用云函数更新 messages 和 chats 集合
      const updateResult = await wx.cloud.callFunction({
        name: 'updateMessage',
        data: {
          participants: sortedParticipants,
          lastMessage: inputValue,
          unreadCount: 1, // 每次发送消息增加 1
          timestamp: new Date(),
          receiver: isSeller ? 'buyer' : 'seller',
          newMessage // 传递新消息内容
        }
      });
  
      if (updateResult.result.success) {
        // 更新本地消息列表
        this.setData({ messages: [...messages, newMessage], inputValue: '' });
      } else {
        throw new Error('云函数更新失败');
      }
    } catch (err) {
      console.error('发送失败:', err);
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  }
});