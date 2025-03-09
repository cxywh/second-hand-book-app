Page({
  data: {
    sellerPhone: '', // 卖家手机号
    book: null,      // 接收传递的书籍数据
    buyerPhone: ''   // 买家手机号
  },

  onLoad(options) {
    // 从首页接收书籍ID
    const bookId = options.bookId;
    this.loadBookDetail(bookId);

    // 获取买家手机号
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.phone) {
      this.setData({ buyerPhone: userInfo.phone });
    }

    // 获取卖家手机号（假设从商品信息中获取）
    const db = wx.cloud.database();
    db.collection('books').doc(bookId).get().then(res => {
      if (res.data && res.data.sellerPhone) {
        this.setData({ sellerPhone: res.data.sellerPhone });
      } else {
        console.error('未找到卖家手机号');
        wx.showToast({ title: '获取卖家信息失败', icon: 'none' });
      }
    }).catch(err => {
      console.error('获取卖家信息失败:', err);
      wx.showToast({ title: '获取卖家信息失败', icon: 'none' });
    });
  },

  // 跳转到聊天页面
  navigateToChat() {
    const { sellerPhone } = this.data;
    if (!sellerPhone) {
      wx.showToast({ title: '卖家信息错误', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/chat/chat?otherUserPhone=${sellerPhone}`
    });
  },

  // 加载书籍详情
  async loadBookDetail(bookId) {
    const db = wx.cloud.database();
    const res = await db.collection('books').doc(bookId).get();
    this.setData({
      book: {
        ...res.data,
        displayPrice: (res.data.price / 100).toFixed(2) // 将分转换为元
      }
    });
  },

  // 发起模拟支付
  async startPayment() {
    wx.showLoading({ title: '发起支付中...' });

    try {
      // 调用模拟支付云函数
      const { result } = await wx.cloud.callFunction({
        name: 'mockPayment', // 调用 mockPayment 云函数
        data: {
          totalFee: this.data.book.price * 100 // 转换为分
        }
      });

      if (result.code === 0) {
        wx.showToast({ title: '支付成功（模拟）' });

        // 创建订单记录
        const db = wx.cloud.database();
        const userInfo = wx.getStorageSync('userInfo');
        await db.collection('orders').add({
          data: {
            buyerPhone: userInfo.phone, // 买家手机号
            sellerPhone: this.data.sellerPhone, // 卖家手机号
            bookId: this.data.book._id, // 商品 ID
            bookTitle: this.data.book.title, // 商品名称
            bookImage: this.data.book.images[0], // 商品图片
            totalFee: this.data.book.price, // 订单总金额
            createTime: db.serverDate() // 订单创建时间
          }
        });

        // 跳转到支付成功页面，并传递订单信息
        wx.redirectTo({
          url: `/pages/paySuccess/paySuccess?orderId=${result.data.orderId}&amount=${this.data.book.price}`
        });
      } else {
        wx.showToast({ title: '支付失败（模拟）', icon: 'none' });
      }
    } catch (err) {
      console.error('支付失败:', err);
      wx.showToast({ title: '支付失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});