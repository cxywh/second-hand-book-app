const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { participants, lastMessage, unreadCount, timestamp, receiver, newMessage } = event;

  try {
    // 更新 messages 集合
    const messageRes = await db.collection('messages')
      .where({
        participants: _.and([_.eq(participants[0]), _.eq(participants[1])])
      })
      .get();

    if (messageRes.data.length > 0) {
      await db.collection('messages').doc(messageRes.data[0]._id).update({
        data: {
          lastMessage,
          unreadCount: _.inc(unreadCount),
          timestamp,
          receiver
        }
      });
    } else {
      await db.collection('messages').add({
        data: {
          participants,
          lastMessage,
          unreadCount,
          timestamp,
          receiver
        }
      });
    }

    // 同步更新 chats 集合的 messages 字段
    const chatRes = await db.collection('chats')
      .where({
        participants: _.all(participants)
      })
      .get();

    if (chatRes.data.length > 0) {
      await db.collection('chats').doc(chatRes.data[0]._id).update({
        data: {
          messages: _.push([newMessage]), // 将新消息添加到 messages 数组
          lastUpdate: new Date()
        }
      });
    } else {
      await db.collection('chats').add({
        data: {
          participants,
          messages: [newMessage],
          createTime: new Date(),
          lastUpdate: new Date()
        }
      });
    }

    return { success: true };
  } catch (err) {
    console.error('云函数更新失败:', err);
    return { success: false, error: err };
  }
};