import fs from 'fs'
import path from 'path'
import { join } from 'path'
import __dirname from '../../dirname.js'
import { triggerAsyncId } from 'async_hooks'

const dataPath = 'account.json' 
const targetDir = join(__dirname, 'sessions') 
const targetMedia= join(__dirname, 'assets/midias')


// util functions 
const saveAccountData = (data) => {
  try {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync(dataPath, stringifyData)
  } catch (err) {
    console.log(err)
  }
}

const getAccountData = () => {
  try {
    const jsonData = fs.readFileSync(dataPath)
    return JSON.parse(jsonData)    
  } catch (err) {
    console.log(err)
  }
}

//Add
const addSession = (id, body) => {
  try {
    console.log('addSession==> ', body)
    var existAccounts = getAccountData()
    const newAccountId = id//Math.floor(100000 + Math.random() * 900000)
    existAccounts[newAccountId] = body
    saveAccountData(existAccounts);
    return ({success: true, msg: 'Session data added successfully'})
  } catch (err) {
    console.log(err)
  }
}

//Read
const listSession = () => {
  try {
    const RandSessions = []
    fs.promises.readdir(targetDir)
    .then(filenames => {
        for (let filename of filenames) {
            if(filename.substring(2, 0) === 'md'){
                const name = filename.split('_', 2)[1]
                const numsStr = name.replace(/[^0-9]/g,'');
                const str = name.replace(/[^a-z]/g,'');
                const string = str+' '+numsStr
                const obj = {id: name, number: numsStr, name: string}
                RandSessions.push(obj)
          }
        }
        saveAccountData(RandSessions);
   })
    .catch(err => {
        console.log(err)
    })
    return getAccountData();
  } catch (err) {
    console.log(err)
  }
}

const listMedias = () => {
  try {
    const medias = []
    const filenames = fs.readdirSync(targetMedia)
    filenames.map((filename) => {
        const ext = path.extname(filename)
        if( ext == '.png' ||  ext == '.gif' || ext == '.jpeg' || ext == '.ogg' || ext == '.mp3' || ext == '.mp4' || ext == '.pdf')
        medias.push(filename)
      })
    return medias
  } catch (err) {
    console.log(err)
  }
}

// Update
const updateSession = (id, body) => {
  try {
    var existAccounts = getAccountData()
    fs.readFile(dataPath, 'utf8', (err, data) => {
     const accountId = id;
     existAccounts[accountId] = body;
     saveAccountData(existAccounts);
     return (`Session with id ${accountId} has been updated`)
   }, true);
  } catch (err) {
    console.log(err)
  }
};

//delete
const delSession =  (id) => {
  try {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      var existAccounts = getAccountData()
      const userId = id;
      delete existAccounts[userId];  
      saveAccountData(existAccounts);
      return(`Session with id ${userId} has been deleted`)
    }, true);
  } catch (err) {
    console.log(err)
  }
 
}

const dataNow = () => {
    try {
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);
      const a = today.toISOString()
      return a
    } catch (err) {
      console.log(err)
    }
}


export {
    addSession,
    delSession,
    listSession,
    updateSession,
    listMedias,
    dataNow
}
