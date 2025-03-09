// cloudfunctions/getOrderDetail/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { orderId } = event;
  const db = cloud.database();

  try {
    const res = await db.collection('orders').doc(orderId).get();
    if (res.data) {
      return { code: 0, data: res.data, message: '订单详情加载成功' };
    } else {
      return { code: -1, message: '订单不存在' };
    }
  } catch (err) {
    console.error('订单详情加载失败:', err);
    return { code: -2, message: '数据库查询失败' };
  }
};