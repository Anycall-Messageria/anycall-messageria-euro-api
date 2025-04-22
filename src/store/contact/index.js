import Contact from  '../../model/contacts.model.js'

import {  rand, greetingMessage , comparNumbers} from '../../utils/util.js'

const recordContacts = async(data) => {
  try {
    //console.log('recordContacts ', data)
    //await Contact.sync({force: true})
    const save = await Contact.create( data )
    //console.log(save, 'KAKAKAKAKKA')
    //console.log('Contacts save ', save instanceof Contact)
    } catch (error) {
  }
}

const updaterecordContacts = async(id, session) => {
  try {
  //console.log(id, session)
  const condition = { where :{idmessage: id } } 
  const options = { multi: true }
  let values = {
      session: session
    }
    //await Contact.sync({force: true})
    let res = await Contact.update( values, condition , options )
    //console.log('Update Record ', res)
  } catch (error) {
    
  }
}

const findContactsRemoteJid = async (jid) => {
  try {
    const find = await Contact.findOne({ where: { remotejid: jid } })
    if(find){
        return find.remotejid
    }    
  } catch (error) {
    console.log(error)
  }
}

export { recordContacts, updaterecordContacts, findContactsRemoteJid }



