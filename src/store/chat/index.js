import Chat from  '../../model/chats.model.js'

const pushChatDb = async (id, conversationTimestamp, unreadCount) => {
    let chats
    let datas = { jid: id, conversationtimestamp: conversationTimestamp, unreadCount }
    try{
        // await Chat.sync({force: true});
        chats = await Chat.findOne({ where: { jid: id } })
        if(chats === null) {
            let insert = await Chat.create(datas)
            //console.log(insert instanceof Message)
            //console.log(insert.id)
        }
      }
      catch (error){
        console.log('Error: '+error)
      }
}

const updateChatDb = async (id, conversationTimestamp, unreadCount) => {
  let chats
  let datas = { jid: id, conversationtimestamp: conversationTimestamp, unreadCount }
  try{
      //await Chat.sync({force: true});
      chats = await Chat.findOne({ where: { jid: id } })
      if(chats) {
        const condition = { where :{jid: id } } 
        const options = { multi: true }
        let values = {
          conversationtimestamp: conversationTimestamp,
          unreadCount: (chats.unreadCount + 1)
          }
          let res = await Chat.update( values, condition , options )
      }
    }
    catch (error){
      console.log('Error: '+error)
    }
}

export { pushChatDb, updateChatDb }


