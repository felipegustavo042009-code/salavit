const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary configurado para:', process.env.CLOUDINARY_CLOUD_NAME);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

function decobrirTipoArquivo(url) {
    if (url.includes('/image/')) {
        return 'image';
    } else if (url.includes('/video/')) {
        return 'video';
    } else if (url === 'application/pdf') {
        return 'pdf';
    } 
    return 'raw';
}

async function uploadCloudinaryDocumentos(file) {
    if (!file) {
        console.log('❌ Nenhum arquivo fornecido para upload');
        return null;
    }

    console.log('📤 Iniciando upload do arquivo:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });

    const tipoArquivo = path.extname(file.originalname).toLowerCase();

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'materiais',
                public_id: `${uuidv4()}-${Date.now()}${tipoArquivo}`,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('❌ Erro no upload do Cloudinary:', error);
                    return reject(error);
                }
                console.log('✅ Upload concluído:', result.secure_url);
                resolve(result.secure_url);
            }
        );
        
        stream.end(file.buffer);
    });
}

async function apagarCloudinaryDocumentos(url) {
    if (!url) {
        console.log('❌ Nenhuma URL fornecida para deletar');
        return;
    }

    try {
        const partes = url.split('/');
        const nomeComExt = partes[partes.length - 1];
        const nomeSemExt = nomeComExt.split('.')[0];
        
        const materiaIndex = url.indexOf('/materiais/');
        if (materiaIndex === -1) {
            console.log('❌ URL não contém pasta materiais');
            return;
        }
        
        const pathAfterMateriais = url.substring(materiaIndex + 1); 
        const publicId = pathAfterMateriais.split('.')[0]; 

        const tipoArquivo = decobrirTipoArquivo(url);
        console.log('📁 Tipo de arquivo identificado:', tipoArquivo);
        
        console.log('🗑️ Apagando arquivo do Cloudinary, public_id:', publicId);
        
        await cloudinary.uploader.destroy(publicId, {
            resource_type: tipoArquivo,
        });
        
        console.log('✅ Arquivo apagado do Cloudinary');
    } catch (error) {
        console.error('❌ Erro ao apagar do Cloudinary:', error);
        throw error;
    }
}

module.exports = {
    upload,
    uploadCloudinaryDocumentos,
    apagarCloudinaryDocumentos,
};