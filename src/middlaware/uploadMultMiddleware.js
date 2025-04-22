import multer from 'multer'
import fs from 'fs'
import path from 'path'


const storage = multer.diskStorage({ //video/mp4  audio/ogg application/pdf 
  destination: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
        cb(null, 'assets/uploads/1')
    }else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, 'assets/midias/1/image')
    }else if (file.mimetype === 'video/mp4') {
        cb(null, 'assets/midias/1/video')
    }else if (file.mimetype === 'video/ogg') {
        const abc = 'assets/midias/1/audio' 
        cb(null, abc)
    }else if (file.mimetype === 'application/pdf') {
        cb(null, 'assets/midias/1/pdf')
    }    
  },
  filename: (req, file, cb) => {
    const extensaoArquivo = file.originalname.split('.')[1];
    const novoNomeArquivo = file.originalname.split('.')[0];
    cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
  }
});

const upload = multer({ storage: storage });
const uploadMiddleware = (req, res, next) => {
  upload.array('fileupload', 2)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const files = req.files;
    req.files = files;
    next();
  });
};

export { uploadMiddleware }


