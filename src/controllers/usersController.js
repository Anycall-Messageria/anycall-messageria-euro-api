import response from '../../response.js'
import user from "../model/user.model.js"
import bcryptjs from 'bcryptjs'
import __dirname from '../../dirname.js'


async function list(req, res) {
  try {
      const userLevel = req.user.level
      const user_comp = req.user.user_company
      let users
      if(userLevel>1){
        users = await user.findAll( {where: { "status":  1 , user_company: user_comp,  
        level: {[Op.in]: [2, 3]}
      }, 
        order: [['name', 'ASC']] }) 
      }else{
        users = await user.findAll( {where: { "status":  1 , user_company: user_comp,
        level: {[Op.in]: [1]}
       }, order: [['name', 'ASC']] })         
      }
      response(res, 200, true, 'list users', users)
  } catch (err) {
      response(res, 500, true, 'Failied list users', err)
  }
}

async function add(req, res) {
  try {
      let setLogin
      const user_comp = req.user.user_company 
      const numSaltRounds = 0
      const { name, cpf,  login, departament, office, email, password, level } = req.body
      const newpassword = await bcryptjs.hash(password, numSaltRounds)
      const l = level ? level : 3
      if(!login){
          setLogin = await getLastLoginUser(user_comp)
      }else{
          setLogin = login
      }
      const users = await user.create({ name, cpf,  login: setLogin , departament, office, email, 
        password: newpassword, level: l, user_company: user_comp });
      if(req.file){
          const nomeArquivo = req.file.originalname.split('.')[0];
          const extensaoArquivo = req.file.originalname.split('.')[1];
          let fileProfile = `${nomeArquivo}.${extensaoArquivo}`
          await alterNameProfileImage(user_comp, fileProfile , `${users.id}.jpeg`)
          await user.update({url_profile: `${users.id}.jpeg`}, { where: {id : users.id}}, { multi: true })
        }
        response(res, 200, true, 'create success', users)
  } catch (err) {
    response(res, 500, false, 'Error server application', err)
  }
}

const update = async (req, res) => {
  const user_comp = req.user.user_company
  let oldProfile, nameNewProfile, getFileName
  const { id, name, login, status, password, cpf, email, level, sessionid, photo} = req.body
  try {

    if(req.file){
      oldProfile = req.body.photo
      const nomeArquivo = req.file.originalname.split('.')[0]; //req.body.id
      const extensaoArquivo = req.file.originalname.split('.')[1];
      getFileName = `${nomeArquivo}.${extensaoArquivo}`
      nameNewProfile = `${req.body.id}.${extensaoArquivo}`
    }

    if(nameNewProfile){
      await deleteNameProfileImage(user_comp, oldProfile)
      await alterNameProfileImage(user_comp, nameNewProfile , getFileName)
    }
    
    const photoProfile = nameNewProfile ? nameNewProfile : photo

    const condition = { where :{id: id } } 
    const options = { multi: true }
    const numSaltRounds = 0
    let obj = sessionid.toString()//{ id_session: items }
    let values, p = ``
    if(password){
      let pass = await bcryptjs.hash(password, numSaltRounds)
      p = ` , password: ${pass}`
    }  
    console.log(id, p)
    values = { name:name, login: login, status:status, cpf:cpf, email:email, 
      level: level, phone_id: obj, url_profile: photoProfile, p }
      console.log(values)
      let resp = await user.update( values, condition, options )
      if(resp)
        response(res, 200, true, 'update success', resp)
    } catch (err) {
      const data = { err }
       response(res, 500, false, 'server application error', data)
    }
}

async function getLastLoginUser(company){
  try {
       const lastLogin = await user.findOne({where:{ user_company: company }, order: [ ["id", "DESC"] ]})
         return (lastLogin.id+1)
     } catch (error) {
         console.error(error)
     }
} 

async function alterNameProfileImage (comp, n, o){
  try {
    const oldFile = `${__dirname}/assets/midias/${comp}/profile/${o}`
    const newFile = `${__dirname}/assets/midias/${comp}/profile/${n}`
      fs.rename(oldFile, newFile, function(err){
      if(err){
        return err;	
      }else{
        console.log('Arquivo renomeado');
      }
    });
    } catch (error) {
  }
}

async function deleteNameProfileImage (comp, o){
  try {
    const oldFile = `${__dirname}/assets/midias/${comp}/profile/${o}`
    console.log(comp, 0, oldFile)
  fs.unlink( oldFile, function (err){
    try {
      if (err) return err;
      console.log('Arquivo deletado!');
    } catch (error) {
      console.log(error);
    }
  })
  } catch (error) {
    console.log(error);
  }
}




export {  list, add, update }
