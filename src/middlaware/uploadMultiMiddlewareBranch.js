import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { getBranchs } from '../../src/utils/util.js'



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const user_comp = req.user.user_company 
    const branch = getBranchs(parseInt(req.body.filial))
    cb(null, `assets/balances/${user_comp}/${branch}`);
  },
  filename: (req, file, cb) => {
    const extensaoArquivo = file.originalname.split('.')[1];
    const novoNomeArquivo = file.originalname.split('.')[0];
    cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
  }
});

const upload = multer({ storage: storage });
const uploadMiddleware = (req, res, next) => {
  upload.array('fileupload', 9)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const files = req.files;
    req.files = files;
    next();
  });
};

export { uploadMiddleware }


