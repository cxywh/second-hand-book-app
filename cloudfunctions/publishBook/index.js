const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  // 图片上传到云存储
  const uploadTasks = event.images.map(filePath => 
    cloud.uploadFile({ cloudPath: `books/${Date.now()}-${Math.random()}.jpg`, filePath })
  )
  const results = await Promise.all(uploadTasks)
  const imageUrls = results.map(res => res.fileID)

  // 存入数据库
  return await db.collection('books').add({
    data: {
      title: event.title,
      price: parseFloat(event.price),
      major: event.major,
      images: imageUrls,
      sellerId: OPENID,
      createTime: db.serverDate()
    }
  })
}