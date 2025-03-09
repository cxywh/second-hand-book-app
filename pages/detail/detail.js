// detail.js 修复版本
Page({
  // ...其他代码...

  createOrder() {
    wx.cloud.callFunction({
      name: 'createOrder',
      data: {
        bookId: this.data.book._id,
        totalFee: this.data.book.price // 确保参数名与后端一致（微信支付需要分单位）
      },
      success: res => {
        this.requestPayment(res.result)
      },
      fail: err => {
        console.error('创建订单失败:', err)
        wx.showToast({ title: '订单创建失败', icon: 'none' })
      }
    })
  },

  requestPayment(params) {
    wx.requestPayment({
      timeStamp: params.timeStamp.toString(),  // 必须为字符串
      nonceStr: params.nonceStr,
      package: params.package,
      signType: 'MD5',
      paySign: params.paySign,
      success: () => {
        wx.showToast({ title: '支付成功' })
        // 支付成功后跳转逻辑
        setTimeout(() => wx.navigateBack(), 1500)
      },
      fail: (err) => {
        console.error('支付失败:', err)
        wx.showToast({ 
          title: err.errMsg || '支付失败',
          icon: 'none'
        })
      }
    })
  },

  // ...其他代码...
})