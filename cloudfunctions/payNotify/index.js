// cloudfunctions/payNotify/index.js
const cloud = require('wx-server-sdk')
const tenpay = require('tenpay')
cloud.init()

const api = new tenpay({
  appid: cloud.getWXContext().APPID,
  mchid: process.env.MCH_ID,
  partnerKey: process.env.API_KEY
})

exports.main = async (event) => {
  const { xml } = event
  const db = cloud.database()
  
  try {
    // 1. 验证支付结果
    const result = await api.paymentNotify(xml)
    
    if (result.return_code === 'SUCCESS') {
      // 2. 更新订单状态
      await db.collection('orders').where({
        outTradeNo: result.out_trade_no
      }).update({
        data: {
          status: 'paid',
          transactionId: result.transaction_id,
          payTime: db.serverDate()
        }
      })

      // 3. 更新书籍状态
      const order = await db.collection('orders')
        .where({ outTradeNo: result.out_trade_no })
        .get()
      
      await db.collection('books')
        .doc(order.data[0].bookId)
        .update({
          data: { status: 'sold' }
        })

      // 4. 返回成功响应
      return api.success()
    }
  } catch (err) {
    console.error('支付回调处理失败:', err)
    return api.fail(err.message)
  }
}