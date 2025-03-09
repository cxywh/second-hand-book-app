// 云函数入口文件
const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
});

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext(); // 获取用户上下文

  try {
    // 这里可以添加服务器端的退出逻辑
    // 例如：清除自定义登录的会话信息或 token
    // 假设我们使用云开发的数据库存储会话信息
    const db = cloud.database();
    const sessionCollection = db.collection('sessions'); // 假设会话信息存储在 sessions 集合中

    // 删除当前用户的会话信息
    await sessionCollection.where({
      openid: wxContext.OPENID // 根据用户的 openid 删除会话
    }).remove();

    // 返回退出登录成功的结果
    return {
      code: 0,
      message: '退出登录成功',
      data: {
        openid: wxContext.OPENID // 返回用户的 openid（可选）
      }
    };
  } catch (err) {
    console.error('退出登录失败:', err);
    return {
      code: -1,
      message: '退出登录失败',
      error: err
    };
  }
};