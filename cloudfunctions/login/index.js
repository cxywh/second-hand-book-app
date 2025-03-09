// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const crypto = require('crypto');

// 加密函数
function encryptPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

exports.main = async (event) => {
  const { phone, password } = event;

  // 1. 校验输入完整性
  if (!phone || !password) {
    return { code: -1, msg: '手机号和密码不能为空' };
  }

  // 2. 查询用户是否存在
  const userRes = await db.collection('users')
    .where({ phone })
    .get();

  if (userRes.data.length === 0) {
    return { code: -1, msg: '该手机号未注册' };
  }

  // 3. 验证密码
  const user = userRes.data[0];
  const encryptedInput = encryptPassword(password);
  if (user.password !== encryptedInput) {
    return { code: -1, msg: '密码错误' };
  }

  // 4. 返回用户信息
  return {
    code: 0,
    msg: '登录成功',
    data: {
      phone: user.phone,
      openId: cloud.getWXContext().OPENID // 确保数据隔离
    }
  };
};