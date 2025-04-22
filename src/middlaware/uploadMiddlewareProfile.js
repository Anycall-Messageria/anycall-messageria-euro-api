import multer from 'multer'


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const user_comp = req.user.user_company 
        cb(null, `assets/midias/${user_comp}/profile`)
    },
    filename: function (req, file, cb) {
        const extensaoArquivo = file.originalname.split('.')[1];
        const novoNomeArquivo = file.originalname.split('.')[0];
        cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
    }
});


const uploadsProfile = multer({ storage });

export {  uploadsProfile }

//uploadMiddleware

