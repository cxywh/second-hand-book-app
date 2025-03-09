// cloudfunctions/mockPayment/index.js
const cloud = require('wx-server-sdk'); // 引入 wx-server-sdk
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 初始化云开发环境

exports.main = async (event) => {
  const { totalFee } = event; // 获取支付金额

  // 模拟支付逻辑
  try {
    // 模拟支付成功
    return {
      code: 0,
      message: '支付成功（模拟）',
      data: {
        orderId: `mock_order_${Date.now()}`, // 模拟订单号
        totalFee, // 支付金额
        paymentTime: new Date().toISOString() // 支付时间
      }
    };
  } catch (err) {
    // 模拟支付失败
    return {
      code: -1,
      message: '支付失败（模拟）',
      error: err
    };
  }
};