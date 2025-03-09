exports.main = async (event, context) => {
  const { type, keyword } = event
  
  const _ = db.command
  let query = {}

  if (type === 'title') {
    query.title = db.RegExp({ regexp: keyword, options: 'i' })
  } else if (type === 'major') {
    query.major = keyword
  }

  return await db.collection('books')
    .where(query)
    .orderBy('createTime', 'desc')
    .get()
}