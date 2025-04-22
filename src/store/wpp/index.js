import { findAll, findMenu , findSubMenu } from "../../service/wpp/find.js"
import dayjs from 'dayjs'
import redis from "../../lib/redis.js"
import { v4 as uuidv4 }  from 'uuid'


async function listsMenuWpp(choice) {
   console.log('listsMenuWpp', choice)
    try {
        let menu = `*MENU*\n`
        if(choice == '$menu'){
            const maps = await findAll('Menu') 
            maps.map(function(d){
                menu+= `${d.ordem} - *${d.description}*\n`
            })
            return menu
          }
         await listsOptionsMenuWpp()
         
    } catch (err) {
        console.log(err)
    }
}

async function listsOptionsMenuWpp(choice) {
    console.log('listsOptionsMenuWpp', choice)
     try {
           const maps = await findAll('SubMenus', choice) 
           const tittle = await findMenu(maps[0].menu_id)
           let subMenu = `*MENU*\n`
           subMenu+= `*${tittle}*\n\n`
             maps.map(function(d){
                subMenu+= `${d.ordem} - *${d.description}*\n`
             })
         return subMenu
     } catch (err) {
         console.log(err)
     }
}

async function optionalSubMenuWpp(choice) {
    try {
      return await findSubMenu(choice)
    } catch (err) {
        console.log(err)
    }
}


async function exitMenuWpp(choice) {
    console.log('exitMenuWpp', choice)
     try {
         if(choice == '$Sair'){
             console.log(choice)
           }
           return menu
     } catch (err) {
         console.log(err)
     }
}


async function historyChat(datas){
    try {
        const { phone , message } = datas
        const id = phone.toString()
        const dbmessage = `messages${id}`
        
        //const r = await redis.del(dbmessage)
        
        const inserted = {id: uuidv4(), dates: dayjs().add(0, "second").unix(),
         company_phone: '554796980163', message_ky: '', message: message}
        
        const t = await redis.lpush(dbmessage, JSON.stringify(inserted))
       
        const existingMessages = await redis.lrange(dbmessage, 0, -1)
        const parsedMessages = existingMessages.map((item) => JSON.parse(item))
        //parsedMessages.map((item) => console.log(item))
        if(parsedMessages.length > 0){
            return parsedMessages
        }else{
           return false
        }        
    } catch (err) {
        console.log(err)
    }
}




export { listsMenuWpp , listsOptionsMenuWpp, exitMenuWpp , historyChat, optionalSubMenuWpp }