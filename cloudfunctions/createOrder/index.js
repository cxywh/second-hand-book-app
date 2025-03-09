// cloudfunctions/createOrder/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { bookId, totalFee, buyerId } = event;
  const db = cloud.database();

  try {
    // 插入订单数据
    const res = await db.collection('orders').add({
      data: {
        bookId,
        totalFee,
        buyerId,
        status: 'paid',
        createTime: db.serverDate()
      }
    });

    return {
      code: 0,
      message: '订单创建成功',
      orderId: res._id // 返回订单 ID
    };
  } catch (err) {
    console.error('订单创建失败:', err);
    return {
      code: -1,
      message: '订单创建失败',
      error: err
    };
  }
};