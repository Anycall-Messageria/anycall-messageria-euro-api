import multer from 'multer'
import medias from "../model/medias.model.js"
import response from '../../response.js'
import fs from 'fs'

async function list(req, res) {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const midia = await medias.findAll({ where: {company_id: user_comp} }) 
        response(res, 200, true, 'List midia', midia)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

const del = async (req, res) => {
    try {
        const id = req.params['id']
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const midia = await medias.findOne({ where: { "id":  id  } }) 
        let media = midia.name+'.'+midia.extension
        fs.unlink( `assets/midias/${user_comp}/${media}`, function (err){
            if (err) throw err;
            console.log('delete file!');
        })
        const resp = medias.destroy({ where: { "id": id } })
        .then(data => { 
            console.log(data)
        })
       .catch((error) => {
            console.error("Error:", error);
        })
        response(res, 200, true, 'delete success', midia)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

async function savedb(novoNomeArquivo, extensaoArquivo, company_id) {
    try {
        console.log(novoNomeArquivo+'.'+extensaoArquivo, company_id)
        const url =  `assets/midias/${company_id}`
        const name = novoNomeArquivo
        const extension = extensaoArquivo
        const media = await medias.create({ url, name, extension, company_id});
        console.log(200, true, 'Create url media.')
    } catch (err) {
        const data = { err }
        console.log(err)
        console.log(500, false, 'server application error.', data)
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const user_comp = req.user.user_company 
        cb(null, `assets/midias/${user_comp}`)
    },
    filename: function (req, file, cb) {
        const user_comps = req.user.user_company
        const extensaoArquivo = file.originalname.split('.')[1];
        const novoNomeArquivo = file.originalname.split('.')[0];
        savedb(file.originalname.split('.')[0], file.originalname.split('.')[1] , user_comps)
        cb(null, `${novoNomeArquivo}.${extensaoArquivo}`, user_comps)
    }
})

const upload = multer({ storage });

export { upload , list, savedb, del}
