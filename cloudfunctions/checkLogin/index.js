// cloudfunctions/checkLogin/index.js
const cloud = require('wx-server-sdk'); // 引入 wx-server-sdk
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 初始化云开发环境

exports.main = async (event) => {
  try {
    // 获取用户的 OpenID
    const { OPENID } = cloud.getWXContext();

    // 如果 OpenID 存在，说明用户已登录
    if (OPENID) {
      // 检查用户是否在数据库中
      const db = cloud.database();
      const userRes = await db.collection('users')
        .where({
          openid: OPENID
        })
        .get();

      // 如果用户存在，返回已登录状态
      if (userRes.data.length > 0) {
        return {
          code: 0,
          message: '用户已登录',
          isLoggedIn: true,
          openid: OPENID
        };
      } else {
        // 用户不存在，返回未登录状态
        return {
          code: -1,
          message: '用户未登录',
          isLoggedIn: false
        };
      }
    } else {
      // OpenID 不存在，返回未登录状态
      return {
        code: -1,
        message: '用户未登录',
        isLoggedIn: false
      };
    }
  } catch (err) {
    console.error('登录状态检查失败:', err);
    return {
      code: -2,
      message: '登录状态检查失败',
      isLoggedIn: false
    };
  }
};