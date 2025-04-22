import Sendmessage from  '../model/sendmessages.model.js'


const insertSendMessageDb = async (datas) => {
  try{
        const save = await Sendmessage.create( datas )
        console.log('Oxi insertSendMessageDb')
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

const updateSendMessageDb = async (receiver) => {
    try {
      const condition = { where :{receiver: receiver } } 
      const options = { multi: true }
      let values = {
          statussend: 1,
          datasend: Date.now()
        }
        let res = await Sendmessage.update( values, condition , options )
        console.log('Oxi updateSendMessageDb')
    } catch (err) {
      console.log(err, 500, false, 'server application error')
    }  
}

export { insertSendMessageDb, updateSendMessageDb }


