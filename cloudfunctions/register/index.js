// cloudfunctions/register/index.js
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
  // 云函数 register 增加手机号格式校验
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { code: -1, msg: '手机号格式错误' };
  }

  // 校验输入
  if (!phone || !password) {
    return { code: -1, msg: '手机号和密码不能为空' };
  }

  // 检查手机号是否已注册
  const userRes = await db.collection('users').where({ phone }).get();
  if (userRes.data.length > 0) {
    return { code: -1, msg: '该手机号已注册' };
  }

  // 创建用户
  const userData = {
    phone,
    password: encryptPassword(password), // 使用 SHA-256 加密
    role: 'user', // 默认角色为普通用户
    createTime: db.serverDate() // 注册时间
  };

  try {
    await db.collection('users').add({ data: userData });
    return { code: 0, msg: '注册成功' };
  } catch (err) {
    console.error('注册失败:', err);
    return { code: -1, msg: '注册失败，请稍后重试' };
  }
};